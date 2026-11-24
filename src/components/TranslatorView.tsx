import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Copy,
  Heart,
  Loader2,
  Mic,
  Share2,
  Volume2,
  X,
} from "lucide-react";
import type { LanguageDirection } from "../types";

interface TranslatorViewProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  direction: LanguageDirection;
  onDirectionChange: (dir: LanguageDirection) => void;
  translatedText: string;
  onTranslatedTextChange: (text: string) => void;
  onAddHistory: (input: string, output: string, direction: LanguageDirection) => void;
  onSaveFavorite: (input: string, output: string, direction: LanguageDirection) => void;
  isFavorited: boolean;
  onNotify: (text: string, tone?: "success" | "info" | "error") => void;
}

const SAMPLE_PHRASES: { en: string; bn: string }[] = [
  { en: "Good morning, how are you?", bn: "শুভ সকাল, আপনি কেমন আছেন?" },
  { en: "I am learning English every day.", bn: "আমি প্রতিদিন ইংরেজি শিখছি।" },
  { en: "Knowledge is power.", bn: "জ্ঞানই শক্তি।" },
  { en: "Thank you very much for your help.", bn: "আপনার সাহায্যের জন্য অনেক ধন্যবাদ।" },
];

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export const TranslatorView: React.FC<TranslatorViewProps> = ({
  sourceText,
  onSourceTextChange,
  direction,
  onDirectionChange,
  translatedText,
  onTranslatedTextChange,
  onAddHistory,
  onSaveFavorite,
  isFavorited,
  onNotify,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    "অনুবাদ এখানে দেখা যাবে..."
  );
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const requestCounterRef = useRef(0);
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const latestTranslatedTextRef = useRef(translatedText);
  latestTranslatedTextRef.current = translatedText;

  const completedKeyRef = useRef<string>(
    sourceText.trim() && translatedText.trim()
      ? `${direction}::${sourceText.trim()}`
      : ""
  );

  const englishFirst = direction === "en|bn";
  const leftLabel = englishFirst ? "English" : "বাংলা (Bengali)";
  const rightLabel = englishFirst ? "বাংলা (Bengali)" : "English";

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
      abortControllerRef.current?.abort();
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const translateText = async (
    overrideText?: string,
    overrideDirection?: LanguageDirection,
    isAuto = false
  ) => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const textToTranslate = (overrideText ?? sourceText).trim();
    const activeDirection = overrideDirection ?? direction;

    if (!textToTranslate) {
      if (!isAuto) {
        onNotify("অনুবাদের জন্য কিছু লিখুন", "info");
        textareaRef.current?.focus();
      }
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestId = ++requestCounterRef.current;
    setIsTranslating(true);
    setStatusMessage("অনুবাদ হচ্ছে...");

    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        textToTranslate
      )}&langpair=${activeDirection}`;

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();

      if (requestId !== requestCounterRef.current) {
        return;
      }

      const result = data?.responseData?.translatedText;
      if (result && typeof result === "string") {
        completedKeyRef.current = `${activeDirection}::${textToTranslate}`;
        onTranslatedTextChange(result);
        setStatusMessage("");
        onAddHistory(textToTranslate, result, activeDirection);
      } else {
        onTranslatedTextChange("");
        setStatusMessage("অনুবাদ পাওয়া যায়নি। আবার চেষ্টা করুন।");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (requestId !== requestCounterRef.current) return;
      onTranslatedTextChange("");
      setStatusMessage("ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।");
    } finally {
      if (requestId === requestCounterRef.current) {
        setIsTranslating(false);
      }
    }
  };

  const translateFnRef = useRef(translateText);
  translateFnRef.current = translateText;

  // Auto Translate 500ms after typing or switching language direction
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = sourceText.trim();
    if (!trimmed) {
      abortControllerRef.current?.abort();
      requestCounterRef.current += 1;
      completedKeyRef.current = "";
      setIsTranslating(false);
      if (latestTranslatedTextRef.current) {
        onTranslatedTextChange("");
      }
      setStatusMessage("অনুবাদ এখানে দেখা যাবে...");
      return;
    }

    const key = `${direction}::${trimmed}`;
    if (completedKeyRef.current === key && latestTranslatedTextRef.current) {
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      void translateFnRef.current(trimmed, direction, true);
    }, 500);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [sourceText, direction, onTranslatedTextChange]);

  const handleSwap = () => {
    const nextDir: LanguageDirection = englishFirst ? "bn|en" : "en|bn";
    completedKeyRef.current = "";
    onDirectionChange(nextDir);
    if (translatedText.trim()) {
      onSourceTextChange(translatedText);
      onTranslatedTextChange("");
    }
    setStatusMessage("ভাষা পরিবর্তন হয়েছে। অনুবাদ হচ্ছে...");
  };

  const handleSelectLanguage = (side: "left" | "right") => {
    const selected: LanguageDirection =
      side === "left"
        ? englishFirst
          ? "en|bn"
          : "bn|en"
        : englishFirst
          ? "bn|en"
          : "en|bn";
    if (selected === direction) return;
    completedKeyRef.current = "";
    onDirectionChange(selected);
    onTranslatedTextChange("");
    setStatusMessage(
      sourceText.trim()
        ? "ভাষা পরিবর্তন হয়েছে। অনুবাদ হচ্ছে..."
        : "অনুবাদ এখানে দেখা যাবে..."
    );
  };

  const handleClear = () => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    abortControllerRef.current?.abort();
    requestCounterRef.current += 1;
    completedKeyRef.current = "";
    setIsTranslating(false);
    onSourceTextChange("");
    onTranslatedTextChange("");
    setStatusMessage("অনুবাদ এখানে দেখা যাবে...");
    textareaRef.current?.focus();
  };

  const handleVoiceInput = () => {
    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onNotify("এই ব্রাউজারে Voice Input সমর্থিত নয়", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = englishFirst ? "en-US" : "bn-BD";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onSourceTextChange(transcript);
        onNotify("Voice input captured", "success");
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      onNotify("Voice Input কাজ করেনি। আবার চেষ্টা করুন।", "error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleCopy = async () => {
    if (!translatedText) {
      onNotify("আগে অনুবাদ করুন", "info");
      return;
    }
    try {
      await navigator.clipboard.writeText(translatedText);
      onNotify("Copied to clipboard", "success");
    } catch {
      onNotify("Copy করা যায়নি", "error");
    }
  };

  const handleSpeakResult = () => {
    if (!translatedText) {
      onNotify("আগে অনুবাদ করুন", "info");
      return;
    }
    if (!("speechSynthesis" in window)) {
      onNotify("এই ব্রাউজারে Speech সমর্থিত নয়", "error");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = englishFirst ? "bn-BD" : "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = async () => {
    if (!translatedText) {
      onNotify("আগে অনুবাদ করুন", "info");
      return;
    }
    const shareBody = `${sourceText}\n\n${translatedText}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Jahidul Translate",
          text: shareBody,
        });
        return;
      } catch {
        // User cancelled or share failed; fall back to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareBody);
      onNotify("Translation copied for sharing", "success");
    } catch {
      onNotify("Share করা যায়নি", "error");
    }
  };

  const handleFavorite = () => {
    if (!translatedText) {
      onNotify("আগে অনুবাদ করুন", "info");
      return;
    }
    onSaveFavorite(sourceText.trim(), translatedText, direction);
  };

  const handleUsePhrase = (phrase: { en: string; bn: string }) => {
    const input = englishFirst ? phrase.en : phrase.bn;
    onSourceTextChange(input);
    void translateText(input, direction);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#dce8e1] pb-5">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#132a21]">
            English &amp; Bangla Translator
          </h1>
          <p className="mt-1.5 text-sm text-[#527063]">
            English to Bangla · Bangla to English · Instant bilingual translation &amp; pronunciation
          </p>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div
        className="flex items-center gap-3 bg-white border border-[#d6e4dc] rounded-2xl p-2"
        role="group"
        aria-label="Language pair selector"
      >
        <button
          type="button"
          onClick={() => handleSelectLanguage("left")}
          className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold bg-[#087f5b] text-white transition-colors duration-150 whitespace-nowrap truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
        >
          {leftLabel}
        </button>

        <button
          type="button"
          onClick={handleSwap}
          aria-label="Swap source and target languages"
          title="Swap languages"
          className="w-11 h-11 rounded-xl bg-[#edf5f0] hover:bg-[#dcece3] text-[#087f5b] flex items-center justify-center shrink-0 transition-transform duration-150 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleSelectLanguage("right")}
          className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold bg-white hover:bg-[#f2f8f4] text-[#087f5b] border border-[#dce8e1] transition-colors duration-150 whitespace-nowrap truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
        >
          {rightLabel}
        </button>
      </div>

      {/* Two-Column Translation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Source Panel */}
        <section
          aria-label="Source text"
          className="bg-white border border-[#d6e4dc] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_10px_rgba(19,42,33,0.03)]"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <label
                htmlFor="translator-source"
                className="text-xs font-semibold tracking-wide text-[#527063]"
              >
                Source · {leftLabel}
              </label>
              <span className="text-xs font-mono tabular-nums text-[#678577]">
                {sourceText.length} chars
              </span>
            </div>

            <textarea
              ref={textareaRef}
              id="translator-source"
              value={sourceText}
              onChange={(e) => onSourceTextChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void translateText();
                }
              }}
              placeholder={
                englishFirst ? "Type English here..." : "এখানে বাংলা লিখুন..."
              }
              rows={6}
              className="w-full min-h-[168px] resize-y rounded-xl border border-[#dce8e1] bg-[#fbfdfc] p-4 text-base leading-relaxed text-[#132a21] placeholder:text-[#7e998c] focus:border-[#087f5b] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-[#ebf2ee] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                aria-pressed={isListening}
                className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b] ${
                  isListening
                    ? "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]"
                    : "bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5]"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isListening ? "Listening..." : "Voice"}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium bg-[#f3f7f4] text-[#456355] hover:bg-[#e5eee8] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => void translateText()}
              disabled={isTranslating}
              className="inline-flex items-center justify-center gap-2 min-h-[40px] px-5 py-2 rounded-lg text-sm font-semibold bg-[#087f5b] hover:bg-[#06674a] disabled:opacity-65 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
            >
              {isTranslating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isTranslating ? "Translating..." : "Translate"}</span>
            </button>
          </div>
        </section>

        {/* Result Panel */}
        <section
          aria-label="Translation result"
          className="bg-white border border-[#d6e4dc] rounded-2xl p-5 flex flex-col justify-between shadow-[0_2px_10px_rgba(19,42,33,0.03)]"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold tracking-wide text-[#527063]">
                Translation · {rightLabel}
              </span>
              {isTranslating ? (
                <span className="text-xs font-mono tabular-nums text-[#087f5b]">
                  Translating...
                </span>
              ) : translatedText ? (
                <span className="text-xs font-mono tabular-nums text-[#087f5b]">
                  Auto · Ready
                </span>
              ) : (
                <span className="text-xs text-[#678577]">
                  Auto Translate
                </span>
              )}
            </div>

            <div
              aria-live="polite"
              className={`w-full min-h-[168px] rounded-xl border border-[#e3ede7] p-4 text-base leading-relaxed whitespace-pre-wrap break-words ${
                translatedText
                  ? "bg-[#f2f8f4] text-[#132a21] font-medium"
                  : "bg-[#f7faf8] text-[#678577]"
              }`}
            >
              {translatedText || statusMessage}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#ebf2ee] flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={handleSpeakResult}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b] ${
                isSpeaking
                  ? "bg-[#087f5b] text-white"
                  : "bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5]"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? "Speaking..." : "Listen"}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleFavorite}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b] ${
                isFavorited
                  ? "bg-[#fdf2f4] text-[#be123c] border border-[#fbcfe8]"
                  : "bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5]"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`}
              />
              <span>{isFavorited ? "Saved" : "Favorite"}</span>
            </button>
          </div>
        </section>
      </div>

      {/* Quick Practice Phrases */}
      <section aria-label="Practice phrases" className="pt-2">
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-sm font-semibold text-[#132a21]">
            Quick Practice Phrases
          </h2>
          <span className="text-xs text-[#678577]">
            Click a phrase to translate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_PHRASES.map((phrase) => (
            <button
              key={phrase.en}
              type="button"
              onClick={() => handleUsePhrase(phrase)}
              className="text-left p-4 rounded-xl bg-white border border-[#dce8e1] hover:border-[#087f5b] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
            >
              <p className="text-sm font-medium text-[#132a21] line-clamp-1">
                {englishFirst ? phrase.en : phrase.bn}
              </p>
              <p className="mt-1 text-xs text-[#527063] line-clamp-1">
                {englishFirst ? phrase.bn : phrase.en}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
