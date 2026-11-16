# Contract Law, Cap. 149: full text

**The Contract Law, Cap. 149** (in Northern Cyprus: *Sözleşmeler Yasası, Fasıl 149*) from the 1959 Revised Edition of the Laws of Cyprus, **in five languages**, with a concept-based keyword finder and an assistant that points to the relevant sections. All 198 sections are included, and each one links to the scanned page it was printed on.

**Live:** https://alirezamahdavishirkharkolaei.github.io/TRNC-Contract-Law/

[![tests](https://github.com/AlirezaMahdavishirkharkolaei/TRNC-Contract-Law/actions/workflows/tests.yml/badge.svg)](https://github.com/AlirezaMahdavishirkharkolaei/TRNC-Contract-Law/actions/workflows/tests.yml)

## Features

- **The complete law:** all 198 sections across its 13 Parts and the italic sub-headings, with the section numbers and marginal titles as printed.
- **Verify against the print:** every section has a "View in the 1959 print" button that opens the original page scan.
- **Read the law in your language:** complete working translations of all 198 sections in Türkçe, فارسی, Русский and Deutsch.
  - When the interface language changes, the law changes with it.
  - You can view the translation, the English, or both side by side, paragraph by paragraph.
  - The English remains the authoritative text. See [docs/TRANSLATION.md](docs/TRANSLATION.md).
- **Keyword finder:** a legal dictionary of 117 concepts, about 3,200 terms in five languages and 48 combination rules.
  - It maps everyday words to provisions. "late fee", "gecikme cezası", "وجه التزام", "неустойка" and "Vertragsstrafe" all lead to s. 74.
  - Chips show which concepts were recognised.
  - Plain full-text search runs as well. Typing a number goes straight to that section; `74`, `s. 74(1)`, `madde 74` and `ماده ۷۴` all work.
- **Ask the law:** describe a situation in any of the five languages. The assistant extracts the legal concepts and lists the relevant sections, each with a snippet in your language and the words that matched.
  - It runs entirely in the browser, and nothing is sent anywhere.
  - It finds provisions; it does not give legal advice.
  - On a 173-case golden set its top-3 accuracy is 100 % and its top-1 accuracy is 86 %. Honest figures for unseen questions are in [docs/EVALUATION.md](docs/EVALUATION.md).
- **Glossary:** 58 key terms in five languages.
- **Cross-references:** mentions such as "section 17", "sections 20, 21 and 22" and "Part VIII" are clickable links.
- **Deep links and citations:**
  - Every section has a permanent link, for example `#s74`.
  - One click copies a citation such as `Contract Law, Cap. 149, s. 74`. In the Turkish interface the citation also includes the form `Sözleşmeler Yasası (Fasıl 149), madde 74`.
- **Five interface languages:** English, Türkçe, فارسی (right to left), Русский and Deutsch.
- **Display:** dark mode, a print layout, and a mobile layout.

## Where the text comes from, and how it was digitised

The source is a scanned copy of the 1959 edition (46 pages). The pipeline in [`scripts/ocr/`](scripts/ocr) produced the text as follows:

1. **OCR.** Each page was rendered at 300 dpi, binarised and run through Tesseract. Word positions were used to separate the marginal notes from the body text; even and odd pages carry their margins on opposite sides.
2. **Segmentation.** The text was split into sections 1 to 198 in strict numerical order, tolerating OCR noise in the section numbers. Part titles and italic sub-headings were removed from the running text.
3. **Clean-up.** Lines were joined, hyphenation was repaired, and enumerations such as (a), (b), (i) were restored using their sequence. Quotation marks were normalised.
4. **Proofreading.**
   - A second, independent OCR pass (400 dpi, different settings) was compared word by word with the first.
   - Every disagreement, and every word not found in a dictionary, was checked against the page image and corrected by hand. The corrections are listed in [`manual.py`](scripts/ocr/manual.py).
5. **Titles.** The section titles come from the "Arrangement of Sections" and were transcribed from the scans.
   - For ss. 35–37 the 1959 Arrangement does not match the body of the law, which follows the Indian Contract Act numbering. The titles and the Part IV/V boundary have been corrected to follow the body; see [docs/LEGAL-REVIEW.md](docs/LEGAL-REVIEW.md).

Misprints in the 1959 edition itself have been kept, for example "every act of promises" in s. 2(2)(e).

`npm test` runs four suites:

- **The law:** all 198 sections are present and in order, the Parts cover every section, no OCR debris remains, enumerations run in sequence, known provisions read as printed, and search and cross-references work.
- **Translations:** paragraph alignment and markers, completeness, and that nothing is left untranslated.
- **Dictionary integrity:** every section can be reached from the dictionary, and every concept has terms in all five languages.
- **Golden set:** the 173-case accuracy check.

## Important limits

- **The text is the 1959 edition.** Amendments made afterwards are not included, either in the TRNC (*Fasıl 149* as amended by TRNC laws) or in the Republic of Cyprus. Before relying on a provision, check the current consolidated text from an official source.
- OCR was proofread, but small errors may remain. The page scan is the authority, which is why it sits one click away from every section.
- **The translations are unofficial working drafts that are awaiting review by lawyers.** They help readers understand the law, but they are not legal translations. Only the English text has legal force.
- The assistant points to provisions; it does not apply them to your facts. For advice, consult a lawyer.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
npm test                      # Node 20 or later
```

## Project layout

```
index.html                 the reference app
assets/                    app.js (UI), match.js (concept matcher), law.js (search, links, citations), i18n.js, style.css
data/cap149.js             the law as structured data (generated)
data/translations/         tr / fa / ru / de full text (generated)
data/concepts.js           legal dictionary: concepts → sections, five languages
data/glossary.js           term base
scans/                     the 46 page images of the 1959 edition
scripts/ocr/               OCR and proofreading pipeline, title translations
scripts/translations/      translation sources (JSON chunks), check and assemble scripts
scripts/build_data.py      builds data/cap149.js
scripts/evaluate.mjs       accuracy report for the keyword finder
tests/                     node --test suites and golden.json
docs/                      ARCHITECTURE, TRANSLATION, LEGAL-REVIEW, EVALUATION
```

The project is organised as an engineering team working under legal oversight.

- [CONTRIBUTING.md](CONTRIBUTING.md) sets out who owns what.
- [docs/LEGAL-REVIEW.md](docs/LEGAL-REVIEW.md) is the sign-off checklist.
- [CHANGELOG.md](CHANGELOG.md) records the releases.

## Author and licence

Built by Alireza Mahdavishirkharkolaei, LL.M. **Mohammad Amir Modami** collaborated on the legal analysis and research behind this project. The code is under the [MIT licence](LICENSE). The statutory text is a public legal document.
