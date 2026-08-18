export const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
] as const;

export const DEFAULT_CURRENCY = "USD";

export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
