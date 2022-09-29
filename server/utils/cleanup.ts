import { Pool } from "../deps.ts";

import { deleteExpiredReservations } from "../models/reservations.ts";
import { numberFromEnv } from "./env.ts";

/**
 * Sets up a cleaning job every n seconds
 */
export const startRepeatedCleanupOfExpiredReservations = async (pool: Pool) => {
  setInterval(async () => await cleanup(pool), await numberFromEnv('CLEANUP_EVERY_MS', 60000, true));
};

/**
 * Cleans up expired reservations once
 */
const cleanup = async (pool: Pool) => {
  const { reservations, completions } = await deleteExpiredReservations(pool);
  if (reservations > 0 || completions > 0) {
    console.log(`Cleaned up ${reservations} reservations, ${0} completions`);
  }
};
