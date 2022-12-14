import {
  Pool, Context,
  createHttpError,
  Router,
  Status,
} from "../deps.ts";

import { authRequired } from "../utils/auth.ts";
import {
  createCompletion,
  getAllCompletions,
  getCompletionForReservation,
  isNewCompletion,
} from "../models/completions.ts";
import { getReservationWithDetails, isExpired } from "../models/reservations.ts";
import { createMolliePayment } from "../utils/mollie.ts";
import { getJsonBody } from "../utils/request.ts";

/**
 * Provides API routes related to completions of reservations.
 */
export const createCompletionsRouter = (pool: Pool): Router => {
  const router = new Router();

  /**
   * Get all completions. Only for admin eyes.
   */
  router.get("/", authRequired, async (ctx) => {
    ctx.response.body = await getAllCompletions(pool);
  });

  /**
   * Get a completion by reservation ID.
   *
   * TODO: maybe implement some sort of IP check
   */
  router.get("/:reservation", async (ctx) => {
    const completion = await getCompletionForReservation(ctx.params.reservation, pool);

    if (completion === undefined) {
      throw createHttpError(
        Status.NotFound,
        "reservation not yet made complete"
      );
    }

    ctx.response.body = completion;
  });

  /**
   * Complete a reservation by creating a new completion.
   */
  router.post("/", async (ctx: Context) => {
    // Get the completion from the POST body
    const com = await getJsonBody(ctx);
    if (!isNewCompletion(com)) {
      throw createHttpError(Status.BadRequest, "completion does not pass validation");
    }

    // Get the reservation from the database
    const res = await getReservationWithDetails(com.reservation, pool);

    // Throw an error if the reservation is expired
    if (await isExpired(res.created_at)) {
      throw createHttpError(Status.Forbidden, "reservation expired");
    }

    const completion = await createCompletion(com, pool);

    if (completion === undefined) {
      throw createHttpError(
        Status.InternalServerError,
        "failed to create completion"
      );
    }

    // Also create a payment record with the payment provider
    const payment = await createMolliePayment(res.id, res.price);

    ctx.response.body = {
      checkout: payment._links.checkout.href,
    };
  });

  return router;
};
