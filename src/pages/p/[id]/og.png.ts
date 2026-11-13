import type { APIRoute } from 'astro';
import { renderOgPng } from '@/lib/og';
import { getSettings, loadPaintings, type Painting } from '@/lib/paintings';

export function getStaticPaths() {
  return loadPaintings().map((painting) => ({
    params: { id: painting.id },
    props: { painting },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { painting } = props as { painting: Painting };
  const settings = getSettings();
  const subtitleParts = [painting.medium, painting.dimensions, painting.dateFormatted].filter(
    Boolean
  );
  const png = await renderOgPng({
    title: painting.title,
    subtitle: subtitleParts.join(' · '),
    siteTitle: settings.siteTitle,
    painting,
  });

  return new Response(new Blob([new Uint8Array(png)], { type: 'image/png' }), {
    headers: { 'Content-Type': 'image/png' },
  });
};
