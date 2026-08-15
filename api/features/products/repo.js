import query from "#shared/db/query.js";
import { PRODUCT_FIELDS } from '#features/products/constants.js';

export async function getItemsFromIds(ids) {
  const sql = `
    SELECT product.${PRODUCT_FIELDS}, mint.name AS mint_name, metal.type AS metal_type
    FROM exchange.products product
    JOIN exchange.metals metal ON metal.id = product.metal_id
    JOIN exchange.mints mint ON mint.id = product.mint_id
    WHERE product.id = ANY($1)
  `;
  const values = [ids];
  const result = await query(sql, values);
  return result.rows;
}
