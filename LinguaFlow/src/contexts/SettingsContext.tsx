import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AppSettings {
  voiceRate: number;       // 0.5 - 2.0
  voicePitch: number;      // 0.5 - 2.0
  voiceName: string;       // Web Speech API voice name
  fontSize: "small" | "medium" | "large" | "xlarge";
  autoTranslate: boolean;
  autoTranslateDelay: number; // ms: 300, 500, 800, 1200
}

const defaultSettings: AppSettings = {
  voiceRate: 0.9,
  voicePitch: 1,
  voiceName: "",
  fontSize: "medium",
  autoTranslate: true,
  autoTranslateDelay: 800,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  fontSizeClass: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "linguaflow-settings";

const fontSizeMap: Record<AppSettings["fontSize"], string> = {
  small: "text-sm",
  medium: "text-lg",
  large: "text-xl",
  xlarge: "text-2xl",
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => setSettings(defaultSettings);

  const fontSizeClass = fontSizeMap[settings.fontSize];

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, fontSizeClass }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
