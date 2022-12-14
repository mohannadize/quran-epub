const fs = require("fs");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const chaptersIds = new Array(114).fill(0).map((_, i) => i + 1);

const chapters = {};

(async () => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);

  const url = `https://tanzil.net/#1:1`;
  await page.goto(url);
  await page.waitForNetworkIdle();

  let chapterCounter = 0;
  let pageCounter = 1;
  while (pageCounter <= 604) {
    console.log("Page", pageCounter);
    const pageContent = await page.evaluate(() => {
      return document.querySelector("#quranText").outerHTML;
    });
    const $ = cheerio.load(pageContent);

    const results = $(".suraHeaderFrame, .aya");

    for (let e of results) {
      const currentTarget = $(e);
      if (currentTarget.hasClass("suraHeaderFrame")) {
        chapterCounter++;
        console.log(currentTarget.text());
        chapters[chapterCounter] = {
          title: currentTarget.text(),
          ayas: [],
        };
      } else {
        chapters[chapterCounter].ayas = [
          ...chapters[chapterCounter].ayas,
          currentTarget.text(),
        ];
      }
    }

    await page.click("a.arrow-link.arrow-left");
    await page.waitForNetworkIdle();
    pageCounter++;
  }

  await browser.close();
  fs.writeFileSync(
    "./src/quranText.json",
    JSON.stringify(
      Object.entries(chapters).map(([id, { title, ayas }]) => {
        return {
          id,
          title,
          ayas,
        };
      }),
      null,
      2
    )
  );
})();
