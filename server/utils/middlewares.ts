import {
  Middleware, green,
  cyan,
  red,
  yellow,
  format,
} from "../deps.ts";
import { isHttpError } from "../deps.ts";

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
