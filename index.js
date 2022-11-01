const puppeteer = require("puppeteer");
const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
// const subImageMatch = require("matches-subimage");

let img1;
let img2;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({width: 1920, height: 1080});
    await page.goto("https://www.vivint.com/ppc/security", { waitUntil: "networkidle2" });

    await page.screenshot({ path: "screenshot1.png", 
                            type: "png",
                            fullPage: true 
                        });

    await page.goto("https://www.vivint.com/ppc/security", { waitUntil: "networkidle2" });

    await page.screenshot({ path: "screenshot2.png",
                            type: "png",
                            fullPage: true 
                        });

    await browser.close();

    img1 = PNG.sync.read(fs.readFileSync('screenshot1.png'));
    img2 = PNG.sync.read(fs.readFileSync('screenshot2.png'));
    const {width, height} = img1;
    const diff = new PNG({width, height});

    pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1});

    fs.writeFileSync('diff.png', PNG.sync.write(diff));
})(); 