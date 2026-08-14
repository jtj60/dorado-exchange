import pool from "#db";

// Runs fn inside a single database transaction.
//
// Checks out a client, issues BEGIN, and hands the client to fn. Commits if fn
// returns, rolls back and rethrows if it throws. The client is always released.
//
// Repos take an optional client/executor as their last argument, so pass the
// client straight through:
//
//   return withTransaction(async (client) => {
//     await orderRepo.insert(order, client);
//     await itemRepo.insertMany(items, client);
//   });
export default async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
