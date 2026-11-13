export function shortenUrl(url?: string): string {
  return (url ?? '').replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').replace(/\/$/, '');
}

export function makeUrlAbsolute(url?: string): string {
  const value = (url ?? '').replace(/\/$/, '');
  if (!value) return '';
  return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
}

export function slugifyValue(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
