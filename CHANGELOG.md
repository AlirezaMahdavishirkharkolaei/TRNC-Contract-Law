# Changelog

## 2.0.0: multilingual law text, keyword finder and assistant

### Added
- **The full law in five languages.** Complete working translations of all 198 sections in Turkish, Persian, Russian and German, about 38,000 words in total, paragraph-aligned with the English.
  - When the interface language changes, the law text changes with it.
  - Three views are available: Translation, English, and Both side by side.
  - Section titles, Part titles, cross-headings and the 1959 endnote are translated too.
- **Concept-based keyword search.** It runs on a legal dictionary of 117 concepts, about 3,200 terms in five languages, and 48 combination rules. Concept chips explain why each result was found.
- **"Ask the law" assistant.** It reads a question written in any of the five languages, finds the legal concepts in it, and lists the relevant sections, each with a snippet and a "why" line. Enter sends; Shift+Enter adds a new line. It runs entirely in the browser.
- **Glossary.** A term base of 58 key terms in five languages, shown in the app.
- **Tests.**
  - `translations.test.mjs`, `dictionary.test.mjs` and `golden.test.mjs`.
  - A golden set of 173 cases.
  - `scripts/evaluate.mjs` for the evaluation report.
- **Documentation.**
  - In `docs/`: ARCHITECTURE, TRANSLATION, LEGAL-REVIEW and EVALUATION.
  - In the repository root: CONTRIBUTING.
  - Issue templates.

### Fixed
- Titles and the Part IV/V boundary for ss. 35–37 now follow the body of the law; the 1959 Arrangement of Sections differs here.
- OCR corrections:
  - s. 90 "liability", s. 129 "as a security", s. 172 "his principal" and "neglect, want of skill"
  - s. 174 "diligence", s. 175 "without first", s. 179 "goods", s. 197 "without authority"
  - marginal titles of ss. 50 and 67.

## 1.0.0
- Full English text of Cap. 149 (1959 Revised Edition), checked by two OCR passes and linked to the page scans.
- Search, cross-reference links, citations, five interface languages, dark mode, and print and mobile layouts.
