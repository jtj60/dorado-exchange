export function getItemPrice(content, premium, bid_spot) {
  if (!bid_spot || !premium || !content) return 0;
  return content * (bid_spot * premium);
}

export function getPayoutDelay(method) {
  if (method === "WIRE") return "1-5 hours";
  if (method === "ACH") return "1-24 hours";
  return "Instant";
}

export function formatCurrency(value) {
  if (value == null) return "-";
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

