import React from "react";

interface VocabularyIllustrationProps {
  id: string;
  label: string;
}

export const VocabularyIllustration: React.FC<VocabularyIllustrationProps> = ({
  id,
  label,
}) => {
  const renderArtwork = () => {
    switch (id) {
      case "apple":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <path
              d="M32 18c-8-4-18 2-18 14 0 11 7 20 14 20 2.5 0 3.5-1 4-1s1.5 1 4 1c7 0 14-9 14-20 0-12-10-18-18-14z"
              fill="#e05347"
            />
            <path
              d="M32 18c1-5 3-9 7-11"
              stroke="#5c3d2e"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M33 13c5-4 10-3 12 1-4 3-9 3-12-1z"
              fill="#087f5b"
            />
            <path
              d="M22 25c-2 3-2 7-1 10"
              stroke="#fbd2ce"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );
      case "book":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <rect x="14" y="12" width="36" height="40" rx="4" fill="#087f5b" />
            <rect x="18" y="16" width="28" height="32" rx="2" fill="#f7fbf8" />
            <path d="M14 16v32c0 2.2 1.8 4 4 4h2V12h-2c-2.2 0-4 1.8-4 4z" fill="#065f46" />
            <line x1="25" y1="24" x2="41" y2="24" stroke="#087f5b" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="25" y1="31" x2="39" y2="31" stroke="#648374" strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="38" x2="35" y2="38" stroke="#648374" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "beautiful":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <circle cx="32" cy="32" r="14" fill="#fde68a" />
            <path
              d="M32 10l3.5 11.5L47 25l-11.5 3.5L32 40l-3.5-11.5L17 25l11.5-3.5z"
              fill="#087f5b"
            />
            <circle cx="48" cy="18" r="3" fill="#d97706" />
            <circle cx="16" cy="45" r="2.5" fill="#087f5b" />
          </svg>
        );
      case "school":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <path d="M10 28L32 14l22 14v22H10V28z" fill="#e2efe7" stroke="#087f5b" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8 28L32 13l24 15" stroke="#065f46" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="26" y="34" width="12" height="16" rx="1.5" fill="#087f5b" />
            <circle cx="32" cy="24" r="3.5" fill="#d97706" />
            <rect x="16" y="34" width="6" height="6" rx="1" fill="#ffffff" stroke="#087f5b" strokeWidth="1.5" />
            <rect x="42" y="34" width="6" height="6" rx="1" fill="#ffffff" stroke="#087f5b" strokeWidth="1.5" />
          </svg>
        );
      case "water":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <path
              d="M32 10C32 10 16 28.5 16 39a16 16 0 0 0 32 0C48 28.5 32 10 32 10z"
              fill="#0ea5e9"
            />
            <path
              d="M24 38c0 4.5 3 8 7 9"
              stroke="#e0f2fe"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );
      case "friend":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <circle cx="24" cy="23" r="6" fill="#087f5b" />
            <circle cx="40" cy="23" r="6" fill="#065f46" />
            <path d="M13 46c0-6.5 4.8-11 11-11s11 4.5 11 11" fill="#087f5b" />
            <path d="M29 46c0-6.5 4.8-11 11-11s11 4.5 11 11" fill="#065f46" opacity="0.85" />
          </svg>
        );
      case "family":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <circle cx="20" cy="22" r="5.5" fill="#065f46" />
            <circle cx="44" cy="22" r="5.5" fill="#065f46" />
            <circle cx="32" cy="30" r="4.2" fill="#d97706" />
            <path d="M11 47c0-6 4-10 9-10s9 4 9 10" fill="#087f5b" />
            <path d="M35 47c0-6 4-10 9-10s9 4 9 10" fill="#087f5b" />
            <path d="M24 47c0-4.5 3.5-8 8-8s8 3.5 8 8" fill="#d97706" />
          </svg>
        );
      case "flower":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <path d="M32 34v19" stroke="#087f5b" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M32 45c5-4 10-3 11 0-4 3-8 3-11 0z" fill="#087f5b" />
            <circle cx="32" cy="18" r="6" fill="#e11d48" />
            <circle cx="41" cy="24" r="6" fill="#fb7185" />
            <circle cx="37" cy="33" r="6" fill="#e11d48" />
            <circle cx="27" cy="33" r="6" fill="#fb7185" />
            <circle cx="23" cy="24" r="6" fill="#e11d48" />
            <circle cx="32" cy="26" r="5" fill="#fbbf24" />
          </svg>
        );
      case "house":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <path d="M13 30L32 14l19 16v21H13V30z" fill="#f5efe6" stroke="#065f46" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9 31L32 12l23 19" stroke="#087f5b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="27" y="35" width="10" height="16" rx="1.5" fill="#087f5b" />
            <rect x="18" y="34" width="6" height="6" rx="1" fill="#93c5fd" stroke="#065f46" strokeWidth="1.2" />
          </svg>
        );
      case "happy":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <circle cx="32" cy="32" r="18" fill="#fbbf24" />
            <circle cx="25.5" cy="27.5" r="2.2" fill="#132a21" />
            <circle cx="38.5" cy="27.5" r="2.2" fill="#132a21" />
            <path
              d="M24 36c2 4 14 4 16 0"
              stroke="#132a21"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        );
      case "knowledge":
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <path
              d="M32 14c-7.5 0-13 5.5-13 12.5 0 4.5 2.4 8.2 6 10.5v4h14v-4c3.6-2.3 6-6 6-10.5C45 19.5 39.5 14 32 14z"
              fill="#fde68a"
              stroke="#d97706"
              strokeWidth="2"
            />
            <rect x="26" y="42" width="12" height="4" rx="1" fill="#087f5b" />
            <rect x="28" y="47" width="8" height="3.5" rx="1" fill="#065f46" />
            <path d="M32 21v10M27 26h10" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "nature":
      default:
        return (
          <svg viewBox="0 0 64 64" className="w-11 h-11" aria-hidden="true">
            <path d="M10 48L25 22l12 18 7-10 10 18H10z" fill="#087f5b" />
            <path d="M25 22l6 9-4 3-6-5z" fill="#d1fae5" />
            <circle cx="46" cy="18" r="5" fill="#fbbf24" />
          </svg>
        );
    }
  };

  return (
    <div
      className="w-20 h-20 rounded-xl bg-[#edf5f0] border border-[#d6e7dd] flex items-center justify-center shrink-0"
      role="img"
      aria-label={`${label} illustration`}
    >
      {renderArtwork()}
    </div>
  );
};
