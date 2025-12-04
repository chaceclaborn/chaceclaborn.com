import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const texturesDir = path.join(__dirname, '..', 'public', 'textures');

// NASA Blue Marble textures (public domain)
const textures = [
  {
    name: 'earth_daymap.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
  },
  {
    name: 'earth_normal.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
  },
  {
    name: 'earth_specular.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
  },
  {
    name: 'earth_clouds.png',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'
  },
  {
    name: 'earth_nightlights.jpg',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png'
  }
];

if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirects
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function downloadAll() {
  console.log('Downloading Earth textures...');

  for (const texture of textures) {
    const dest = path.join(texturesDir, texture.name);
    if (fs.existsSync(dest)) {
      console.log(`Skipping ${texture.name} (already exists)`);
      continue;
    }
    console.log(`Downloading ${texture.name}...`);
    try {
      await downloadFile(texture.url, dest);
      console.log(`Downloaded ${texture.name}`);
    } catch (error) {
      console.error(`Failed to download ${texture.name}:`, error.message);
    }
  }

  console.log('Done!');
}

downloadAll();
