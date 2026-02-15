import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Copy, Volume2, Share2, Star, Check, Sparkles } from "lucide-react";
import type { Language } from "@/data/languages";
import { useTranslation } from "@/hooks/useTranslation";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import PremiumLoader from "./ui/PremiumLoader";

interface TextTranslationPanelProps {
  sourceLang: Language;
  targetLang: Language;
}

const TextTranslationPanel = ({ sourceLang, targetLang }: TextTranslationPanelProps) => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const { translate, isTranslating } = useTranslation();
  const { speak, isSpeaking: isSpeakingSource } = useSpeechSynthesis();
  const { speak: speakTarget, isSpeaking: isSpeakingTarget } = useSpeechSynthesis();
  const { settings, fontSizeClass } = useSettings();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-translate with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!sourceText.trim() || !settings.autoTranslate) {
      if (!sourceText.trim()) setTranslatedText("");
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const result = await translate(sourceText, sourceLang, targetLang);
      if (result) {
        setTranslatedText(result);
      }
    }, settings.autoTranslateDelay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang, translate]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    
    const result = await translate(sourceText, sourceLang, targetLang);
    if (result) {
      setTranslatedText(result);
    }
  }, [sourceText, sourceLang, targetLang, translate]);

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (translatedText && navigator.share) {
      try {
        await navigator.share({
          title: "Translation",
          text: `${sourceText}\n\n→ ${translatedText}`,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else if (translatedText) {
      navigator.clipboard.writeText(`${sourceText}\n\n→ ${translatedText}`);
      toast.success("Translation copied for sharing!");
    }
  };

  const handleSpeakSource = () => {
    speak(sourceText, sourceLang);
  };

  const handleSpeakTarget = () => {
    speakTarget(translatedText, targetLang);
  };

  const charCount = sourceText.length;
  const maxChars = 5000;
  const charPercent = (charCount / maxChars) * 100;

  return (
    <div className="space-y-4">
      {/* Source */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-elevated rounded-3xl p-6 hover-lift"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sourceLang.flag}</span>
            <span className="text-sm font-semibold text-foreground">{sourceLang.name}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleSpeakSource}
            disabled={!sourceText.trim() || isSpeakingSource}
            className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all disabled:opacity-40 focus-ring"
          >
            <Volume2 className={`w-4 h-4 transition-colors ${
              isSpeakingSource ? "text-primary animate-pulse" : "text-muted-foreground"
            }`} />
          </motion.button>
        </div>
        
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleTranslate();
            }
          }}
          placeholder="Enter text to translate..."
          className={`w-full bg-transparent text-foreground ${fontSizeClass} leading-relaxed resize-none outline-none placeholder:text-muted-foreground/40 min-h-[140px] focus-ring rounded-lg`}
        />
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className={`absolute left-0 top-0 h-full rounded-full ${
                  charPercent > 90 ? "bg-destructive" : charPercent > 70 ? "bg-warning" : "bg-primary"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(charPercent, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className={`text-xs font-medium ${
              charPercent > 90 ? "text-destructive" : "text-muted-foreground"
            }`}>
              {charCount.toLocaleString()} / {maxChars.toLocaleString()}
            </span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="btn-premium px-6 py-2.5 rounded-xl text-primary-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            {isTranslating ? (
              <PremiumLoader size="sm" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Translate
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Swap indicator */}
      <motion.div 
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div 
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isTranslating 
              ? "bg-primary/20 shadow-glow" 
              : "bg-secondary/50"
          }`}
          animate={isTranslating ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 2, repeat: isTranslating ? Infinity : 0, ease: "linear" }}
        >
          {isTranslating ? (
            <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          ) : (
            <ArrowRightLeft className="w-5 h-5 text-primary/60" />
          )}
        </motion.div>
      </motion.div>

      {/* Target */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-elevated rounded-3xl p-6 hover-lift relative overflow-hidden"
      >
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 gradient-accent opacity-60" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{targetLang.flag}</span>
            <span className="text-sm font-semibold text-foreground">{targetLang.name}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleSpeakTarget}
              disabled={!translatedText || isSpeakingTarget}
              className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all disabled:opacity-40 focus-ring"
            >
              <Volume2 className={`w-4 h-4 transition-colors ${
                isSpeakingTarget ? "text-primary animate-pulse" : "text-muted-foreground"
              }`} />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              disabled={!translatedText}
              className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all disabled:opacity-40 focus-ring"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="w-4 h-4 text-success" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              disabled={!translatedText}
              className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all disabled:opacity-40 focus-ring"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsFavorited(!isFavorited);
                toast.success(isFavorited ? "Removed from favorites" : "Added to favorites");
              }}
              disabled={!translatedText}
              className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all disabled:opacity-40 focus-ring"
            >
              <Star className={`w-4 h-4 transition-all ${
                isFavorited ? "text-warning fill-warning scale-110" : "text-muted-foreground"
              }`} />
            </motion.button>
          </div>
        </div>
        
        <div className="min-h-[140px]">
          <AnimatePresence mode="wait">
            {isTranslating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[140px] gap-3"
              >
                <PremiumLoader size="md" text="Translating..." />
              </motion.div>
            ) : translatedText ? (
              <motion.p
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${fontSizeClass} text-foreground leading-relaxed`}
              >
                {translatedText}
              </motion.p>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[140px] text-center"
              >
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground/60">Translation will appear here...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TextTranslationPanel;
