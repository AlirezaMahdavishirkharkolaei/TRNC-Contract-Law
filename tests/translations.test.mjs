// Translations must stay paragraph-aligned with the English text so the "both" view and citations line up.
import test from "node:test";
import assert from "node:assert/strict";
import { LAW } from "../data/cap149.js";
import { TRANSLATIONS } from "../data/translations/index.js";

const LANGS = ["tr", "fa", "ru", "de"];
const marker = (p) => (p.match(/^(\(\w+\)\s*)+/) || [""])[0].replace(/\s/g, "");

for (const l of LANGS) {
  const T = TRANSLATIONS[l];
  test(`${l}: every section translated, paragraph-aligned, same (1)/(a) markers`, () => {
    assert.equal(T.lang, l);
    assert.match(T.status, /pending legal review/);
    for (const s of LAW.sections) {
      const tx = T.sections[s.n];
      assert.ok(Array.isArray(tx), `s.${s.n} missing`);
      assert.equal(tx.length, s.text.length, `s.${s.n}: ${tx.length} paragraphs vs ${s.text.length}`);
      tx.forEach((p, i) => {
        assert.ok(p.trim().length > 0, `s.${s.n} ¶${i} empty`);
        assert.equal(marker(p), marker(s.text[i]), `s.${s.n} ¶${i} marker`);
      });
    }
    assert.equal(Object.keys(T.sections).length, 198);
    assert.ok(T.endnote && T.endnote.length > 100);
  });
  test(`${l}: section and Part titles present`, () => {
    for (const s of LAW.sections) assert.ok(s["title_" + l], `s.${s.n} title_${l}`);
    for (const p of LAW.parts) assert.ok(p["title_" + l], `Part ${p.id} title_${l}`);
  });
}

test("fa/ru translations are not left in English (script check)", () => {
  for (const [l, re] of [["fa", /[؀-ۿ]/g], ["ru", /[а-яё]/gi]]) {
    for (const s of LAW.sections) {
      const txt = TRANSLATIONS[l].sections[s.n].join(" ");
      const native = (txt.match(re) || []).length, latin = (txt.match(/[a-z]/gi) || []).length;
      assert.ok(native > latin * 3, `${l} s.${s.n} looks untranslated`);
    }
  }
});

test("tr/de translations differ from the English text", () => {
  for (const l of ["tr", "de"]) for (const s of LAW.sections) {
    TRANSLATIONS[l].sections[s.n].forEach((p, i) => assert.notEqual(p, s.text[i], `${l} s.${s.n} ¶${i} identical to English`));
  }
});

test("cross-headings translated wherever the English has one", () => {
  for (const s of LAW.sections.filter((x) => x.heading)) for (const l of LANGS) assert.ok(s.heading_i18n?.[l], `s.${s.n} heading ${l}`);
});
