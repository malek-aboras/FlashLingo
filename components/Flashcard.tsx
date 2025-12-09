'use client';

import { useState } from 'react';

export interface FlashcardData {
  id: number;
  vocab_de: string;
  vocab_en: string;
  artikel?: string;
  helping_verb?: string;
  type?: string;
  note?: string;
  example?: string;
}

interface FlashcardProps {
  card: FlashcardData;
  onNext: () => void;
  onDontRemember: () => void;
}

export default function Flashcard({ card, onNext, onDontRemember }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const formatGermanWord = () => {
    if (card.type === 'noun' && card.artikel) {
      return (
        <>
          <span className="font-bold">{card.artikel}</span> {card.vocab_de}
        </>
      );
    } else if (card.type === 'verb' && card.helping_verb) {
      return (
        <>
          <span className="font-bold">{card.helping_verb}</span> {card.vocab_de}
        </>
      );
    } else {
      return <span className="font-bold">{card.vocab_de}</span>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-4">
      <div className="w-full max-w-2xl">
        {/* Flashcard */}
        <div
          className="relative w-full h-96 cursor-pointer perspective-1000"
          onClick={!isFlipped ? handleFlip : undefined}
        >
          <div
            className={`absolute w-full h-full transition-transform duration-600 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s ease-in-out',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front of card */}
            <div
              className="absolute w-full h-full bg-white rounded-2xl shadow-xl flex items-center justify-center p-8 backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-semibold text-gray-800">
                  {card.vocab_en}
                </p>
                <p className="text-sm text-gray-500 mt-8">Click to flip</p>
              </div>
            </div>

            {/* Back of card */}
            <div
              className="absolute w-full h-full bg-primary rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="text-center text-white">
                <p className="text-4xl md:text-5xl font-semibold mb-6">
                  {formatGermanWord()}
                </p>
                {card.example && (
                  <p className="text-lg md:text-xl text-blue-100 italic mb-4 max-w-xl">
                    {card.example}
                  </p>
                )}
                {card.note && (
                  <p className="text-sm text-blue-200 max-w-xl">
                    {card.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - only show when flipped */}
        {isFlipped && (
          <div className="flex gap-4 mt-8 justify-center">
            <button
              onClick={onDontRemember}
              className="px-8 py-4 bg-error text-white rounded-lg font-semibold text-lg hover:bg-red-600 transform hover:scale-105 transition-all shadow-lg"
            >
              Don&apos;t Remember
            </button>
            <button
              onClick={onNext}
              className="px-8 py-4 bg-success text-white rounded-lg font-semibold text-lg hover:bg-green-600 transform hover:scale-105 transition-all shadow-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
