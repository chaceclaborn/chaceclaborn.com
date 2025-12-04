import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const profileImage = join(projectRoot, 'public/images/profile.jpg');
const appDir = join(projectRoot, 'src/app');

async function generateFavicons() {
  console.log('Generating favicons from profile image...');

  // Read the source image
  const image = sharp(profileImage);

  // Generate 32x32 PNG favicon
  await image
    .clone()
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(join(appDir, 'icon.png'));
  console.log('Created icon.png (32x32)');

  // Generate apple-touch-icon (180x180)
  await image
    .clone()
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(join(appDir, 'apple-icon.png'));
  console.log('Created apple-icon.png (180x180)');

  // Generate favicon.ico (multi-size ICO)
  // For simplicity, we'll use the 32x32 size
  await image
    .clone()
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(join(appDir, 'favicon.ico'));
  console.log('Created favicon.ico (32x32)');

  console.log('Done! Favicons generated successfully.');
}

generateFavicons().catch(console.error);
