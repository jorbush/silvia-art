import type { APIRoute } from 'astro';
import { renderOgPng } from '@/lib/og';
import {
  getSettings,
  getUniqueTags,
  loadPaintings,
  paintingQuantityText,
  type Painting,
} from '@/lib/paintings';

export function getStaticPaths() {
  const paintings = loadPaintings();
  return getUniqueTags(paintings).map(({ slug, tag }) => ({
    params: { tag: slug },
    props: {
      tagLabel: tag,
      paintings: paintings.filter((p) => p.tagSlugs.includes(slug)),
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { tagLabel, paintings } = props as { tagLabel: string; paintings: Painting[] };
  const settings = getSettings();
  const png = await renderOgPng({
    title: `Tag: ${tagLabel}`,
    subtitle: paintingQuantityText(paintings.length, false),
    siteTitle: settings.siteTitle,
    gridPaintings: paintings,
  });

  return new Response(new Blob([new Uint8Array(png)], { type: 'image/png' }), {
    headers: { 'Content-Type': 'image/png' },
  });
};
