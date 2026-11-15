# Contract Law, Cap. 149: full text

**Searchable full text of the Contract Law, Cap. 149** (in Northern Cyprus: *Sözleşmeler Yasası, Fasıl 149*), taken from the 1959 Revised Edition of the Laws of Cyprus. All 198 sections are included, and each one links to the scanned page it was printed on.

**Live:** https://alirezamahdavishirkharkolaei.github.io/TRNC-Contract-Law/

[![tests](https://github.com/AlirezaMahdavishirkharkolaei/TRNC-Contract-Law/actions/workflows/tests.yml/badge.svg)](https://github.com/AlirezaMahdavishirkharkolaei/TRNC-Contract-Law/actions/workflows/tests.yml)

## Features

- **The complete law:** all 198 sections across its 13 Parts and the italic sub-headings, with the section numbers and marginal titles as printed.
- **Verify against the print:** every section has a "View in the 1959 print" button that opens the original page scan.
- **Search:** full-text search across the law and the section titles. Typing a number goes straight to that section; `74`, `s. 74(1)`, `madde 74` and `ماده ۷۴` all work.
- **Cross-references:** mentions such as "section 17", "sections 20, 21 and 22" and "Part VIII" are clickable links.
- **Deep links and citations:**
  - Every section has a permanent link, for example `#s74`.
  - One click copies a citation such as `Contract Law, Cap. 149, s. 74`. In the Turkish interface the citation also includes the form `Sözleşmeler Yasası (Fasıl 149), madde 74`.
- **Five interface languages:** English, Türkçe, فارسی (right to left), Русский and Deutsch. Section and Part titles also carry **unofficial** Turkish and Persian translations, which help with navigation and make the law searchable in those languages. The statutory text itself is always shown in the original English.
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

Misprints in the 1959 edition itself have been kept, for example "every act of promises" in s. 2(2)(e).

`npm test` checks the result: that all 198 sections are present and in order, that the Parts cover every section, that no OCR debris remains, that enumerations run in sequence, that known provisions read as printed, and that search and cross-references work.

## Important limits

- **The text is the 1959 edition.** Amendments made afterwards are not included, either in the TRNC (*Fasıl 149* as amended by TRNC laws) or in the Republic of Cyprus. Before relying on a provision, check the current consolidated text from an official source.
- OCR was proofread, but small errors may remain. The page scan is the authority, which is why it sits one click away from every section.
- The translated titles are unofficial aids, not legal translations.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
npm test                      # Node 20 or later
```

## Project layout

```
index.html            the reference app
assets/               app.js (UI), law.js (search, links, citations), i18n.js, style.css
data/cap149.js        the law as structured data (generated)
scans/                the 46 page images of the 1959 edition
scripts/ocr/          the OCR and proofreading pipeline, plus the proofread output
scripts/build_data.py builds data/cap149.js
tests/                node --test suite
```

## Author and licence

Built by Alireza Mahdavishirkharkolaei, LL.M. The code is under the [MIT licence](LICENSE). The statutory text is a public legal document.
