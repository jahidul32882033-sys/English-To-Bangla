import React, { useMemo, useState } from "react";
import { ArrowUpRight, Copy, Search, Trash2, Volume2 } from "lucide-react";
import type { FavoriteItem, LanguageDirection } from "../types";

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  onRemoveFavorite: (id: string) => void;
  onLoadTranslation: (
    input: string,
    output: string,
    direction: LanguageDirection
  ) => void;
  onNotify: (text: string, tone?: "success" | "info" | "error") => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onLoadTranslation,
  onNotify,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return favorites;
    return favorites.filter(
      (item) =>
        item.input.toLowerCase().includes(trimmed) ||
        item.output.toLowerCase().includes(trimmed)
    );
  }, [favorites, query]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify("Copied to clipboard", "success");
    } catch {
      onNotify("Copy করা যায়নি", "error");
    }
  };

  const speakOutput = (text: string, direction: LanguageDirection = "en|bn") => {
    if (!("speechSynthesis" in window)) {
      onNotify("এই ব্রাউজারে Speech সমর্থিত নয়", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = direction === "en|bn" ? "bn-BD" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#dce8e1] pb-5">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#132a21]">
            Favorite Translations
          </h1>
          <p className="mt-1.5 text-sm text-[#527063]">
            Your saved bilingual phrases for daily review ·{" "}
            <span className="tabular-nums">{favorites.length} saved</span>
          </p>
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="relative max-w-md">
          <Search
            className="w-4 h-4 text-[#678577] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter saved favorites..."
            aria-label="Filter saved favorites"
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d6e4dc] text-sm text-[#132a21] placeholder:text-[#7e998c] focus:border-[#087f5b] focus:outline-none transition-colors"
          />
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white border border-[#d6e4dc] rounded-2xl p-10 text-center">
          <p className="text-base font-medium text-[#132a21]">
            কোনো Favorite নেই।
          </p>
          <p className="mt-1 text-sm text-[#527063]">
            Save useful translations using the Favorite button on the Translator tab.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#d6e4dc] rounded-2xl p-10 text-center">
          <p className="text-base font-medium text-[#132a21]">
            No matching favorites found.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#d6e4dc] rounded-2xl divide-y divide-[#ebf2ee] overflow-hidden shadow-[0_2px_10px_rgba(19,42,33,0.03)]">
          {filtered.map((item) => {
            const dir: LanguageDirection = item.direction || "en|bn";
            return (
              <article
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs text-[#678577]">
                    {dir === "bn|en" ? "Bangla → English" : "English → Bangla"}
                    {item.date ? ` · ${item.date}` : ""}
                  </p>
                  <p className="text-sm font-semibold text-[#132a21] break-words">
                    {item.input}
                  </p>
                  <p className="text-base text-[#087f5b] font-medium break-words">
                    {item.output}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onLoadTranslation(item.input, item.output, dir)
                    }
                    className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Open</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => speakOutput(item.output, dir)}
                    aria-label="Listen to saved translation"
                    title="Listen"
                    className="w-9 h-9 rounded-lg bg-[#f3f7f4] text-[#456355] hover:bg-[#e5eee8] hover:text-[#132a21] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void copyText(item.output)}
                    aria-label="Copy saved translation"
                    title="Copy"
                    className="w-9 h-9 rounded-lg bg-[#f3f7f4] text-[#456355] hover:bg-[#e5eee8] hover:text-[#132a21] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(item.id)}
                    aria-label="Remove from favorites"
                    title="Remove"
                    className="w-9 h-9 rounded-lg bg-[#f3f7f4] text-[#456355] hover:bg-[#fef2f2] hover:text-[#b91c1c] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
