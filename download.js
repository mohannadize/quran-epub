const fs = require("fs");
const puppeteer = require("puppeteer");

const chaptersIds = new Array(114).fill(0).map((_, i) => i + 1);

const chapters = [];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  
  await page.setDefaultNavigationTimeout(0)
  
  for (let chapterId of chaptersIds) {
    const url = `https://quranapp.com/${chapterId}`;
    await page.goto(url);
    await page.waitForNetworkIdle();
    const chapter = await page.evaluate(chapterId => {
      const header = document.querySelector(".surah-header");
      const title = header.dataset.name;
      const titleSVG = header.querySelector("svg").outerHTML;
      const content = document.querySelector(".content");
      const ayas = [...content.querySelectorAll("a.verse")].map((aya) => {
        return {
          text: aya.textContent,
          page: aya.style.fontFamily,
        }
      });
  
      return {
        id: chapterId,
        title,
        titleSVG,
        ayas,
      }
    }, chapterId);

    chapters.push(chapter);
  }
  
  await browser.close()
  console.log(chapters);
  fs.writeFileSync("quranText.json", JSON.stringify(chapters, null, 2));
})();
