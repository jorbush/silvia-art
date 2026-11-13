import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

export interface PaintingMeta {
  width: number;
  height: number;
  aspectRatio: number;
  blurData: string;
}

export interface SyncConfig {
  org: string;
  repo: string;
  branch: string;
  localOverridePath?: string;
}

export function getSyncConfig(): SyncConfig {
  return {
    org: process.env.CONTENT_ORG || 'jorbush',
    repo: process.env.CONTENT_REPO || 'silvia-art-content',
    branch: process.env.CONTENT_BRANCH || 'main',
    localOverridePath: process.env.CONTENT_LOCAL_PATH,
  };
}

export function mirrorDirectory(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  const srcEntries = fs.readdirSync(src).filter((f) => f !== '.DS_Store');
  const srcSet = new Set(srcEntries);

  for (const destChild of fs.readdirSync(dest)) {
    if (destChild === '.DS_Store') continue;
    if (!srcSet.has(destChild)) {
      fs.rmSync(path.join(dest, destChild), { recursive: true, force: true });
    }
  }

  for (const child of srcEntries) {
    const srcChild = path.join(src, child);
    const destChild = path.join(dest, child);
    const stats = fs.statSync(srcChild);
    if (stats.isDirectory()) {
      mirrorDirectory(srcChild, destChild);
    } else {
      fs.copyFileSync(srcChild, destChild);
    }
  }
}

export function findLocalContentDir(cwd = process.cwd(), overridePath?: string): string | null {
  if (process.env.FORCE_REMOTE_SYNC === 'true') {
    return null;
  }

  const candidates = [
    overridePath,
    path.resolve(cwd, '../silvia-art-content'),
    path.resolve(cwd, 'silvia-art-content'),
    path.resolve(cwd, 'content-repo'),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'content/paintings'))) {
      return dir;
    }
  }
  return null;
}

function downloadRemoteTarball(tarballUrl: string, destDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(destDir, { recursive: true });
    const tarPath = path.join(destDir, 'content.tar.gz');

    function fetchUrl(url: string, redirectsLeft = 5) {
      https
        .get(url, { headers: { 'User-Agent': 'silvia-art-sync-agent' } }, (res) => {
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            if (redirectsLeft <= 0) {
              return reject(new Error('Too many redirects while downloading content tarball'));
            }
            return fetchUrl(res.headers.location, redirectsLeft - 1);
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`Failed to fetch tarball (${res.statusCode}) from ${url}`));
          }

          const stream = fs.createWriteStream(tarPath);
          res.pipe(stream);
          stream.on('finish', () => {
            stream.close();
            try {
              execSync(`tar -xzf "${tarPath}" --strip-components=1 -C "${destDir}"`, {
                stdio: 'ignore',
              });
              fs.unlinkSync(tarPath);
              resolve();
            } catch (err) {
              reject(err);
            }
          });
          stream.on('error', reject);
        })
        .on('error', reject);
    }

    fetchUrl(tarballUrl);
  });
}

export async function generateImageManifest(
  imagesDir: string,
  manifestOutPath: string
): Promise<Record<string, PaintingMeta>> {
  const manifest: Record<string, PaintingMeta> = {};

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(path.dirname(manifestOutPath), { recursive: true });
    fs.writeFileSync(manifestOutPath, JSON.stringify(manifest, null, 2));
    return manifest;
  }

  const files = fs
    .readdirSync(imagesDir)
    .filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f))
    .sort();

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const image = sharp(filePath).rotate();
    const metadata = await image.metadata();
    const width = metadata.width || 1200;
    const height = metadata.height || 1200;
    const aspectRatio = Number((width / height).toFixed(6));

    const blurBuffer = await sharp(filePath)
      .rotate()
      .resize(24)
      .blur(2)
      .jpeg({ quality: 65 })
      .toBuffer();

    manifest[`/images/paintings/${file}`] = {
      width,
      height,
      aspectRatio,
      blurData: `data:image/jpeg;base64,${blurBuffer.toString('base64')}`,
    };
  }

  fs.mkdirSync(path.dirname(manifestOutPath), { recursive: true });
  fs.writeFileSync(manifestOutPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

export async function syncContent(cwd = process.cwd()): Promise<void> {
  const config = getSyncConfig();
  const destPaintings = path.join(cwd, 'src/content/paintings');
  const destImages = path.join(cwd, 'public/images/paintings');
  const destSettings = path.join(cwd, 'src/data/settings.json');
  const destManifest = path.join(cwd, 'src/data/paintings-meta.json');

  const localDir = findLocalContentDir(cwd, config.localOverridePath);
  if (localDir) {
    console.log(`📦 [sync-content] Mirroring local content from ${localDir}`);
    mirrorDirectory(path.join(localDir, 'content/paintings'), destPaintings);
    mirrorDirectory(path.join(localDir, 'images/paintings'), destImages);

    const localSettings = path.join(localDir, 'content/settings.json');
    if (fs.existsSync(localSettings)) {
      fs.mkdirSync(path.dirname(destSettings), { recursive: true });
      fs.copyFileSync(localSettings, destSettings);
    }

    const manifest = await generateImageManifest(destImages, destManifest);
    console.log(
      `✅ [sync-content] Local sync complete (${Object.keys(manifest).length} painting images indexed).`
    );
    return;
  }

  const tarballUrl = `https://github.com/${config.org}/${config.repo}/archive/refs/heads/${config.branch}.tar.gz`;
  const tempDir = path.join(cwd, '.content-cache');
  console.log(`🌐 [sync-content] Fetching ${config.org}/${config.repo}@${config.branch}...`);

  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    await downloadRemoteTarball(tarballUrl, tempDir);

    mirrorDirectory(path.join(tempDir, 'content/paintings'), destPaintings);
    mirrorDirectory(path.join(tempDir, 'images/paintings'), destImages);

    const remoteSettings = path.join(tempDir, 'content/settings.json');
    if (fs.existsSync(remoteSettings)) {
      fs.mkdirSync(path.dirname(destSettings), { recursive: true });
      fs.copyFileSync(remoteSettings, destSettings);
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
    const manifest = await generateImageManifest(destImages, destManifest);
    console.log(
      `✅ [sync-content] Remote sync complete (${Object.keys(manifest).length} painting images indexed).`
    );
  } catch (err) {
    console.warn(`⚠️ [sync-content] Remote sync failed: ${(err as Error).message}`);
    if (fs.existsSync(destPaintings) && fs.readdirSync(destPaintings).length > 0) {
      console.log('ℹ️ [sync-content] Preserving existing synced content.');
      await generateImageManifest(destImages, destManifest);
      return;
    }
    throw err;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncContent().catch((err) => {
    console.error('❌ [sync-content] Fatal error:', err);
    process.exit(1);
  });
}
