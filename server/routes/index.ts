import { createHttpError, Evt, Pool, Router, Status } from "../deps.ts";

import { Ticket } from "../models/tickets.ts";
import { verifyToken } from "../utils/crypto.ts";
import { createAuthRouter } from './auth.ts';
import { createCompletionsRouter } from "./completions.ts";
import { createPaymentsRouter } from "./payments.ts";
import { createReservationsRouter } from "./reservations.ts";
import { createTicketsRouter } from "./tickets.ts";
import { createTicketScansRouter } from "./ticket_scans.ts";
import { createTicketTypesRouter } from "./ticket_types.ts";

export const createRouter = (pool: Pool, updates: Evt<Ticket>): Router => {
  const router = new Router();

  // TODO: move websocket into its own file
  router.get("/wss", (ctx) => {
    // Try to upgrade from HTTP to WebSocket
    if (!ctx.isUpgradable) {
      throw createHttpError(Status.NotImplemented, "could not upgrade to websocket");
    }
    const ws = ctx.upgrade();

    // Construct a new Ctx object to keep track of whose attached to the Evt
    const evtCtx = Evt.newCtx();

    ws.onmessage = async (m) => {
      // The only message expected from the client is the JWT token
      try {
        await verifyToken(m.data);
        // Once verified, attach to the `updates` emitter and send messages to client
        updates.attach(evtCtx, (rwd) => ws.send(JSON.stringify(rwd)));
      } catch (error) {
        console.log(error);
        ws.send(JSON.stringify({ "error": error }));
      }
    };

    // Client closes WebSocket, Ctx.done() detaches all listeners to `updates`
    ws.onclose = () => evtCtx.done();
  });

  router.get("/ticket_types", createTicketTypesRouter(pool).routes());
  router.get("/reservations", createReservationsRouter(pool, updates).routes());
  router.get("/completions", createCompletionsRouter(pool).routes());
  router.get("/payments", createPaymentsRouter(pool).routes());
  router.get("/auth", createAuthRouter().routes());
  router.get("/ticket_scans", createTicketScansRouter(pool).routes());
  router.get("/tickets", createTicketsRouter(pool).routes());

  return router;
};
