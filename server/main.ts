import { Application, oakCors } from "./deps.ts";

import { connectToDatabase } from "./utils/database.ts";
import { createRouter } from "./routes/index.ts";
import { logger, errors } from "./utils/middlewares.ts";
import { startRepeatedCleanupOfExpiredReservations } from "./utils/cleanup.ts";
import { numberFromEnv } from "./utils/env.ts";

/**
 * This is the main entrypoint of the server application.
 * 
 * It connects to the database, starts the application and listens to the specified port.
 */

console.log('Connecting to database');
const pool = await connectToDatabase();

console.log('Setting up application');
const app = new Application();

// Add CORS headers to all requests
app.use(oakCors());

// Use the custom logger
app.use(logger);

// Catch errors that are thrown and return appropriate status codes
app.use(errors);

// Routing
const router = createRouter(pool);
app.use(router.routes());
app.use(router.allowedMethods());

// If the server starts succesfully, start the cleanup sequence
app.addEventListener("listen", async () => await startRepeatedCleanupOfExpiredReservations(pool));

// Start server on the./ru   port from the environment file
const port = await numberFromEnv('PORT', 8080, true);
console.log(`Going to listen on port ${port}`);
await app.listen({ port });
