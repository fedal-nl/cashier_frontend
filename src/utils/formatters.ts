// any formatting functions that are used across the app can be added here, date, currency, etc

/**
 * Format the currency to a Iraq Dinar format.
 * @param amount The amount to format.
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
