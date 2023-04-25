import { Pool, Router } from "../deps.ts";

import { getAllTicketTypes } from "../models/ticket_types.ts";
import { getTicketStatistics } from "../models/tickets.ts";
import { authRequired } from "../utils/middlewares.ts";

const getStatistics = async (pool: Pool) =>
  JSON.stringify({
    totals: await getAllTicketTypes(pool),
    sales_per_day: await getTicketStatistics(pool)
  });

/**
 * Endpoints to get live ticket statistics.
 */
export const createStatisticsRouter = (
  pool: Pool
): Router => {
  const router = new Router();

  router.get("/", authRequired, async (ctx) => {
    ctx.response.body = await getStatistics(pool);
  });

  return router;
};
