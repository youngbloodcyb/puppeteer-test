const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({width: 1920, height: 1080});
    await page.goto("https://www.apple.com/", { waitUntil: "networkidle2" });

    await page.screenshot({ path: "screenshot.jpg", 
                            type: "jpeg",
                            fullPage: true 
                        });

    await browser.close();
})(); 