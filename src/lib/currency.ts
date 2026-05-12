// Bangladeshi Taka — used everywhere a price is displayed.
export const TAKA_SYMBOL = "৳";
export const CURRENCY_CODE = "BDT";

type FormatPriceOptions = {
  /** Include the ৳ symbol prefix. Defaults to true. */
  showSymbol?: boolean;
  /** Number of decimals to display. Defaults to 2. */
  decimals?: 0 | 2;
};

/**
 * Formats a numeric amount as a localized BDT price string.
 *
 * Examples:
 *   formatPrice(2450)              // "৳2,450.00"
 *   formatPrice(2450, { decimals: 0 })       // "৳2,450"
 *   formatPrice(2450, { showSymbol: false }) // "2,450.00"
 *   formatPrice(null)              // "৳0.00"
 */
export function formatPrice(
  amount: number | string | null | undefined,
  options: FormatPriceOptions = {},
): string {
  const { showSymbol = true, decimals = 2 } = options;
  const num =
    typeof amount === "string" ? parseFloat(amount) : (amount ?? Number.NaN);

  const safeNum = Number.isFinite(num) ? (num as number) : 0;

  const formatted = safeNum.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${TAKA_SYMBOL}${formatted}` : formatted;
}
