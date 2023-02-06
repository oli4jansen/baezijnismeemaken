import { Context, createHttpError, Pool, Router, Status } from "../deps.ts";

import {
  createReservation,
  getAllReservations,
  getReservationWithDetails,
  isNewReservation
} from "../models/reservations.ts";
import { shopShouldBeOpen, authRequired } from "../utils/middlewares.ts";
import { getJsonBody } from "../utils/request.ts";

/**
 * Provides API routes related to reservations.
 */
export const createReservationsRouter = (
  pool: Pool
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
   * TODO: implement some sort of IP check? Probably not everyone should see this
   */
  router.get("/:id", shopShouldBeOpen, async (ctx) => {
    ctx.response.body = await getReservationWithDetails(ctx.params.id, pool);
  });

  /**
   * Make a new reservation.
   */
  router.post("/", shopShouldBeOpen, async (ctx: Context) => {
    const res = await getJsonBody(ctx);
    if (!isNewReservation(res)) {
      throw createHttpError(Status.BadRequest, "new reservation does not pass validation");
    }

    const reservation = await createReservation(res, pool);
    ctx.response.body = reservation;
  });

  return router;
};
