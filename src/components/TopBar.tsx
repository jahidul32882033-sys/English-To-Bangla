import React from "react";
import type { PageId } from "../types";

interface TopBarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onNewTranslation: () => void;
}

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: "home", label: "Translate" },
  { id: "vocabulary", label: "Vocabulary" },
  { id: "tense", label: "12 Tenses" },
  { id: "history", label: "History" },
  { id: "favorites", label: "Favorites" },
];

export const TopBar: React.FC<TopBarProps> = ({
  activePage,
  onSelectPage,
  onNewTranslation,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#dce8e1]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectPage("home")}
          className="font-[var(--font-display)] text-xl font-bold tracking-tight text-[#087f5b] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087f5b] cursor-pointer"
        >
          Jahidul Translate
        </button>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPage(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#087f5b] ${
                  isActive
                    ? "text-[#087f5b] font-semibold"
                    : "text-[#4c6b5d] hover:text-[#132a21]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-[#087f5b]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onNewTranslation}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#087f5b] hover:bg-[#06674a] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b]"
          >
            New Translation
          </button>
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="md:hidden flex items-center gap-1 px-3 py-1.5 border-t border-[#e8f0eb] overflow-x-auto bg-white"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPage(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#087f5b] text-white"
                  : "text-[#4c6b5d] hover:bg-[#edf5f0] hover:text-[#132a21]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
