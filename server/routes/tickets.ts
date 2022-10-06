import { createHttpError, Pool, Router, Status } from "../deps.ts";

import { getAllTickets, getTicketById, personalizeTicketById } from "../models/tickets.ts";
import { getTicketScanByTicketId } from "../models/ticket_scans.ts";
import { authRequired, checkAuthentication, hasAuthentication } from "../utils/auth.ts";
import { decodeFromQR } from "../utils/qr.ts";
import { getJsonBody } from "../utils/request.ts";
import { sendTickets } from "../utils/tickets.ts";

export const createTicketsRouter = (
  pool: Pool
): Router => {
  const router = new Router();

  /**
   * Get all tickets. Only available for admins.
   */
  router.get("/", authRequired, async (ctx) => {
    ctx.response.body = await getAllTickets(pool);
  });

  /**
   * Get a ticket by identifier or QR code
   */
  router.get("/:idOrQr", async (ctx) => {
    if (hasAuthentication(ctx)) {

      // ADMIN route
      await checkAuthentication(ctx);
      ctx.response.body = await getTicketById(ctx.params.idOrQr, pool);

    } else {

      // OWNER OF TICKET route
      // Try to decode the QR code string
      let ticket_id: string, owner_counter: number;
      try {
        [ticket_id, owner_counter] = await decodeFromQR(ctx.params.idOrQr);
      } catch (error) {
        console.log(error.message, ctx.params.qr);
        throw createHttpError(Status.BadRequest, 'invalid ticket');
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

      ctx.response.body = ticket;
    }
  });

  /**
   * PUT on a specific ticket will personalize it with a new email address and name. This will
   * invalidate the existing QR-code and send a new QR-code to the new email adress.
   */
  router.put("/:idOrQr", async (ctx) => {
    // Get the body from the request
    const body = await getJsonBody(ctx);
    console.log(body);
    if (!body.owner_email || !body.owner_first_name || !body.owner_last_name) {
      throw createHttpError(Status.BadRequest, "please provide new owner email, first name and last name");
    }

    let ticket_id;
    if (hasAuthentication(ctx)) {
      // ADMIN route
      await checkAuthentication(ctx);
      ticket_id = ctx.params.idOrQr;
    } else {
      // OWNER OF TICKET route
      let owner_counter: number;
      try {
        [ticket_id, owner_counter] = await decodeFromQR(ctx.params.idOrQr);
      } catch (_) {
        throw createHttpError(Status.BadRequest, 'invalid ticket');
      }

      const isAlreadyScanned = await getTicketScanByTicketId(ticket_id, pool);
      if (isAlreadyScanned) {
        throw createHttpError(Status.BadRequest, 'ticket already scanned');
      }

      const ticket = await getTicketById(ticket_id, pool);
      if (ticket.owner_counter !== owner_counter) {
        throw createHttpError(Status.BadRequest, 'ticket re-personalized');
      }
    }

    await personalizeTicketById(ticket_id, body.owner_email, body.owner_first_name, body.owner_last_name, pool);

    const ticket = await getTicketById(ticket_id, pool);

    await sendTickets([ticket], true);

    ctx.response.body = ticket;
  });


  return router;
};
