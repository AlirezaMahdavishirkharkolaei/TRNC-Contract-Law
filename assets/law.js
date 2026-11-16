// Pure helpers (no DOM): search, cross-references, citations. Tested in tests/law.test.mjs.

export const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹", ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export function normDigits(s) {
  return String(s).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d)).replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d));
}

/** Fold case and diacritics so "sozlesme" finds "sözleşme" and "consent" finds "Consent". */
export function fold(s) {
  return normDigits(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[يى]/g, "ی").replace(/ك/g, "ک").toLowerCase();
}

/** "74", "s 74", "s. 74(1)", "section 74", "madde 74", "ماده ۷۴" -> 74 */
export function parseSectionQuery(q) {
  const m = normDigits(q).trim().match(/^(?:s\.?|sec\.?|section|madde|md\.?|ماده|статья|ст\.?|§)?\s*(\d{1,3})(?:\s*\(\w+\))*\s*$/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 198 ? n : null;
}

/** Search sections: every word must appear in the text or in a title (any language). Returns ranked results. */
export function search(sections, query) {
  const words = fold(query).split(/\s+/).filter((w) => w.length > 1 || /\d/.test(w));
  if (!words.length) return [];
  const out = [];
  for (const s of sections) {
    const titles = fold([s.title, s.title_tr, s.title_fa].join(" "));
    const body = fold(s.text.join(" "));
    let score = 0, ok = true;
    for (const w of words) {
      const inTitle = titles.includes(w), inBody = body.includes(w);
      if (!inTitle && !inBody) { ok = false; break; }
      score += (inTitle ? 10 : 0) + (inBody ? 1 + Math.min(5, body.split(w).length - 2) : 0);
    }
    if (ok) out.push({ section: s, score });
  }
  return out.sort((a, b) => b.score - a.score || a.section.n - b.section.n);
}

/** Wrap matches of the query words in <mark>, on already-escaped HTML text only (outside tags). */
export function highlight(html, query) {
  const words = query.trim().split(/\s+/).filter((w) => w.length > 1).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return html;
  const re = new RegExp(`(${words.join("|")})`, "gi");
  return html.split(/(<[^>]+>)/).map((part) => (part.startsWith("<") ? part : part.replace(re, "<mark>$1</mark>"))).join("");
}

/** Turn "section 17", "sections 20, 21 and 22", "section 2(1)" and "Part VIII" into links. Input must be escaped HTML. */
export function linkify(html) {
  html = html.replace(/\b(sections?)\s+((?:\d{1,3}(?:\(\w+\))*(?:,\s*|\s+(?:and|or|to)\s+)?)+)/g, (all, word, list) =>
    word + " " + list.replace(/\d{1,3}(?:\(\w+\))*/g, (ref) => {
      const n = Number(ref.match(/^\d+/)[0]);
      return n >= 1 && n <= 198 ? `<a href="#s${n}" class="xref">${ref}</a>` : ref;
    }));
  return html.replace(/\bPart ([IVX]{1,5})\b(?! [a-z]*\.)/g, (all, p) => `<a href="#part-${p}" class="xref">Part ${p}</a>`);
}

/** Indentation for each paragraph of a section: "(1)" 0, "(a)" 1, "(i)" 2 (roman after a letter item), "Provided" 1. */
export function levels(paras) {
  const ROMAN = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/;
  let prevKey = null, prevLevel = 0;
  return paras.map((p) => {
    const m = p.match(/^\(([^)]+)\)/);
    let lv;
    if (!m) lv = /^Provided\b/.test(p) ? Math.max(1, prevLevel) : 0;
    else {
      const k = m[1];
      if (/^\d+$/.test(k)) lv = 0;
      else if (ROMAN.test(k) && (ROMAN.test(prevKey || "") && prevLevel === 2 || (k === "i" && prevKey !== "h"))) lv = 2;
      else lv = 1;
      prevKey = k;
    }
    prevLevel = lv;
    return lv;
  });
}

export function citation(n, sub) {
  return `Contract Law, Cap. 149, s. ${n}${sub ? `(${sub})` : ""}`;
}
export function citationTr(n) {
  return `Sözleşmeler Yasası (Fasıl 149), madde ${n}`;
}
