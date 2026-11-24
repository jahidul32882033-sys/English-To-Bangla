import React, { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Volume2 } from "lucide-react";
import { VOCABULARY_WORDS } from "../data/vocabulary";
import type { VocabularyWord } from "../types";
import { VocabularyIllustration } from "./VocabularyIllustration";

const WORD_OF_DAY_KEY = "jt_word_of_the_day";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface StoredWordOfDay {
  wordId: string;
  expiresAt: number;
}

function pickRandomWord(excludeId?: string): VocabularyWord {
  const candidates =
    excludeId && VOCABULARY_WORDS.length > 1
      ? VOCABULARY_WORDS.filter((item) => item.id !== excludeId)
      : VOCABULARY_WORDS;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? VOCABULARY_WORDS[0];
}

function getOrRotateWordOfDay(): { word: VocabularyWord; expiresAt: number } {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(WORD_OF_DAY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredWordOfDay>;
      if (
        typeof parsed.wordId === "string" &&
        typeof parsed.expiresAt === "number" &&
        now < parsed.expiresAt
      ) {
        const existing = VOCABULARY_WORDS.find((w) => w.id === parsed.wordId);
        if (existing) {
          return { word: existing, expiresAt: parsed.expiresAt };
        }
      }
      const nextWord = pickRandomWord(
        typeof parsed.wordId === "string" ? parsed.wordId : undefined
      );
      const nextExpiresAt = now + TWENTY_FOUR_HOURS_MS;
      localStorage.setItem(
        WORD_OF_DAY_KEY,
        JSON.stringify({ wordId: nextWord.id, expiresAt: nextExpiresAt })
      );
      return { word: nextWord, expiresAt: nextExpiresAt };
    }
  } catch {
    // Ignore storage errors and fall back to random word
  }

  const word = pickRandomWord();
  const expiresAt = now + TWENTY_FOUR_HOURS_MS;
  try {
    localStorage.setItem(
      WORD_OF_DAY_KEY,
      JSON.stringify({ wordId: word.id, expiresAt })
    );
  } catch {
    // Ignore storage errors
  }
  return { word, expiresAt };
}

interface WordOfTheDayProps {
  onPracticeWord: (englishSentence: string) => void;
  onOpenVocabulary: () => void;
  onNotify: (text: string, tone?: "success" | "info" | "error") => void;
}

export const WordOfTheDay: React.FC<WordOfTheDayProps> = ({
  onPracticeWord,
  onOpenVocabulary,
  onNotify,
}) => {
  const [{ word, expiresAt }, setDailyEntry] = useState(getOrRotateWordOfDay);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const msUntilExpiry = Math.max(1000, expiresAt - Date.now());
    const timer = window.setTimeout(() => {
      setDailyEntry(getOrRotateWordOfDay());
    }, Math.min(msUntilExpiry, 2147483647));

    return () => window.clearTimeout(timer);
  }, [expiresAt]);

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      onNotify("এই ব্রাউজারে Speech সমর্থিত নয়", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section aria-label="Word of the Day" className="pt-2">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-sm font-semibold text-[#132a21]">
          Word of the Day
        </h2>
        <button
          type="button"
          onClick={onOpenVocabulary}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#087f5b] hover:text-[#06674a] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Browse Vocabulary</span>
        </button>
      </div>

      <article className="bg-white border border-[#d6e4dc] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-[0_2px_10px_rgba(19,42,33,0.03)]">
        <div className="flex items-start gap-4 min-w-0">
          <VocabularyIllustration id={word.id} label={word.word} />

          <div className="min-w-0 space-y-1">
            <p className="text-xs text-[#678577]">
              Daily Study · {word.partOfSpeech} ·{" "}
              <span className="font-mono">{word.phonetic}</span>
            </p>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h3 className="font-[var(--font-display)] text-2xl font-semibold text-[#087f5b]">
                {word.word}
              </h3>
              <span className="text-lg font-semibold text-[#132a21]">
                {word.bangla}
              </span>
            </div>

            <p className="pt-1 text-sm text-[#132a21]">{word.exampleEn}</p>
            <p className="text-xs text-[#527063]">{word.exampleBn}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:self-end">
          <button
            type="button"
            onClick={handleSpeak}
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
            onClick={() => onPracticeWord(word.exampleEn)}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold bg-[#f3f7f4] text-[#132a21] hover:bg-[#e5eee8] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
          >
            <span>Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </article>
    </section>
  );
};
