export function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

export function toIsoString(value: unknown): string | undefined {
  const date = toDate(value);
  return date ? date.toISOString() : undefined;
}

