const pool = require("../db"); // Import the database connection

exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exchange.products ORDER BY name ASC;");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};