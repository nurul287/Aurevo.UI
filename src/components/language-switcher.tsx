import { setLanguage, type AppLanguage } from "@/i18n";
import { useTranslation } from "react-i18next";

/** EN / বাং toggle shown in the header. */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current: AppLanguage = i18n.language === "bn" ? "bn" : "en";
  const next: AppLanguage = current === "bn" ? "en" : "bn";

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      aria-label={current === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
      className="inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-bold text-gray-700 transition-colors hover:bg-[#111111] hover:text-white"
    >
      {current === "bn" ? "EN" : "বাং"}
    </button>
  );
}
