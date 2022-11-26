const fs = require("fs");
const NodepubLite = require("nodepub-lite");
const imageToUri = require("image-to-uri");

const titleSVGBackground = fs.readFileSync("./src/surah-header.svg", {
  encoding: "utf-8",
});
const quran = JSON.parse(
  fs.readFileSync("./src/quranText.json", {
    encoding: "utf-8",
  })
);

const FONTSCSS = new Array(604)
  .fill(0)
  .map((_, i) => {
    const pageNumber = i + 1;
    return `@font-face {
  font-family: page_${pageNumber};
  src: url(../fonts/page_${pageNumber}.otf);
}`;
  })
  .join("\n");

const metadata = {
  title: "Quran",
  author: "Mohanad",
  language: "ar",
  cover: {
    name: "cover.jpg",
    data: imageToUri("./src/cover.jpg"),
  },
  fonts: new Array(604).fill(0).map((_, i) => {
    const name = `page_${i + 1}.otf`;

    return {
      name,
      data: fs.readFileSync(`./src/fonts/${name}`),
      type: "application/font-sfnt",
    };
  }),
};

const book = new NodepubLite(metadata);

// book.addCSS(FONTSCSS);

book.addCSS(`
body {
  font-size: 20px;
}

.chapter-title {
  min-height: 50px;
  max-width: 60vw;
  margin: auto;
  box-sizing: border-box;
  position: relative;
  margin-top: 20px;
  margin-bottom: 40px;
}

.chapter-title > * {
  position: absolute;
  height: 100%;
  display: block;
  transform: translateX(-50%) translateY(-50%);
  left: 50%;
  top: 50%;
}

.chapter-title>svg:last-child {
  height: 100%;
  fill: currentColor !important
}

path {
  stroke: currentColor !important;
}

p {
  text-align:center;
  width: 80vmin;
  max-width: 100%;
  margin: auto;
  text-indent: 0;
}
`);

quran.forEach(({ id, title, titleSVG, ayas }) => {
  const pagesOfChapter = [...new Set(ayas.map(({ page }) => page))];

  const css = `
  @font-face {
    font-family: page_1;
    src: url("../fonts/page_1.otf");
  }
  ${pagesOfChapter
    .map(
      (page) => `
  @font-face {
    font-family: ${page};
    src: url("../fonts/${page}.otf");
  }
  `
    )
    .join("\n")}
  `;

  const content = `<div class="chapter-title">
  ${titleSVG}
  </div>
  
  ${
    id == 9 || id == 1
      ? ""
      : "<p style='font-family: page_1; margin-bottom: 30px; font-size: 1.2em'>ﭑ​ﭒ​ﭓ​ﭔ​</p>"
  }
  

  <p>
  ${ayas
    .map(({ page, text }) => {
      return `<span style="font-family: ${page}">${text}</span>`;
    })
    .join("\n")}
  </p>`;

  book.addSection(title, content, { css });
});

book.createEPUB(`./dist/Quran`);
