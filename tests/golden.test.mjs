// Accuracy of the keyword finder against a lawyer-written golden set (tests/golden.json).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { analyse } from "../assets/match.js";

const { cases } = JSON.parse(fs.readFileSync(new URL("./golden.json", import.meta.url), "utf8"));
const run = (c) => {
  const ns = analyse(c.q).sections.map((s) => s.n);
  return c.none ? ns.length === 0 : c.expect.some((e) => ns.slice(0, c.top || 3).includes(e));
};

test("golden set: every case passes (top-3 hit, or no answer where none is expected)", () => {
  const failed = cases.filter((c) => !run(c)).map((c) => `[${c.lang}] ${c.q}`);
  assert.deepEqual(failed, []);
});

test("golden set covers all five languages and has negative cases", () => {
  for (const l of ["en", "tr", "fa", "ru", "de"]) assert.ok(cases.filter((c) => c.lang === l).length >= 15, l);
  assert.ok(cases.filter((c) => c.none).length >= 5);
});
