import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import cn from "./cn.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    cn: { translation: cn }
  },
  lng: "en", // 默认语言
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
