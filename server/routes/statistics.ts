import { Pool, Router } from "../deps.ts";

import { getTicketStatistics } from "../models/tickets.ts";
import { authRequired } from "../utils/auth.ts";

/**
 * Endpoints to get ticket statistics.
 */
export const createStatisticsRouter = (
  pool: Pool
): Router => {
  const router = new Router();

  router.get("/", authRequired, async (ctx) => {
    const statistics = await getTicketStatistics(pool);
    ctx.response.body = statistics;
  });

  return router;
};
