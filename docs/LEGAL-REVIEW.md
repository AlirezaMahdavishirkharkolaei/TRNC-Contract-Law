# Legal review checklist

The project is organised like a legal-tech product, with engineering work on one side and legal oversight on the other. This checklist sets out what the legal reviewers sign off and what is still open. Reviewers tick items in a pull request; nothing is marked done without a named reviewer.

## A. Source text (English)

- [x] All 198 sections were checked against the 1959 page scans after two independent OCR passes. Corrections are listed in `scripts/ocr/manual.py`.
- [x] **Arrangement mismatch, ss. 35–37.** The 1959 "Arrangement of Sections" lists titles for ss. 35–37 that do not match the body. The body follows the Indian Contract Act numbering: s. 35 is the fixed-time contingency rule, s. 36 covers impossible events, and s. 37 covers the obligation to perform and binding representatives. The titles, and the Part IV/V boundary (Part IV is now ss. 31–36; Part V is ss. 37–67), follow the body.
- [x] Marginal-title misprints were corrected where the body is unambiguous: s. 50 "promisee", and s. 67 "neglect of promisee".
- [ ] Compare against the current consolidated TRNC text (*Fasıl 149* as amended) and list the amended sections in the app.
- [ ] Compare against the current Republic of Cyprus consolidated text.

## B. Translations

For each language, a reviewer qualified in that legal system confirms the items below, Part by Part:

- [ ] The terms of art follow the term base (`data/glossary.js`), or the term base is updated.
- [ ] No provision changes meaning. Pay particular attention to: s. 2 definitions; s. 11 (age of majority, 18); ss. 15–18 (coercion, undue influence, fraud, misrepresentation); s. 25 exceptions; s. 27 restraint of trade; s. 74 penalty clause; ss. 76–77 formal requirements; ss. 91–97 discharge of surety; s. 138 formalities of a pledge of shares; ss. 190–191 undisclosed principal.
- [ ] Provisos ("Provided that…") and exceptions keep their scope.
- [ ] Section titles match the content of the section, not the 1959 Arrangement where the two differ.

| Language | Part I–III | IV–VII | VIII–X | XI | XII | XIII | Reviewer |
|---|---|---|---|---|---|---|---|
| Türkçe | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| فارسی | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Русский | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Deutsch | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | |

## C. Dictionary and assistant

- [ ] Each concept's primary sections (`p`) are the provisions a practitioner would cite first, and the related sections (`r`) are genuinely related.
- [ ] Every golden case in `tests/golden.json` has the right expected sections.
- [ ] The assistant shows its "finds provisions, not legal advice" notice in every language.
- [ ] Add golden cases from real client questions (anonymised) at least once a quarter, and record the first-pass score in [EVALUATION.md](EVALUATION.md) before tuning.
