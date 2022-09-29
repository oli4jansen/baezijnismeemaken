import { Context } from "../deps.ts";

// deno-lint-ignore no-explicit-any
export const getJsonBody = async (ctx: Context): Promise<any> => {
  const result = ctx.request.body();
  if (result.type !== "json") {
    throw new Error("Body must contain JSON");
  }
  return await result.value;
}

// deno-lint-ignore no-explicit-any
export const getFormBody = async (ctx: Context): Promise<URLSearchParams> => {
  const result = ctx.request.body();
  if (result.type !== "form") {
    throw new Error("Body must contain JSON");
  }
  return await result.value;
}