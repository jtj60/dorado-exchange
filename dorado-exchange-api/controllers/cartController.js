const cartService = require('../services/cartService');

async function getCart(req, res, next) {
  try {
    await cartService.getCart(req.query.user_id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('sendCreatedEmail failed:', err);
    return next(err);
  }
}

async function syncCart(req, res, next) {
  try {
    await cartService.syncCart(req.body.user_id, req.body.cart)
    res.status(200).json({ message: "Cart synced successfully" });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getCart,
  syncCart,
};
