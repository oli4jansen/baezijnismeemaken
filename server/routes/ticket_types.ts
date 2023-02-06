import {
  createHttpError, Pool, Router,
  Status
} from "../deps.ts";

import {
  createTicketType,
  deleteTicketType,
  getAllTicketTypes,
  getTicketType,
  isNewTicketType,
  updateTicketType
} from "../models/ticket_types.ts";
import { shopShouldBeOpen, authRequired } from "../utils/middlewares.ts";
import { getJsonBody } from "../utils/request.ts";

export const createTicketTypesRouter = (pool: Pool): Router => {
  const router = new Router();

  router.get("/", shopShouldBeOpen, async (ctx) => {
    ctx.response.body = await getAllTicketTypes(pool);
  });

  router.get("/:id", shopShouldBeOpen, async (ctx) => {
    ctx.response.body = await getTicketType(ctx.params.id, pool);
  });

  router.post("/", authRequired, async (ctx) => {
    const tt = await getJsonBody(ctx);
    if (!isNewTicketType(tt)) {
      throw createHttpError(
        Status.BadRequest,
        "new ticket type does not pass validation"
      );
    }
    ctx.response.body = await createTicketType(tt, pool);
  });

  router.put("/:id", authRequired, async (ctx) => {
    const tt = await getJsonBody(ctx);
    if (!isNewTicketType(tt)) {
      throw createHttpError(
        Status.BadRequest,
        "new ticket type does not pass validation"
      );
    }
    ctx.response.body = await updateTicketType(ctx.params.id, tt, pool);
  });

  router.delete("/:id", authRequired, async (ctx) => {
    ctx.response.body = await deleteTicketType(ctx.params.id, pool);
  });

  return router;
};
