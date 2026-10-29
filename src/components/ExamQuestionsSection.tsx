import React, { useState } from 'react';
import { ExamQuestion } from '../types';
import {
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PenTool,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ExamQuestionsSectionProps {
  questions: ExamQuestion[];
  onUpdateQuestion: (questionId: string, updated: Partial<ExamQuestion>) => void;
}

export const ExamQuestionsSection: React.FC<ExamQuestionsSectionProps> = ({
  questions,
  onUpdateQuestion,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [practiceModeId, setPracticeModeId] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [gradingLoading, setGradingLoading] = useState<Record<string, boolean>>({});

  const categories = ['all', '2-Mark Conceptual', '5-Mark Analytical', '10-Mark Deep Dive'];

  const filteredQuestions = questions.filter((q) => {
    if (activeCategory === 'all') return true;
    return q.category === activeCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleGradeAnswer = async (q: ExamQuestion) => {
    const input = userInputs[q.id];
    if (!input || !input.trim()) return;

    setGradingLoading((prev) => ({ ...prev, [q.id]: true }));
    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          modelAnswer: q.modelAnswer,
          expectedKeywords: q.expectedKeywords,
          userAnswer: input,
          maxMarks: q.marks,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const evaluation = await res.json();
      onUpdateQuestion(q.id, {
        userAnswer: input,
        evaluation,
      });
    } catch (err) {
      console.error('Error grading answer:', err);
    } finally {
      setGradingLoading((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mb-8">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Exam Preparation Question Bank
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Model Answers & Rubrics
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Curated Exam Questions
            </h3>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Questions' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="p-6 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No questions found in this category.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const isPracticeMode = practiceModeId === q.id;
            const currentInput = userInputs[q.id] || q.userAnswer || '';
            const isGrading = gradingLoading[q.id] || false;

            return (
              <div
                key={q.id || idx}
                className={`border rounded-xl transition-all duration-150 overflow-hidden ${
                  isExpanded ? 'border-slate-300 shadow-xs bg-slate-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Question Banner */}
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                        {q.marks} Marks
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {q.category}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">
                        Q{idx + 1}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h4>

                    {/* Keywords Preview */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Key terms needed:
                      </span>
                      {q.expectedKeywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/70"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expand / Practice Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setPracticeModeId((prev) => (prev === q.id ? null : q.id))
                      }
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                        isPracticeMode
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Practice answering this question yourself"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Practice Mode</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                      title={isExpanded ? 'Hide Model Answer' : 'Show Model Answer'}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Interactive Practice Mode Section */}
                {isPracticeMode && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-200 bg-sky-50/30">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-sky-600" />
                        Type Your Answer for Instant Evaluation:
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Include the required keywords above
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={currentInput}
                      onChange={(e) =>
                        setUserInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Write your answer as you would in the actual examination paper..."
                      className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed font-sans"
                    />

                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[11px] text-slate-500">
                        Word count: {currentInput.trim() ? currentInput.trim().split(/\s+/).length : 0} words
                      </span>

                      <button
                        onClick={() => handleGradeAnswer(q)}
                        disabled={isGrading || !currentInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {isGrading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Grading against rubrics...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Grade My Answer</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Grading Result Feedback */}
                    {q.evaluation && (
                      <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            Examiner Evaluation
                          </span>
                          <span className="text-sm font-extrabold text-emerald-900 tabular-nums">
                            Score: {q.evaluation.score} / {q.marks} Marks
                          </span>
                        </div>

                        <p className="text-xs text-emerald-950 mb-3 leading-relaxed">
                          {q.evaluation.feedback}
                        </p>

                        {q.evaluation.missingKeywords && q.evaluation.missingKeywords.length > 0 && (
                          <div className="text-xs text-amber-900 mb-2">
                            <span className="font-bold">Missing Keywords to include: </span>
                            {q.evaluation.missingKeywords.join(', ')}
                          </div>
                        )}

                        {q.evaluation.strengths && q.evaluation.strengths.length > 0 && (
                          <div className="text-xs text-emerald-800">
                            <span className="font-bold">Key Strengths: </span>
                            {q.evaluation.strengths.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Model Answer Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-200 bg-white">
                    {/* Examiner Tip */}
                    <div className="p-3 mb-4 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Examiner Score Booster Tip: </span>
                        <span>{q.examinerTip}</span>
                      </div>
                    </div>

                    {/* Step-by-step Model Answer */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        Official Model Answer (Full Marks):
                      </span>
                      <div className="text-xs md:text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {q.modelAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
