# Contributing to `silvia-art`

Thank you for helping improve Silvia's gallery!

## Development Setup

1. Install Node.js 22+ and `pnpm` 11+.
2. Optionally clone `jorbush/silvia-art-content` as a sibling directory (`../silvia-art-content`) for instant local content syncing.
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Required Checks

Every pull request runs four independent GitHub Actions workflows. Run them locally before pushing:

```bash
pnpm run check-format
pnpm run lint
pnpm run test:unit
pnpm run build
pnpm run test:e2e
```

## Code Standards

- Use TypeScript strict mode (`astro/tsconfigs/strict`).
- Keep UI components pure Astro where possible; use minimal progressive vanilla JS that hooks into `astro:page-load` and `astro:after-swap` cleanly without stacking event listeners across View Transitions.
- Never commit `.env` files, secrets, or synced `src/content/paintings/` binaries into this repository.
