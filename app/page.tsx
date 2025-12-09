'use client';

import { useState, useEffect } from 'react';
import Flashcard, { FlashcardData } from '@/components/Flashcard';

export default function Home() {
  const [currentCard, setCurrentCard] = useState<FlashcardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const fetchNextCard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/flashcards');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch flashcard');
      }

      if (!data.card) {
        setIsDone(true);
        setCurrentCard(null);
      } else {
        setCurrentCard(data.card);
        setIsDone(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (remembered: boolean) => {
    if (!currentCard) return;

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vocabularyId: currentCard.id,
          remembered,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to record progress');
      }

      // Fetch the next card
      await fetchNextCard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleNext = () => {
    handleProgress(true);
  };

  const handleDontRemember = () => {
    handleProgress(false);
  };

  useEffect(() => {
    fetchNextCard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading flashcard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-error mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => fetchNextCard()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isDone || !currentCard) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center bg-green-50 p-12 rounded-lg max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-success mb-4">
            You&apos;re done for today!
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            Great job! Come back tomorrow to continue learning.
          </p>
          <button
            onClick={() => fetchNextCard()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Check for More Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Flashcard
        card={currentCard}
        onNext={handleNext}
        onDontRemember={handleDontRemember}
      />
    </div>
  );
}
