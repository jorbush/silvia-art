import { describe, expect, it } from 'vitest';
import { makeUrlAbsolute, shortenUrl, slugifyValue } from '@/lib/url';

describe('url helpers', () => {
  it('shortens and absolutizes URLs', () => {
    expect(shortenUrl('https://www.example.com/')).toBe('example.com');
    expect(shortenUrl('https://example.com/p/123/')).toBe('example.com/p/123');
    expect(makeUrlAbsolute('example.com/')).toBe('https://example.com');
    expect(makeUrlAbsolute('https://example.com/')).toBe('https://example.com');
  });

  it('slugifies accented and spaced values', () => {
    expect(slugifyValue('Oil on canvas')).toBe('oil-on-canvas');
    expect(slugifyValue('La liberté')).toBe('la-liberte');
  });
});
