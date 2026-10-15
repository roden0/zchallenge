export function formatPrice(price: number): string {
  const fixed = price.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  return `${intPart},${decPart} EUR`;
}
