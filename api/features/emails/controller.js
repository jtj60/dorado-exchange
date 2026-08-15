import { asyncHandler } from "#shared/middleware/asyncHandler.js";
import * as emailService from "#features/emails/service.js"

export const sendCreatedEmail = asyncHandler(async (req, res) => {
  await emailService.sendCreatedEmail(req.body);
  return res.status(200).json({ success: true });
});

export const sendAcceptedEmail = asyncHandler(async (req, res) => {
  await emailService.sendAcceptedEmail(req.body);
  return res.status(200).json({ success: true });
});
