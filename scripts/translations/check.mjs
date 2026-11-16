// usage: node check.mjs lang file -> verifies paragraph alignment with English
import { LAW } from "../../data/cap149.js";
import fs from "fs";
const [lang, file] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(file, "utf8"));
let bad = 0;
for (const [k, paras] of Object.entries(d)) {
  const en = LAW.sections[Number(k) - 1].text;
  if (en.length !== paras.length) { console.log("COUNT", k, en.length, paras.length); bad++; continue; }
  en.forEach((p, i) => {
    const me = (p.match(/^(\(\w+\)\s*)+/) || [""])[0].replace(/\s/g, ""), mt = (paras[i].match(/^(\(\w+\)\s*)+/) || [""])[0].replace(/\s/g, "");
    if (me !== mt) { console.log("MARK", k, i, JSON.stringify(me), JSON.stringify(mt)); bad++; }
  });
}
console.log(lang, file, Object.keys(d).length, "sections", bad ? bad + " problems" : "OK");
