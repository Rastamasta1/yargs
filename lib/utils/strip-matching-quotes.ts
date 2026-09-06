export function stripMatchingQuotes(value: string): string {
  if (
    value.length >= 2 &&
    (value[0] === "'" || value[0] === '"') &&
    value[value.length - 1] === value[0]
  ) {
    return value.slice(1, -1);
  }
  return value;
}
