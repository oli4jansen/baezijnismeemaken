import { Application, Evt, oakCors } from "./deps.ts";

import { connectToDatabase } from "./utils/database.ts";
import { createRouter } from "./routes/index.ts";
import { logger, errors } from "./utils/middlewares.ts";
import { startRepeatedCleanupOfExpiredReservations } from "./utils/cleanup.ts";

/**
 * This is the main entrypoint of the server application.
 */

const pool = await connectToDatabase();
const updates = Evt.create<number>();
const app = new Application();

// Add CORS headers to all requests
app.use(oakCors());

// Use the custom logger
app.use(logger);

// Catch errors that are thrown and return appropriate status codes
app.use(errors);

// Routing
const router = createRouter(pool, updates);
app.use(router.routes());
app.use(router.allowedMethods());

// If the server starts succesfully, start the cleanup sequence
app.addEventListener("listen", async () => await startRepeatedCleanupOfExpiredReservations(pool));

// Also log the port number the server is listening on
app.addEventListener("listen", () => console.log(`Listening on port 8080`));

// Start server
await app.listen({ port: 8080 });
