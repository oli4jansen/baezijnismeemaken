import {
  Middleware, green,
  cyan,
  red,
  yellow,
  format,
createHttpError,
Status,
RouterMiddleware,
} from "../deps.ts";
import { isHttpError } from "../deps.ts";
import { checkAuthentication } from "./auth.ts";
import { booleanFromEnv } from "./env.ts";

/**
 * Router middleware for Oak that will check if a valid JWT is passed in the Authorization
 * header of the request and respond with an 401 Unauthorized if this is not the case.
 */
export const authRequired: RouterMiddleware<string> = async (ctx, next) => {
  await checkAuthentication(ctx);
  await next();
};

/**
 * Middleware to check if the shop is opened or not
 */
export const shopShouldBeOpen: RouterMiddleware<string> = async (ctx, next) => {
  if (!(await booleanFromEnv('SHOP_OPENED', false) || await checkAuthentication(ctx))) {
    throw createHttpError(Status.Forbidden, "ticket shop closed");
  }
  await next();
};

/**
 * Catches errors that are not catched anywhere else and responds to the request appropriately.
 */
export const errors: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (isHttpError(error)) {
      ctx.response.status = error.status;
      ctx.response.body = { error: error.message };
      ctx.response.type = "json";
    } else {
      ctx.response.status = 500;
      ctx.response.body = { error: 'Fatal error occured' };
      throw error;
    }
  }
};

/**
 * Will log every request to the console.
 */
export const logger: Middleware = async ({ request, response }, next) => {
  const start = Date.now();
  await next();
  const ms: number = Date.now() - start;
  const status: number = response.status;
  const time = `${format(new Date(Date.now()), "MM-dd-yyyy HH:mm:ss.SSS")}`;
  const log_string = `[${time}] ${request.ip} "${request.method} ${request.url.pathname}" ${String(status)
    } (${ms}ms)`;

  if (status >= 500) {
    console.log(`${red(log_string)}`);
  } else if (status >= 400) {
    console.log(`${yellow(log_string)}`);
  } else if (status >= 300) {
    console.log(`${cyan(log_string)}`);
  } else if (status >= 200) {
    console.log(`${green(log_string)}`);
  } else {
    console.log(`${red(log_string)}`);
  }
};
