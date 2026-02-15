import { useState, useCallback, forwardRef, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, Trash2, MessageCircle, Sparkles } from "lucide-react";
import type { Language } from "@/data/languages";
import { useTranslation } from "@/hooks/useTranslation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import PremiumLoader from "./ui/PremiumLoader";

interface ConversationPanelProps {
  sourceLang: Language;
  targetLang: Language;
}

interface Message {
  id: number;
  speaker: "left" | "right";
  original: string;
  translated: string;
  lang: Language;
  targetLang: Language;
}

const ConversationPanel = forwardRef<HTMLDivElement, ConversationPanelProps>(
  ({ sourceLang, targetLang }, ref) => {
    const [activeSpeaker, setActiveSpeaker] = useState<"left" | "right" | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const { translate, isTranslating } = useTranslation();
    const { startListening, stopListening, isListening, isSupported } = useSpeechRecognition();
    const { speak, isSpeaking } = useSpeechSynthesis();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleResult = useCallback(async (text: string, isFinal: boolean) => {
      setCurrentTranscript(text);
      
      if (isFinal && text.trim() && activeSpeaker) {
        stopListening();
        setCurrentTranscript("");
        
        const isLeftSpeaker = activeSpeaker === "left";
        const speakerLang = isLeftSpeaker ? sourceLang : targetLang;
        const speakerTargetLang = isLeftSpeaker ? targetLang : sourceLang;
        
        const result = await translate(text, speakerLang, speakerTargetLang);
        
        if (result) {
          const newMessage: Message = {
            id: Date.now(),
            speaker: activeSpeaker,
            original: text,
            translated: result,
            lang: speakerLang,
            targetLang: speakerTargetLang,
          };
          setMessages(prev => [...prev, newMessage]);
        }
        
        setActiveSpeaker(null);
      }
    }, [activeSpeaker, sourceLang, targetLang, translate, stopListening]);

    const toggleSpeaker = useCallback((side: "left" | "right") => {
      if (!isSupported) return;

      if (activeSpeaker === side) {
        stopListening();
        if (currentTranscript.trim()) {
          const isLeftSpeaker = side === "left";
          const speakerLang = isLeftSpeaker ? sourceLang : targetLang;
          const speakerTargetLang = isLeftSpeaker ? targetLang : sourceLang;
          
          translate(currentTranscript, speakerLang, speakerTargetLang).then(result => {
            if (result) {
              const newMessage: Message = {
                id: Date.now(),
                speaker: side,
                original: currentTranscript,
                translated: result,
                lang: speakerLang,
                targetLang: speakerTargetLang,
              };
              setMessages(prev => [...prev, newMessage]);
            }
          });
          setCurrentTranscript("");
        }
        setActiveSpeaker(null);
      } else {
        if (activeSpeaker) {
          stopListening();
        }
        setCurrentTranscript("");
        setActiveSpeaker(side);
        const lang = side === "left" ? sourceLang : targetLang;
        startListening(lang, handleResult);
      }
    }, [activeSpeaker, isSupported, currentTranscript, sourceLang, targetLang, startListening, stopListening, handleResult, translate]);

    const handleSpeak = (msg: Message) => {
      speak(msg.translated, msg.targetLang);
    };

    const clearMessages = () => {
      setMessages([]);
    };

    return (
      <div ref={ref} className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 space-y-4 pb-4 overflow-y-auto min-h-[200px] max-h-[400px] pr-2">
          <AnimatePresence>
            {messages.length === 0 && !isListening && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <motion.div 
                  className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
                </motion.div>
                <p className="text-sm text-muted-foreground font-medium">Start a conversation</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Tap one of the microphones below to begin
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, x: msg.speaker === "left" ? -30 : 30 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex ${msg.speaker === "right" ? "justify-end" : "justify-start"}`}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`max-w-[85%] rounded-2xl p-4 transition-shadow ${
                  msg.speaker === "left"
                    ? "glass-elevated rounded-tl-md"
                    : "gradient-accent text-primary-foreground rounded-tr-md shadow-lg"
                }`}
                style={msg.speaker === "right" ? {
                  boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.3)"
                } : undefined}
              >
                <p className={`text-sm font-medium leading-relaxed ${
                  msg.speaker === "right" ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {msg.lang.flag} {msg.original}
                </p>
                <div className={`mt-3 pt-3 border-t ${
                  msg.speaker === "right" ? "border-primary-foreground/20" : "border-border/30"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-base font-semibold leading-relaxed flex-1 ${
                      msg.speaker === "right" ? "text-primary-foreground" : "text-foreground"
                    }`}>
                      {msg.targetLang.flag} {msg.translated}
                    </p>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSpeak(msg)}
                      disabled={isSpeaking}
                      className={`p-1.5 rounded-lg disabled:opacity-50 flex-shrink-0 ${
                        msg.speaker === "right" 
                          ? "hover:bg-primary-foreground/10" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <Volume2 className={`w-4 h-4 ${
                        msg.speaker === "right" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Current transcript while listening */}
          <AnimatePresence>
            {isListening && currentTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${activeSpeaker === "right" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[80%] rounded-2xl p-4 glass-frosted border border-primary/30">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-primary font-medium">Listening...</span>
                  </div>
                  <p className="text-sm text-foreground/70 italic">{currentTranscript}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Clear button */}
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-center mb-3"
            >
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={clearMessages}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary/50 hover:bg-destructive/10 transition-all focus-ring"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear conversation
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two-way mic controls */}
        <motion.div 
          className="glass-elevated rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleSpeaker("left")}
              disabled={isTranslating && activeSpeaker === "left"}
              className={`flex-1 flex flex-col items-center gap-2.5 py-5 rounded-xl transition-all disabled:opacity-50 focus-ring ${
                activeSpeaker === "left" 
                  ? "gradient-accent shadow-lg" 
                  : "bg-secondary hover:bg-secondary/80"
              }`}
              style={activeSpeaker === "left" ? {
                boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.4)"
              } : undefined}
            >
              {activeSpeaker === "left" && isTranslating ? (
                <PremiumLoader size="sm" />
              ) : (
                <Mic className={`w-7 h-7 ${
                  activeSpeaker === "left" ? "text-primary-foreground" : "text-foreground"
                }`} />
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{sourceLang.flag}</span>
                <span className={`text-xs font-semibold ${
                  activeSpeaker === "left" ? "text-primary-foreground" : "text-muted-foreground"
                }`}>
                  {sourceLang.name}
                </span>
              </div>
            </motion.button>

            <div className="w-px h-12 bg-border/50" />

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleSpeaker("right")}
              disabled={isTranslating && activeSpeaker === "right"}
              className={`flex-1 flex flex-col items-center gap-2.5 py-5 rounded-xl transition-all disabled:opacity-50 focus-ring ${
                activeSpeaker === "right" 
                  ? "gradient-accent shadow-lg" 
                  : "bg-secondary hover:bg-secondary/80"
              }`}
              style={activeSpeaker === "right" ? {
                boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.4)"
              } : undefined}
            >
              {activeSpeaker === "right" && isTranslating ? (
                <PremiumLoader size="sm" />
              ) : (
                <Mic className={`w-7 h-7 ${
                  activeSpeaker === "right" ? "text-primary-foreground" : "text-foreground"
                }`} />
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{targetLang.flag}</span>
                <span className={`text-xs font-semibold ${
                  activeSpeaker === "right" ? "text-primary-foreground" : "text-muted-foreground"
                }`}>
                  {targetLang.name}
                </span>
              </div>
            </motion.button>
          </div>
          
          <motion.p 
            className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {!isSupported ? (
              "Speech recognition not supported"
            ) : activeSpeaker ? (
              <>
                <Sparkles className="w-3 h-3 text-primary" />
                Listening... Tap again to stop
              </>
            ) : (
              "Tap a side to start speaking"
            )}
          </motion.p>
        </motion.div>
      </div>
    );
  }
);

ConversationPanel.displayName = "ConversationPanel";

export default ConversationPanel;
