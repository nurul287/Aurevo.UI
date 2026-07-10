import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import bn from "./locales/bn.json";

export type AppLanguage = "en" | "bn";

const STORAGE_KEY = "aurevo_language";

/**
 * English by default for everyone; Bangla only when the user has explicitly
 * chosen it via the header toggle (choice is persisted).
 */
export function detectLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "bn") return saved;
  } catch {
    /* privacy modes — fall through to English */
  }
  return "en";
}

export function setLanguage(lang: AppLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  void i18n.changeLanguage(lang);
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: detectLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
});

export default i18n;
