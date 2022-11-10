const puppeteer = require("puppeteer");
const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
const lighthouse = require("lighthouse");
const config = require("lighthouse/lighthouse-core/config/lr-desktop-config.js");
// const reportGenerator = require("lighthouse/lighthouse-core/report/report-generator");

let img1;
let img2;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({width: 1920, height: 8000});
    await page.goto("https://www.vivint.com/ppc/security", { waitUntil: "networkidle2" });

    await page.screenshot({ path: "screenshot1.png", 
                            type: "png",
                            fullPage: false 
                        });

    await page.goto("https://www.vivint.com/ppc/brand", { waitUntil: "networkidle2" });

    await page.screenshot({ path: "screenshot2.png",
                            type: "png",
                            fullPage: true 
                        });

    const report = await lighthouse(page.url(), {
        port: (new URL(browser.wsEndpoint())).port,
        output: 'json',
        logLevel: 'info',
        disableDeviceEmulation: true,
        chromeFlags: ['--disable-mobile-emulation']
    }, config);

    const json = report.report;
    const lhScore = {
        URL: json.requestedURL,
        PERFORMANCE: json.categories.performance.score,
        ACCESSIBILITY: json.categories.accessibility.score,
        BEST_PRACTICES: json.categories.best-practices.score,
        PWA: json.categories.pwa.score,
        SEO: json.categories.seo.score
    }

    console.log(`Lighthouse scores: ${report.lhr.score}`);
    
    console.log('Writing results...');
    fs.writeFileSync('lighthouse-report.json', lhScore);
    // fs.writeFileSync('report.json', json);

    await browser.close();

    img1 = PNG.sync.read(fs.readFileSync('screenshot1.png'));
    img2 = PNG.sync.read(fs.readFileSync('screenshot2.png'));
    const {width, height} = img1;
    const diff = new PNG({width, height});

    pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.1, diffMask: true});

    fs.writeFileSync('diff.png', PNG.sync.write(diff));
    console.log(diff);
})(); 