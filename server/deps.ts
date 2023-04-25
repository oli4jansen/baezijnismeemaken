/**
 * This file contains all third-party dependencies.
 * 
 * It is a Deno convention to store them in deps.ts: https://deno.land/manual@v1.26.0/examples/manage_dependencies
 */

// Database
export { Pool, PoolClient, Transaction } from "https://deno.land/x/postgres@v0.16.1/mod.ts";
export { QueryObjectResult } from "https://deno.land/x/postgres@v0.16.1/query/query.ts";
export type { QueryArguments } from "https://deno.land/x/postgres@v0.16.1/query/query.ts";

// Oak (routing framework)
export { createHttpError, Status, Router, Context, Application, isHttpError } from "https://deno.land/x/oak@v11.1.0/mod.ts";
export type { RouterMiddleware, Middleware } from "https://deno.land/x/oak@v11.1.0/mod.ts";
export { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

// Crypto and authentication
export * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
export { decode, encode } from "https://deno.land/std@0.141.0/encoding/base64.ts";
export { create, verify, getNumericDate } from "https://deno.land/x/djwt@v2.7/mod.ts";
export type { Payload } from "https://deno.land/x/djwt@v2.7/mod.ts";

// PDF
export { PageSizes, PDFDocument, rgb } from 'https://cdn.skypack.dev/pdf-lib@^1.11.1?dts';

// Various utils
export { green, cyan, red, yellow } from "https://deno.land/std@0.53.0/fmt/colors.ts";
export { format } from "https://deno.land/std@0.156.0/datetime/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";