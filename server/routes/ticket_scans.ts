import {
  createHttpError,
  Router,
  Status,
  Pool
} from "../deps.ts";

import { authRequired } from "../utils/auth.ts";
import { createTicketScan, getTicketScanByTicketId } from "../models/ticket_scans.ts";
import { decodeFromQR } from "../utils/qr.ts";
import { getJsonBody } from "../utils/request.ts";
import { getTicketById } from "../models/tickets.ts";

export const createTicketScansRouter = (pool: Pool): Router => {
  const router = new Router();

  router.post("/", authRequired, async (ctx) => {
    const ts = await getJsonBody(ctx);
    if (!ts || !ts.qr || typeof ts.qr !== 'string') {
      throw createHttpError(
        Status.BadRequest,
        `new ticket scan does not pass validation`
      );
    }

    const [ticket_id, owner_counter] = await decodeFromQR(ts.qr);

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

    // Mark the ticket as scanned
    await createTicketScan(ticket_id, pool);

    ctx.response.body = {
      ticket: await getTicketById(ticket_id, pool)
    };
  });

  return router;
};
