import {
  createHttpError,
  Router,
  Status,
  Pool
} from "../deps.ts";

import { createTicketScan, getTicketScanByTicketId } from "../models/ticket_scans.ts";
import { decodeFromQR } from "../utils/qr.ts";
import { getJsonBody } from "../utils/request.ts";
import { getTicketById } from "../models/tickets.ts";
import { authRequired } from "../utils/middlewares.ts";

/**
 * Provides API routes related to the scanning of tickets.
 */
export const createTicketScansRouter = (pool: Pool): Router => {
  const router = new Router();

  /**
   * Create a new ticket scan
   */
  router.post("/", authRequired, async (ctx) => {
    // Get the QR code string from the request body
    const ts = await getJsonBody(ctx);
    if (!ts || !ts.qr || typeof ts.qr !== 'string') {
      throw createHttpError(
        Status.BadRequest,
        `new ticket scan does not pass validation`
      );
    }

    // Try to decode the QR code string
    let ticket_id: string, owner_counter: number;
    try {
      [ticket_id, owner_counter] = await decodeFromQR(ts.qr);
    } catch (error) {
      console.log(error.message, ts.qr);
      throw createHttpError(Status.BadRequest, 'ticket could not be decrypted');
    }

    const isAlreadyScanned = await getTicketScanByTicketId(ticket_id, pool);
    if (isAlreadyScanned) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = {
        error: 'ticket already scanned',
        ticketScan: isAlreadyScanned
      };
      return;
    }

    const ticket = await getTicketById(ticket_id, pool);
    if (ticket.owner_counter !== owner_counter) {
      ctx.response.status = Status.Gone;
      ctx.response.body = {
        error: 'ticket re-personalized',
        ticket
      };
      return;
    }

    // Mark the ticket as scanned by creating a ticket_scan object in database
    await createTicketScan(ticket_id, pool);

    ctx.response.body = {
      ticket: await getTicketById(ticket_id, pool)
    };
  });

  return router;
};
