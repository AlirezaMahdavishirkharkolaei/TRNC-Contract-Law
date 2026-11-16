// Integrity of the legal dictionary (data/concepts.js) and term base (data/glossary.js).
import test from "node:test";
import assert from "node:assert/strict";
import { CONCEPTS, COMBOS, GENERIC } from "../data/concepts.js";
import { GLOSSARY } from "../data/glossary.js";
import { LAW } from "../data/cap149.js";

const LANGS = ["en", "tr", "fa", "ru", "de"];
const valid = (n) => Number.isInteger(n) && n >= 1 && n <= 198;

test("concept ids are unique and every concept is complete in five languages", () => {
  const ids = CONCEPTS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate id");
  for (const c of CONCEPTS) {
    for (const l of LANGS) {
      assert.ok(c.label?.[l], `${c.id}: label.${l}`);
      assert.ok(c.t[l]?.length, `${c.id}: no ${l} terms`);
      assert.equal(new Set(c.t[l]).size, c.t[l].length, `${c.id}: duplicate ${l} term`);
    }
    if (!c.aux) assert.ok(c.p.length > 0, `${c.id}: no primary sections`);
    [...c.p, ...c.r].forEach((n) => assert.ok(valid(n), `${c.id}: bad section ${n}`));
  }
});

test("combination rules and umbrella list point at existing concepts", () => {
  const ids = new Set(CONCEPTS.map((c) => c.id));
  for (const r of COMBOS) {
    [...r.all, r.add].forEach((id) => assert.ok(ids.has(id), `combo refers to unknown ${id}`));
    assert.ok(r.weight > 0);
    assert.ok(!CONCEPTS.find((c) => c.id === r.add).aux, `combo adds auxiliary concept ${r.add}`);
  }
  GENERIC.forEach((id) => assert.ok(ids.has(id), `GENERIC ${id}`));
});

test("every one of the 198 sections can be reached from the dictionary", () => {
  const reach = new Set(CONCEPTS.flatMap((c) => [...c.p, ...c.r]));
  const missing = LAW.sections.map((s) => s.n).filter((n) => !reach.has(n));
  assert.deepEqual(missing, [], `unreachable sections: ${missing}`);
});

test("dictionary size (the matcher relies on breadth)", () => {
  const terms = CONCEPTS.reduce((a, c) => a + LANGS.reduce((b, l) => b + c.t[l].length, 0), 0);
  assert.ok(CONCEPTS.length >= 100, `concepts: ${CONCEPTS.length}`);
  assert.ok(terms >= 2500, `terms: ${terms}`);
});

test("glossary entries are complete and point at real sections", () => {
  for (const g of GLOSSARY) {
    for (const l of LANGS) assert.ok(g[l], `${g.en}: ${l}`);
    (g.s || []).forEach((n) => assert.ok(valid(n), `${g.en}: bad section ${n}`));
  }
});
