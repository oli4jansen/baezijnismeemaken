import { Pool, Router } from "../deps.ts";

import { createAuthRouter } from './auth.ts';
import { createCompletionsRouter } from "./completions.ts";
import { createPaymentsRouter } from "./payments.ts";
import { createReservationsRouter } from "./reservations.ts";
import { createSettingsRouter } from "./settings.ts";
import { createStatisticsRouter } from "./statistics.ts";
import { createTicketsRouter } from "./tickets.ts";
import { createTicketScansRouter } from "./ticket_scans.ts";
import { createTicketTypesRouter } from "./ticket_types.ts";

/**
 * Creates the application routes, e.g. all API root endpoints available.
 */
export const createRouter = (pool: Pool): Router => {
  const router = new Router();

  router.get("/ticket_types", createTicketTypesRouter(pool).routes());
  router.get("/reservations", createReservationsRouter(pool).routes());
  router.get("/completions", createCompletionsRouter(pool).routes());
  router.get("/payments", createPaymentsRouter(pool).routes());
  router.get("/auth", createAuthRouter().routes());
  router.get("/ticket_scans", createTicketScansRouter(pool).routes());
  router.get("/tickets", createTicketsRouter(pool).routes());
  router.get("/statistics", createStatisticsRouter(pool).routes());
  router.get("/settings", createSettingsRouter().routes());

  return router;
};
