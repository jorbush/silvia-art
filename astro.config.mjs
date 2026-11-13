import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const siteUrl = process.env.SITE_URL || 'https://silvia-art.vercel.app';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
