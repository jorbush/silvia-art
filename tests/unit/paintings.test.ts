import { describe, expect, it } from 'vitest';
import {
  formatPaintingDate,
  getDateRangeForPaintings,
  getNextPainting,
  getPreviousPainting,
  getUniqueMediums,
  getUniqueTags,
  paintingQuantityText,
  sortPaintings,
  type Painting,
} from '@/lib/paintings';

function makePainting(overrides: Partial<Painting>): Painting {
  return {
    id: 'abc',
    slug: 'abc',
    title: 'Sample',
    date: '2024-01-15',
    dateFormatted: 'Jan 15, 2024',
    dateFormattedShort: 'Jan 2024',
    year: '2024',
    image: '/images/paintings/abc.webp',
    width: 800,
    height: 1000,
    aspectRatio: 0.8,
    tags: [],
    tagSlugs: [],
    hidden: false,
    body: '',
    ...overrides,
  };
}

describe('paintings domain helpers', () => {
  it('sorts by priorityOrder first, then date descending', () => {
    const a = makePainting({ id: 'a', title: 'Old Prio 1', date: '1990-01-01', priorityOrder: 1 });
    const b = makePainting({ id: 'b', title: 'Newest', date: '2025-11-01' });
    const c = makePainting({ id: 'c', title: 'Older', date: '2020-05-01' });
    const d = makePainting({ id: 'd', title: 'Prio 2', date: '2024-01-01', priorityOrder: 2 });

    const sorted = sortPaintings([c, b, d, a]);
    expect(sorted.map((p) => p.id)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('computes previous and next paintings', () => {
    const list = [makePainting({ id: '1' }), makePainting({ id: '2' }), makePainting({ id: '3' })];
    expect(getPreviousPainting(list[0], list)).toBeUndefined();
    expect(getNextPainting(list[0], list)?.id).toBe('2');
    expect(getPreviousPainting(list[1], list)?.id).toBe('1');
    expect(getNextPainting(list[2], list)).toBeUndefined();
  });

  it('aggregates tags, mediums, and date ranges', () => {
    const list = [
      makePainting({
        id: '1',
        date: '1995-03-10',
        tags: ['Floral', 'Buda'],
        tagSlugs: ['floral', 'buda'],
        medium: 'Oil on canvas',
        mediumSlug: 'oil-on-canvas',
      }),
      makePainting({
        id: '2',
        date: '2025-10-19',
        tags: ['Floral'],
        tagSlugs: ['floral'],
        medium: 'Watercolor',
        mediumSlug: 'watercolor',
      }),
    ];

    expect(getUniqueTags(list)).toEqual([
      { tag: 'Floral', slug: 'floral', count: 2 },
      { tag: 'Buda', slug: 'buda', count: 1 },
    ]);
    expect(getUniqueMediums(list)).toEqual([
      { medium: 'Oil on canvas', slug: 'oil-on-canvas', count: 1 },
      { medium: 'Watercolor', slug: 'watercolor', count: 1 },
    ]);
    expect(getDateRangeForPaintings(list)).toEqual({
      start: 'Mar 1995',
      end: 'Oct 2025',
      description: 'Mar 1995–Oct 2025',
    });
    expect(formatPaintingDate('2024-08-27')).toBe('Aug 27, 2024');
    expect(paintingQuantityText(1)).toBe('(1 Painting)');
    expect(paintingQuantityText(3, false)).toBe('3 Paintings');
  });
});
