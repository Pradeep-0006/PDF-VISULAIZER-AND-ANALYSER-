import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard, ExamWeightage } from '../types';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Plus,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';

interface FlashcardDeckProps {
  cards: Flashcard[];
  onUpdateCards: (updated: Flashcard[]) => void;
  documentTitle: string;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  cards,
  onUpdateCards,
  documentTitle,
}) => {
  const [filterWeightage, setFilterWeightage] = useState<'all' | 'crucial' | 'high'>('all');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [studySessionCompleted, setStudySessionCompleted] = useState<boolean>(false);
  const [reviewedInSession, setReviewedInSession] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New card modal form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newWeightage, setNewWeightage] = useState<ExamWeightage>('crucial');

  // Filter and prioritize cards by exam weightage (Crucial > High > Medium)
  const prioritizedCards = React.useMemo(() => {
    let filtered = [...cards];
    if (filterWeightage === 'crucial') {
      filtered = filtered.filter((c) => c.weightage === 'crucial');
    } else if (filterWeightage === 'high') {
      filtered = filtered.filter((c) => c.weightage === 'crucial' || c.weightage === 'high');
    }

    // Weightage sorting priority: crucial (3) > high (2) > medium (1), then by Leitner box ascending (unmastered first)
    return filtered.sort((a, b) => {
      const weightScore = { crucial: 3, high: 2, medium: 1 };
      const diff = weightScore[b.weightage] - weightScore[a.weightage];
      if (diff !== 0) return diff;
      return a.leitnerBox - b.leitnerBox;
    });
  }, [cards, filterWeightage]);

  const activeCard = prioritizedCards[currentIndex] || null;

  // Leitner distribution counts
  const boxCounts = React.useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    cards.forEach((c) => {
      const idx = Math.min(Math.max(c.leitnerBox - 1, 0), 4);
      counts[idx]++;
    });
    return counts;
  }, [cards]);

  const masteredCount = boxCounts[4];
  const masteryPercentage = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  // Handle rating a card
  const handleRateCard = useCallback(
    (rating: 'again' | 'hard' | 'good' | 'easy') => {
      if (!activeCard) return;

      let nextBox = activeCard.leitnerBox;
      let nextInterval = activeCard.intervalDays;

      switch (rating) {
        case 'again':
          nextBox = 1;
          nextInterval = 1;
          setStreak(0);
          break;
        case 'hard':
          nextBox = Math.max(1, activeCard.leitnerBox);
          nextInterval = Math.max(1, Math.round(activeCard.intervalDays * 1.2));
          setStreak((s) => s + 1);
          break;
        case 'good':
          nextBox = Math.min(5, activeCard.leitnerBox + 1);
          nextInterval = Math.round(activeCard.intervalDays * 2.5) || 3;
          setStreak((s) => s + 1);
          break;
        case 'easy':
          nextBox = Math.min(5, activeCard.leitnerBox + 2);
          nextInterval = Math.round(activeCard.intervalDays * 4) || 7;
          setStreak((s) => s + 1);
          break;
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextInterval);

      const updatedDeck = cards.map((c) =>
        c.id === activeCard.id
          ? {
              ...c,
              leitnerBox: nextBox,
              intervalDays: nextInterval,
              nextReviewDate: nextDate.toISOString(),
              reviewCount: c.reviewCount + 1,
              lastRating: rating,
            }
          : c
      );

      onUpdateCards(updatedDeck);
      setReviewedInSession((r) => r + 1);
      setIsFlipped(false);

      if (currentIndex + 1 >= prioritizedCards.length) {
        setStudySessionCompleted(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [activeCard, cards, currentIndex, onUpdateCards, prioritizedCards.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard('again');
        if (e.key === '2') handleRateCard('hard');
        if (e.key === '3') handleRateCard('good');
        if (e.key === '4') handleRateCard('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRateCard, isFlipped, showAddModal]);

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `custom-fc-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      topic: newTopic.trim() || 'Custom Concept',
      weightage: newWeightage,
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
    };

    onUpdateCards([newCard, ...cards]);
    setNewFront('');
    setNewBack('');
    setNewTopic('');
    setShowAddModal(false);
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudySessionCompleted(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mb-8">
      {/* Header Deck Stats & Leitner Progress */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/60">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Spaced Repetition Engine
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                High-Weightage Prioritized
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Exam Mastery Flashcard Deck
            </h3>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => {
                  setFilterWeightage('all');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterWeightage === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({cards.length})
              </button>
              <button
                onClick={() => {
                  setFilterWeightage('high');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterWeightage === 'high'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                High+ ({cards.filter((c) => c.weightage !== 'medium').length})
              </button>
              <button
                onClick={() => {
                  setFilterWeightage('crucial');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterWeightage === 'crucial'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔥 Crucial Only ({cards.filter((c) => c.weightage === 'crucial').length})
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {/* Leitner Box Visual Progress */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {['Box 1 (Daily)', 'Box 2 (2d)', 'Box 3 (4d)', 'Box 4 (7d)', 'Box 5 (Mastered)'].map(
            (label, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  activeCard && activeCard.leitnerBox === idx + 1
                    ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[11px] font-medium text-slate-500 mb-0.5 truncate">{label}</div>
                <div className="text-base font-bold text-slate-900 tabular-nums">
                  {boxCounts[idx]}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Study Arena */}
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[440px] bg-slate-50/30">
        {studySessionCompleted ? (
          <div className="text-center max-w-md py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Study Session Complete!</h4>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              You reviewed {reviewedInSession} high-yield concept cards. Spaced intervals have been
              calculated based on your memory recall.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={restartSession}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                Review Again
              </button>
              <button
                onClick={() => {
                  setFilterWeightage('crucial');
                  restartSession();
                }}
                className="px-5 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Drill Crucial Only (🔥)
              </button>
            </div>
          </div>
        ) : activeCard ? (
          <div className="w-full max-w-2xl flex flex-col items-center">
            {/* Top Card Info Bar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{activeCard.topic}</span>
                <span>·</span>
                <span
                  className={`font-semibold capitalize ${
                    activeCard.weightage === 'crucial'
                      ? 'text-rose-600'
                      : activeCard.weightage === 'high'
                      ? 'text-amber-600'
                      : 'text-slate-600'
                  }`}
                >
                  {activeCard.weightage === 'crucial' && '🔥 '}
                  {activeCard.weightage} Weightage
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span>Leitner Box {activeCard.leitnerBox} / 5</span>
                <span>·</span>
                <span className="font-mono tabular-nums">
                  Card {currentIndex + 1} of {prioritizedCards.length}
                </span>
              </div>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-80 cursor-pointer perspective-1000 group mb-6 select-none"
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front of Card (Prompt) */}
                <div className="absolute inset-0 w-full h-full bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 shadow-md p-8 flex flex-col justify-between backface-hidden transition-colors">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="uppercase tracking-wider font-semibold">QUESTION / PROMPT</span>
                    <span className="text-slate-400 text-[11px]">Click or press Space to reveal</span>
                  </div>

                  <div className="my-auto text-center">
                    <p className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                      {activeCard.front}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-sky-600 font-medium">
                      <Brain className="w-3.5 h-3.5" />
                      Active Recall
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <RotateCw className="w-3.5 h-3.5" />
                      Flip Card
                    </span>
                  </div>
                </div>

                {/* Back of Card (Answer & Explanation) */}
                <div className="absolute inset-0 w-full h-full bg-slate-900 text-white rounded-2xl border-2 border-slate-800 shadow-xl p-8 flex flex-col justify-between backface-hidden rotate-y-180">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="uppercase tracking-wider font-semibold text-sky-400">
                      ANSWER & EXAM CONCEPTS
                    </span>
                    <span className="text-slate-400 text-[11px]">Rate your recall below</span>
                  </div>

                  <div className="my-auto overflow-y-auto max-h-48 pr-2">
                    <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed">
                      {activeCard.back}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span className="text-emerald-400 font-medium">Key Exam Takeaway</span>
                    <span className="text-[11px] text-slate-400">Keys 1-4 to rate recall</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interval Rating Buttons (Visible when flipped) */}
            {isFlipped ? (
              <div className="w-full flex flex-col items-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  How well did you recall this concept?
                </p>
                <div className="grid grid-cols-4 gap-2.5 w-full">
                  <button
                    onClick={() => handleRateCard('again')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 transition-colors"
                  >
                    <span className="text-xs font-bold">Again</span>
                    <span className="text-[11px] text-rose-600 mt-0.5">&lt; 1 day (Key 1)</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('hard')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    <span className="text-xs font-bold">Hard</span>
                    <span className="text-[11px] text-amber-600 mt-0.5">+1 day (Key 2)</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('good')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors"
                  >
                    <span className="text-xs font-bold">Good</span>
                    <span className="text-[11px] text-sky-600 mt-0.5">+3 days (Key 3)</span>
                  </button>

                  <button
                    onClick={() => handleRateCard('easy')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <span className="text-xs font-bold">Easy</span>
                    <span className="text-[11px] text-emerald-600 mt-0.5">+7 days (Key 4)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-slate-700 text-[10px]">
                    Space
                  </span>
                  Flip card
                </span>
                <span>·</span>
                <span className="text-slate-400">
                  Prioritized for high exam score impact
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No flashcards matching the current filter.</p>
            <button
              onClick={() => setFilterWeightage('all')}
              className="mt-2 text-xs font-medium text-sky-600 hover:underline"
            >
              Reset Filter to All
            </button>
          </div>
        )}
      </div>

      {/* Add Custom Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-lg font-bold text-slate-900 mb-1">Add Custom Exam Flashcard</h4>
            <p className="text-xs text-slate-500 mb-4">
              Add your own custom formula, definition, or tricky question to this chapter.
            </p>

            <form onSubmit={handleAddNewCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Front (Question or Prompt)
                </label>
                <textarea
                  required
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the role of cytochrome c in apoptosis vs ETC?"
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Back (Answer & Exam Keywords)
                </label>
                <textarea
                  required
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Acts as a mobile electron carrier between Complex III and IV..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Bioenergetics"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Weightage
                  </label>
                  <select
                    value={newWeightage}
                    onChange={(e) => setNewWeightage(e.target.value as ExamWeightage)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="crucial">🔥 Crucial (Top Exam Focus)</option>
                    <option value="high">High Weightage</option>
                    <option value="medium">Medium Weightage</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
