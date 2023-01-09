import { createHttpError, Evt, Pool, Router, Status } from "../deps.ts";

import { getTicketStatistics } from "../models/tickets.ts";
import { verifyToken } from "../utils/crypto.ts";
import { createAuthRouter } from './auth.ts';
import { createCompletionsRouter } from "./completions.ts";
import { createPaymentsRouter } from "./payments.ts";
import { createReservationsRouter } from "./reservations.ts";
import { createStatisticsRouter } from "./statistics.ts";
import { createTicketsRouter } from "./tickets.ts";
import { createTicketScansRouter } from "./ticket_scans.ts";
import { createTicketTypesRouter } from "./ticket_types.ts";

export const createRouter = (pool: Pool, updates: Evt<number>): Router => {
  const router = new Router();

  // TODO: move websocket into its own file
  router.get("/live", (ctx) => {
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

        // Once verified, send the initial statistics
        ws.send(JSON.stringify(await getTicketStatistics(pool)));

        // Then, attach to the `updates` emitter and send stats to client whenever new tickets are reserved
        updates.attach(evtCtx, async () => {
          ws.send(JSON.stringify(await getTicketStatistics(pool)));
        });
      } catch (error) {
        console.log(error);
        ws.send(JSON.stringify({ "error": error }));
      }
    };

    // Client closes WebSocket, Ctx.done() detaches all listeners to `updates`
    ws.onclose = () => evtCtx.done();
  });

  router.get("/ticket_types", createTicketTypesRouter(pool).routes());
  router.get("/reservations", createReservationsRouter(pool).routes());
  router.get("/completions", createCompletionsRouter(pool).routes());
  router.get("/payments", createPaymentsRouter(pool, updates).routes());
  router.get("/auth", createAuthRouter().routes());
  router.get("/ticket_scans", createTicketScansRouter(pool).routes());
  router.get("/tickets", createTicketsRouter(pool).routes());
  router.get("/statistics", createStatisticsRouter(pool).routes());

  return router;
};
