import query from "#shared/db/query.js";

export async function getAllSuppliers() {
  const sql = `
    SELECT *
    FROM exchange.suppliers
  `;
  const values = [];
  const result = await query(sql, values);
  return result.rows;
}

export async function getSupplierFromId(id) {
  const sql = `
    SELECT *
    FROM exchange.suppliers
    WHERE id = $1
  `;
  const values = [id];
  const result = await query(sql, values);
  return result.rows[0];
}
