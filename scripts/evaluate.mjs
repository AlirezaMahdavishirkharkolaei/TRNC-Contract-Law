// Prints the matcher's accuracy on tests/golden.json, per language and per set.
// Usage: node scripts/evaluate.mjs [--fail]
import fs from "node:fs";
import { analyse } from "../assets/match.js";

const { cases } = JSON.parse(fs.readFileSync(new URL("../tests/golden.json", import.meta.url), "utf8"));
const rows = cases.map((c) => {
  const ns = analyse(c.q).sections.map((s) => s.n);
  const top1 = c.none ? ns.length === 0 : c.expect.includes(ns[0]);
  const top3 = c.none ? ns.length === 0 : c.expect.some((e) => ns.slice(0, c.top || 3).includes(e));
  return { ...c, ns, top1, top3 };
});
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
const table = (key) => {
  const groups = [...new Set(rows.map((r) => r[key]))];
  console.log(`\nby ${key}`.padEnd(14), "cases".padStart(6), "top-1".padStart(8), "top-3".padStart(8));
  for (const g of groups) {
    const rs = rows.filter((r) => r[key] === g);
    console.log(String(g).padEnd(13), String(rs.length).padStart(6), pct(rs.filter((r) => r.top1).length, rs.length).padStart(8), pct(rs.filter((r) => r.top3).length, rs.length).padStart(8));
  }
};
table("lang"); table("set");
console.log(`\nall ${rows.length} cases: top-1 ${pct(rows.filter((r) => r.top1).length, rows.length)}, top-3 ${pct(rows.filter((r) => r.top3).length, rows.length)}`);
if (process.argv.includes("--fail")) for (const r of rows.filter((x) => !x.top3)) console.log("FAIL", r.lang, r.q, "expected", r.expect, "got", r.ns.slice(0, 5));
