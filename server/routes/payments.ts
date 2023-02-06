import {
  createHttpError, Evt, Pool, Router,
  Status
} from "../deps.ts";

import { createPayment, getPaymentForReservation } from "../models/payments.ts";
import { getReservationWithDetails } from "../models/reservations.ts";
import { checkAuthentication } from "../utils/auth.ts";
import { shopShouldBeOpen } from "../utils/middlewares.ts";
import { createMolliePayment, fetchMolliePayment } from "../utils/mollie.ts";
import { getFormBody } from "../utils/request.ts";
import { sendTickets } from "../utils/tickets.ts";

export const createPaymentsRouter = (pool: Pool, updates: Evt<number>): Router => {
  const router = new Router();

  /**
   * Check if a payment has already been made for a reservation
   * TODO: ip check
   */
  router.get("/:reservation", shopShouldBeOpen, async (ctx) => {
    const payment = await getPaymentForReservation(ctx.params.reservation, pool);

    if (payment === undefined) {
      throw createHttpError(Status.NotFound, "payment not done yet");
    }

    try {
      // If authenticated, the entire payment may be viewed
      await checkAuthentication(ctx);
      ctx.response.body = payment;
    } catch {
      // Otherwise, only the existence may be checked
      ctx.response.body = { created_at: payment.created_at };
    }
  });

  /**
   * Called when a user want to create a Mollie payment for a given reservation. In practice,
   * this only happens when a user accidentally cancels the first payment, as a Mollie payment
   * is already created when the completion of a reservation is posted (see completions.ts router).
   */
  router.post("/:reservation", shopShouldBeOpen, async (ctx) => {
    const existing = await getPaymentForReservation(ctx.params.reservation, pool);

    if (existing !== undefined) {
      throw createHttpError(Status.BadRequest, "reservation already paid");
    }

    const res = await getReservationWithDetails(ctx.params.reservation, pool);

    // Also create a payment record with the payment provider
    const payment = await createMolliePayment(ctx.params.reservation, res.price);

    ctx.response.body = {
      checkout: payment._links.checkout.href,
    };
  });

  /**
   * Called by Mollie with payment confirmation
   */
  router.post("/:reservation/webhook", async (ctx) => {
    const id = (await getFormBody(ctx))?.get('id');
    if (!id) {
      console.error('Mollie webhook called but without ID');
      return;
    }

    // TODO: this should happen in a Worker

    const molliePayment = await fetchMolliePayment(id);

    if (molliePayment.status === 'paid') {

      // TODO: what errors could occur here? How should we handle these? Eg double payments and such
      // Also: the webhook seems to get called multiple times so errors WILL occur here
      try {
        await createPayment({
          reservation: ctx.params.reservation,
          mollie_id: id
        }, pool);

        const reservation = await getReservationWithDetails(ctx.params.reservation, pool);
        await sendTickets(reservation.tickets);

        console.log('PAYED, post update');
        updates.post(updates.postCount + 1);
      } catch (error) {
        console.log(error);
      }

    } else {
      // TODO
      console.error('Mollie status was not paid, not implemented yet');
    }

    // nikszeggend response
    ctx.response.status = 200;
    ctx.response.body = 'ack';
  });

  return router;
};
