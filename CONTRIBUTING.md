# Contributing

Thank you for helping. This project is legal reference material, so **accuracy comes before features**.

## Roles

| Area | Owner | Files |
|---|---|---|
| Source text and OCR | legal + engineering | `scripts/ocr/`, `data/cap149.js` (generated) |
| Translations | a translator per language, with a lawyer reviewer | `scripts/translations/<lang>/`, `data/translations/` (generated) |
| Legal dictionary | legal | `data/concepts.js`, `data/glossary.js`, `tests/golden.json` |
| Matcher and UI | engineering | `assets/` |
| Sign-off | legal | [`docs/LEGAL-REVIEW.md`](docs/LEGAL-REVIEW.md) |

## Workflow

1. Open an issue first, using one of the templates: **Translation error**, **Legal accuracy** or **Bug**.
2. Make the change on a branch and open a pull request.
3. `npm test` must pass. CI runs it on every push.
4. Any change to the text, a translation, or the dictionary's section mappings needs a second reviewer with a legal background.

## Common tasks

```bash
# rebuild the statute data after editing OCR corrections or titles
python3 scripts/build_data.py scripts/ocr/secs_proofread.json scripts/ocr/structure.json

# rebuild translations after editing a chunk
node scripts/translations/check.mjs fa scripts/translations/fa/p02.json
node scripts/translations/assemble.mjs

# measure the keyword finder
node scripts/evaluate.mjs --fail

npm test
```

## Rules for the dictionary (`data/concepts.js`)

- Give each concept terms in **all five languages**. The tests enforce this.
- Prefer phrases to single words. A single word must not be ambiguous in any of the five languages. For example, German *die* is also the article, Persian *مرد* is also "man", and the English *estate* also appears in *estate agent*.
- Before you tune the dictionary on new golden cases, record their first-pass score in [`docs/EVALUATION.md`](docs/EVALUATION.md).
