// Wraps an async route handler so any thrown/rejected error is forwarded to the
// central errorHandler, instead of every controller repeating try/catch/next.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
