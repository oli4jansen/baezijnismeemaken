import { createHttpError, Evt, Pool, Router, Status } from "../deps.ts";

import { getTicketStatistics } from "../models/tickets.ts";
import { getAllTicketTypes } from "../models/ticket_types.ts";
import { verifyToken } from "../utils/crypto.ts";

const getStatistics = async (pool: Pool) =>
  JSON.stringify({
    totals: await getAllTicketTypes(pool),
    sales_per_day: await getTicketStatistics(pool)
  });

/**
 * Endpoints to get live ticket statistics.
 */
export const createStatisticsRouter = (
  pool: Pool,
  updates: Evt<number>
): Router => {
  const router = new Router();

  /**
   * The / route in the statistics router will try to update itself to a WebSocket connection
   * to send live updates on statistics.
   */
  router.get("/", (ctx) => {
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
        ws.send(await getStatistics(pool));

        // Then, attach to the `updates` emitter and send stats to client whenever new tickets are reserved
        updates.attach(evtCtx, async () => ws.send(await getStatistics(pool)));
      } catch (error) {
        console.log(error);
        ws.send(JSON.stringify({ "error": error }));
      }
    };

    // Client closes WebSocket, Ctx.done() detaches all listeners to `updates`
    ws.onclose = () => evtCtx.done();
  });

  return router;
};
