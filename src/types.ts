export type LanguageDirection = "en|bn" | "bn|en";

export type PageId = "home" | "vocabulary" | "tense" | "history" | "favorites";

export interface HistoryItem {
  id: string;
  input: string;
  output: string;
  direction: LanguageDirection;
  date: string;
}

export interface FavoriteItem {
  id: string;
  input: string;
  output: string;
  direction?: LanguageDirection;
  date?: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  bangla: string;
  exampleEn: string;
  exampleBn: string;
}

export type TenseGroup = "Present" | "Past" | "Future";

export interface TenseItem {
  name: string;
  group: TenseGroup;
  use: string;
  positive: string;
  negative: string;
  question: string;
  negativeQuestion: string;
  examples: [string, string][];
}

export interface ToastMessage {
  id: number;
  text: string;
  tone: "success" | "info" | "error";
}
