const pool = require("../db"); // Database connection

const getCart = async (req, res) => {
  const { user_id } = req.query;

  try {
    const query = 
    `
      SELECT ci.id AS cart_item_id, ci.product_id, ci.scrap_id, p.* 
      FROM exchange.cart_items ci
      LEFT JOIN exchange.products p ON ci.product_id = p.id
      WHERE ci.cart_id = (SELECT id FROM exchange.carts WHERE user_id = $1);
    `;
    const values = [user_id];

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const syncCart = async (req, res) => {
  const { user_id, cart } = req.body;

  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN"); // ✅ Start transaction

      // 🔹 Delete existing cart items for the user
      await client.query(
        `DELETE FROM exchange.cart_items WHERE cart_id = (SELECT id FROM exchange.carts WHERE user_id = $1)`,
        [user_id]
      );

      if (cart.length > 0) {
        // 🔹 Get the user's cart ID (or create one if it doesn't exist)
        const cartResult = await client.query(
          `INSERT INTO exchange.carts (id, user_id)
           VALUES (gen_random_uuid(), $1)
           ON CONFLICT (user_id) DO NOTHING
           RETURNING id`,
          [user_id]
        );

        const cartId =
          cartResult.rows.length > 0
            ? cartResult.rows[0].id
            : (await client.query(`SELECT id FROM exchange.carts WHERE user_id = $1`, [user_id])).rows[0].id;

        // 🔹 Insert all new cart items in one batch query
        const values = cart
          .map((item, index) => `($1, gen_random_uuid(), $${index + 2})`)
          .join(", ");

        const query = `
          INSERT INTO exchange.cart_items (cart_id, id, product_id)
          VALUES ${values}
        `;

        await client.query(query, [cartId, ...cart.map((item) => item.id)]);
      }

      await client.query("COMMIT"); // ✅ Commit transaction
      res.status(200).json({ message: "Cart synced successfully" });

    } catch (error) {
      await client.query("ROLLBACK"); // ❌ Rollback on error
      console.error("Error syncing cart:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release(); // ✅ Release connection
    }
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database Error" });
  }
};

const checkAmountInCart = async (req, res) => {
  const { user_id, product_id, scrap_id } = req.query;

  try {
    const query = `
      SELECT COUNT(*) AS quantity
      FROM exchange.cart_items
      WHERE cart_id = (SELECT id FROM exchange.carts WHERE user_id = $1)
      AND (product_id = $2 OR scrap_id = $3);
    `;
    
    const values = [user_id, product_id, scrap_id];
    const { rows } = await pool.query(query, values);

    res.json({ quantity: rows[0].quantity });
  } catch (error) {
    console.error("Error checking amount in cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  const user_id = req.body.user_id;
  const product_id = req.body.product.id || null;
  const scrap_id = req.body.scrap_id || null;

  try {
    const query = `
      WITH user_cart AS (
        INSERT INTO exchange.carts (id, user_id)
        VALUES (gen_random_uuid(), $1)
        ON CONFLICT (user_id) DO NOTHING
        RETURNING id
      ), existing_cart AS (
        SELECT id FROM exchange.carts WHERE user_id = $1
      )
      INSERT INTO exchange.cart_items (id, cart_id, product_id, scrap_id)
      VALUES (gen_random_uuid(), COALESCE((SELECT id FROM user_cart), (SELECT id FROM existing_cart)), $2, $3);
    `;
    
    const values = [user_id, product_id, scrap_id];
    await pool.query(query, values);
    
    res.status(200).json({ message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeFromCart = async (req, res) => {
  const user_id = req.body.user_id;
  const product_id = req.body.product.id || null;
  const scrap_id = req.body.scrap_id || null;

  try {
    const query = `
      DELETE FROM exchange.cart_items
      WHERE id = (
        SELECT id FROM exchange.cart_items
        WHERE cart_id = (SELECT id FROM exchange.carts WHERE user_id = $1)
        AND (product_id = $2 OR scrap_id = $3)
        ORDER BY id ASC
        LIMIT 1
      );
    `;
    
    const values = [user_id, product_id, scrap_id];
    await pool.query(query, values);
    
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const clearCart = async (req, res) => {
  const user_id = req.body.user_id;
  const address = req.body.address;

  try {
    const query = 
    `
      DELETE FROM exchange.cart_items
      WHERE cart_id = (SELECT id FROM exchange.carts WHERE user_id = $1);
    `;
    const values = [user_id];

    await pool.query(query, values);
    res.status(200).json("");
  } catch (error) {
    console.error("Error updating cart", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCart,
  syncCart,
  checkAmountInCart,
  addToCart,
  removeFromCart,
  clearCart,
};
