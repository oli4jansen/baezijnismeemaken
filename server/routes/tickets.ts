import { createHttpError, Pool, Router, Status } from "../deps.ts";

import { getAllTickets, getTicketById, personalizeTicketById } from "../models/tickets.ts";
import { authRequired } from "../utils/middlewares.ts";
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
   * Get a ticket by identifier
   */
  router.get("/:id", authRequired, async (ctx) => {
    ctx.response.body = await getTicketById(ctx.params.id, pool);
  });

  /**
   * PUT on a specific ticket will personalize it with a new email address and name. This will
   * invalidate the existing QR-code and send a new QR-code to the new email adress.
   */
  router.put("/:id", authRequired, async (ctx) => {
    // Get the body from the request
    const body = await getJsonBody(ctx);

    if (!body.owner_email || !body.owner_first_name || !body.owner_last_name || !body.owner_society) {
      throw createHttpError(Status.BadRequest, "please provide new owner email, first name and last name");
    }

    await personalizeTicketById(ctx.params.id, body.owner_email, body.owner_first_name, body.owner_last_name, body.owner_society, pool);

    const ticket = await getTicketById(ctx.params.id, pool);

    await sendTickets([ticket], true);

    ctx.response.body = ticket;
  });


  return router;
};
