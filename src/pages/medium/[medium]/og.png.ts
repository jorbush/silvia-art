import type { APIRoute } from 'astro';
import { renderOgPng } from '@/lib/og';
import {
  getSettings,
  getUniqueMediums,
  loadPaintings,
  paintingQuantityText,
  type Painting,
} from '@/lib/paintings';

export function getStaticPaths() {
  const paintings = loadPaintings();
  return getUniqueMediums(paintings).map(({ slug, medium }) => ({
    params: { medium: slug },
    props: {
      mediumLabel: medium,
      paintings: paintings.filter((p) => p.mediumSlug === slug),
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { mediumLabel, paintings } = props as { mediumLabel: string; paintings: Painting[] };
  const settings = getSettings();
  const png = await renderOgPng({
    title: `Medium: ${mediumLabel}`,
    subtitle: paintingQuantityText(paintings.length, false),
    siteTitle: settings.siteTitle,
    gridPaintings: paintings,
  });

  return new Response(new Blob([new Uint8Array(png)], { type: 'image/png' }), {
    headers: { 'Content-Type': 'image/png' },
  });
};
