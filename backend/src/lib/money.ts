export const SHIPPING_FLAT_RATE_IN_PAISE = 49_900;
export const FREE_SHIPPING_THRESHOLD_IN_PAISE = 2_500_000;

export function paiseToRupees(amountInPaise: number) {
  return amountInPaise / 100;
}

export function calculateShippingInPaise(subtotalInPaise: number) {
  if (subtotalInPaise === 0 || subtotalInPaise >= FREE_SHIPPING_THRESHOLD_IN_PAISE) {
    return 0;
  }

  return SHIPPING_FLAT_RATE_IN_PAISE;
}
