const transactionService = require("../services/transactionService");

async function getTransactionHistory(req, res, next) {
  try {
    const { user_id } = req.body;
    const result = await transactionService.getTransactionHistory(user_id);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getTransactionHistory,
};
