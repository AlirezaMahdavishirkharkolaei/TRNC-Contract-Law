# Architecture

The site is a static web app with no build step and no server. Everything, including the chat assistant, runs in the visitor's browser, and no question typed into the site leaves the device.

```
index.html ──> assets/app.js ──┬─> assets/i18n.js           interface strings (en, tr, fa, ru, de)
                               ├─> assets/law.js            text search, cross-reference links, citations
                               ├─> assets/match.js          concept matcher (keyword search + chat)
                               ├─> data/cap149.js           the statute: 198 sections, 13 Parts (generated)
                               ├─> data/translations/*.js   tr / fa / ru / de full text (generated)
                               ├─> data/concepts.js         the legal dictionary: concepts → sections
                               └─> data/glossary.js         term base used by the translators and shown in the app
```

## Data

| File | What it holds | How it is made |
|---|---|---|
| `data/cap149.js` | `LAW = {meta, parts[], sections[], endnote}`. Each section has its number, English marginal title, title translations in four languages, Part, cross-heading (with translations), scan pages, and its paragraphs. | `python3 scripts/build_data.py scripts/ocr/secs_proofread.json scripts/ocr/structure.json` |
| `data/translations/<lang>.js` | `{lang, status, endnote, sections: {n: [paragraphs]}}`. Each translation has the same paragraph count and the same `(1)`/`(a)` markers as the English. | `node scripts/translations/assemble.mjs`, from the JSON chunks in `scripts/translations/<lang>/` |
| `data/concepts.js` | `CONCEPTS` (117 legal concepts: labels, primary sections `p`, related sections `r`, terms `t` in five languages), `COMBOS` (48 combination rules), `GENERIC` (umbrella concepts). | Written by hand and reviewed. See below. |
| `data/glossary.js` | 58 core terms with their rendering in each language and the sections that use them. | Written by hand. The translations follow it. |

## Showing the law in the reader's language

When the interface language changes, each section is drawn from `data/translations/<lang>.js`, and the visitor can choose one of three views:

- **Translation**: the translated text only.
- **English**: the authoritative English text only.
- **Both**: the translation and the English side by side, paragraph by paragraph.

Section titles, Part titles, cross-headings and the 1959 endnote switch language too. Persian is laid out right to left. If a section has no translation, the English text is shown together with a notice; the tests prevent this from happening.

## Keyword search and the chat assistant

Both features run on `assets/match.js` → `analyse(text)`.

1. **Normalise.** Persian and Arabic letters and digits are unified, the zero-width non-joiner becomes a space, diacritics are removed and the text is lowercased.
2. **Match terms.** Every term of every concept is tried in all five languages, so a question that mixes languages still works. How a dictionary token may match a token in the question depends on the language:
   - **English:** the two must reduce to the same light stem.
   - **Russian:** the term's final vowel is dropped and the rest is matched as a prefix.
   - **German:** prefix match, or containment inside a compound word (*Vertrags|strafe*).
   - **Turkish and Persian:** the term may be followed by up to six suffix characters (*kefil+in*, *قرارداد+ها*). A Turkish dictionary form that already carries a suffix is compared by stem.
   - **Guards:**
     - An ordinary English word is never read as a Turkish word plus a suffix, so *surety* is not *süre* + *ty*.
     - A short block-list separates look-alikes such as *süre* and *sürekli*.
     - Terms of three letters or fewer must match exactly.
   - **Phrases:** a multi-word term may have one extra word between its words.
3. **Weight.** A concept counts once, with the weight of its longest matched phrase, because longer phrases are more specific. Umbrella concepts (agency, guarantee, bailment and so on) step back when a specific concept is also found.
4. **Combine.** Combination rules add the concept that two signals mean together. For example, *guarantee* + *waiver/extra time* → discharge of surety (s. 93). Auxiliary signal concepts such as *withdraw*, *until paid*, *if*, *for himself* or *payment* carry no sections of their own; they only take part in these rules.
5. **Score sections.**
   - Primary sections score `3 × weight`, with a small decay down the list.
   - Related sections score `1 × weight`.
   - A reference to a section number in the question ("section 74", "madde 74", "ماده ۷۴", "статья 74", "§ 74") scores 100.
   - A stated age under 18 adds the *minor* concept.
   - Results below 2.5 are dropped. Unrelated small talk therefore returns nothing; it does not return a guess.
6. **Show the results.**
   - **Search** shows the concept hits first, then plain text matches in English and in the translation.
   - **Chat** shows the five strongest sections, each with a snippet in the reader's language and the words that triggered it ("why"), plus related sections.

The assistant finds the provisions; it does not give legal advice, and it says so in every language.

## Quality gates (`npm test`)

| Suite | What it guards |
|---|---|
| `tests/law.test.mjs` | All 198 sections are present and in order, the Parts cover every section, no OCR debris remains, enumerations run in sequence, known provisions read as printed, and search and links work. |
| `tests/translations.test.mjs` | Every section exists in four languages, paragraph counts and markers match the English, nothing is left untranslated, and all titles and headings are present. |
| `tests/dictionary.test.mjs` | Concept ids are unique, every concept has terms in all five languages, every section number is valid, combination rules point at real concepts, all 198 sections can be reached from the dictionary, and the dictionary has a minimum size. |
| `tests/golden.test.mjs` | Every case in the 173-case golden set passes. See [EVALUATION.md](EVALUATION.md). |

CI runs the suite on every push and pull request (`.github/workflows/tests.yml`). The site is deployed by `.github/workflows/pages.yml`.
