import { createHttpError, Status, Pool, } from "../deps.ts";
import { runQuery, runTransaction } from "../utils/database.ts";
import { numberFromEnv } from "../utils/env.ts";
import { createMultipleTickets, Ticket } from "./tickets.ts";
import { getNumberTicketsLeft } from "./ticket_types.ts";

export interface Reservation {
  id: string;
  created_at: string;
}

export interface ReservationWithAdminDetails {
  id: string;
  created_at: string;
  amount: number;
  price: number;

  email?: string;
  first_name?: string;
  last_name?: string;

  paid: boolean;
}

export interface ReservationWithDetails {
  id: string;

  created_at: string;
  expired: boolean;
  valid_until: number;

  tickets: Ticket[];
  price: number;
}

export interface NewReservation {
  [ticketId: string]: number;
}

// deno-lint-ignore no-explicit-any
export const isNewReservation = (arg: any): arg is NewReservation => {
  return (arg && typeof arg === 'object' && Object.keys(arg).length > 0 && Object.values(arg).every(i => typeof i === 'number'));
};

export const isExpired = async (createdAt: string) => {
  return await validUntil(createdAt) < new Date().getTime();
};

export const validUntil = async (createdAt: string) => {
  const createdAtTime = new Date(createdAt).getTime()
  const validFor = await numberFromEnv('RESERVATION_VALID_FOR_MS', 600000);
  return createdAtTime + validFor;
};

export const createReservation = async (
  tt: NewReservation,
  pool: Pool
): Promise<ReservationWithDetails> => {
  // TODO: investigate if this transaction can be optimized  


  // Check if reservation is still allowed (tickets not sold out)
  const available = await getNumberTicketsLeft(pool);
  const requestedTicketsAreAvailable = Object.entries(tt).every(([id, amount]) => {
    const ta = available.find(a => a.id === id);
    return ta && ta.amount_left >= amount;
  });

  if (!requestedTicketsAreAvailable) {
    throw createHttpError(Status.Forbidden, "no more tickets left to reserve");
  }

  const id = await runTransaction(pool, async (trans) => {
    // Insert the `reservation` object
    const sql = `
      INSERT INTO
        reservations (created_at)
      VALUES
        (DEFAULT)
      RETURNING
        id,
        created_at;
      `;
    const res = (await trans.queryObject<{ id: string; created_at: string }>(sql)).rows[0];

    // Insert the individual `ticket` objects
    Object.entries(tt).forEach(async ([id, amount]) =>
      await createMultipleTickets(res.id, id, amount, trans)
    );

    return res.id;
  });

  // Return the reservation with details
  return await getReservationWithDetails(id, pool);
};

export const getAllReservations = async (
  pool: Pool,
): Promise<ReservationWithAdminDetails[]> => {
  const sql = `
    SELECT
      r.id,
      r.created_at,
      CAST(COUNT(t.id) AS int) AS amount,
      CAST(SUM(tt.price) AS int) AS price,
      STRING_AGG(DISTINCT c.email, ',') AS email,
      STRING_AGG(DISTINCT c.first_name, ',') AS first_name,
      STRING_AGG(DISTINCT c.last_name, ',') AS last_name,
      BOOL_OR(p.reservation IS NOT NULL) AS paid
    FROM
      reservations AS r
      JOIN tickets AS t ON r.id = t.reservation
      JOIN ticket_types AS tt ON t.ticket_type = tt.id
      LEFT JOIN completions AS c ON r.id = c.reservation
      LEFT JOIN payments AS p ON r.id = p.reservation
    GROUP BY
      r.id
    ORDER BY
      r.created_at DESC;
  `;
  return (await runQuery<ReservationWithAdminDetails>(pool, sql)).rows;
};

/**
 * Gets a reservation with all of the tickets that are associated with the reservation and the
 * names of the tickets (from ticket_types)
 */
export const getReservationWithDetails = async (
  id: string,
  pool: Pool,
): Promise<ReservationWithDetails> => {
  const resultSql = `
    SELECT
      t.id AS id,
      r.id AS reservation,
      t.ticket_type AS ticket_type,
      t.owner_counter AS owner_counter,
      t.owner_email AS owner_email,
      t.owner_first_name AS owner_first_name,
      t.owner_last_name AS owner_last_name,
      t.owner_society AS owner_society,
      r.created_at AS created_at,
      tt.name AS name,
      tt.price AS price
    FROM
      reservations AS r
      JOIN tickets AS t ON r.id = t.reservation
      JOIN ticket_types AS tt ON t.ticket_type = tt.id
    WHERE
      r.id = $ID;
  `;
  const result = (
    await runQuery<{
      id: string;
      reservation: string,
      ticket_type: string;
      owner_counter: number;
      owner_email: string;
      owner_first_name: string;
      owner_last_name: string;
      owner_society: string;
      created_at: string;
      name: string;
      price: number;
    }>(pool, resultSql, { id })
  ).rows;

  if (result.length === 0) {
    throw createHttpError(Status.NotFound, "reservation not found");
  }

  return {
    id: result[0].reservation,

    created_at: result[0].created_at,
    valid_until: await validUntil(result[0].created_at),
    expired: await isExpired(result[0].created_at),

    tickets: result.map((r) => ({
      id: r.id,
      ticket_type: r.ticket_type,
      owner_counter: r.owner_counter,
      owner_email: r.owner_email,
      owner_first_name: r.owner_first_name,
      owner_last_name: r.owner_last_name,
      owner_society: r.owner_society,
      price: r.price,
      reservation: r.reservation,
      ticket_name: r.name
    } as Ticket)),
    price: result.reduce((acc, cur) => acc + cur.price, 0),
  };
};

export const deleteExpiredReservations = async (
  pool: Pool
): Promise<{ completions: number; reservations: number }> => {
  const valid = await numberFromEnv('RESERVATION_VALID_FOR_MS', 600000);
  // Delete completions without a payment
  const sqlC = `
    DELETE FROM
      completions
    WHERE
      reservation IN (
        SELECT
          c.reservation
        FROM
          completions AS c
          LEFT JOIN payments AS p ON c.reservation = p.reservation
          INNER JOIN reservations AS r ON r.id = c.reservation
        WHERE
          p.id IS NULL
          AND r.created_at < (CURRENT_TIMESTAMP - INTERVAL '${valid} milliseconds')
      );`;
  const completions = (await runQuery<{ id: string }>(pool, sqlC));

  // Delete reservations without completions
  const sqlR = `
    DELETE FROM
      reservations
    WHERE
      id IN (
        SELECT
          r.id
        FROM
          reservations AS r
          LEFT JOIN completions AS c ON r.id = c.reservation
        WHERE
          c.reservation IS NULL
          AND r.created_at < (CURRENT_TIMESTAMP - INTERVAL '${valid} milliseconds')
      );`;
  const reservations = (await runQuery<{ id: string }>(pool, sqlR));

  return {
    completions: completions.rowCount || 0,
    reservations: reservations.rowCount || 0,
  };
};
