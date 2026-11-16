// Concept matcher: finds the sections of Cap. 149 that a free-text question is about, in five languages.
// Design goal: precision. Only dictionary terms (data/concepts.js) can trigger a concept; each result carries
// the words that triggered it, so the user can see why a section was suggested.
import { CONCEPTS, COMBOS, GENERIC } from "../data/concepts.js";
import { LAW } from "../data/cap149.js";

const PERSIAN = "۰۱۲۳۴۵۶۷۸۹", ARABIC = "٠١٢٣٤٥٦٧٨٩";

/** Language-independent normalisation used for both dictionary terms and user text. */
export function normalize(s) {
  return String(s)
    .replace(/[۰-۹]/g, (d) => PERSIAN.indexOf(d)).replace(/[٠-٩]/g, (d) => ARABIC.indexOf(d))
    .replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/ة/g, "ه").replace(/[أإآ]/g, "ا").replace(/ؤ/g, "و").replace(/ـ/g, "")
    .replace(/‌/g, " ")
    .replace(/ß/g, "ss").replace(/İ/g, "i").replace(/I/g, "i")
    .normalize("NFD").replace(/[̀-ًͯ-ٰٟ]/g, "")
    .replace(/ı/g, "i").replace(/ё/g, "е")
    .toLowerCase();
}
export function tokenize(s) {
  return normalize(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/** Light English stemmer: enough to equate lease/leases/leasing and threaten/threatened, but not lease/least. */
export function enStem(w) {
  if (w.length <= 3 || !/^[a-z]+$/.test(w)) return w;
  if (w.endsWith("ies") && w.length > 4) w = w.slice(0, -3) + "y";
  else if (w.endsWith("sses")) w = w.slice(0, -2);
  else if (w.endsWith("s") && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.endsWith("ing") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("ed") && w.length > 4) w = w.slice(0, -2);
  if (/([b-df-hj-np-tv-z])\1$/.test(w) && !/(ll|ss|ff|zz)$/.test(w)) w = w.slice(0, -1);
  if (w.endsWith("e") && w.length > 3) w = w.slice(0, -1);
  return w;
}
const isLatin = (w) => /^[a-z0-9]+$/.test(w);
const isCyrillic = (w) => /[а-я]/.test(w);
const isGermanish = (w) => /[a-z]/.test(w);

/** Does a dictionary token match a token typed by the user? */
export function tokenMatches(term, word, lang) {
  if (term === word) return true;
  if (term.length <= 3) return false;
  if (lang === "en" && isLatin(term)) return enStem(term) === enStem(word);
  if (lang === "ru" || isCyrillic(term)) {
    const stem = term.length >= 5 ? term.replace(/[аеиоуыэюяйь]+$/, "") : term;
    return word.startsWith(stem) && word.length <= stem.length + 4;
  }
  if (lang === "de" && isGermanish(term)) {
    if (word.startsWith(term) && word.length <= term.length + 3) return true;
    return term.length >= 6 && word.includes(term) && word.length <= term.length + 14; // compounds: Vertrags|strafe
  }
  // Turkish and Persian: agglutinative suffixes after the base form (kefil+in, قرارداد+ها).
  // An ordinary English word is never read as a Turkish word plus suffix ("surety" is not "süre"+"ty").
  if (isLatin(word) && EN_VOCAB.has(word)) return false;
  if (PREFIX_BLOCK.some(([t, re]) => t === term && re.test(word))) return false;
  if (word.startsWith(term) && word.length <= term.length + 6) return true;
  // Turkish: the dictionary form may itself carry a suffix (talimatlara ~ talimatlarıma): compare stems.
  if (isLatin(term) && isLatin(word) && term.length >= 7) {
    const k = Math.max(6, term.length - 3);
    return word.slice(0, k) === term.slice(0, k) && word.length <= term.length + 6;
  }
  return false;
}

const LANGS = ["en", "tr", "fa", "ru", "de"];
/** Different words that merely start like a dictionary term: süre (period) ≠ sürekli (continuing). */
const PREFIX_BLOCK = [["sure", /^surekl/], ["kira", /^kiraz/], ["ifa", /^ifad/]];
/** Every word of the English statute and of the English dictionary terms. */
const EN_VOCAB = new Set([
  ...LAW.sections.flatMap((s) => tokenize(s.title + " " + s.text.join(" "))),
  ...CONCEPTS.flatMap((c) => (c.t.en || []).flatMap((x) => tokenize(x))),
  ..."i am my me we you he she it they is are was were be been the a an and or but if so to of in on at by for with without from up about into over after before can could would should will shall may might must do does did done have has had not no yes this that these those who whom what when where why how which all any some more most other such only own same than too very just also give gave given gives get got take took make made pay paid say said tell told ask asked want need know think say".split(" "),
]);
/** Pre-tokenised dictionary. Terms from every language are tried, so mixed-language questions work. */
const INDEX = CONCEPTS.map((c) => ({
  c,
  terms: LANGS.flatMap((lang) => (c.t[lang] || []).map((raw) => ({ raw, lang, toks: tokenize(raw) }))).filter((x) => x.toks.length),
}));

function findPhrase(toks, words, lang) {
  for (let i = 0; i < words.length; i++) {
    if (!tokenMatches(toks[0], words[i], lang)) continue;
    let pos = i, ok = true;
    for (let k = 1; k < toks.length; k++) {
      let found = -1;
      for (let j = pos + 1; j <= Math.min(words.length - 1, pos + 2); j++) if (tokenMatches(toks[k], words[j], lang)) { found = j; break; }
      if (found < 0) { ok = false; break; }
      pos = found;
    }
    if (ok) return { start: i, end: pos };
  }
  // Persian/Turkish compounds typed without a space: "شرطبندی" for "شرط بندی"
  if (toks.length > 1 && (lang === "fa" || lang === "tr")) {
    const joined = toks.join("");
    const at = words.findIndex((w) => w.startsWith(joined));
    if (at >= 0) return { start: at, end: at };
  }
  return null;
}

/** Section numbers mentioned explicitly: "section 74", "s. 74", "madde 74", "ماده ۷۴", "статья 74", "§ 74". */
export function explicitSections(text) {
  const out = new Set();
  const re = /(?:\bsections?|\bss?\.|\bmadde(?:si|nin)?|\bmd\.|ماده|مواد|\bстатьи?|\bст\.|§|\bparagraph|\babschnitt)\s*(\d{1,3}(?:\s*(?:,|and|ve|و|и|und|-)\s*\d{1,3})*)/giu;
  for (const m of normalize(text).matchAll(re)) for (const n of m[1].match(/\d{1,3}/g)) { const k = Number(n); if (k >= 1 && k <= 198) out.add(k); }
  return [...out];
}

/**
 * Analyse a question. Returns { concepts: [{id, label, words, weight}], sections: [{n, score, primary, via:[conceptIds]}] }.
 * A concept counts once, with the weight of its longest matched term (longer phrases are more specific).
 */
export function analyse(text, { minScore = 2.5 } = {}) {
  const words = tokenize(text);
  const hits = [];
  for (const { c, terms } of INDEX) {
    let best = null;
    const seen = [];
    for (const t of terms) {
      const m = findPhrase(t.toks, words, t.lang);
      if (!m) continue;
      seen.push(t.raw);
      const w = t.toks.length + (t.toks.join("").length >= 8 ? 0.5 : 0);
      if (!best || w > best.w) best = { w, m };
    }
    if (best) hits.push({ id: c.id, label: c.label, words: [...new Set(seen)].slice(0, 4), weight: best.w, p: c.p, r: c.r || [] });
  }
  // Age stated as a number below 18: "16 year old", "16 yaşında", "۱۶ ساله", "۱۶ سالمه", "16 лет", "16 Jahre"
  const age = normalize(text).match(/(\d{1,2})\s*(?:-?\s*(?:years?\s*old|yrs?\s*old|year-old|yasinda|yasindaki|yas|ساله|سالمه|سالشه|سالم|سال دارم|سال دارد|سال سن|سالش|лет|года|jahre|jahre alt|jährig))/u);
  if (age && Number(age[1]) < 18 && !hits.some((h) => h.id === "minor")) {
    const c = CONCEPTS.find((x) => x.id === "minor");
    hits.push({ id: c.id, label: c.label, words: [age[0]], weight: 2.5, p: c.p, r: c.r || [] });
  }
  // Combination rules
  const have = new Set(hits.map((h) => h.id));
  for (const rule of COMBOS) {
    if (!rule.all.every((id) => have.has(id))) continue;
    const c = CONCEPTS.find((x) => x.id === rule.add);
    const existing = hits.find((h) => h.id === rule.add);
    const words = rule.all.flatMap((id) => hits.find((h) => h.id === id).words.slice(0, 1));
    if (existing) existing.weight += rule.weight;
    else hits.push({ id: c.id, label: c.label, words, weight: rule.weight, p: c.p, r: c.r || [], combo: true });
    have.add(rule.add);
  }
  // Umbrella concepts step back only when a specific concept was also found.
  if (hits.some((h) => !GENERIC.includes(h.id))) for (const h of hits) if (GENERIC.includes(h.id)) h.weight *= 0.6;
  // Drop concepts whose only evidence is a phrase fully contained in a stronger concept's phrase (e.g. "offer" inside "counter-offer").
  hits.sort((a, b) => b.weight - a.weight);
  const scores = new Map();
  const add = (n, v, id, primary) => {
    const e = scores.get(n) || { n, score: 0, primary: false, via: [] };
    e.score += v; e.primary = e.primary || primary; if (!e.via.includes(id)) e.via.push(id);
    scores.set(n, e);
  };
  for (const h of hits) {
    h.p.forEach((n, i) => add(n, 3 * h.weight * (1 - 0.02 * i), h.id, true));
    h.r.forEach((n) => add(n, 1 * h.weight, h.id, false));
  }
  for (const n of explicitSections(text)) add(n, 100, "explicit", true);
  const sections = [...scores.values()].filter((s) => s.score >= minScore).sort((a, b) => b.score - a.score || a.n - b.n);
  return { concepts: hits.filter((h) => !conceptById(h.id).aux).map(({ p, r, ...rest }) => rest), sections };
}

export const conceptById = (id) => CONCEPTS.find((c) => c.id === id);
