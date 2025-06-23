const express = require("express");
const router = express.Router();

const {
  retrievePaymentIntent,
  updatePaymentIntent,
  getPaymentIntentFromSalesOrderId,
} = require("../controllers/stripeController");

const { requireUser, requireAdmin } = require("../middleware/authMiddleware");

router.get("/retrieve_payment_intent", requireUser, retrievePaymentIntent);
router.get("/get_sales_order_payment_intent", requireAdmin, getPaymentIntentFromSalesOrderId);
router.post("/update_payment_intent", requireUser, updatePaymentIntent);

module.exports = router;
