import {
  createHttpError,
  Router,
  Status,
  bcrypt,
  getNumericDate
} from "../deps.ts";

import { getJsonBody } from "../utils/request.ts";
import { generateToken } from "../utils/crypto.ts";
import { fromEnv } from "../utils/env.ts";

/**
 * Provides API routes related to authentication and authorization.
 */
export const createAuthRouter = (): Router => {
  const router = new Router();

  /**
   * Get an access token in return for username and password.
   * Password must be encrypted using bcrypt with the username as a prepended salt.
   */
  router.post("/token", async (ctx) => {
    // Check if ADMIN is present in .env file
    const user = await fromEnv('ADMIN_USERNAME', () => { throw Error('No ADMIN_USERNAME set in .env file') });
    const password = await fromEnv('ADMIN_PASSWORD', () => { throw Error('No ADMIN_PASSWORD set in .env file') });
    if (!user || !password) {
      throw createHttpError(
        Status.InternalServerError,
        "unable to generate tokens at this time"
      );
    }

    // Get credentials from POST body
    const res = await getJsonBody(ctx);
    if (!res.user || !res.password) {
      throw new Error("please provide user credentials");
    }
    if (res.user !== user || !(await bcrypt.compare(res.password, password))) {
      throw new Error("invalid credentials");
    }

    // Respond with an access token
    ctx.response.body = { token: await generateToken({ exp: getNumericDate(60 * 60) }) };
  });

  return router;
};
