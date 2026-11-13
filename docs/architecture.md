# Architecture Overview

`silvia-art` is a pure static Astro application (`output: 'static'`).

## Three-Repo Separation

1. **`silvia-art-cms-auth` (Rust on Cloudflare Workers)** handles the GitHub OAuth secret exchange for Sveltia CMS.
2. **`silvia-art-content` (GitHub + GitHub Pages)** stores painting markdown files, WebP images, and the Sveltia CMS UI under `/admin/`.
3. **`silvia-art` (Astro on Vercel)** pulls content at build time, computes image dimensions and blur-up data URIs, renders static HTML pages + PNG OpenGraph cards, and deploys static files to Vercel's CDN.

## View Transitions & Theme Persistence

- `BaseLayout.astro` mounts `<ClientRouter />` from `astro:transitions`.
- `Nav.astro` and `Footer.astro` use `transition:persist` so navigation chrome and theme controls stay stable across page swaps.
- Thumbnail cards and detail artwork share `transition:name="painting-img-<id>"` for smooth morph transitions.
- An inline script in `<head>` plus an `astro:after-swap` listener applies the stored `light`/`dark`/`system` theme before paint to prevent flicker.
