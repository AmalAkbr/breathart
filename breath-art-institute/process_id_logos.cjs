const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = 'c:/Users/ASUS/Desktop/breathartinstitute/breath-art-institute/src/assets';
const outputDir = path.join(assetsDir, 'partners');

const logos = [
    { input: 'ignet.webp', output: 'id_ignet.png' },
    { input: 'institute.png', output: 'id_breathart.png' },
    { input: 'meta.webp', output: 'id_meta.png' }
];

async function processLogo({ input, output }) {
    const inputPath = path.join(assetsDir, input);
    const outputPath = path.join(outputDir, output);

    console.log(`Processing ${input} -> ${output}...`);

    try {
        // First, check if input exists
        if (!fs.existsSync(inputPath)) {
            console.error(`Input file not found: ${inputPath}`);
            return;
        }

        // Standard processing: 
        // 1. Convert to RGBA
        // 2. Make white/near-white transparent (if not already)
        // 3. Trim
        // 4. Fit into 400x120 transparent container

        await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then(({ data, info }) => {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    // If pixel is very close to white, make it transparent
                    if (r > 245 && g > 245 && b > 245) {
                        data[i + 3] = 0;
                    }
                }
                return sharp(data, { raw: info });
            })
            .trim()
            .resize(400, 120, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(outputPath);

        console.log(`Successfully saved to ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${input}:`, err);
    }
}

async function run() {
    for (const logo of logos) {
        await processLogo(logo);
    }
}

run();
