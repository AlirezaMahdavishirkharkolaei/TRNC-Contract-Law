# Translations: method and status

**Status: machine-assisted working translations, pending review by qualified lawyers.** Only the English text of the 1959 Revised Edition has legal force. The translations exist so that a reader can follow the law in their own language. They are not certified, and they must not be cited in place of the English.

| Language | Words | Sections | Titles | Reviewed by a lawyer |
|---|---|---|---|---|
| Türkçe | ≈ 8,600 | 198 / 198 | ✓ | pending |
| فارسی | ≈ 10,600 | 198 / 198 | ✓ | pending |
| Русский | ≈ 8,900 | 198 / 198 | ✓ | pending |
| Deutsch | ≈ 10,100 | 198 / 198 | ✓ | pending |

## Method

1. **Source.** The English text in `data/cap149.js`, after OCR proofreading. Misprints in the 1959 print are translated as the obvious intended meaning, and the English keeps the misprint.
2. **Alignment.** One translated paragraph for each English paragraph. The `(1)`, `(a)` and `(i)` markers are kept exactly, so the side-by-side view and citations line up. The tests enforce this.
3. **Term base.** Key terms are rendered consistently, following `data/glossary.js`. Examples:

   | English | Türkçe | فارسی | Русский | Deutsch |
   |---|---|---|---|---|
   | proposal | öneri | ایجاب | предложение (оферта) | Antrag |
   | promisor / promisee | vaat eden / vaat alan | متعهد / متعهدله | обещающий / получатель обещания | Versprechender / Versprechensempfänger |
   | consideration | karşılık | عوض | встречное удовлетворение | Gegenleistung |
   | void / voidable | hükümsüz / iptal edilebilir | باطل / قابل ابطال | ничтожный / оспоримый | nichtig / anfechtbar |
   | surety / principal debtor | kefil / asıl borçlu | ضامن / مدیون اصلی | поручитель / основной должник | Bürge / Hauptschuldner |
   | bailment / bailor / bailee | emanet / emanet veren / emanet alan | امانت / امانت‌گذار / امانت‌دار | хранение / поклажедатель / хранитель | Verwahrung / Hinterleger / Verwahrer |
   | pledge / pawnor / pawnee | rehin / rehin veren / rehin alan | رهن / راهن / مرتهن | залог / залогодатель / залогодержатель | Pfand / Verpfänder / Pfandgläubiger |
   | agent / principal | temsilci / temsil olunan | نماینده / اصیل | агент / принципал | Vertreter / Geschäftsherr |

4. **Register.** Statutory style is used in each language: *-dır/-ir* in Turkish legal drafting, formal Persian legal prose, the style of the Russian civil code, and German *Gesetzessprache*. Where a common-law term has no exact equivalent, the nearest civil-law term is used and the English term is added in brackets the first time it appears. For example, *Verwahrung (bailment)* and *хранение (бейлмент)*.
5. **Checks.**
   - `node scripts/translations/check.mjs <lang> <chunk.json>` checks each chunk.
   - `npm test` checks the assembled files.

## How to correct a translation

Edit the JSON chunk in `scripts/translations/<lang>/pNN.json`, then run:

```bash
node scripts/translations/check.mjs tr scripts/translations/tr/p03.json
node scripts/translations/assemble.mjs
npm test
```

Open a pull request, or use the **Translation error** issue template. Please cite the section and paragraph, and give the corrected wording.
