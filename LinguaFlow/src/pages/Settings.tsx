import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, Type, Zap, RotateCcw, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { toast } from "sonner";

const fontSizes = [
  { value: "small" as const, label: "صغير", labelEn: "Small", preview: "Aa" },
  { value: "medium" as const, label: "متوسط", labelEn: "Medium", preview: "Aa" },
  { value: "large" as const, label: "كبير", labelEn: "Large", preview: "Aa" },
  { value: "xlarge" as const, label: "كبير جداً", labelEn: "X-Large", preview: "Aa" },
];

const fontSizePreviewClass: Record<string, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
};

const speeds = [
  { value: 300, label: "Fast" },
  { value: 500, label: "Normal" },
  { value: 800, label: "Relaxed" },
  { value: 1200, label: "Slow" },
];

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettings();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const previewVoice = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("Hello, this is a voice preview.");
    u.rate = settings.voiceRate;
    u.pitch = settings.voicePitch;
    if (settings.voiceName) {
      const v = voices.find((v) => v.name === settings.voiceName);
      if (v) u.voice = v;
    }
    window.speechSynthesis.speak(u);
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Settings reset to defaults");
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="px-5 pt-6 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all focus-ring"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground font-medium">Customize your experience</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pb-8 relative z-10 space-y-5">
        {/* Voice Settings */}
        <motion.div
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="glass-elevated rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Volume2 className="w-4.5 h-4.5 text-primary" />
            </div>
            <h2 className="text-base font-display font-semibold text-foreground">Voice & Speech</h2>
          </div>

          {/* Voice Selection */}
          <div className="mb-5">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Voice</label>
            <select
              value={settings.voiceName}
              onChange={(e) => updateSettings({ voiceName: e.target.value })}
              className="w-full bg-secondary/50 border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus-ring appearance-none"
            >
              <option value="">System Default</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Speed</label>
              <span className="text-xs font-semibold text-primary">{settings.voiceRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voiceRate}
              onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-primary h-1.5 rounded-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Slow</span>
              <span className="text-[10px] text-muted-foreground">Fast</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Pitch</label>
              <span className="text-xs font-semibold text-primary">{settings.voicePitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voicePitch}
              onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
              className="w-full accent-primary h-1.5 rounded-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Low</span>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
          </div>

          {/* Preview Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={previewVoice}
            className="w-full py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-all flex items-center justify-center gap-2 focus-ring"
          >
            <Volume2 className="w-4 h-4" />
            Preview Voice
          </motion.button>
        </motion.div>

        {/* Font Size */}
        <motion.div
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="glass-elevated rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Type className="w-4.5 h-4.5 text-accent" />
            </div>
            <h2 className="text-base font-display font-semibold text-foreground">Font Size</h2>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {fontSizes.map((fs) => {
              const active = settings.fontSize === fs.value;
              return (
                <motion.button
                  key={fs.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateSettings({ fontSize: fs.value })}
                  className={`relative flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all focus-ring ${
                    active
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border/40 bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="fontActive"
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </motion.div>
                  )}
                  <span className={`font-semibold text-foreground ${fontSizePreviewClass[fs.value]}`}>
                    {fs.preview}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">{fs.labelEn}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/30">
            <p className={`text-foreground ${fontSizePreviewClass[settings.fontSize]} transition-all`}>
              This is how your translation text will look.
            </p>
            <p className={`text-muted-foreground ${fontSizePreviewClass[settings.fontSize]} transition-all mt-1`}>
              هذا هو شكل نص الترجمة.
            </p>
          </div>
        </motion.div>

        {/* Translation Speed */}
        <motion.div
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="glass-elevated rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-warning" />
            </div>
            <h2 className="text-base font-display font-semibold text-foreground">Translation Speed</h2>
          </div>

          {/* Auto translate toggle */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-translate</p>
              <p className="text-xs text-muted-foreground">Translate as you type</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => updateSettings({ autoTranslate: !settings.autoTranslate })}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                settings.autoTranslate ? "bg-primary" : "bg-secondary"
              }`}
            >
              <motion.div
                className="w-6 h-6 rounded-full bg-white shadow-md"
                animate={{ x: settings.autoTranslate ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* Delay buttons */}
          {settings.autoTranslate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Typing delay</label>
              <div className="grid grid-cols-4 gap-2">
                {speeds.map((s) => {
                  const active = settings.autoTranslateDelay === s.value;
                  return (
                    <motion.button
                      key={s.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateSettings({ autoTranslateDelay: s.value })}
                      className={`py-2.5 rounded-xl text-xs font-semibold transition-all focus-ring ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {s.label}
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Wait {settings.autoTranslateDelay}ms after you stop typing
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Reset */}
        <motion.button
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          className="w-full py-4 rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive text-sm font-semibold transition-all flex items-center justify-center gap-2 focus-ring"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </motion.button>
      </main>
    </div>
  );
};

export default Settings;
