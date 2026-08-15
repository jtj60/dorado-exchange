import { asyncHandler } from "#shared/middleware/asyncHandler.js";
import * as transactionService from "#features/transactions/service.js"

export const getTransactionHistory = asyncHandler(async (req, res) => {
  const { user_id } = req.body;
  const result = await transactionService.getTransactionHistory(user_id);
  return res.status(200).json(result);
});
