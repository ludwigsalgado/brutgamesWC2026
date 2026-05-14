import sharp from 'sharp';
import { join, basename } from 'path';

const SRC_DIR = 'public/sprites';
const sprites = ['shooter.png', 'keeper_idle.png', 'keeper_dive_left.png', 'keeper_dive_right.png', 'defender.png'];

for (const file of sprites) {
  const input = join(SRC_DIR, file);
  const output = join(SRC_DIR, basename(file, '.png') + '_clean.png');

  // Convertir verde dominante a transparente
  const { data, info } = await sharp(input).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (g > 40 && g > r && g > b) data[i + 3] = 0;
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(output);
  console.log(`✓ ${file} → ${basename(output)}`);
}

console.log('\n✅ All sprites processed successfully!');
