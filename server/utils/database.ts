import { Pool, QueryArguments, QueryObjectResult, Transaction } from "../deps.ts";
import { fromEnv, numberFromEnv } from "./env.ts";

/**
 * Created a pool of connections to the database. This will throw an error if it fails.
 */
export const connectToDatabase = async () => {
  return new Pool(
    {
      database: await fromEnv('DATABASE_NAME', 'baezijnismeemaken', true),
      hostname: await fromEnv('DATABASE_HOST', 'localhost', true),
      port: await numberFromEnv('DATABASE_PORT', 5432, true),
      user: await fromEnv('DATABASE_USER', 'postgres', true),
      password: await fromEnv('DATABASE_PASSWORD', 'postgres', true)
    },
    await numberFromEnv('DATABASE_POOL_CONNECTIONS', 20, true)
  );
};

/**
 * Run a single query on a connection from the database pool and automatically clean up the connection afterwards.
 */
export const runQuery = async <T>(pool: Pool, query: string, parameters: QueryArguments = {}): Promise<QueryObjectResult<T>> => {
  const client = await pool.connect();
  let result;
  try {
    result = await client.queryObject<T>(query, parameters);
  } finally {
    client.release();
  }
  return result;
}

/**
 * Transaction abstraction over the database pool
 */
export const runTransaction = async <T>(pool: Pool, action: ((trans: Transaction) => Promise<T>)): Promise<T> => {
  const client = await pool.connect();
  let result;
  try {
    const trans = client.createTransaction("a_transaction");
    await trans.begin();
    try {
      result = await action(trans);
      await trans.commit();
    } catch (error) {
      trans.rollback();
      throw error;
    }
  } finally {
    client.release();
  }
  return result;
}
