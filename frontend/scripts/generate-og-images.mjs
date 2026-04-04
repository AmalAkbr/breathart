import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer-core";

const baseUrl = process.argv[2] || "https://www.breathartinstitute.in";
const outputDir = path.resolve("public", "app");

const pages = [
  { route: "/", fileName: "og-home.png" },
  { route: "/about", fileName: "og-about.png" },
  { route: "/courses", fileName: "og-courses.png" },
  { route: "/blogs", fileName: "og-blogs.png" },
];

const executableCandidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

const executablePath = executableCandidates.find((candidate) =>
  fs.existsSync(candidate),
);

if (!executablePath) {
  console.error(
    "No Chrome/Chromium executable found. Set CHROME_PATH and try again.",
  );
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const item of pages) {
    const url = new URL(item.route, baseUrl).toString();
    const outputPath = path.join(outputDir, item.fileName);

    console.log(`Capturing ${url} -> ${outputPath}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Give client-side animations enough time before capture.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await page.screenshot({
      path: outputPath,
      type: "png",
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
  }

  console.log("OG screenshots generated successfully.");
} finally {
  await browser.close();
}
