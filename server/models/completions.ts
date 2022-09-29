import { Pool } from "../deps.ts";
import { runQuery, runTransaction } from "../utils/database.ts";
import { personalizeTicketsByReservation } from "./tickets.ts";

export interface Completion {
  reservation: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface NewCompletion {
  reservation: string;
  email: string;
  first_name: string;
  last_name: string;
}

// deno-lint-ignore no-explicit-any
export const isNewCompletion = (arg: any): arg is NewCompletion => {
  return (
    arg &&
    arg.reservation &&
    typeof arg.reservation == "string" &&
    arg.email &&
    typeof arg.email == "string" &&
    arg.first_name &&
    typeof arg.first_name == "string" &&
    arg.last_name &&
    typeof arg.last_name == "string"
  );
};

export const createCompletion = async (
  com: NewCompletion,
  pool: Pool
): Promise<Completion> => {
  return await runTransaction(pool, async (trans) => {
    // Personalize the tickets with the personal details of the reserver
    await personalizeTicketsByReservation(com, trans);

    // Insert the completion (db will throw error if reservation already has one)
    const sql = `
      INSERT INTO
        completions (reservation, email, first_name, last_name, created_at)
      VALUES
        ($RESERVATION, $EMAIL, $FIRST_NAME, $LAST_NAME, DEFAULT)
      RETURNING
        reservation,
        email,
        first_name,
        last_name,
        created_at;
      `;
    return (await trans.queryObject<Completion>(sql, { ...com })).rows[0];
  });
};

export const getAllCompletions = async (
  pool: Pool
): Promise<Completion[]> => {
  // TODO: for admin eyes only
  const sql = `SELECT * FROM completions;`;
  return (await runQuery<Completion>(pool, sql)).rows;
};

export const getCompletionForReservation = async (
  reservation: string,
  pool: Pool
): Promise<Completion> => {
  // TODO: for admin eyes only
  const sql = `SELECT reservation, email, first_name, last_name, created_at FROM completions WHERE reservation=$RESERVATION;`;
  return (await runQuery<Completion>(pool, sql, { reservation })).rows[0];
};
