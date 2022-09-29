import {
  createHttpError,
  Router,
  Status,
  Pool
} from "../deps.ts";

import { authRequired } from "../utils/auth.ts";
import { createTicketScan, getIsTicketAlreadyScanned } from "../models/ticket_scans.ts";
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
        "new ticket scan does not pass validation"
      );
    }

    const ticket_id = await decodeFromQR(ts.qr);

    const isAlreadyScanned = await getIsTicketAlreadyScanned(ticket_id, pool);
    if (isAlreadyScanned) {
      throw createHttpError(Status.Conflict, "ticket already scanned");
    }

    // Mark the ticket as scanned
    await createTicketScan(ticket_id, pool);

    ctx.response.body = await getTicketById(ticket_id, pool);
  });

  return router;
};
