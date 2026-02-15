import { useState, useRef, forwardRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scan, Copy, Volume2, Upload, X, ImageIcon, Sparkles, Check } from "lucide-react";
import type { Language } from "@/data/languages";
import { useTranslation } from "@/hooks/useTranslation";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "sonner";
import PremiumLoader from "./ui/PremiumLoader";

interface CameraPanelProps {
  sourceLang: Language;
  targetLang: Language;
}

const CameraPanel = forwardRef<HTMLDivElement, CameraPanelProps>(
  ({ sourceLang, targetLang }, ref) => {
    const [detectedText, setDetectedText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [copied, setCopied] = useState(false);
    const { translate, isTranslating } = useTranslation();
    const { speak, isSpeaking } = useSpeechSynthesis();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = useCallback(async (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setIsExtracting(true);
      setDetectedText("");
      setTranslatedText("");

      // Simulated OCR - in production, use an OCR API
      setTimeout(async () => {
        const simulatedTexts = [
          "Welcome to our restaurant! Today's special: Grilled salmon with herbs.",
          "Bienvenue dans notre restaurant! Spécialité du jour: Saumon grillé aux herbes.",
          "¡Bienvenido a nuestro restaurante! Especial de hoy: Salmón a la parrilla con hierbas.",
          "Willkommen in unserem Restaurant! Tagesangebot: Gegrillter Lachs mit Kräutern.",
        ];
        const detected = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
        setDetectedText(detected);
        setIsExtracting(false);

        const result = await translate(detected, sourceLang, targetLang);
        if (result) {
          setTranslatedText(result);
        }
      }, 1500);
    }, [sourceLang, targetLang, translate]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast.error("Please select an image file");
          return;
        }
        handleImageSelect(file);
      }
    };

    const handleReset = () => {
      setSelectedImage(null);
      setDetectedText("");
      setTranslatedText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleCopy = () => {
      if (translatedText) {
        navigator.clipboard.writeText(translatedText);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    };

    const handleSpeak = () => {
      if (translatedText) {
        speak(translatedText, targetLang);
      }
    };

    return (
      <div ref={ref} className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {!selectedImage ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-elevated rounded-3xl overflow-hidden"
            >
              {/* Camera viewfinder placeholder */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-secondary/50 to-secondary/20 flex flex-col items-center justify-center gap-4">
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-grid opacity-30" />
                
                {/* Scan frame */}
                <div className="absolute inset-6 border-2 border-dashed border-primary/30 rounded-2xl" />
                
                {/* Animated scan corners */}
                <motion.div 
                  className="absolute top-8 left-8 w-10 h-10 border-t-3 border-l-3 border-primary rounded-tl-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute top-8 right-8 w-10 h-10 border-t-3 border-r-3 border-primary rounded-tr-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div 
                  className="absolute bottom-8 left-8 w-10 h-10 border-b-3 border-l-3 border-primary rounded-bl-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
                <motion.div 
                  className="absolute bottom-8 right-8 w-10 h-10 border-b-3 border-r-3 border-primary rounded-br-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                />

                {/* Center content */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center gap-3 z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium text-center px-8 max-w-xs">
                    Capture or upload an image containing text to translate
                  </p>
                </motion.div>
              </div>

              {/* Action buttons */}
              <div className="p-5 flex items-center justify-center gap-4 bg-secondary/20">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-premium w-18 h-18 rounded-full flex items-center justify-center"
                >
                  <Camera className="w-8 h-8 text-primary-foreground" />
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-all focus-ring"
                >
                  <Upload className="w-6 h-6 text-foreground" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Image Preview */}
              <div className="relative glass-elevated rounded-2xl overflow-hidden">
                <motion.img 
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={selectedImage} 
                  alt="Selected" 
                  className="w-full max-h-[220px] object-cover"
                />
                
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleReset}
                  className="absolute top-3 right-3 p-2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-all shadow-lg focus-ring"
                >
                  <X className="w-4 h-4 text-foreground" />
                </motion.button>

                <AnimatePresence>
                  {isExtracting && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                    >
                      <PremiumLoader size="lg" />
                      <div className="text-center">
                        <p className="font-semibold text-foreground">Scanning image...</p>
                        <p className="text-sm text-muted-foreground mt-1">Extracting text with AI</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Detected Text */}
              <AnimatePresence>
                {detectedText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-elevated rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Scan className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Detected Text
                      </span>
                    </div>
                    <p className="text-foreground text-lg leading-relaxed">
                      {detectedText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Translated */}
              <AnimatePresence>
                {(translatedText || isTranslating) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-elevated rounded-2xl p-5 relative overflow-hidden"
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
                      
                      {translatedText && (
                        <div className="flex items-center gap-1">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSpeak}
                            disabled={isSpeaking}
                            className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all disabled:opacity-50 focus-ring"
                          >
                            <Volume2 className={`w-4 h-4 transition-colors ${
                              isSpeaking ? "text-primary animate-pulse" : "text-muted-foreground"
                            }`} />
                          </motion.button>
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCopy}
                            className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all focus-ring"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {isTranslating ? (
                      <div className="py-4">
                        <PremiumLoader size="md" text="Translating..." />
                      </div>
                    ) : (
                      <p className="text-foreground text-xl font-medium leading-relaxed">
                        {translatedText}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="w-full py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-semibold text-foreground transition-all flex items-center justify-center gap-2 focus-ring"
              >
                <ImageIcon className="w-4 h-4" />
                Scan Another Image
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

CameraPanel.displayName = "CameraPanel";

export default CameraPanel;
