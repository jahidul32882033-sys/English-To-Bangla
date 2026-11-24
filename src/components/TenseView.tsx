import React, { useState } from "react";
import { Volume2 } from "lucide-react";
import { TENSE_DATA } from "../data/tenses";
import type { TenseGroup } from "../types";

interface TenseViewProps {
  onNotify: (text: string, tone?: "success" | "info" | "error") => void;
}

const GROUPS: TenseGroup[] = ["Present", "Past", "Future"];

export const TenseView: React.FC<TenseViewProps> = ({ onNotify }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const activeTense = TENSE_DATA[selectedIndex] ?? TENSE_DATA[0];

  const speakExample = (sentence: string) => {
    if (!("speechSynthesis" in window)) {
      onNotify("এই ব্রাউজারে Speech সমর্থিত নয়", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.onstart = () => setSpeakingText(sentence);
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);
    window.speechSynthesis.speak(utterance);
  };

  const structures = [
    { label: "Positive", formula: activeTense.positive },
    { label: "Negative", formula: activeTense.negative },
    { label: "Interrogative", formula: activeTense.question },
    { label: "Negative Interrogative", formula: activeTense.negativeQuestion },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#dce8e1] pb-5">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#132a21]">
            English 12 Tenses
          </h1>
          <p className="mt-1.5 text-sm text-[#527063]">
            Complete tense structures, Bangla usage explanations, and spoken examples
          </p>
        </div>

        <div className="text-xs font-medium text-[#527063] tabular-nums">
          {selectedIndex + 1} / {TENSE_DATA.length} tenses
        </div>
      </div>

      {/* Mobile Dropdown Selector */}
      <div className="lg:hidden">
        <label
          htmlFor="tense-select-mobile"
          className="block text-xs font-semibold text-[#527063] mb-1.5"
        >
          Select Tense
        </label>
        <select
          id="tense-select-mobile"
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-[#d6e4dc] text-sm font-medium text-[#132a21] focus:border-[#087f5b] focus:outline-none"
        >
          {TENSE_DATA.map((tense, index) => (
            <option key={tense.name} value={index}>
              {tense.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Index */}
        <aside
          aria-label="12 English tenses list"
          className="hidden lg:block lg:col-span-4 bg-white border border-[#d6e4dc] rounded-2xl p-4 space-y-5 shadow-[0_2px_10px_rgba(19,42,33,0.03)]"
        >
          {GROUPS.map((group) => {
            const items = TENSE_DATA.map((tense, idx) => ({
              tense,
              idx,
            })).filter((entry) => entry.tense.group === group);

            return (
              <div key={group} className="space-y-1.5">
                <h2 className="px-2.5 text-xs font-semibold text-[#678577]">
                  {group} Tenses
                </h2>
                <div className="space-y-1">
                  {items.map(({ tense, idx }) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={tense.name}
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b] ${
                          isSelected
                            ? "bg-[#087f5b] text-white font-semibold"
                            : "text-[#132a21] hover:bg-[#edf5f0] font-medium"
                        }`}
                      >
                        {tense.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Right Tense Details */}
        <section
          aria-live="polite"
          className="lg:col-span-8 bg-white border border-[#d6e4dc] rounded-2xl p-6 space-y-6 shadow-[0_2px_10px_rgba(19,42,33,0.03)]"
        >
          <div className="border-b border-[#ebf2ee] pb-4">
            <p className="text-xs font-medium text-[#527063]">
              {activeTense.group} Tense · Grammar Guide
            </p>
            <h2 className="mt-1 font-[var(--font-display)] text-2xl sm:text-3xl font-semibold text-[#087f5b]">
              {activeTense.name}
            </h2>
            <p className="mt-2 text-base text-[#132a21] leading-relaxed">
              {activeTense.use}
            </p>
          </div>

          {/* 4 Formula Blocks */}
          <div>
            <h3 className="text-sm font-semibold text-[#132a21] mb-3">
              Sentence Structures
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {structures.map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-[#f4f9f6] border border-[#dce8e1]"
                >
                  <p className="text-xs font-semibold text-[#527063]">
                    {item.label}
                  </p>
                  <p className="mt-1.5 font-mono text-sm text-[#132a21] leading-snug">
                    {item.formula}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div className="pt-2">
            <h3 className="text-sm font-semibold text-[#132a21] mb-3">
              Examples
            </h3>
            <div className="divide-y divide-[#ebf2ee] border border-[#dce8e1] rounded-xl overflow-hidden">
              {activeTense.examples.map(([english, bangla]) => {
                const isSpeaking = speakingText === english;
                return (
                  <div
                    key={english}
                    className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-base font-semibold text-[#132a21]">
                        {english}
                      </p>
                      <p className="mt-0.5 text-sm text-[#527063]">{bangla}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakExample(english)}
                      className={`inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087f5b] ${
                        isSpeaking
                          ? "bg-[#087f5b] text-white"
                          : "bg-[#edf5f0] text-[#087f5b] hover:bg-[#dfeee5]"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? "Speaking" : "Listen"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
