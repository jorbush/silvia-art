import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { slugifyValue } from './url';
import { DEFAULT_SETTINGS, type GallerySettings } from './settings';

export interface Painting {
  id: string;
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  dateFormattedShort: string;
  year: string;
  image: string;
  width: number;
  height: number;
  aspectRatio: number;
  blurData?: string;
  medium?: string;
  mediumSlug?: string;
  dimensions?: string;
  tags: string[];
  tagSlugs: string[];
  priorityOrder?: number;
  hidden: boolean;
  descriptionHtml?: string;
  body: string;
}

export interface TagSummary {
  tag: string;
  slug: string;
  count: number;
}

export interface MediumSummary {
  medium: string;
  slug: string;
  count: number;
}

export interface PaintingDateRange {
  start: string;
  end: string;
  description: string;
}

interface ManifestEntry {
  width: number;
  height: number;
  aspectRatio: number;
  blurData: string;
}

export function formatPaintingDate(dateStr: string, short = false): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateStr;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10) - 1;
  const day = Number.parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month, day));

  if (short) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function normalizeDateString(input: string | Date): string {
  if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  }
  return String(input).slice(0, 10);
}

export function sortPaintings(paintings: Painting[]): Painting[] {
  return [...paintings].sort((a, b) => {
    const aHasPrio = typeof a.priorityOrder === 'number';
    const bHasPrio = typeof b.priorityOrder === 'number';

    if (aHasPrio && bHasPrio && a.priorityOrder !== b.priorityOrder) {
      return (a.priorityOrder as number) - (b.priorityOrder as number);
    }
    if (aHasPrio && !bHasPrio) return -1;
    if (!aHasPrio && bHasPrio) return 1;

    return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
  });
}

export function getPreviousPainting(
  painting: Painting,
  paintings: Painting[]
): Painting | undefined {
  const idx = paintings.findIndex((p) => p.id === painting.id);
  return idx > 0 ? paintings[idx - 1] : undefined;
}

export function getNextPainting(painting: Painting, paintings: Painting[]): Painting | undefined {
  const idx = paintings.findIndex((p) => p.id === painting.id);
  return idx >= 0 && idx < paintings.length - 1 ? paintings[idx + 1] : undefined;
}

export function getDateRangeForPaintings(paintings: Painting[]): PaintingDateRange {
  if (paintings.length === 0) {
    return { start: '', end: '', description: '' };
  }
  const byDateDesc = [...paintings].sort((a, b) => b.date.localeCompare(a.date));
  const start = formatPaintingDate(byDateDesc[byDateDesc.length - 1].date, true);
  const end = formatPaintingDate(byDateDesc[0].date, true);
  const description = start === end ? start : `${start}–${end}`;
  return { start, end, description };
}

export function getUniqueTags(paintings: Painting[]): TagSummary[] {
  const map = new Map<string, TagSummary>();
  for (const painting of paintings) {
    for (const tag of painting.tags) {
      const slug = slugifyValue(tag);
      if (!slug) continue;
      const existing = map.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(slug, { tag, slug, count: 1 });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getUniqueMediums(paintings: Painting[]): MediumSummary[] {
  const map = new Map<string, MediumSummary>();
  for (const painting of paintings) {
    if (!painting.medium || !painting.mediumSlug) continue;
    const existing = map.get(painting.mediumSlug);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(painting.mediumSlug, {
        medium: painting.medium,
        slug: painting.mediumSlug,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.medium.localeCompare(b.medium));
}

export function paintingQuantityText(count: number, includeParentheses = true): string {
  const label = count === 1 ? 'Painting' : 'Paintings';
  return includeParentheses ? `(${count} ${label})` : `${count} ${label}`;
}

export function getSettings(cwd = process.cwd()): GallerySettings {
  const settingsPath = path.join(cwd, 'src/data/settings.json');
  if (!fs.existsSync(settingsPath)) {
    return DEFAULT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function loadPaintings(cwd = process.cwd()): Painting[] {
  const paintingsDir = path.join(cwd, 'src/content/paintings');
  if (!fs.existsSync(paintingsDir)) {
    return [];
  }

  const manifestPath = path.join(cwd, 'src/data/paintings-meta.json');
  let manifest: Record<string, ManifestEntry> = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      manifest = {};
    }
  }

  const files = fs
    .readdirSync(paintingsDir)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const items: Painting[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(paintingsDir, file), 'utf8');
    const parsed = matter(raw);
    const data = parsed.data;
    if (data.hidden === true) continue;

    const slug = path.basename(file, '.md');
    const id = typeof data.id === 'string' && data.id.trim() ? data.id.trim() : slug;
    const title =
      typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Untitled';
    const date = normalizeDateString(data.date ?? '2024-01-01');
    const image = String(data.image ?? '');
    const meta = manifest[image];
    const tags: string[] = Array.isArray(data.tags)
      ? data.tags.map((t) => String(t).trim()).filter(Boolean)
      : [];
    const medium =
      typeof data.medium === 'string' && data.medium.trim() ? data.medium.trim() : undefined;

    items.push({
      id,
      slug,
      title,
      date,
      dateFormatted: formatPaintingDate(date, false),
      dateFormattedShort: formatPaintingDate(date, true),
      year: date.slice(0, 4),
      image,
      width: meta?.width ?? 1200,
      height: meta?.height ?? 1200,
      aspectRatio: meta?.aspectRatio ?? 1,
      blurData: meta?.blurData,
      medium,
      mediumSlug: medium ? slugifyValue(medium) : undefined,
      dimensions:
        typeof data.dimensions === 'string' && data.dimensions.trim()
          ? data.dimensions.trim()
          : undefined,
      tags,
      tagSlugs: tags.map(slugifyValue).filter(Boolean),
      priorityOrder: typeof data.priorityOrder === 'number' ? data.priorityOrder : undefined,
      hidden: false,
      body: parsed.content.trim(),
    });
  }

  return sortPaintings(items);
}
