import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { generateImageManifest, mirrorDirectory } from '../../scripts/sync-content';

const tempDirs: string[] = [];

function createTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'silvia-art-test-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('sync-content helpers', () => {
  it('mirrors files and removes stale destination entries', () => {
    const src = createTempDir();
    const dest = createTempDir();

    fs.writeFileSync(path.join(src, 'a.md'), 'hello');
    fs.writeFileSync(path.join(dest, 'stale.md'), 'old');

    mirrorDirectory(src, dest);

    expect(fs.existsSync(path.join(dest, 'a.md'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'stale.md'))).toBe(false);
  });

  it('generates aspectRatio and blurData manifest using sharp', async () => {
    const imgDir = createTempDir();
    const outDir = createTempDir();
    const imgPath = path.join(imgDir, 'sample.webp');
    const manifestPath = path.join(outDir, 'paintings-meta.json');

    await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 3,
        background: { r: 200, g: 120, b: 80 },
      },
    })
      .webp()
      .toFile(imgPath);

    const manifest = await generateImageManifest(imgDir, manifestPath);
    const entry = manifest['/images/paintings/sample.webp'];

    expect(entry).toBeDefined();
    expect(entry.width).toBe(120);
    expect(entry.height).toBe(80);
    expect(entry.aspectRatio).toBe(1.5);
    expect(entry.blurData.startsWith('data:image/jpeg;base64,')).toBe(true);
  });
});
