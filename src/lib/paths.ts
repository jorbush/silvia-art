import { slugifyValue } from './url';

export const PATH_ROOT = '/';
export const PATH_GRID = '/grid';
export const PATH_SETS = '/sets';

export const PREFIX_PAINTING = '/p';
export const PREFIX_TAG = '/tag';
export const PREFIX_MEDIUM = '/medium';

export function pathForRoot(): string {
  return PATH_ROOT;
}

export function pathForGrid(): string {
  return PATH_GRID;
}

export function pathForSets(): string {
  return PATH_SETS;
}

export function pathForTag(tag: string): string {
  return `${PREFIX_TAG}/${encodeURIComponent(slugifyValue(tag))}`;
}

export function pathForTagShare(tag: string): string {
  return `${pathForTag(tag)}/share`;
}

export function pathForMedium(medium: string): string {
  return `${PREFIX_MEDIUM}/${encodeURIComponent(slugifyValue(medium))}`;
}

export function pathForMediumShare(medium: string): string {
  return `${pathForMedium(medium)}/share`;
}

export function pathForPainting(id: string, options?: { tag?: string; medium?: string }): string {
  if (options?.tag) {
    return `${pathForTag(options.tag)}/${encodeURIComponent(id)}`;
  }
  if (options?.medium) {
    return `${pathForMedium(options.medium)}/${encodeURIComponent(id)}`;
  }
  return `${PREFIX_PAINTING}/${encodeURIComponent(id)}`;
}

export function pathForPaintingShare(
  id: string,
  options?: { tag?: string; medium?: string }
): string {
  return `${pathForPainting(id, options)}/share`;
}

export function getEscapePath(pathname = ''): string | undefined {
  const normalized = pathname.replace(/\/+$/, '') || '/';

  if (/^\/p\/[^/]+\/share$/.test(normalized)) {
    return normalized.replace(/\/share$/, '');
  }
  if (/^\/p\/[^/]+$/.test(normalized)) {
    return PATH_GRID;
  }

  if (/^\/tag\/[^/]+\/share$/.test(normalized)) {
    return normalized.replace(/\/share$/, '');
  }
  if (/^\/tag\/[^/]+\/[^/]+\/share$/.test(normalized)) {
    return normalized.replace(/\/share$/, '');
  }
  if (/^\/tag\/[^/]+\/[^/]+$/.test(normalized)) {
    return normalized.replace(/\/[^/]+$/, '');
  }
  if (/^\/tag\/[^/]+$/.test(normalized)) {
    return PATH_GRID;
  }

  if (/^\/medium\/[^/]+\/share$/.test(normalized)) {
    return normalized.replace(/\/share$/, '');
  }
  if (/^\/medium\/[^/]+\/[^/]+\/share$/.test(normalized)) {
    return normalized.replace(/\/share$/, '');
  }
  if (/^\/medium\/[^/]+\/[^/]+$/.test(normalized)) {
    return normalized.replace(/\/[^/]+$/, '');
  }
  if (/^\/medium\/[^/]+$/.test(normalized)) {
    return PATH_GRID;
  }

  return undefined;
}
