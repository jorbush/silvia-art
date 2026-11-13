import { describe, expect, it } from 'vitest';
import {
  getEscapePath,
  pathForGrid,
  pathForMedium,
  pathForMediumShare,
  pathForPainting,
  pathForPaintingShare,
  pathForRoot,
  pathForTag,
  pathForTagShare,
} from '@/lib/paths';

describe('paths', () => {
  it('builds painting, tag, and medium routes', () => {
    expect(pathForRoot()).toBe('/');
    expect(pathForGrid()).toBe('/grid');
    expect(pathForPainting('4EIMQsCO')).toBe('/p/4EIMQsCO');
    expect(pathForPaintingShare('4EIMQsCO')).toBe('/p/4EIMQsCO/share');
    expect(pathForTag('Oil Landscape')).toBe('/tag/oil-landscape');
    expect(pathForTagShare('Oil Landscape')).toBe('/tag/oil-landscape/share');
    expect(pathForPainting('4EIMQsCO', { tag: 'Oil Landscape' })).toBe(
      '/tag/oil-landscape/4EIMQsCO'
    );
    expect(pathForMedium('Oil on canvas')).toBe('/medium/oil-on-canvas');
    expect(pathForMediumShare('Oil on canvas')).toBe('/medium/oil-on-canvas/share');
    expect(pathForPainting('4EIMQsCO', { medium: 'Oil on canvas' })).toBe(
      '/medium/oil-on-canvas/4EIMQsCO'
    );
  });

  it('resolves escape paths cleanly', () => {
    expect(getEscapePath('/')).toBeUndefined();
    expect(getEscapePath('/grid')).toBeUndefined();
    expect(getEscapePath('/p/4EIMQsCO')).toBe('/grid');
    expect(getEscapePath('/p/4EIMQsCO/share')).toBe('/p/4EIMQsCO');
    expect(getEscapePath('/tag/landscape')).toBe('/grid');
    expect(getEscapePath('/tag/landscape/share')).toBe('/tag/landscape');
    expect(getEscapePath('/tag/landscape/4EIMQsCO')).toBe('/tag/landscape');
    expect(getEscapePath('/tag/landscape/4EIMQsCO/share')).toBe('/tag/landscape/4EIMQsCO');
    expect(getEscapePath('/medium/oil-on-canvas')).toBe('/grid');
    expect(getEscapePath('/medium/oil-on-canvas/4EIMQsCO')).toBe('/medium/oil-on-canvas');
  });
});
