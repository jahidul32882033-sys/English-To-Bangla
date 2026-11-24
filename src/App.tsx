import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Info, AlertCircle } from "lucide-react";
import { TopBar } from "./components/TopBar";
import { TranslatorView } from "./components/TranslatorView";
import { VocabularyView } from "./components/VocabularyView";
import { TenseView } from "./components/TenseView";
import { HistoryView } from "./components/HistoryView";
import { FavoritesView } from "./components/FavoritesView";
import { WordOfTheDay } from "./components/WordOfTheDay";
import type {
  FavoriteItem,
  HistoryItem,
  LanguageDirection,
  PageId,
  ToastMessage,
} from "./types";

const HISTORY_KEY = "jt_history";
const FAVORITES_KEY = "jt_favorites";

function loadStoredHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      id: typeof item.id === "string" ? item.id : `hist-${idx}-${Date.now()}`,
      input: String(item.input ?? ""),
      output: String(item.output ?? ""),
      direction: item.direction === "bn|en" ? "bn|en" : "en|bn",
      date: String(item.date ?? ""),
    }));
  } catch {
    return [];
  }
}

function loadStoredFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      id: typeof item.id === "string" ? item.id : `fav-${idx}-${Date.now()}`,
      input: String(item.input ?? ""),
      output: String(item.output ?? ""),
      direction: item.direction === "bn|en" ? "bn|en" : "en|bn",
      date: item.date ? String(item.date) : undefined,
    }));
  } catch {
    return [];
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [sourceText, setSourceText] = useState("");
  const [direction, setDirection] = useState<LanguageDirection>("en|bn");
  const [translatedText, setTranslatedText] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(loadStoredHistory);
  const [favorites, setFavorites] =
    useState<FavoriteItem[]>(loadStoredFavorites);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const toastTimerRef = useRef<number | null>(null);

  const notify = useCallback(
    (text: string, tone: "success" | "info" | "error" = "info") => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      setToast({ id: Date.now(), text, tone });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 2800);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const persistHistory = (next: HistoryItem[]) => {
    setHistory(next);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  };

  const persistFavorites = (next: FavoriteItem[]) => {
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  };

  const handleAddHistory = (
    input: string,
    output: string,
    dir: LanguageDirection
  ) => {
    const latest = history[0];
    if (
      latest &&
      latest.input === input &&
      latest.output === output &&
      latest.direction === dir
    ) {
      return;
    }
    const newEntry: HistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      input,
      output,
      direction: dir,
      date: new Date().toLocaleString(),
    };
    const next = [newEntry, ...history].slice(0, 100);
    persistHistory(next);
  };

  const handleClearHistory = () => {
    persistHistory([]);
    notify("History cleared", "info");
  };

  const handleRemoveHistoryItem = (id: string) => {
    persistHistory(history.filter((item) => item.id !== id));
  };

  const isCurrentFavorited = Boolean(
    translatedText &&
      favorites.some(
        (fav) =>
          fav.input === sourceText.trim() && fav.output === translatedText
      )
  );

  const handleSaveFavorite = (
    input: string,
    output: string,
    dir: LanguageDirection
  ) => {
    const existing = favorites.find(
      (fav) => fav.input === input && fav.output === output
    );
    if (existing) {
      persistFavorites(favorites.filter((fav) => fav.id !== existing.id));
      notify("Removed from Favorites", "info");
      return;
    }
    const newFav: FavoriteItem = {
      id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      input,
      output,
      direction: dir,
      date: new Date().toLocaleDateString(),
    };
    persistFavorites([newFav, ...favorites]);
    notify("Favorite-এ সংরক্ষণ হয়েছে", "success");
  };

  const handleRemoveFavorite = (id: string) => {
    persistFavorites(favorites.filter((item) => item.id !== id));
    notify("Removed from Favorites", "info");
  };

  const handleLoadTranslation = (
    input: string,
    output: string,
    dir: LanguageDirection
  ) => {
    setDirection(dir);
    setSourceText(input);
    setTranslatedText(output);
    setActivePage("home");
  };

  const handleSendFromVocabulary = (englishSentence: string) => {
    setDirection("en|bn");
    setSourceText(englishSentence);
    setTranslatedText("");
    setActivePage("home");
    notify("Loaded into Translator", "info");
  };

  const handleNewTranslation = () => {
    setSourceText("");
    setTranslatedText("");
    setActivePage("home");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9f7] text-[#132a21]">
      <TopBar
        activePage={activePage}
        onSelectPage={setActivePage}
        onNewTranslation={handleNewTranslation}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activePage === "home" && (
          <div className="space-y-8">
            <TranslatorView
              sourceText={sourceText}
              onSourceTextChange={setSourceText}
              direction={direction}
              onDirectionChange={setDirection}
              translatedText={translatedText}
              onTranslatedTextChange={setTranslatedText}
              onAddHistory={handleAddHistory}
              onSaveFavorite={handleSaveFavorite}
              isFavorited={isCurrentFavorited}
              onNotify={notify}
            />
            <WordOfTheDay
              onPracticeWord={(sentence) => {
                setDirection("en|bn");
                setSourceText(sentence);
                setTranslatedText("");
                window.scrollTo({ top: 0, behavior: "smooth" });
                notify("Loaded Word of the Day example", "info");
              }}
              onOpenVocabulary={() => setActivePage("vocabulary")}
              onNotify={notify}
            />
          </div>
        )}

        {activePage === "vocabulary" && (
          <VocabularyView
            onSendToTranslator={handleSendFromVocabulary}
            onNotify={notify}
          />
        )}

        {activePage === "tense" && <TenseView onNotify={notify} />}

        {activePage === "history" && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onRemoveHistoryItem={handleRemoveHistoryItem}
            onLoadTranslation={handleLoadTranslation}
            onNotify={notify}
          />
        )}

        {activePage === "favorites" && (
          <FavoritesView
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
            onLoadTranslation={handleLoadTranslation}
            onNotify={notify}
          />
        )}
      </main>

      <footer className="border-t border-[#dce8e1] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#678577]">
          <p>© 2026 Jahidul Translate</p>
          <p>Learn English Every Day</p>
        </div>
      </footer>

      {/* Non-intrusive Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-opacity duration-150 ${
            toast.tone === "error"
              ? "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
              : toast.tone === "success"
                ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]"
                : "bg-white border-[#d6e4dc] text-[#132a21]"
          }`}
        >
          {toast.tone === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : toast.tone === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Info className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
