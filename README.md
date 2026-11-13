# Silvia Art

A minimalist, static-first paintings gallery built with **Astro**, **Tailwind CSS v4**, **TypeScript**, and **Astro View Transitions**.

## Ecosystem Repositories

| Repository                                                                      | Role                                                    |
| ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`jorbush/silvia-art`](https://github.com/jorbush/silvia-art)                   | Static Astro gallery frontend                           |
| [`jorbush/silvia-art-content`](https://github.com/jorbush/silvia-art-content)   | Paintings markdown, images, and Sveltia CMS (`/admin/`) |
| [`jorbush/silvia-art-cms-auth`](https://github.com/jorbush/silvia-art-cms-auth) | Rust Cloudflare Worker for GitHub OAuth                 |

## Features

- Zero database, zero S3/object storage, zero server runtime
- Build-time content & image sync from `silvia-art-content` with automatic aspect ratio & blur placeholder generation via `sharp`
- Native Astro View Transitions (`<ClientRouter />`) with shared-element thumbnail-to-detail image morphing
- Full-frame feed (`/`), responsive thumbnail grid (`/grid`), mobile taxonomy view (`/sets`), tag pages (`/tag/[tag]`), medium pages (`/medium/[medium]`), and build-time PNG OpenGraph images
- Keyboard navigation (`ArrowLeft`/`J`, `ArrowRight`/`L`, `Escape`) and Light/Dark/System theme persistence
- Dedicated CI workflows for **Prettier**, **Oxlint**, **Vitest**, and **Playwright**

## Quick Start

```bash
pnpm install
pnpm dev
```

`predev` and `prebuild` automatically run `scripts/sync-content.ts`, which reads from `../silvia-art-content` locally or downloads the latest `main` tarball from GitHub.

## Scripts

```bash
pnpm run sync:content   # Sync paintings & generate image metadata manifest
pnpm run build          # Typecheck (astro check) & build static site
pnpm run check-format   # Prettier check
pnpm run lint           # Oxlint (--deny-warnings)
pnpm run test:unit      # Vitest unit tests
pnpm run test:e2e       # Playwright E2E suite against built preview
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [Architecture](./docs/architecture.md)
- [Content Sync](./docs/content-sync.md)
- [Testing Guide](./docs/testing.md)
- [Deployment Guide](./docs/deployment.md)
