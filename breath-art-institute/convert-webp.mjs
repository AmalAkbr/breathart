// convert-webp.mjs — converts all heavy PNG/JPEG assets to WebP
import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const assetsDir = './src/assets';
const extensions = ['.png', '.jpg', '.jpeg'];
// Skip files that are already tiny (icons < 50KB) or already WebP
const MIN_SIZE = 40 * 1024; // 40 KB threshold

const files = readdirSync(assetsDir).filter(f => {
    const ext = extname(f).toLowerCase();
    const size = statSync(join(assetsDir, f)).size;
    return extensions.includes(ext) && size >= MIN_SIZE;
});

console.log(`Converting ${files.length} assets to WebP...\n`);

for (const file of files) {
    const input = join(assetsDir, file);
    const name = basename(file, extname(file));
    const output = join(assetsDir, `${name}.webp`);

    const inputSize = statSync(input).size;

    try {
        await sharp(input)
            .webp({ quality: 82, effort: 4 })
            .toFile(output);

        const outputSize = statSync(output).size;
        const saved = (((inputSize - outputSize) / inputSize) * 100).toFixed(1);
        console.log(`✅ ${file} → ${name}.webp  (${(inputSize / 1024).toFixed(0)}KB → ${(outputSize / 1024).toFixed(0)}KB, -${saved}%)`);
    } catch (err) {
        console.error(`❌ ${file}: ${err.message}`);
    }
}

console.log('\nDone!');
