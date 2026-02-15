import { useState, useCallback, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import type { Language } from "@/data/languages";

// Map language codes to Web Speech API language codes
const getVoiceLang = (lang: Language): string => {
  const langMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
    ar: "ar-SA",
    hi: "hi-IN",
    tr: "tr-TR",
    nl: "nl-NL",
    pl: "pl-PL",
    sv: "sv-SE",
    da: "da-DK",
    fi: "fi-FI",
    no: "no-NO",
    cs: "cs-CZ",
    el: "el-GR",
    he: "he-IL",
    th: "th-TH",
    vi: "vi-VN",
    id: "id-ID",
    ms: "ms-MY",
    uk: "uk-UA",
    ro: "ro-RO",
    hu: "hu-HU",
    sk: "sk-SK",
    bg: "bg-BG",
    hr: "hr-HR",
    sr: "sr-RS",
    ca: "ca-ES",
    lt: "lt-LT",
    lv: "lv-LV",
    et: "et-EE",
    sl: "sl-SI",
  };
  return langMap[lang.code] || lang.code;
};

interface UseSpeechSynthesisReturn {
  speak: (text: string, lang: Language) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string, lang: Language) => {
    if (!isSupported || !text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getVoiceLang(lang);
    utterance.rate = settings.voiceRate;
    utterance.pitch = settings.voicePitch;

    const voices = window.speechSynthesis.getVoices();
    
    // Prefer user-selected voice, then language match
    let selectedVoice: SpeechSynthesisVoice | undefined;
    if (settings.voiceName) {
      selectedVoice = voices.find(v => v.name === settings.voiceName);
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(
        voice => voice.lang.startsWith(lang.code) || voice.lang === getVoiceLang(lang)
      );
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, settings.voiceRate, settings.voicePitch, settings.voiceName]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
};
