import { Pool } from "../deps.ts";
import { runQuery } from "../utils/database.ts";

export interface Payment {
  id: string;
  reservation: string;
  created_at: string;
  mollie_id: string;
}

export interface NewPayment {
  reservation: string;
  mollie_id: string;
}

// deno-lint-ignore no-explicit-any
export const isNewCompletion = (arg: any): arg is NewPayment => {
  return (
    arg &&
    arg.reservation &&
    typeof arg.reservation == "string" &&
    arg.mollie_id &&
    typeof arg.mollie_id == "string"
  );
};

export const createPayment = async (
  pay: NewPayment,
  pool: Pool
): Promise<Payment> => {
  const sql = `INSERT INTO payments (reservation, created_at, mollie_id) VALUES ($RESERVATION, DEFAULT, $MOLLIE_ID) RETURNING id, reservation, created_at, mollie_id;`;
  return (await runQuery<Payment>(pool, sql, { ...pay })).rows[0];
};

export const getAllPayments = async (
  pool: Pool
): Promise<Payment[]> => {
  const sql = `SELECT id, reservation, created_at, mollie_id FROM payments;`;
  return (await runQuery<Payment>(pool, sql)).rows;
};

export const getPaymentForReservation = async (
  reservation: string,
  pool: Pool
): Promise<Payment> => {
  const sql = `SELECT id, reservation, created_at, mollie_id FROM payments WHERE reservation=$RESERVATION;`;
  return (await runQuery<Payment>(pool, sql, { reservation })).rows[0];
};
