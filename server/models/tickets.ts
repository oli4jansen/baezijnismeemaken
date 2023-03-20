import { Pool, Transaction } from "../deps.ts";
import { runQuery } from "../utils/database.ts";
import { NewCompletion } from "./completions.ts";

export interface Ticket {
  // Unique identifier of this one specific ticket
  id: string;
  // Identifier of the reservation of which this ticket is a part
  reservation: string;
  // Identifier of the type of this ticket
  ticket_type: string;
  // Name of the type of this ticket
  ticket_name?: string;
  // A couter that is upped if the ticket is re-personalized (invalides old QR codes)
  owner_counter: number;
  // Details of the owner of the ticket
  owner_email: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_society: string;
  // Details of the person that reserved the ticket (may differ from owner)
  reserver_email?: string;
  reserver_first_name?: string;
  reserver_last_name?: string;
}

export interface TicketStatistics {
  date: string;
  ticket_type: string;
  name: string;
  amount: number;
  revenue: number;
}

/**
 * Gets all tickets in the database.
 * 
 * Also includes information from the reservation (when was the ticket reserved), completion (personal details
 * of the person that reserved tickets), ticket type (id, name and price) and whether the ticket was paid and scanned.
 * To do this, multiple tables need to be joined together.
 */
export const getAllTickets = async (pool: Pool): Promise<Ticket[]> => {
  const sql = `
    SELECT
      t.id AS id,
      t.reservation AS reservation,
      t.ticket_type AS ticket_type,
      STRING_AGG(DISTINCT tt.name, ',') AS ticket_name,
      MAX(tt.price) AS ticket_price,
      t.owner_counter AS owner_counter,
      t.owner_email AS owner_email,
      t.owner_first_name AS owner_first_name,
      t.owner_last_name AS owner_last_name,
      t.owner_society AS owner_society,
      STRING_AGG(DISTINCT c.email, ',') AS reserver_email,
      STRING_AGG(DISTINCT c.first_name, ',') AS reserver_first_name,
      STRING_AGG(DISTINCT c.last_name, ',') AS reserver_last_name,
      BOOL_OR(p.id IS NOT NULL) AS paid,
      BOOL_OR(ts.id IS NOT NULL) AS scanned,
      r.created_at AS created_at
    FROM
      tickets AS t
      JOIN reservations AS r ON r.id = t.reservation
      JOIN completions AS c ON c.reservation = t.reservation
      JOIN ticket_types AS tt ON t.ticket_type = tt.id
      LEFT JOIN payments AS p ON r.id = p.reservation
      LEFT JOIN ticket_scans AS ts ON t.id = ts.ticket_id
    GROUP BY
      t.id,
      c.reservation,
      r.id,
      p.id,
      ts.id
    ORDER BY
      r.created_at
    DESC;
    `;

  return (await runQuery<Ticket>(pool, sql)).rows;
};

export const getTicketById = async (
  id: string,
  pool: Pool
): Promise<Ticket> => {
  const resultSql = `
    SELECT
      t.id AS id,
      t.reservation AS reservation,
      t.ticket_type AS ticket_type,
      STRING_AGG(DISTINCT tt.name, ',') AS ticket_name,
      MAX(tt.price) AS ticket_price,
      t.owner_counter AS owner_counter,
      CAST(COUNT(ttt.id) AS int) AS num_tickets_in_reservation,
      t.owner_email AS owner_email,
      t.owner_first_name AS owner_first_name,
      t.owner_last_name AS owner_last_name,
      t.owner_society AS owner_society,
      STRING_AGG(DISTINCT c.email, ',') AS reserver_email,
      STRING_AGG(DISTINCT c.first_name, ',') AS reserver_first_name,
      STRING_AGG(DISTINCT c.last_name, ',') AS reserver_last_name,
      r.created_at AS created_at
    FROM
      tickets AS t
      JOIN reservations AS r ON r.id = t.reservation
      JOIN completions AS c ON c.reservation = t.reservation
      JOIN ticket_types AS tt ON t.ticket_type = tt.id
      JOIN tickets AS ttt ON t.reservation = ttt.reservation
    WHERE
      t.id = $ID
    GROUP BY
      t.id,
      c.reservation,
      r.id;
  `;
  return (await runQuery<Ticket>(pool, resultSql, { id })).rows[0];
};

export const getTicketStatistics = async (pool: Pool): Promise<TicketStatistics[]> => {
  const sql = `
    SELECT
      created_at::date AS date,
      ticket_type,
      tt.name,
      CAST(COUNT(*) AS int) AS amount,
      CAST(COUNT(*) * tt.price AS int) AS revenue
    FROM
      tickets
      JOIN ticket_types AS tt ON ticket_type = tt.id
    GROUP BY
      created_at::date,
      ticket_type,
      tt.id
    ORDER BY
      created_at::date
    DESC;`;

  return (await runQuery<TicketStatistics>(pool, sql)).rows;
};

export const personalizeTicketById = async (
  id: string,
  owner_email: string,
  owner_first_name: string,
  owner_last_name: string,
  owner_society: string,
  pool: Pool
): Promise<Ticket> => {
  const sql = `
    UPDATE
      tickets 
    SET
      owner_email=$OWNER_EMAIL,
      owner_first_name=$OWNER_FIRST_NAME,
      owner_last_name=$OWNER_LAST_NAME,
      owner_society=$OWNER_SOCIETY,
      owner_counter=owner_counter + 1
    WHERE
      id=$ID
    RETURNING
      id, reservation, ticket_type, owner_counter, owner_email, owner_first_name, owner_last_name, owner_society;
    `;
  return (await runQuery<Ticket>(pool, sql, { id, owner_email, owner_first_name, owner_last_name, owner_society })).rows[0];
};


/**
 * Only allowed inside a transaction because it's related to creating a reservation
 */
export const createMultipleTickets = async (
  reservation: string,
  ticket_type: string,
  amount: number,
  trans: Transaction
) => {
  let inserts = amount;
  if (inserts === 0) {
    return;
  }
  let linkSql = `INSERT INTO tickets (reservation, ticket_type) VALUES `;
  while (inserts--) {
    linkSql += '($RESERVATION, $TICKET_TYPE)';
    if (inserts > 0) {
      linkSql += ', ';
    } else {
      linkSql += ';';
    }
  }
  await trans.queryObject(linkSql, { reservation, ticket_type });
};

/**
 * Only allowed in a transaction because it's related to completing a reservation
 */
export const personalizeTicketsByReservation = async (
  { reservation, email, first_name, last_name, society }: NewCompletion,
  transaction: Transaction
): Promise<{ id: string }[]> => {
  const sql = `
    UPDATE
      tickets 
    SET
      owner_email=$EMAIL,
      owner_first_name=$FIRST_NAME,
      owner_last_name=$LAST_NAME,
      owner_society=$SOCIETY
    WHERE
      reservation=$RESERVATION
    RETURNING
      id;
    `;
  return (await transaction.queryObject<{ id: string }>(sql, { reservation, email, first_name, last_name, society })).rows;
};

