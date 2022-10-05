import { Context, Router, Pool, Evt, createHttpError, Status } from "../deps.ts";

import {
  createReservation,
  getAllReservations,
  getReservationWithDetails,
  isNewReservation
} from "../models/reservations.ts";
import { getJsonBody } from "../utils/request.ts";
import { authRequired } from "../utils/auth.ts";
import { Ticket } from "../models/tickets.ts";

/**
 * Provides API routes related to reservations.
 */
export const createReservationsRouter = (
  pool: Pool,
  updates: Evt<Ticket>
): Router => {
  const router = new Router();

  /**
   * Get all reservations. Only for admin eyes.
   */
  router.get("/", authRequired, async (ctx) => {
    ctx.response.body = await getAllReservations(pool);
  });

  /**
   * Get a reservation by its ID.
   *
   * TODO: implement some sort of IP check
   */
  router.get("/:id", async (ctx) => {
    ctx.response.body = await getReservationWithDetails(ctx.params.id, pool);
  });

  /**
   * Make a new reservation.
   */
  router.post("/", async (ctx: Context) => {
    const res = await getJsonBody(ctx);
    if (!isNewReservation(res)) {
      throw createHttpError(Status.BadRequest, "new reservation does not pass validation");
    }

    const reservation = await createReservation(res, pool);
    ctx.response.body = reservation;

    reservation.tickets.forEach(t => updates.post(t));
  });

  return router;
};
