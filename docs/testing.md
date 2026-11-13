# Testing Guide

## Unit Tests (Vitest)

Unit tests live in `tests/unit/` and cover:

- `paths.test.ts`: route builders and `Escape` navigation paths
- `paintings.test.ts`: sorting (`priorityOrder` + `date`), neighbor lookup, tag/medium aggregation, date range formatting
- `url.test.ts`: URL normalization and accented slugification
- `sync-content.test.ts`: directory mirroring and `sharp` manifest generation

Run with:

```bash
pnpm run test:unit
```

## End-to-End Tests (Playwright)

Playwright tests live in `tests/e2e/gallery.spec.ts` and run against the built Astro preview server (`pnpm preview --host 127.0.0.1 --port 4321`).

Run locally:

```bash
pnpm exec playwright install chromium
pnpm run build
pnpm run test:e2e
```
