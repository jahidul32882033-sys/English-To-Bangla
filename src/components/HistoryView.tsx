import React, { useMemo, useState } from "react";
import { ArrowUpRight, Copy, Search, Trash2 } from "lucide-react";
import type { HistoryItem, LanguageDirection } from "../types";

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (id: string) => void;
  onLoadTranslation: (
    input: string,
    output: string,
    direction: LanguageDirection
  ) => void;
  onNotify: (text: string, tone?: "success" | "info" | "error") => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onRemoveHistoryItem,
  onLoadTranslation,
  onNotify,
}) => {
  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return history;
    return history.filter(
      (item) =>
        item.input.toLowerCase().includes(trimmed) ||
        item.output.toLowerCase().includes(trimmed)
    );
  }, [history, query]);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify("Copied to clipboard", "success");
    } catch {
      onNotify("Copy করা যায়নি", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#dce8e1] pb-5">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#132a21]">
            Translation History
          </h1>
          <p className="mt-1.5 text-sm text-[#527063]">
            Recent translations saved locally in your browser ·{" "}
            <span className="tabular-nums">{history.length} saved</span>
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {confirmClear ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold bg-[#b91c1c] hover:bg-[#991b1b] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Confirm Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-medium bg-[#edf5f0] text-[#456355] hover:bg-[#dcebe2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="relative max-w-md">
          <Search
            className="w-4 h-4 text-[#678577] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter translation history..."
            aria-label="Filter translation history"
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d6e4dc] text-sm text-[#132a21] placeholder:text-[#7e998c] focus:border-[#087f5b] focus:outline-none transition-colors"
          />
        </div>
      )}

      {history.length === 0 ? (
        <div className="bg-white border border-[#d6e4dc] rounded-2xl p-10 text-center">
          <p className="text-base font-medium text-[#132a21]">
            কোনো History নেই।
          </p>
          <p className="mt-1 text-sm text-[#527063]">
            Translate any English or Bangla text and it will appear here automatically.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#d6e4dc] rounded-2xl p-10 text-center">
          <p className="text-base font-medium text-[#132a21]">
            No matching history entries found.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#d6e4dc] rounded-2xl divide-y divide-[#ebf2ee] overflow-hidden shadow-[0_2px_10px_rgba(19,42,33,0.03)]">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs text-[#678577] tabular-nums">
                  {item.direction === "bn|en"
                    ? "Bangla → English"
                    : "English → Bangla"}{" "}
                  · {item.date}
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
                    onLoadTranslation(
                      item.input,
                      item.output,
                      item.direction || "en|bn"
                    )
                  }
                  className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => void copyText(item.output)}
                  aria-label="Copy translation"
                  title="Copy"
                  className="w-9 h-9 rounded-lg bg-[#f3f7f4] text-[#456355] hover:bg-[#e5eee8] hover:text-[#132a21] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveHistoryItem(item.id)}
                  aria-label="Delete history entry"
                  title="Remove"
                  className="w-9 h-9 rounded-lg bg-[#f3f7f4] text-[#456355] hover:bg-[#fef2f2] hover:text-[#b91c1c] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
