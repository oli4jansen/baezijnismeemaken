import {
  createHttpError,
  Status,
  RouterMiddleware,
  Context
} from "../deps.ts";

import { verifyToken } from "./crypto.ts";

/**
 * Router middleware for Oak that will check if a valid JWT is passed in the Authorization
 * header of the request and respond with an 401 Unauthorized if this is not the case.
 */
export const authRequired: RouterMiddleware<string> = async (ctx, next) => {
  await checkAuthentication(ctx);
  await next();
};

/**
 * Checks whether the current request has authentication headers and returns a boolean.
 */
export const hasAuthentication = (ctx: Context) => ctx.request.headers.has("Authorization");

/**
 * Checks if the request has authentication headers AND validates them. Will throw an
 * unauthorized error.
 */
export const checkAuthentication = async (ctx: Context) => {
  if (!hasAuthentication(ctx)) {
    throw createHttpError(
      Status.Unauthorized,
      "please provide an authorization header",
    );
  }

  const authHeader = ctx.request.headers.get("Authorization")!;
  if (!authHeader.startsWith("Bearer ") || authHeader.length <= 7) {
    throw createHttpError(Status.Unauthorized, "authorization header invalid");
  }

  // Slice of the 'Bearer ' part
  const jwt = authHeader.slice(7);

  try {
    return !!(await verifyToken(jwt));
  } catch (e) {
    throw createHttpError(Status.Unauthorized, e.message);
  }
};