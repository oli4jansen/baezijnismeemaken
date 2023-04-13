import { Router } from "../deps.ts";
  
import { booleanFromEnv, numberFromEnv, toEnv } from "../utils/env.ts";
import { authRequired } from "../utils/middlewares.ts";
import { getJsonBody } from "../utils/request.ts";
  
  /**
   * Provides API routes related to the shop settings accessible from the admin panel.
   */
  export const createSettingsRouter = (): Router => {
    const router = new Router();
  
    router.get("/open", async (ctx) => {
      let open = await booleanFromEnv('SHOP_OPENED', false);
      let opensAtTimestamp = await numberFromEnv('SHOP_OPENS_AT_TIMESTAMP', 0);

      if (!open && opensAtTimestamp > 0 && opensAtTimestamp < +new Date()) {
        open = true;
        opensAtTimestamp = 0;
        toEnv('SHOP_OPENED', `${open}`);
        toEnv('SHOP_OPENS_AT_TIMESTAMP', `${opensAtTimestamp}`);
      }

      ctx.response.body = {
        open,
        opensAtTimestamp
      };
    });

    router.put("/open", authRequired, async (ctx) => {
      const body = await getJsonBody(ctx);

      toEnv('SHOP_OPENED', `${body.open}`);
      toEnv('SHOP_OPENS_AT_TIMESTAMP', `${body.opensAtTimestamp}`);

      ctx.response.body = {
        open: await booleanFromEnv('SHOP_OPENED', false),
        opensAtTimestamp: await numberFromEnv('SHOP_OPENS_AT_TIMESTAMP', 0)
      };
    });
  
    return router;
  };
  