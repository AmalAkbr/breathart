import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const partnersDir = path.resolve('src/assets/partners');

async function processLogos() {
    const files = fs.readdirSync(partnersDir).filter(f => f.endsWith('.png'));
    
    for (const file of files) {
        const filePath = path.join(partnersDir, file);
        const buffer = await fs.promises.readFile(filePath);
        
        const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
        const r = data[0], g = data[1], b = data[2];
        
        const mask = Buffer.alloc(info.width * info.height);
        for (let i = 0; i < data.length; i += info.channels) {
            const dr = data[i], dg = data[i+1], db = data[i+2];
            const dist = Math.sqrt((dr-r)**2 + (dg-g)**2 + (db-b)**2);
            mask[i/info.channels] = dist < 20 ? 0 : 255;
        }

        const processed = await sharp(buffer)
            .joinChannel(mask, { raw: { width: info.width, height: info.height, channels: 1 } })
            .trim() // TIGHT TRIM
            .ensureAlpha()
            .toBuffer();

        await fs.promises.writeFile(filePath, processed);
        console.log(`Tight processed ${file}`);
    }
}

processLogos().catch(console.error);
