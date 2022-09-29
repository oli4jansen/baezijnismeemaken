import { Pool } from "../deps.ts";
import { runQuery } from "../utils/database.ts";

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  amount_available: number;
  amount_left?: number;
}

export interface NewTicketType {
  name: string;
  description: string;
  price: number;
  amount_available: number;
}

// deno-lint-ignore no-explicit-any
export const isNewTicketType = (arg: any): arg is NewTicketType => {
  return (
    arg &&
    arg.name &&
    typeof arg.name == "string" &&
    arg.description &&
    typeof arg.description == "string" &&
    arg.price &&
    typeof arg.price == "number" &&
    arg.amount_available &&
    typeof arg.amount_available == "number"
  );
};

export const createTicketType = async (
  tt: NewTicketType,
  pool: Pool
): Promise<TicketType> => {
  const sql = `INSERT INTO ticket_types (name, description, price, amount_available) VALUES ($NAME, $DESCRIPTION, $PRICE, $AMOUNT_AVAILABLE) RETURNING id, name, description, price, amount_available;`;
  return (await runQuery<TicketType>(pool, sql, { ...tt })).rows[0];
};

export const getNumberTicketsLeft = async (pool: Pool): Promise<{ id: string; amount_left: number; }[]> => {
  const sql = `
    SELECT
      tt.id,
      COALESCE(
        CAST(amount_available - COUNT(t.id) AS int),
        amount_available
      ) AS amount_left
    FROM
      ticket_types AS tt
      LEFT JOIN tickets AS t ON tt.id = t.ticket_type
    GROUP BY
      tt.id
    ORDER BY
      tt.name ASC;
  `;

  return (await runQuery<{ id: string; amount_left: number; }>(pool, sql,)).rows;
};

export const getAllTicketTypes = async (pool: Pool): Promise<TicketType[]> => {
  const sql = `
    SELECT
      tt.id,
      name,
      description,
      price,
      amount_available,
      COALESCE(CAST(amount_available - COUNT(t.id) AS int), amount_available) AS amount_left
    FROM
      ticket_types AS tt
      LEFT JOIN tickets AS t ON tt.id = t.ticket_type
    GROUP BY
      tt.id
    ORDER BY
      tt.name
    ASC;`

  return (await runQuery<TicketType>(pool, sql)).rows;
};

export const getTicketType = async (
  id: string,
  pool: Pool
): Promise<TicketType> => {
  const sql = `SELECT id, name, description, price, amount_available FROM ticket_types WHERE id=$ID;`;
  return (await runQuery<TicketType>(pool, sql, { id })).rows[0];
};

export const updateTicketType = async (
  id: string,
  tt: NewTicketType,
  pool: Pool
): Promise<TicketType> => {
  const sql = `UPDATE ticket_types SET name=$NAME, description=$DESCRIPTION, price=$PRICE, amount_available=$AMOUNT_AVAILABLE WHERE id=$ID RETURNING id, name, description, price, amount_available;`;
  return (await runQuery<TicketType>(pool, sql, { ...tt, id })).rows[0];
};

export const deleteTicketType = async (
  id: string,
  pool: Pool
): Promise<{ id: string }> => {
  const sql = `DELETE FROM ticket_types WHERE id=$ID RETURNING id;`;
  return (await runQuery<{ id: string; }>(pool, sql, { id })).rows[0];
};
