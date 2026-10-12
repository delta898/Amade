function instant(value: unknown): number | null {
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? null : value.valueOf();
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function sortPostsNewestFirst<T extends { id: string; data: { published_at?: unknown; date?: unknown } }>(posts: T[]): T[] {
  return [...posts].sort((left, right) => {
    const leftTime = instant(left.data.published_at) ?? instant(left.data.date);
    const rightTime = instant(right.data.published_at) ?? instant(right.data.date);
    if (leftTime === null && rightTime !== null) return 1;
    if (rightTime === null && leftTime !== null) return -1;
    if (leftTime !== null && rightTime !== null && leftTime !== rightTime) return rightTime - leftTime;
    return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  });
}
