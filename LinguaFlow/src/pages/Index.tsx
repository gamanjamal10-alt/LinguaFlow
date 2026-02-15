import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Type, Mic, MessageSquare, Camera, ArrowLeftRight, Globe, Wifi, WifiOff, Sparkles, Settings } from "lucide-react";
import { LANGUAGES } from "@/data/languages";
import type { Language } from "@/data/languages";
import LanguageSelector from "@/components/LanguageSelector";
import TextTranslationPanel from "@/components/TextTranslationPanel";
import VoiceTranslationPanel from "@/components/VoiceTranslationPanel";
import ConversationPanel from "@/components/ConversationPanel";
import CameraPanel from "@/components/CameraPanel";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ThemeToggle from "@/components/ui/ThemeToggle";

type TabId = "text" | "voice" | "conversation" | "camera";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "text", label: "Text", icon: Type },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "conversation", label: "Chat", icon: MessageSquare },
  { id: "camera", label: "Camera", icon: Camera },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("text");
  const [sourceLang, setSourceLang] = useState<Language>(LANGUAGES[0]); // English
  const [targetLang, setTargetLang] = useState<Language>(LANGUAGES[1]); // Spanish
  const [isOffline, setIsOffline] = useState(false);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className="px-5 pt-6 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div 
              className="relative w-11 h-11 rounded-2xl gradient-accent flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-5 h-5 text-primary-foreground" />
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ 
                  boxShadow: [
                    "0 0 20px hsl(var(--primary) / 0.3)",
                    "0 0 40px hsl(var(--primary) / 0.4)",
                    "0 0 20px hsl(var(--primary) / 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-bold text-foreground">LinguaFlow</h1>
                <span className="badge-premium text-[10px]">
                  <Sparkles className="w-2.5 h-2.5" />
                  PRO
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">AI-Powered Translation</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/settings")}
              className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-all focus-ring"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOffline(!isOffline)}
              className={`p-2.5 rounded-xl transition-all ${
                isOffline 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-success/10 text-success"
              }`}
            >
              {isOffline ? (
                <WifiOff className="w-4 h-4" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
            </motion.button>
            <ThemeToggle />
          </motion.div>
        </div>

        {/* Language Selectors */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-end gap-2"
        >
          <div className="flex-1">
            <LanguageSelector selected={sourceLang} onSelect={setSourceLang} label="From" />
          </div>
          <motion.button
            whileTap={{ scale: 0.85, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            onClick={swapLanguages}
            className="p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all mb-0.5 group"
          >
            <ArrowLeftRight className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          </motion.button>
          <div className="flex-1">
            <LanguageSelector selected={targetLang} onSelect={setTargetLang} label="To" />
          </div>
        </motion.div>
      </header>

      {/* Tab Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 mb-4"
      >
        <div className="flex glass-frosted p-1.5">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-all focus-ring"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-card rounded-xl shadow-lg"
                    style={{ boxShadow: "0 4px 20px -4px hsl(var(--primary) / 0.15)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <span className={`transition-colors ${
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}>
                    {tab.label}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <main className="flex-1 px-5 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === "text" && <TextTranslationPanel sourceLang={sourceLang} targetLang={targetLang} />}
            {activeTab === "voice" && <VoiceTranslationPanel sourceLang={sourceLang} targetLang={targetLang} />}
            {activeTab === "conversation" && <ConversationPanel sourceLang={sourceLang} targetLang={targetLang} />}
            {activeTab === "camera" && <CameraPanel sourceLang={sourceLang} targetLang={targetLang} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-destructive/95 backdrop-blur-xl text-destructive-foreground text-sm font-semibold shadow-2xl flex items-center gap-2.5"
            style={{ boxShadow: "0 20px 60px -20px hsl(var(--destructive) / 0.5)" }}
          >
            <WifiOff className="w-4 h-4" />
            Offline Mode — Using downloaded packs
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
