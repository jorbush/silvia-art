# Deployment Guide

## 1. Deploy `silvia-art` to Vercel

1. Connect `jorbush/silvia-art` to Vercel.
2. Framework preset: **Astro** (Build command: `pnpm run build`, Output directory: `dist`).
3. Optional environment variables:
   - `SITE_URL` — production canonical URL (e.g. `https://silvia-art.vercel.app` or your custom domain)
   - `FORCE_REMOTE_SYNC=true` — optional on CI/Vercel (Vercel has no sibling folder so remote sync runs automatically)
4. In Vercel **Project Settings → Git → Deploy Hooks**, create a hook named `content-publish` targeting `main`.

## 2. Connect `silvia-art-content`

Add the Vercel Deploy Hook URL as the `VERCEL_DEPLOY_HOOK_URL` GitHub Actions secret in `jorbush/silvia-art-content` so publishing a new painting automatically triggers a fresh static rebuild.
