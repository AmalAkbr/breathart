const https = require('https');
const fs = require('fs');

const urls = [
  'https://breathartinstitute.in/wp-content/uploads/2025/08/1-2.png',
  'https://breathartinstitute.in/wp-content/uploads/2025/08/2-2.png',
  'https://breathartinstitute.in/wp-content/uploads/2025/08/3-2.png',
  'https://breathartinstitute.in/wp-content/uploads/2025/08/4-2.png',
  'https://breathartinstitute.in/wp-content/uploads/2025/08/5-2.png',
  'https://breathartinstitute.in/wp-content/uploads/2025/08/6-2.png',
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://breathartinstitute.in/',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br'
};

urls.forEach((url, i) => {
  https.get(url, { headers }, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(`src/assets/${i+1}-2.png`);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${url} to src/assets/${i+1}-2.png`);
      });
    } else {
      console.log(`Failed to download ${url}: ${res.statusCode}`);
    }
  }).on('error', err => console.error(err));
});
