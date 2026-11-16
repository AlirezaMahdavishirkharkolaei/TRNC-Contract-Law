import { LAW } from "../data/cap149.js";
import { LANGS, RTL, setLang, getLang, t } from "./i18n.js";
import { escapeHtml, search, parseSectionQuery, highlight, linkify, levels, citation, citationTr } from "./law.js";

const $ = (id) => document.getElementById(id);
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* */ } } };
const BY_N = new Map(LAW.sections.map((s) => [s.n, s]));
let query = "";

function trTitle(s) {
  const l = getLang();
  return l === "tr" ? s.title_tr : l === "fa" ? s.title_fa : "";
}
function partTitle(p) {
  const l = getLang();
  return l === "tr" ? p.title_tr : l === "fa" ? p.title_fa : "";
}

function sectionHtml(s) {
  const lv = levels(s.text);
  const body = s.text.map((p, i) => {
    let h = linkify(escapeHtml(p));
    if (query) h = highlight(h, query);
    return `<p class="l${lv[i]}">${h}</p>`;
  }).join("");
  const tt = trTitle(s);
  let title = escapeHtml(s.title);
  if (query) title = highlight(title, query);
  return `<article class="sec" id="s${s.n}" data-n="${s.n}">
    <header><a class="num" href="#s${s.n}" aria-label="${escapeHtml(t("section"))} ${s.n}">${s.n}.</a>
      <div><h3>${title}</h3>${tt ? `<span class="tr" dir="auto" title="${escapeHtml(t("titleTr"))}">${escapeHtml(tt)}</span>` : ""}</div></header>
    <div class="body" lang="en">${body}</div>
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
      if (s.heading) out.push(`<h3 class="group-head">${escapeHtml(s.heading)}</h3>`);
      out.push(sectionHtml(s));
    }
  }
  $("law").innerHTML = out.join("");
  $("endnote").innerHTML = `<b>${escapeHtml(t("endnote"))}:</b> ${escapeHtml(LAW.endnote)}`;
  $("status").textContent = "";
}

function renderResults(results) {
  $("law").innerHTML = results.length ? results.map((r) => sectionHtml(r.section)).join("") : `<p>${escapeHtml(t("noResults"))}</p>`;
  $("endnote").innerHTML = "";
  $("status").textContent = results.length ? t("results", { n: results.length }) : "";
}

function renderToc() {
  $("toc").innerHTML = LAW.parts.map((p) => `<details ${p.from <= 2 ? "open" : ""}>
    <summary>${escapeHtml(t("part"))} ${p.id}. ${escapeHtml(p.title)}${partTitle(p) ? `<small dir="auto">${escapeHtml(partTitle(p))}</small>` : ""}</summary>
    <ol>${LAW.sections.filter((s) => s.part === p.id).map((s) => `<li><a href="#s${s.n}"><span>${s.n}</span><span>${escapeHtml(s.title)}</span></a></li>`).join("")}</ol>
  </details>`).join("");
}

function applyLang(code) {
  setLang(code);
  document.documentElement.lang = code;
  document.documentElement.dir = RTL.has(code) ? "rtl" : "ltr";
  document.querySelectorAll("[data-t]").forEach((el) => { el.textContent = t(el.dataset.t); });
  $("q").placeholder = t("search");
  renderToc();
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
  renderResults(search(LAW.sections, q));
}

function toast(msg) {
  const el = $("toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 1400);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(t("copied")); } catch { window.prompt("", text); }
}

let scanPages = [], scanIdx = 0;
function showScan() {
  const p = scanPages[scanIdx];
  $("scan-img").src = `scans/p-${String(p).padStart(2, "0")}.jpg`;
  $("scan-img").alt = t("page", { n: p });
  $("scan-title").textContent = `Cap. 149 (1959) · ${t("page", { n: p })}`;
  $("scan-prev").disabled = p <= 1; $("scan-next").disabled = p >= 46;
}
function openScan(pages) { scanPages = [...Array(46)].map((_, i) => i + 1); scanIdx = pages[0] - 1; showScan(); $("scan").showModal(); }

function init() {
  $("lang").innerHTML = Object.entries(LANGS).map(([c, n]) => `<option value="${c}">${n}</option>`).join("");
  const urlLang = new URLSearchParams(location.search).get("lang");
  const nav = (navigator.language || "en").slice(0, 2);
  const lang = (urlLang && LANGS[urlLang] && urlLang) || store.get("cap149_lang") || (LANGS[nav] ? nav : "en");
  $("lang").value = lang;
  $("lang").addEventListener("change", () => { store.set("cap149_lang", $("lang").value); applyLang($("lang").value); });
  let timer;
  $("q").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => runQuery(false), 160); });
  $("q").addEventListener("keydown", (e) => { if (e.key === "Escape") { $("q").value = ""; runQuery(false); } });
  $("clear").addEventListener("click", () => { $("q").value = ""; runQuery(false); $("q").focus(); });
  $("home").addEventListener("click", (e) => { e.preventDefault(); $("q").value = ""; runQuery(false); history.replaceState(null, "", location.pathname + location.search); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== $("q")) { e.preventDefault(); $("q").focus(); }
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
    const a = e.target.closest('a[href^="#s"], a[href^="#part-"]');
    if (a && query) { $("q").value = ""; runQuery(true); }
    if (a) {
      e.preventDefault();
      const id = a.getAttribute("href").slice(1);
      history.replaceState(null, "", "#" + id);
      if (id.startsWith("s")) go(Number(id.slice(1)));
      else $(id)?.scrollIntoView({ block: "start" });
    }
  });
  $("scan-prev").addEventListener("click", () => { if (scanIdx > 0) { scanIdx--; showScan(); } });
  $("scan-next").addEventListener("click", () => { if (scanIdx < 45) { scanIdx++; showScan(); } });
  $("scan-close").addEventListener("click", () => $("scan").close());
  $("scan").addEventListener("click", (e) => { if (e.target === $("scan")) $("scan").close(); });
  applyLang(lang);
  const m = location.hash.match(/^#s(\d{1,3})$/);
  if (m) requestAnimationFrame(() => go(Number(m[1])));
  else if (location.hash.startsWith("#part-")) requestAnimationFrame(() => $(location.hash.slice(1))?.scrollIntoView());
}
init();
