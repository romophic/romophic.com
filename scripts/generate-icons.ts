import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SOURCE_ICON = path.join(PUBLIC_DIR, 'icon.webp');

const TARGETS = [
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
  { name: 'favicon.ico', size: 32 },
];

async function generateIcons() {
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`Source icon not found: ${SOURCE_ICON}`);
    process.exit(1);
  }

  console.log(`Generating icons from ${SOURCE_ICON}...`);

  for (const target of TARGETS) {
    const outputPath = path.join(PUBLIC_DIR, target.name);
    try {
      if (target.name.endsWith('.ico')) {
        // sharp doesn't directly support .ico, but usually .png with .ico extension works in modern browsers
        // or we can use sharp to output png and just name it .ico for simplicity in this context,
        // though proper .ico format is better. For standard compliance, let's output a 32x32 png
        // but naming it .ico might be misleading if it's just a png.
        // However, many tools handle png-in-ico.
        // Let's stick to standard sharp png output for now.
        await sharp(SOURCE_ICON)
          .resize(target.size, target.size)
          .toFormat('png')
          .toFile(outputPath);
      } else {
        await sharp(SOURCE_ICON)
          .resize(target.size, target.size)
          .toFormat('png')
          .toFile(outputPath);
      }
      console.log(`Created ${target.name}`);
    } catch (error) {
      console.error(`Error creating ${target.name}:`, error);
    }
  }

  // Handle SVG - we can't easily convert webp to svg.
  // We will delete the existing favicon.svg if it exists to avoid confusion.
  const svgPath = path.join(PUBLIC_DIR, 'favicon.svg');
  if (fs.existsSync(svgPath)) {
    fs.unlinkSync(svgPath);
    console.log('Removed favicon.svg (replaced by png/ico)');
  }
}

generateIcons();
