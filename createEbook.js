const fs = require("fs");
const NodepubLite = require("nodepub-lite");
const imageToUri = require("image-to-uri");

const quran = JSON.parse(
  fs.readFileSync("./src/quranText.json", {
    encoding: "utf-8",
  })
);

const tafsir = JSON.parse(
  fs.readFileSync("./src/tafsirText.json", {
    encoding: "utf-8",
  })
);

const combined = quran.map((data, i) => ({
  ...data,
  tafsir: tafsir[i].tafsir,
}));

const appendix = JSON.parse(
  fs.readFileSync("./src/appendix.json", {
    encoding: "utf-8",
  })
);

const metadata = {
  title: "Quran",
  author: "Mohanad",
  language: "ar",
  cover: {
    name: "cover.jpg",
    data: imageToUri("./src/cover.jpg"),
  },
  fonts: [
    {
      name: "me_quran.otf",
      data: fs.readFileSync("./src/fonts/me_quran.otf"),
      type: "application/font-sfnt",
    },
  ],
};

const book = new NodepubLite(metadata);

book.addCSS(`
@font-face {
  font-family: me_quran;
  src: url("../fonts/me_quran.otf");
}

body {
  font-size: 20px;
  padding: 10px;
}

.chapter-title {
  font-family: me_quran;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 40px;
  font-size: 1.6em;
}

.chapter-title {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 40px;
  font-size: 1.6em;
}

path {
  stroke: currentColor !important;
}

p.quranText {
  font-family: me_quran;
  text-align: justify;
  margin: auto;
  line-height: 2;
  text-indent: 0;
}

p.normalText {
  text-align: justify;
  line-height: initial;
}

a.aya {
  margin-left: 5px;
  margin-right: 5px;
}

a.aya, a.aya > span {
  text-decoration: none;
  color: currentColor;
}
`);

quran.forEach(({ id, title, ayas }) => {
  const content = `<h2 class="chapter-title">
  ${title}
  </h2>
  
  ${
    id == 9 || id == 1
      ? ""
      : "<p style='margin-bottom: 30px; font-size: 1.2em; text-align: center' class='quranText'>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>"
  }
  

  <p class='quranText'>
  ${ayas
    .map((text, i) => {
      return `<a id="aya-${
        i + 1
      }" href="chapter-${id}-tafsir.xhtml#aya-${i + 1}-tafsir" class='aya'><span>${text}</span></a>`;
    })
    .join("\n")}
  </p>
  `;

  book.addSection(title, content, {
    overrideFilename: `chapter-${id}`,
  });
});

appendix.forEach(({ id, title, content }) => {
  const body = `<h2 class="normal-title">
  ${title}
  </h2>
  
  <p class='normalText'>
  ${content.join("\n")}
  </p>`;

  book.addSection(title, body, {
    overrideFilename: id,
  });
});

tafsir.forEach(({ id, title, tafsir }) => {
  const content = `<h2 class="chapter-title">
  ${title}
  </h2>
  
  ${
    id == 9 || id == 1
      ? ""
      : "<p style='margin-bottom: 30px; font-size: 1.2em; text-align: center' class='quranText'>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>"
  }
  

  <p class='quranText'>
  ${tafsir
    .map((text, i) => {
      return `<a id="aya-${
        i + 1
      }-tafsir" href="chapter-${id}.xhtml#aya-${i + 1}" class="aya"><span>${text}</span></a>`;
    })
    .join("\n")}
  </p>
  `;

  book.addSection(title, content, {
    overrideFilename: `chapter-${id}-tafsir`,
  });
});

book.createEPUB(`./dist/Quran`);
