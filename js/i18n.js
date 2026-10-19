// Languages: English is written in the code; the other languages live in js/lang/*.js.
"use strict";

const LANGS = {
  en: { name: "English", short: "EN", locale: "en-GB", dir: "ltr" },
  ar: { name: "العربية", short: "ع", locale: "ar-EG", dir: "rtl" },
  fr: { name: "Français", short: "FR", locale: "fr-FR", dir: "ltr" },
  it: { name: "Italiano", short: "IT", locale: "it-IT", dir: "ltr" },
  de: { name: "Deutsch", short: "DE", locale: "de-DE", dir: "ltr" },
};

const I18N = {};

const LANG = (() => {
  try {
    const saved = localStorage.getItem("fd-lang");
    if (LANGS[saved]) return saved;
  } catch (error) { /* ignore */ }
  const browser = (navigator.language || "en").slice(0, 2);
  return LANGS[browser] ? browser : "en";
})();

document.documentElement.lang = LANG;
document.documentElement.dir = LANGS[LANG].dir;

// t("Showing {n} of {total}", { n: 3, total: 6 })
function t(text, vars) {
  const dict = I18N[LANG];
  let out = (dict && dict[text]) || text;
  if (vars) out = out.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));
  return out;
}

// Locale for numbers and dates; Latin digits everywhere so prices stay easy to compare.
function localeTag() { return `${LANGS[LANG].locale}-u-nu-latn`; }

function setLang(code) {
  try { localStorage.setItem("fd-lang", code); } catch (error) { /* ignore */ }
  location.reload();
}

// Translates the fixed text in the HTML:
//   data-i18n        → text (the English text is the key; it is read from the element the first time)
//   data-i18n-html   → HTML (for text with a <br>)
//   data-i18n-ph     → placeholder, data-i18n-aria → aria-label
function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n") || el.textContent.trim();
    el.setAttribute("data-i18n", key);
    el.textContent = t(key);
  });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html") || el.innerHTML.trim();
    el.setAttribute("data-i18n-html", key);
    el.innerHTML = t(key);
  });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
}
