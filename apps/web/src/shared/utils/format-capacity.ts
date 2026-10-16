export function formatCapacity(capacity: string): string {
  return capacity.replace(
    /^(\d+)(\D.*)$/,
    (_, amount: string, unit: string) => `${amount} ${unit.trim()}`,
  );
}
