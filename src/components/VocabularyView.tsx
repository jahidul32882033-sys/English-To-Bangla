import React, { useMemo, useState } from "react";
import { ArrowRight, Search, Volume2 } from "lucide-react";
import { VOCABULARY_WORDS } from "../data/vocabulary";
import { VocabularyIllustration } from "./VocabularyIllustration";

interface VocabularyViewProps {
  onSendToTranslator: (englishWord: string) => void;
  onNotify: (text: string, tone?: "success" | "info" | "error") => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  onSendToTranslator,
  onNotify,
}) => {
  const [query, setQuery] = useState("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return VOCABULARY_WORDS;
    return VOCABULARY_WORDS.filter(
      (item) =>
        item.word.toLowerCase().includes(trimmed) ||
        item.bangla.includes(query.trim()) ||
        item.exampleEn.toLowerCase().includes(trimmed)
    );
  }, [query]);

  const speakWord = (word: string, id: string) => {
    if (!("speechSynthesis" in window)) {
      onNotify("এই ব্রাউজারে Speech সমর্থিত নয়", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#dce8e1] pb-5">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#132a21]">
            English Vocabulary
          </h1>
          <p className="mt-1.5 text-sm text-[#527063]">
            Essential words with Bangla meanings, phonetics, and spoken example sentences
          </p>
        </div>

        <div className="text-xs font-medium text-[#527063] tabular-nums">
          {filteredWords.length} of {VOCABULARY_WORDS.length} words
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search
          className="w-4 h-4 text-[#678577] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search English word or Bangla..."
          aria-label="Search English word or Bangla meaning"
          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d6e4dc] text-sm text-[#132a21] placeholder:text-[#7e998c] focus:border-[#087f5b] focus:outline-none transition-colors"
        />
      </div>

      {/* Vocabulary Cards Grid */}
      {filteredWords.length === 0 ? (
        <div className="bg-white border border-[#d6e4dc] rounded-2xl p-10 text-center">
          <p className="text-base font-medium text-[#132a21]">
            কোনো শব্দ পাওয়া যায়নি।
          </p>
          <p className="mt-1 text-sm text-[#527063]">
            Try searching for another English word or Bangla translation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredWords.map((item) => {
            const isSpeaking = speakingId === item.id;
            return (
              <article
                key={item.id}
                className="bg-white border border-[#d6e4dc] rounded-2xl p-5 flex gap-4 items-start shadow-[0_2px_10px_rgba(19,42,33,0.03)]"
              >
                <VocabularyIllustration id={item.id} label={item.word} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-lg font-bold text-[#087f5b] truncate">
                      {item.word}
                    </h2>
                    <span className="text-xs text-[#678577] shrink-0">
                      {item.partOfSpeech} ·{" "}
                      <span className="font-mono">{item.phonetic}</span>
                    </span>
                  </div>

                  <p className="mt-0.5 text-base font-semibold text-[#132a21]">
                    {item.bangla}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#ebf2ee] space-y-1">
                    <p className="text-sm text-[#132a21]">{item.exampleEn}</p>
                    <p className="text-xs text-[#527063]">{item.exampleBn}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakWord(item.word, item.id)}
                      className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b] ${
                        isSpeaking
                          ? "bg-[#087f5b] text-white"
                          : "bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5]"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? "Speaking" : "Listen"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSendToTranslator(item.exampleEn)}
                      className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium bg-[#f3f7f4] text-[#456355] hover:bg-[#e5eee8] hover:text-[#132a21] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
