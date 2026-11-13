# Content Sync Pipeline

`scripts/sync-content.ts` runs automatically before `pnpm dev` (`predev`) and `pnpm build` (`prebuild`).

## Resolution Order

1. **Local sibling repository** (unless `FORCE_REMOTE_SYNC=true`): checks `CONTENT_LOCAL_PATH`, `../silvia-art-content`, `./silvia-art-content`, and `./content-repo`.
2. **Remote GitHub tarball**: downloads `https://github.com/${CONTENT_ORG}/${CONTENT_REPO}/archive/refs/heads/${CONTENT_BRANCH}.tar.gz` (defaults to `jorbush/silvia-art-content@main`).

## Generated Artifacts (Gitignored)

- `src/content/paintings/*.md` — mirrored painting markdown entries
- `public/images/paintings/*` — mirrored WebP painting images
- `src/data/settings.json` — mirrored gallery settings
- `src/data/paintings-meta.json` — `sharp`-generated `width`, `height`, `aspectRatio`, and `blurData` base64 JPEG placeholders
