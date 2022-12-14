import { Pool } from "../deps.ts";
import { runQuery } from "../utils/database.ts";

export interface TicketScan {
  id: string;
  ticket_id: string;
  created_at: string;
}

/**
 * Create a new ticket_scan object in the database
 */
export const createTicketScan = async (
  ticket_id: string,
  pool: Pool
): Promise<TicketScan> => {
  const sql = `
    INSERT INTO
      ticket_scans
      (ticket_id)
    VALUES
      ($TICKET_ID)
    RETURNING
      id,
      ticket_id,
      created_at;
    `;
  return (await runQuery<TicketScan>(pool, sql, { ticket_id })).rows[0];
};

/**
 * Get a ticket_scan from the database based on the ticket_id
 */
export const getTicketScanByTicketId = async (
  ticket_id: string,
  pool: Pool
): Promise<TicketScan> => {
  const sql = `
    SELECT
      id, ticket_id, created_at
    FROM
      ticket_scans
    WHERE
      ticket_id = $TICKET_ID`;
  return (await runQuery<TicketScan>(pool, sql, { ticket_id })).rows[0];
};
