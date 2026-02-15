import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Language } from "@/data/languages";
import { toast } from "sonner";

interface UseTranslationReturn {
  translate: (text: string, sourceLang: Language, targetLang: Language) => Promise<string | null>;
  isTranslating: boolean;
  error: string | null;
}

export const useTranslation = (): UseTranslationReturn => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(async (
    text: string,
    sourceLang: Language,
    targetLang: Language
  ): Promise<string | null> => {
    if (!text.trim()) {
      return null;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('translate', {
        body: {
          text: text.trim(),
          sourceLang: sourceLang.name,
          targetLang: targetLang.name,
          sourceCode: sourceLang.code,
          targetCode: targetLang.code,
        },
      });

      if (functionError) {
        console.error("Translation function error:", functionError);
        throw new Error(functionError.message || "Translation failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.translation) {
        throw new Error("No translation received");
      }

      return data.translation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Translation failed";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Translation error:", err);
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return { translate, isTranslating, error };
};
