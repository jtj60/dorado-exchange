const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productsRoutes = require("./routes/products");
const emailRoutes = require("./routes/emails");
const { toNodeHandler } = require("better-auth/node"); // Import BetterAuth middleware
const { auth } = require("./auth"); // Import your BetterAuth instance

dotenv.config(); // Load environment variables
 
const app = express();
const PORT = process.env.PORT || 5000;

console.log(process.env.FRONTEND_URL)

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

//Mount BetterAuth authentication routes
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

// Use the products and email routes
app.use("/api/products", productsRoutes);
app.use("/api/emails", emailRoutes);

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
