// Interface strings. The statutory text itself is shown in the original English of the 1959 edition.
export const LANGS = { en: "English", tr: "Türkçe", fa: "فارسی", ru: "Русский", de: "Deutsch" };
export const RTL = new Set(["fa"]);

const S = {
  en: {
    title: "Contract Law, Cap. 149", sub: "Northern Cyprus & Republic of Cyprus · full text of the 1959 edition",
    search: "Search the law, or type a section number (e.g. 74)", parts: "Parts", part: "Part", section: "Section", sections: "sections",
    results: "{n} sections match", noResults: "No section matches. Try another word, or a number between 1 and 198.",
    copyCite: "Copy citation", copyLink: "Copy link", viewScan: "View in the 1959 print", copied: "Copied",
    page: "Page {n}", prev: "Previous page", next: "Next page", close: "Close", clear: "Clear",
    about: "About this text", titleTr: "Unofficial translation of the title",
    aboutBody: "This is the complete English text of the Contract Law, Cap. 149, as printed in the 1959 Revised Edition of the Laws of Cyprus, digitised from the printed volume by OCR and proofread against it. The law applies in Northern Cyprus as Sözleşmeler Yasası (Fasıl 149) and in the Republic of Cyprus as the Contract Law, Cap. 149. Amendments made after 1959 in either jurisdiction are not included. Check the current consolidated text before relying on any provision in practice, and use the page scans to verify the wording.",
    endnote: "Note in the 1959 edition", source: "Source code and method", origin: "In force since 1 January 1931 · 198 sections · 13 Parts",
    tip: "Tip: press / to search, and link to any section with #s74.", top: "Back to top",
  },
  tr: {
    title: "Sözleşmeler Yasası, Fasıl 149", sub: "Kuzey Kıbrıs ve Kıbrıs Cumhuriyeti · 1959 baskısının tam metni",
    search: "Yasada arayın veya madde numarası yazın (ör. 74)", parts: "Kısımlar", part: "Kısım", section: "Madde", sections: "madde",
    results: "{n} madde eşleşiyor", noResults: "Eşleşen madde yok. Başka bir kelime veya 1 ile 198 arasında bir sayı deneyin.",
    copyCite: "Atfı kopyala", copyLink: "Bağlantıyı kopyala", viewScan: "1959 baskısında gör", copied: "Kopyalandı",
    page: "Sayfa {n}", prev: "Önceki sayfa", next: "Sonraki sayfa", close: "Kapat", clear: "Temizle",
    about: "Bu metin hakkında", titleTr: "Başlığın gayriresmî çevirisi",
    aboutBody: "Bu, Kıbrıs Yasaları 1959 Gözden Geçirilmiş Baskısında yer alan Sözleşmeler Yasası, Fasıl 149'un İngilizce tam metnidir; basılı ciltten OCR ile sayısallaştırılmış ve ona karşı kontrol edilmiştir. Yasa Kuzey Kıbrıs'ta Sözleşmeler Yasası (Fasıl 149), Kıbrıs Cumhuriyeti'nde Contract Law, Cap. 149 olarak uygulanır. 1959'dan sonra her iki yargı alanında yapılan değişiklikler dahil değildir. Uygulamada herhangi bir hükme dayanmadan önce güncel konsolide metni kontrol edin ve ifadeyi doğrulamak için sayfa taramalarını kullanın.",
    endnote: "1959 baskısındaki not", source: "Kaynak kod ve yöntem", origin: "1 Ocak 1931'den beri yürürlükte · 198 madde · 13 kısım",
    tip: "İpucu: aramak için / tuşuna basın; herhangi bir maddeye #s74 ile bağlantı verin.", top: "Başa dön",
  },
  fa: {
    title: "قانون قرارداد، فصل ۱۴۹", sub: "قبرس شمالی و جمهوری قبرس · متن کامل ویرایش ۱۹۵۹",
    search: "در قانون جستجو کنید یا شمارهٔ ماده را بنویسید (مثلاً ۷۴)", parts: "بخش‌ها", part: "بخش", section: "ماده", sections: "ماده",
    results: "{n} ماده پیدا شد", noResults: "ماده‌ای پیدا نشد. واژهٔ دیگری یا عددی بین ۱ و ۱۹۸ را امتحان کنید.",
    copyCite: "کپی ارجاع", copyLink: "کپی پیوند", viewScan: "دیدن در چاپ ۱۹۵۹", copied: "کپی شد",
    page: "صفحهٔ {n}", prev: "صفحهٔ قبل", next: "صفحهٔ بعد", close: "بستن", clear: "پاک کردن",
    about: "دربارهٔ این متن", titleTr: "ترجمهٔ غیررسمی عنوان",
    aboutBody: "این متن کامل انگلیسی قانون قرارداد، فصل ۱۴۹، طبق ویرایش بازنگری‌شدهٔ ۱۹۵۹ قوانین قبرس است که با OCR از نسخهٔ چاپی استخراج و با آن مقابله شده. این قانون در قبرس شمالی با عنوان Sözleşmeler Yasası (Fasıl 149) و در جمهوری قبرس با عنوان Contract Law, Cap. 149 اجرا می‌شود. اصلاحاتی که پس از ۱۹۵۹ در هر یک از این دو حوزه تصویب شده در این متن نیست. پیش از استناد به هر ماده در عمل، متن تلفیقی روز را بررسی کنید و برای اطمینان از عبارت، تصویر صفحه را ببینید.",
    endnote: "یادداشت ویرایش ۱۹۵۹", source: "کد منبع و روش کار", origin: "لازم‌الاجرا از ۱ ژانویهٔ ۱۹۳۱ · ۱۹۸ ماده · ۱۳ بخش",
    tip: "نکته: برای جستجو کلید / را بزنید و با ‎#s74 به هر ماده پیوند دهید.", top: "بازگشت به بالا",
  },
  ru: {
    title: "Закон о договорах, гл. 149", sub: "Северный Кипр и Республика Кипр · полный текст издания 1959 года",
    search: "Поиск по закону или номер статьи (например, 74)", parts: "Части", part: "Часть", section: "Статья", sections: "статей",
    results: "Найдено статей: {n}", noResults: "Ничего не найдено. Попробуйте другое слово или число от 1 до 198.",
    copyCite: "Копировать ссылку на норму", copyLink: "Копировать URL", viewScan: "Посмотреть в издании 1959 г.", copied: "Скопировано",
    page: "Страница {n}", prev: "Предыдущая страница", next: "Следующая страница", close: "Закрыть", clear: "Очистить",
    about: "Об этом тексте", titleTr: "Неофициальный перевод заголовка",
    aboutBody: "Это полный английский текст Закона о договорах, гл. 149, в редакции пересмотренного издания законов Кипра 1959 года, оцифрованный с печатного тома методом OCR и сверенный с ним. Закон действует на Северном Кипре как Sözleşmeler Yasası (Fasıl 149) и в Республике Кипр как Contract Law, Cap. 149. Изменения, внесённые после 1959 года, не включены. Перед применением на практике сверяйтесь с действующей консолидированной редакцией и проверяйте формулировки по сканам страниц.",
    endnote: "Примечание в издании 1959 г.", source: "Исходный код и методика", origin: "Действует с 1 января 1931 г. · 198 статей · 13 частей",
    tip: "Совет: нажмите / для поиска; ссылка на статью — #s74.", top: "Наверх",
  },
  de: {
    title: "Vertragsgesetz, Cap. 149", sub: "Nordzypern & Republik Zypern · vollständiger Text der Ausgabe von 1959",
    search: "Im Gesetz suchen oder Paragraphennummer eingeben (z. B. 74)", parts: "Teile", part: "Teil", section: "Abschnitt", sections: "Abschnitte",
    results: "{n} Abschnitte gefunden", noResults: "Kein Treffer. Versuchen Sie ein anderes Wort oder eine Zahl von 1 bis 198.",
    copyCite: "Zitat kopieren", copyLink: "Link kopieren", viewScan: "Im Druck von 1959 ansehen", copied: "Kopiert",
    page: "Seite {n}", prev: "Vorherige Seite", next: "Nächste Seite", close: "Schließen", clear: "Leeren",
    about: "Über diesen Text", titleTr: "Inoffizielle Übersetzung des Titels",
    aboutBody: "Dies ist der vollständige englische Text des Contract Law, Cap. 149, wie in der überarbeiteten Ausgabe der Gesetze Zyperns von 1959 gedruckt, per OCR aus dem gedruckten Band digitalisiert und damit abgeglichen. Das Gesetz gilt in Nordzypern als Sözleşmeler Yasası (Fasıl 149) und in der Republik Zypern als Contract Law, Cap. 149. Änderungen nach 1959 sind nicht enthalten. Prüfen Sie vor der praktischen Anwendung die aktuelle konsolidierte Fassung und den Wortlaut anhand der Seitenscans.",
    endnote: "Anmerkung in der Ausgabe von 1959", source: "Quellcode und Methode", origin: "In Kraft seit 1. Januar 1931 · 198 Abschnitte · 13 Teile",
    tip: "Tipp: / öffnet die Suche; Link auf einen Abschnitt mit #s74.", top: "Nach oben",
  },
};
let cur = "en";
export const setLang = (c) => (cur = S[c] ? c : "en");
export const getLang = () => cur;
export function t(key, vars = {}) {
  const s = S[cur][key] ?? S.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}
export function missing() {
  const out = {};
  for (const [c, d] of Object.entries(S)) {
    const m = Object.keys(S.en).filter((k) => !(k in d));
    if (m.length) out[c] = m;
  }
  return out;
}
