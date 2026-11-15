import { test } from "node:test";
import assert from "node:assert/strict";
import { LAW } from "../data/cap149.js";
import { search, parseSectionQuery, linkify, levels, fold, highlight, citation } from "../assets/law.js";
import { missing } from "../assets/i18n.js";

test("all 198 sections are present, in order, with text and titles", () => {
  assert.equal(LAW.sections.length, 198);
  LAW.sections.forEach((s, i) => {
    assert.equal(s.n, i + 1);
    assert.ok(s.title.length > 3, `title ${s.n}`);
    assert.ok(s.title_tr && s.title_fa, `translated titles ${s.n}`);
    assert.ok(s.text.length >= 1 && s.text.join(" ").split(" ").length >= 8, `text ${s.n}`);
    assert.ok(s.pages[0] >= 7 && s.pages.at(-1) <= 46, `pages ${s.n}`);
  });
});

test("parts cover sections 1-198 without gaps or overlaps", () => {
  let next = 1;
  for (const p of LAW.parts) { assert.equal(p.from, next); assert.ok(p.to >= p.from); next = p.to + 1; }
  assert.equal(next, 199);
  assert.equal(LAW.parts.length, 13);
});

test("no OCR debris remains in the text", () => {
  const bad = /[¢@#£$%{}\[\]|]|\b(?:Voip|Bonps|cighteen|promisce|bailec|moncy)\b/;
  for (const s of LAW.sections) for (const p of s.text) assert.ok(!bad.test(p), `s.${s.n}: ${p.slice(0, 80)}`);
});

test("enumerations are in sequence within each section", () => {
  const L = "abcdefghijklmnopqrstuvwxyz";
  for (const s of LAW.sections) {
    let prev = null;
    for (const p of s.text) {
      const m = p.match(/^(?:\(\d+\)\s*)?\(([a-z])\)/);
      if (!m || ["i", "v", "x"].includes(m[1]) && prev !== L[L.indexOf(m[1]) - 1]) continue;
      if (m[1] === "a") { prev = "a"; continue; }
      assert.equal(L.indexOf(m[1]), L.indexOf(prev) + 1, `s.${s.n}: (${prev}) then (${m[1]})`);
      prev = m[1];
    }
  }
});

test("known provisions read as printed", () => {
  const t = (n) => LAW.sections[n - 1].text.join(" ");
  assert.match(t(1), /This Law may be cited as the Contract Law\./);
  assert.match(t(11), /age of eighteen years/);
  assert.match(t(14), /sections 20, 21 and 22\./);
  assert.match(t(74), /reasonable compensation not exceeding the amount so named/);
  assert.match(t(78), /nine per centum per annum/);
  assert.match(LAW.endnote, /Commercial Code \(Amendment\) Law 1917/);
});

test("section queries and search", () => {
  for (const q of ["74", "s 74", "s. 74(1)", "section 74", "madde 74", "ماده ۷۴"]) assert.equal(parseSectionQuery(q), 74);
  assert.equal(parseSectionQuery("199"), null);
  assert.equal(parseSectionQuery("penalty"), null);
  assert.equal(search(LAW.sections, "penalty")[0].section.n, 74);
  assert.ok(search(LAW.sections, "kefil").length > 5, "Turkish titles are searchable");
  assert.ok(search(LAW.sections, "وجه التزام").some((r) => r.section.n === 74), "Persian titles are searchable");
  assert.equal(fold("Sözleşme"), "sozlesme");
});

test("cross-references, highlighting, indentation, citations", () => {
  const h = linkify("subject to sections 20, 21 and 22 and section 2(1); Part VIII of this Law; section 300");
  assert.match(h, /href="#s20"/); assert.match(h, /href="#s22"/); assert.match(h, /href="#s2" class="xref">2\(1\)/);
  assert.match(h, /href="#part-VIII"/); assert.doesNotMatch(h, /#s300/);
  assert.equal(highlight('<a href="#s1">consent</a>', "consent"), '<a href="#s1"><mark>consent</mark></a>');
  assert.deepEqual(levels(["(1) A", "(a) b", "(b) c", "(i) d", "(ii) e", "(2) f", "Provided g"]), [0, 1, 1, 2, 2, 0, 1]);
  assert.deepEqual(levels(["(h) x", "(i) y", "(j) z"]), [1, 1, 1]);
  assert.equal(citation(74, 1), "Contract Law, Cap. 149, s. 74(1)");
  assert.deepEqual(missing(), {});
});
