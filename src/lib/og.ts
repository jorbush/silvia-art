import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import type { Painting } from './paintings';

let cachedFontRegular: Buffer | null = null;
let cachedFontBold: Buffer | null = null;

function loadFonts(cwd = process.cwd()): { regular: Buffer; bold: Buffer } {
  if (!cachedFontRegular) {
    cachedFontRegular = fs.readFileSync(path.join(cwd, 'public/fonts/IBMPlexMono-Regular.ttf'));
  }
  if (!cachedFontBold) {
    cachedFontBold = fs.readFileSync(path.join(cwd, 'public/fonts/IBMPlexMono-Bold.ttf'));
  }
  return { regular: cachedFontRegular, bold: cachedFontBold };
}

async function imageAsPngDataUrl(
  publicImagePath: string,
  cwd = process.cwd()
): Promise<string | null> {
  const relative = publicImagePath.replace(/^\/+/, '');
  const fullPath = path.join(cwd, 'public', relative);
  if (!fs.existsSync(fullPath)) return null;

  const pngBuffer = await sharp(fullPath)
    .rotate()
    .resize({ width: 900, height: 500, fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

export async function renderOgPng(options: {
  title: string;
  subtitle?: string;
  siteTitle: string;
  painting?: Painting;
  gridPaintings?: Painting[];
}): Promise<Uint8Array> {
  const { regular, bold } = loadFonts();

  let mainVisual: Record<string, unknown>;
  if (options.painting) {
    const dataUrl = await imageAsPngDataUrl(options.painting.image);
    mainVisual = dataUrl
      ? {
          type: 'img',
          props: {
            src: dataUrl,
            style: {
              maxWidth: '100%',
              maxHeight: '430px',
              objectFit: 'contain',
              borderRadius: '4px',
            },
          },
        }
      : { type: 'div', props: { children: '' } };
  } else {
    const thumbs = (options.gridPaintings ?? []).slice(0, 4);
    const thumbUrls = await Promise.all(thumbs.map((p) => imageAsPngDataUrl(p.image)));
    mainVisual = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        },
        children: thumbUrls.filter(Boolean).map((src) => ({
          type: 'img',
          props: {
            src,
            style: {
              width: '240px',
              height: '320px',
              objectFit: 'cover',
              borderRadius: '4px',
            },
          },
        })),
      },
    };
  }

  const element = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        backgroundColor: '#000000',
        color: '#f3f4f6',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '44px 56px',
        fontFamily: 'IBM Plex Mono',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              width: '100%',
              fontSize: '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontWeight: 700, textTransform: 'uppercase' },
                  children: options.title,
                },
              },
              {
                type: 'div',
                props: {
                  style: { color: '#9ca3af', fontSize: '20px' },
                  children: options.siteTitle,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              width: '100%',
            },
            children: mainVisual,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              color: '#9ca3af',
              fontSize: '18px',
              textTransform: 'uppercase',
            },
            children: options.subtitle || '',
          },
        },
      ],
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svg = await satori(element as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'IBM Plex Mono', data: regular, weight: 400, style: 'normal' },
      { name: 'IBM Plex Mono', data: bold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
