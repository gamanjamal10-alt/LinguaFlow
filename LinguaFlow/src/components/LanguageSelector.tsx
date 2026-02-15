import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, Check, Globe } from "lucide-react";
import { LANGUAGES, type Language } from "@/data/languages";

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (lang: Language) => void;
  label?: string;
}

const LanguageSelector = ({ selected, onSelect, label }: LanguageSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = LANGUAGES.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search.toLowerCase())
  );

  const handleSelect = useCallback(
    (lang: Language) => {
      onSelect(lang);
      setOpen(false);
      setSearch("");
    },
    [onSelect]
  );

  return (
    <div className="relative">
      {label && (
        <span className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
          {label}
        </span>
      )}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl glass-elevated hover:shadow-lg transition-all min-w-[160px] w-full group focus-ring"
      >
        <span className="text-xl">{selected.flag}</span>
        <span className="font-medium text-sm text-foreground flex-1 text-left">{selected.name}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm" 
              onClick={() => setOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-full left-0 mt-2 z-50 w-80 glass-elevated rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Search header */}
              <div className="p-3 border-b border-border/50 bg-secondary/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search languages..."
                    className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-background/80 border border-border/50 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
                  />
                  <AnimatePresence>
                    {search && (
                      <motion.button 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setSearch("")} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Language list */}
              <div className="max-h-72 overflow-y-auto p-2">
                {filtered.map((lang, index) => {
                  const isSelected = selected.code === lang.code;
                  return (
                    <motion.button
                      key={lang.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleSelect(lang)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all focus-ring ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-secondary/50 text-foreground"
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className={`flex-1 text-left ${isSelected ? "font-semibold" : "font-medium"}`}>
                        {lang.name}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {lang.code}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
                
                {filtered.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">No languages found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
