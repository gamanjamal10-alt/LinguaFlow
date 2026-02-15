import { useState, useCallback, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Volume2, Sparkles, Waves } from "lucide-react";
import type { Language } from "@/data/languages";
import { useTranslation } from "@/hooks/useTranslation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "sonner";
import PremiumLoader from "./ui/PremiumLoader";

interface VoiceTranslationPanelProps {
  sourceLang: Language;
  targetLang: Language;
}

const WaveBar = ({ delay, index }: { delay: number; index: number }) => (
  <motion.div
    className="w-1 rounded-full bg-gradient-to-t from-primary to-accent"
    animate={{ 
      height: [4, 20 + Math.random() * 12, 4],
      opacity: [0.6, 1, 0.6]
    }}
    transition={{ 
      duration: 0.8 + Math.random() * 0.4, 
      repeat: Infinity, 
      delay: delay * 0.05,
      ease: "easeInOut" 
    }}
  />
);

const VoiceTranslationPanel = forwardRef<HTMLDivElement, VoiceTranslationPanelProps>(
  ({ sourceLang, targetLang }, ref) => {
    const [transcript, setTranscript] = useState("");
    const [translation, setTranslation] = useState("");
    const { translate, isTranslating } = useTranslation();
    const { startListening, stopListening, isListening, isSupported } = useSpeechRecognition();
    const { speak, isSpeaking } = useSpeechSynthesis();

    const handleResult = useCallback(async (text: string, isFinal: boolean) => {
      setTranscript(text);
      
      if (isFinal && text.trim()) {
        stopListening();
        const result = await translate(text, sourceLang, targetLang);
        if (result) {
          setTranslation(result);
        }
      }
    }, [translate, sourceLang, targetLang, stopListening]);

    const toggleListening = useCallback(() => {
      if (!isSupported) {
        toast.error("Speech recognition is not supported in this browser");
        return;
      }

      if (isListening) {
        stopListening();
        if (transcript.trim()) {
          translate(transcript, sourceLang, targetLang).then(result => {
            if (result) setTranslation(result);
          });
        }
      } else {
        setTranscript("");
        setTranslation("");
        startListening(sourceLang, handleResult);
      }
    }, [isListening, isSupported, transcript, sourceLang, targetLang, startListening, stopListening, handleResult, translate]);

    const handleSpeak = () => {
      if (translation) {
        speak(translation, targetLang);
      }
    };

    return (
      <div ref={ref} className="flex flex-col items-center gap-6 py-6">
        {/* Mic Button */}
        <div className="relative">
          {/* Outer glow rings */}
          <AnimatePresence>
            {isListening && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.4,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      background: `linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.2))`
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={toggleListening}
            disabled={isTranslating}
            className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all disabled:opacity-50 focus-ring ${
              isListening
                ? "gradient-accent shadow-2xl"
                : "bg-secondary hover:bg-secondary/80"
            }`}
            style={isListening ? { 
              boxShadow: "0 0 60px hsl(var(--primary) / 0.4), 0 20px 40px -10px hsl(var(--primary) / 0.3)"
            } : undefined}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="stop"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Square className="w-8 h-8 text-primary-foreground" />
                </motion.div>
              ) : isTranslating ? (
                <motion.div
                  key="loading"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <PremiumLoader size="md" />
                </motion.div>
              ) : (
                <motion.div
                  key="mic"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Mic className="w-9 h-9 text-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <motion.p 
          className="text-sm font-medium text-muted-foreground text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {!isSupported 
            ? "Speech recognition not supported" 
            : isListening 
              ? "Listening... Tap to stop" 
              : isTranslating 
                ? "Processing your speech..."
                : "Tap to start speaking"}
        </motion.p>

        {/* Waveform */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, height: 0 }}
              animate={{ opacity: 1, scale: 1, height: "auto" }}
              exit={{ opacity: 0, scale: 0.8, height: 0 }}
              className="flex items-center justify-center gap-1 h-12 px-6"
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <WaveBar key={i} delay={i} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live transcript while listening */}
        <AnimatePresence>
          {isListening && transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="w-full glass-frosted rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Waves className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Listening...
                </span>
              </div>
              <p className="text-foreground/80 text-lg italic leading-relaxed">{transcript}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {!isListening && (transcript || translation) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full space-y-4"
            >
              {transcript && (
                <motion.div 
                  className="glass-elevated rounded-2xl p-5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{sourceLang.flag}</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Original Speech
                    </span>
                  </div>
                  <p className="text-foreground text-lg leading-relaxed">{transcript}</p>
                </motion.div>
              )}

              {translation && (
                <motion.div 
                  className="glass-elevated rounded-2xl p-5 relative overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 gradient-accent" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{targetLang.flag}</span>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Translation
                      </span>
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSpeak}
                      disabled={isSpeaking}
                      className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all disabled:opacity-50 focus-ring"
                    >
                      <Volume2 className={`w-5 h-5 transition-colors ${
                        isSpeaking ? "text-primary animate-pulse" : "text-primary"
                      }`} />
                    </motion.button>
                  </div>
                  <p className="text-foreground text-xl font-medium leading-relaxed">{translation}</p>
                </motion.div>
              )}

              {isTranslating && !translation && (
                <motion.div 
                  className="glass-elevated rounded-2xl p-6 flex flex-col items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <PremiumLoader size="md" text="Translating..." />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

VoiceTranslationPanel.displayName = "VoiceTranslationPanel";

export default VoiceTranslationPanel;
