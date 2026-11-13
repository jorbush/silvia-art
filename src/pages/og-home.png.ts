import type { APIRoute } from 'astro';
import { renderOgPng } from '@/lib/og';
import { getSettings, loadPaintings, paintingQuantityText } from '@/lib/paintings';

export const GET: APIRoute = async () => {
  const paintings = loadPaintings();
  const settings = getSettings();
  const png = await renderOgPng({
    title: settings.siteTitle,
    subtitle: paintingQuantityText(paintings.length, false),
    siteTitle: settings.siteDescription,
    gridPaintings: paintings,
  });

  return new Response(new Blob([new Uint8Array(png)], { type: 'image/png' }), {
    headers: { 'Content-Type': 'image/png' },
  });
};
