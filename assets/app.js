import { LAW } from "../data/cap149.js";
import { TRANSLATIONS } from "../data/translations/index.js";
import { GLOSSARY } from "../data/glossary.js";
import { LANGS, RTL, setLang, getLang, t } from "./i18n.js";
import { escapeHtml, search, parseSectionQuery, highlight, linkify, levels, citation, citationTr } from "./law.js";
import { analyse, conceptById } from "./match.js";

const $ = (id) => document.getElementById(id);
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* */ } } };
const BY_N = new Map(LAW.sections.map((s) => [s.n, s]));
let query = "";
let view = store.get("cap149_view") || "tr"; // "tr" = translation, "en" = English, "both"

// ------------------------------------------------------------------ text in the current language
function translated(n) {
  const l = getLang();
  if (l === "en") return null;
  const tx = TRANSLATIONS[l]?.sections?.[n];
  return Array.isArray(tx) && tx.length ? tx : null;
}
function titleFor(s) {
  const l = getLang();
  return l === "en" ? "" : s["title_" + l] || "";
}
function partTitle(p) {
  const l = getLang();
  return l === "en" ? "" : p["title_" + l] || "";
}
function headingFor(s) {
  const l = getLang();
  return l === "en" ? "" : s.heading_i18n?.[l] || "";
}
const conceptLabel = (c) => c.label[getLang()] || c.label.en;

function bodyHtml(paras, lang, dir) {
  const lv = levels(paras);
  return `<div class="body" lang="${lang}" dir="${dir}">` + paras.map((p, i) => {
    let h = escapeHtml(p);
    if (lang === "en") h = linkify(h);
    if (query) h = highlight(h, query);
    return `<p class="l${lv[i]}">${h}</p>`;
  }).join("") + "</div>";
}

function sectionHtml(s) {
  const l = getLang(), tx = translated(s.n);
  const dir = RTL.has(l) ? "rtl" : "ltr";
  let body;
  if (l === "en" || view === "en") body = bodyHtml(s.text, "en", "ltr");
  else if (!tx) body = `<p class="notr">${escapeHtml(t("noTr"))}</p>` + bodyHtml(s.text, "en", "ltr");
  else if (view === "both") body = `<div class="both">${bodyHtml(tx, l, dir)}${bodyHtml(s.text, "en", "ltr")}</div>`;
  else body = bodyHtml(tx, l, dir);
  const tt = titleFor(s);
  let title = escapeHtml(s.title);
  if (query) title = highlight(title, query);
  return `<article class="sec" id="s${s.n}" data-n="${s.n}">
    <header><a class="num" href="#s${s.n}" aria-label="${escapeHtml(t("section"))} ${s.n}">${s.n}.</a>
      <div><h3>${title}</h3>${tt ? `<span class="tr" dir="auto">${escapeHtml(tt)}</span>` : ""}</div></header>
    ${body}
    <div class="actions">
      <button type="button" data-act="cite">${escapeHtml(t("copyCite"))}</button>
      <button type="button" data-act="link">${escapeHtml(t("copyLink"))}</button>
      <button type="button" data-act="scan">${escapeHtml(t("viewScan"))} · ${escapeHtml(t("page", { n: s.pages[0] }))}</button>
    </div></article>`;
}

function renderAll() {
  const out = [];
  for (const p of LAW.parts) {
    out.push(`<div class="part-head" id="part-${p.id}"><p>${escapeHtml(t("part"))} ${p.id}</p><h2>${escapeHtml(p.title)}</h2>${partTitle(p) ? `<small dir="auto">${escapeHtml(partTitle(p))}</small>` : ""}</div>`);
    for (let n = p.from; n <= p.to; n++) {
      const s = BY_N.get(n);
      if (s.heading) out.push(`<h3 class="group-head">${escapeHtml(s.heading)}${headingFor(s) ? `<small dir="auto">${escapeHtml(headingFor(s))}</small>` : ""}</h3>`);
      out.push(sectionHtml(s));
    }
  }
  $("law").innerHTML = out.join("");
  const en2 = getLang() !== "en" && view !== "en" ? TRANSLATIONS[getLang()]?.endnote : "";
  $("endnote").innerHTML = `<b>${escapeHtml(t("endnote"))}:</b> ${view === "tr" && en2 ? `<span dir="auto">${escapeHtml(en2)}</span>` : escapeHtml(LAW.endnote)}${view === "both" && en2 ? `<span class="tx" dir="auto">${escapeHtml(en2)}</span>` : ""}`;
  $("status").textContent = "";
  $("topics").innerHTML = "";
}

/** Keyword search = concept matching (dictionary) first, then plain text matches in English and in the translation. */
function renderSearch(q) {
  const a = analyse(q);
  const l = getLang();
  const textSections = l === "en" ? LAW.sections : LAW.sections.map((s) => ({ ...s, text: [...s.text, ...(translated(s.n) || [])] }));
  const textHits = search(textSections, q).map((r) => BY_N.get(r.section.n));
  const conceptHits = a.sections.map((x) => BY_N.get(x.n));
  const seen = new Set(conceptHits.map((s) => s.n));
  const extra = textHits.filter((s) => !seen.has(s.n));
  $("topics").innerHTML = a.concepts.length ? `<span>${escapeHtml(t("topics"))}:</span> ` + a.concepts.map((c) => `<button type="button" class="chip" data-concept="${c.id}">${escapeHtml(conceptLabel(c))}</button>`).join("") : "";
  const parts = [];
  if (conceptHits.length) parts.push(conceptHits.map(sectionHtml).join(""));
  if (extra.length) parts.push(`<h3 class="group-head">${escapeHtml(t("textHits"))}</h3>` + extra.map(sectionHtml).join(""));
  $("law").innerHTML = parts.join("") || `<p>${escapeHtml(t("noResults"))}</p>`;
  $("endnote").innerHTML = "";
  const n = conceptHits.length + extra.length;
  $("status").textContent = n ? t("results", { n }) : "";
}

function renderToc() {
  $("toc").innerHTML = LAW.parts.map((p) => `<details ${p.from <= 2 ? "open" : ""}>
    <summary>${escapeHtml(t("part"))} ${p.id}. ${escapeHtml(p.title)}${partTitle(p) ? `<small dir="auto">${escapeHtml(partTitle(p))}</small>` : ""}</summary>
    <ol>${LAW.sections.filter((s) => s.part === p.id).map((s) => `<li><a href="#s${s.n}"><span>${s.n}</span><span dir="auto">${escapeHtml(titleFor(s) || s.title)}</span></a></li>`).join("")}</ol>
  </details>`).join("");
}

function renderGlossary() {
  const cols = ["en", "tr", "fa", "ru", "de"];
  $("glossary").innerHTML = `<summary>${escapeHtml(t("glossary"))}</summary><div class="gl-wrap"><table class="gl"><thead><tr>${cols.map((c) => `<th>${LANGS[c]}</th>`).join("")}<th>s.</th></tr></thead><tbody>` +
    GLOSSARY.map((g) => `<tr>${cols.map((c) => `<td dir="auto">${escapeHtml(g[c])}</td>`).join("")}<td>${g.s.slice(0, 4).map((n) => `<a href="#s${n}">${n}</a>`).join(", ")}</td></tr>`).join("") + "</tbody></table></div>";
}

function renderViewSwitch() {
  const l = getLang();
  $("viewswitch").hidden = l === "en";
  $("viewswitch").innerHTML = l === "en" ? "" : `<span class="note">${escapeHtml(t("unofficial"))}</span>` +
    ["tr", "en", "both"].map((v) => `<button type="button" data-view="${v}" aria-pressed="${view === v}">${escapeHtml(t(v === "tr" ? "viewTr" : v === "en" ? "viewEn" : "viewBoth"))}</button>`).join("");
}

function applyLang(code) {
  setLang(code);
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.has(code) ? "rtl" : "ltr";
  document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  $("q").placeholder = t("search");
  $("chat-input").placeholder = t("chatPh");
  renderToc();
  renderGlossary();
  renderViewSwitch();
  resetChat();
  runQuery(true);
}

function go(n, flash = true) {
  const el = $("s" + n);
  if (!el) return;
  el.scrollIntoView({ block: "start" });
  if (flash) { el.classList.add("hit"); setTimeout(() => el.classList.remove("hit"), 1600); }
  document.querySelectorAll(".toc a.active").forEach((a) => a.classList.remove("active"));
  const link = document.querySelector(`.toc a[href="#s${n}"]`);
  if (link) { link.classList.add("active"); link.closest("details").open = true; }
}

function runQuery(keepScroll) {
  const q = $("q").value.trim();
  $("clear").hidden = !q;
  const n = parseSectionQuery(q);
  if (!q || n) {
    query = "";
    renderAll();
    if (n) { go(n); return; }
    if (!keepScroll) window.scrollTo(0, 0);
    return;
  }
  query = q;
  renderSearch(q);
}

function showSectionFromAnywhere(n) {
  if (query || $("q").value) { $("q").value = ""; runQuery(true); }
  history.replaceState(null, "", "#s" + n);
  go(n);
}

// ------------------------------------------------------------------ chat
const SUGGEST = { en: ["guarantee", "penalty for late payment", "agent", "deposit of goods", "minor", "fraud"], tr: ["kefalet", "gecikme cezası", "temsilci", "emanet", "küçük", "hile"],
  fa: ["ضمانت", "جریمه تاخیر", "نماینده", "امانت", "صغیر", "تقلب"], ru: ["поручительство", "неустойка", "агент", "хранение", "несовершеннолетний", "обман"],
  de: ["Bürgschaft", "Vertragsstrafe", "Vertreter", "Verwahrung", "minderjährig", "Betrug"] };

function addMsg(html, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.innerHTML = html;
  $("chat-log").appendChild(div);
  $("chat-log").scrollTop = $("chat-log").scrollHeight;
}
function resetChat() {
  $("chat-log").innerHTML = "";
  addMsg(`<p>${escapeHtml(t("chatHello"))}</p><p class="small">${escapeHtml(t("chatNote"))}</p>`, "bot");
}
function snippet(n) {
  const tx = translated(n) || BY_N.get(n).text;
  const s = tx.join(" ");
  return s.length > 190 ? s.slice(0, 190).replace(/\s+\S*$/, "") + "…" : s;
}
function answer(text) {
  const greet = /^(hi|hello|hey|merhaba|selam|سلام|درود|привет|здравствуйте|hallo|guten tag)\b/i.test(text.trim()) && text.trim().split(/\s+/).length <= 3;
  if (greet) return `<p>${escapeHtml(t("chatGreet"))}</p>`;
  const a = analyse(text);
  if (!a.sections.length) {
    return `<p>${escapeHtml(t("chatNone"))}</p><p>${(SUGGEST[getLang()] || SUGGEST.en).map((w) => `<button type="button" class="chip" data-ask="${escapeHtml(w)}">${escapeHtml(w)}</button>`).join(" ")}</p>`;
  }
  const primary = a.sections.filter((s) => s.primary).slice(0, 5);
  const related = a.sections.filter((s) => !primary.includes(s)).slice(0, 6);
  const why = (s) => s.via.map((id) => id === "explicit" ? t("explicitRef") : (() => { const c = a.concepts.find((x) => x.id === id); return c ? c.words.join(", ") : ""; })()).filter(Boolean).join("; ");
  const dir = RTL.has(getLang()) ? "rtl" : "ltr";
  return `<p>${escapeHtml(t("chatFound"))} ${a.concepts.slice(0, 6).map((c) => `<span class="chip static">${escapeHtml(conceptLabel(c))}</span>`).join(" ")}</p>
    <p><b>${escapeHtml(t("chatSections"))}</b></p>
    ${primary.map((s) => { const sec = BY_N.get(s.n); return `<div class="hitcard"><a href="#s${s.n}" data-goto="${s.n}"><b>s. ${s.n}</b> · ${escapeHtml(titleFor(sec) || sec.title)}</a>
      <p dir="${translated(s.n) ? dir : "ltr"}">${escapeHtml(snippet(s.n))}</p><p class="why">${escapeHtml(t("chatWhy"))}: ${escapeHtml(why(s))}</p></div>`; }).join("")}
    ${related.length ? `<p>${escapeHtml(t("chatRelated"))} ${related.map((s) => `<a href="#s${s.n}" data-goto="${s.n}">s. ${s.n}</a>`).join(", ")}</p>` : ""}`;
}
function sendChat(text) {
  text = text.trim();
  if (!text) return;
  addMsg(`<p dir="auto">${escapeHtml(text)}</p>`, "me");
  addMsg(answer(text), "bot");
}
function openChat(open) {
  $("chat").hidden = !open;
  $("chat-btn").setAttribute("aria-expanded", String(open));
  if (open) $("chat-input").focus();
}

// ------------------------------------------------------------------ misc
function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 1400);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch { window.prompt("", text); }
}
let scanIdx = 0;
function showScan() {
  const p = scanIdx + 1;
  $("scan-img").src = `scans/p-${String(p).padStart(2, "0")}.jpg`;
  $("scan-img").alt = t("page", { n: p });
  $("scan-title").textContent = `Cap. 149 (1959) · ${t("page", { n: p })}`;
  $("scan-prev").disabled = p <= 1; $("scan-next").disabled = p >= 46;
}
function openScan(pages) { scanIdx = pages[0] - 1; showScan(); $("scan").showModal(); }

function init() {
  $("lang").innerHTML = Object.entries(LANGS).map(([c, n]) => `<option value="${c}">${n}</option>`).join("");
  const urlLang = new URLSearchParams(location.search).get("lang");
  const nav = (navigator.language || "en").slice(0, 2);
  const lang = (urlLang && LANGS[urlLang] && urlLang) || store.get("cap149_lang") || (LANGS[nav] ? nav : "en");
  $("lang").value = lang;
  $("lang").addEventListener("change", () => { store.set("cap149_lang", $("lang").value); applyLang($("lang").value); });
  let timer;
  $("q").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => runQuery(false), 180); });
  $("q").addEventListener("keydown", (e) => { if (e.key === "Escape") { $("q").value = ""; runQuery(false); } });
  $("clear").addEventListener("click", () => { $("q").value = ""; runQuery(false); $("q").focus(); });
  $("home").addEventListener("click", (e) => { e.preventDefault(); $("q").value = ""; runQuery(false); history.replaceState(null, "", location.pathname + location.search); });
  $("chat-btn").addEventListener("click", () => openChat($("chat").hidden));
  $("chat-close").addEventListener("click", () => openChat(false));
  $("chat-form").addEventListener("submit", (e) => { e.preventDefault(); sendChat($("chat-input").value); $("chat-input").value = ""; });
  // Enter sends, Shift+Enter adds a new line (IME composition is left alone).
  $("chat-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); $("chat-form").requestSubmit(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { e.preventDefault(); $("q").focus(); }
    if ($("scan").open && e.key === "ArrowLeft") $("scan-prev").click();
    if ($("scan").open && e.key === "ArrowRight") $("scan-next").click();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (b) {
      const n = Number(b.closest(".sec").dataset.n), s = BY_N.get(n);
      if (b.dataset.act === "cite") copy(getLang() === "tr" ? `${citation(n)} / ${citationTr(n)}` : citation(n));
      if (b.dataset.act === "link") copy(location.origin + location.pathname + "#s" + n);
      if (b.dataset.act === "scan") openScan(s.pages);
      return;
    }
    const v = e.target.closest("[data-view]");
    if (v) { view = v.dataset.view; store.set("cap149_view", view); renderViewSwitch(); runQuery(true); return; }
    const ask = e.target.closest("[data-ask]");
    if (ask) { sendChat(ask.dataset.ask); return; }
    const chip = e.target.closest("[data-concept]");
    if (chip) {
      const c = conceptById(chip.dataset.concept);
      $("law").innerHTML = [...c.p, ...(c.r || [])].map((n) => sectionHtml(BY_N.get(n))).join("");
      $("status").textContent = conceptLabel(c);
      return;
    }
    const g = e.target.closest("[data-goto]");
    if (g) { e.preventDefault(); if (matchMedia("(max-width: 760px)").matches) openChat(false); showSectionFromAnywhere(Number(g.dataset.goto)); return; }
    const a = e.target.closest('a[href^="#s"], a[href^="#part-"]');
    if (a) {
      e.preventDefault();
      const id = a.getAttribute("href").slice(1);
      if (id.startsWith("s")) showSectionFromAnywhere(Number(id.slice(1)));
      else { if (query) { $("q").value = ""; runQuery(true); } $(id)?.scrollIntoView({ block: "start" }); }
    }
  });
  $("scan-prev").addEventListener("click", () => { if (scanIdx > 0) { scanIdx--; showScan(); } });
  $("scan-next").addEventListener("click", () => { if (scanIdx < 45) { scanIdx++; showScan(); } });
  $("scan-close").addEventListener("click", () => $("scan").close());
  $("scan").addEventListener("click", (e) => { if (e.target === $("scan")) $("scan").close(); });
  applyLang(lang);
  if (new URLSearchParams(location.search).has("chat")) openChat(true);
  const m = location.hash.match(/^#s(\d{1,3})$/);
  if (m) requestAnimationFrame(() => go(Number(m[1])));
  else if (location.hash.startsWith("#part-")) requestAnimationFrame(() => $(location.hash.slice(1))?.scrollIntoView());
}
init();
