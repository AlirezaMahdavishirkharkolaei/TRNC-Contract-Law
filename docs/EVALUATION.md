# Evaluating the keyword finder and the chat assistant

`tests/golden.json` holds 173 questions written the way real clients ask them, in five languages, each with the section(s) a lawyer would expect. A case passes if an expected section is among the first three results. Negative cases, such as small talk, pass only if nothing is returned.

Run `node scripts/evaluate.mjs` to see the table, or `node scripts/evaluate.mjs --fail` to list failures.

## Current results

| | cases | top-1 | top-3 |
|---|---|---|---|
| English | 87 | 85.1 % | 100 % |
| Türkçe | 24 | 87.5 % | 100 % |
| فارسی | 22 | 95.5 % | 100 % |
| Русский | 17 | 76.5 % | 100 % |
| Deutsch | 23 | 87.0 % | 100 % |
| **All** | **173** | **86.1 %** | **100 %** |

## Honest generalisation figures

Every case in the golden set now passes, but that is partly because the dictionary was improved using these very cases. To measure how the finder copes with questions it has never seen, three **blind sets** were written and scored *before* any tuning on them:

| Set | Cases | First-pass top-3 (before tuning) | After dictionary expansion |
|---|---|---|---|
| blind-1 | 30 | 43 % (13/30) | 100 % |
| blind-2 | 24 | 38 % (9/24) | 100 % |
| blind-3 | 20 | 65 % (13/20) | 100 % |

The rising first-pass score on blind-3 shows that the dictionary is generalising. Even so, a new kind of question can still be missed. When that happens, the chat assistant says so and suggests rephrasing or using the table of contents; it does not invent an answer.

## Adding cases

1. Write the question as a client would write it, in any of the five languages.
2. Put the expected section(s) in `expect`, then have a lawyer confirm them.
3. For a new batch, set `"set": "blind-N"`, run `node scripts/evaluate.mjs`, and **record the first-pass score here before changing the dictionary**.
4. Then extend `data/concepts.js` with terms, concepts or combination rules until `npm test` passes.
