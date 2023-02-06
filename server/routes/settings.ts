import { Router } from "../deps.ts";
  
import { booleanFromEnv, toEnv } from "../utils/env.ts";
import { authRequired } from "../utils/middlewares.ts";
import { getJsonBody } from "../utils/request.ts";
  
  /**
   * Provides API routes related to the shop settings accessible from the admin panel.
   */
  export const createSettingsRouter = (): Router => {
    const router = new Router();
  
    router.get("/open", authRequired, async (ctx) => {
      ctx.response.body = { open: await booleanFromEnv('SHOP_OPENED', false) };
    });

    router.put("/open", authRequired, async (ctx) => {
      const body = await getJsonBody(ctx);
      toEnv('SHOP_OPENED', `${body.open}`);
      ctx.response.body = { open: await booleanFromEnv('SHOP_OPENED', false) };
    });
  
    return router;
  };
  