type Entry = { id: string; body?: string; data: any };

export function contentKind(entry: Entry): string {
  if (typeof entry.data.kind === 'string') return entry.data.kind;
  const prefix = entry.id.split('/')[0];
  return prefix === 'page' ? 'page' : prefix;
}

export function contentSlug(entry: Entry): string {
  return entry.id.split('/').at(-1) || 'untitled';
}

export function contentTitle(entry: Entry): string {
  if (typeof entry.data.title === 'string' && entry.data.title.trim()) return entry.data.title.trim();
  const heading = entry.body?.match(/^#\s+(.+?)\s*#*\s*$/mu)?.[1]?.trim();
  if (heading) return heading;
  return contentSlug(entry).replace(/-/gu, ' ');
}

export function contentAuthor(entry: Entry): string | undefined {
  return typeof entry.data.author === 'string' && entry.data.author.trim() ? entry.data.author.trim() : undefined;
}

export function hasContentHeading(entry: Entry): boolean {
  return /^#\s+.+$/mu.test(entry.body || '');
}

export function contentDescription(entry: Entry): string {
  if (typeof entry.data.description === 'string' && entry.data.description.trim()) return entry.data.description.trim();
  return '';
}

export function contentPath(entry: Entry): string {
  const candidate = typeof entry.data.path === 'string' ? entry.data.path : `/${contentSlug(entry)}/`;
  return candidate.replace(/^\/+|\/+$/gu, '');
}

export function isContentPublic(entry: Entry): boolean {
  const kind = contentKind(entry);
  return kind === 'post' ? (entry.data.publication ?? 'none') === 'public' : entry.data.is_public === true;
}

export function isContentDeployed(entry: Entry): boolean {
  const kind = contentKind(entry);
  return kind === 'post' ? (entry.data.publication ?? 'none') !== 'none' : entry.data.is_public === true;
}
