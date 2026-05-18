export function parseTagsField(value: unknown): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return [...new Set(value.map(String).map((s) => s.trim()).filter(Boolean))];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return [
            ...new Set(parsed.map(String).map((s) => s.trim()).filter(Boolean)),
          ];
        }
      } catch {
        /* ignore */
      }
    }
    return [
      ...new Set(
        trimmed
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ];
  }
  return undefined;
}
