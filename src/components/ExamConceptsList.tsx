import React, { useState } from 'react';
import { ExamConcept, ExamWeightage } from '../types';
import {
  Flame,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Search,
  BookOpen,
  MessageSquare
} from 'lucide-react';

interface ExamConceptsListProps {
  concepts: ExamConcept[];
  onAskTutorAboutConcept: (conceptTitle: string) => void;
}

export const ExamConceptsList: React.FC<ExamConceptsListProps> = ({
  concepts,
  onAskTutorAboutConcept,
}) => {
  const [filterWeightage, setFilterWeightage] = useState<'all' | 'crucial' | 'high' | 'medium'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredConcepts = concepts.filter((c) => {
    const matchesWeight = filterWeightage === 'all' || c.weightage === filterWeightage;
    const matchesSearch =
      c.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.coreDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.mnemonic && c.mnemonic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesWeight && matchesSearch;
  });

  const handleCopyDefinition = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mb-8">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Exam-Wise High-Yield Mastery
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                Scoring Definitions & Traps
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Important Concepts to Remember
            </h3>
          </div>

          {/* Search & Weightage Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search concepts or formulas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 w-44 md:w-56 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setFilterWeightage('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterWeightage === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterWeightage('crucial')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterWeightage === 'crucial'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔥 Crucial
              </button>
              <button
                onClick={() => setFilterWeightage('high')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterWeightage === 'high'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setFilterWeightage('medium')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterWeightage === 'medium'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Medium
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Cards Stack */}
      <div className="p-6 divide-y divide-slate-100">
        {filteredConcepts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No concepts match your search criteria.
          </div>
        ) : (
          filteredConcepts.map((item, idx) => (
            <div key={item.id || idx} className="py-6 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{item.concept}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      item.weightage === 'crucial'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.weightage === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}
                  >
                    {item.weightage === 'crucial' && '🔥 '}
                    {item.weightage.toUpperCase()} · ~{item.weightagePercentage}% Exam Marks
                  </span>

                  <button
                    onClick={() => onAskTutorAboutConcept(item.concept)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors font-medium"
                    title="Ask AI Tutor for intuition or doubt clarification"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Ask Tutor</span>
                  </button>
                </div>
              </div>

              {/* Why High Weightage note */}
              <p className="text-xs text-slate-500 mb-3.5 italic pl-9">
                Why tested: {item.whyHighWeightage}
              </p>

              <div className="pl-9 space-y-3.5">
                {/* Scoring Definition */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      Core Exam Definition (For Full Marks)
                    </span>
                    <button
                      onClick={() => handleCopyDefinition(item.id, item.coreDefinition)}
                      className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors"
                      title="Copy verbatim definition"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {item.coreDefinition}
                  </p>
                </div>

                {/* Key Formulas or Rules */}
                {item.keyFormulasOrRules && item.keyFormulasOrRules.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
                      Key Formulas, Equations & Governing Rules:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {item.keyFormulasOrRules.map((rule, rIdx) => (
                        <div
                          key={rIdx}
                          className="bg-slate-900 text-sky-300 font-mono text-xs px-3 py-2 rounded-lg border border-slate-800 flex items-center gap-2"
                        >
                          <span className="text-slate-500 select-none">›</span>
                          <span className="text-slate-100">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Exam Traps & Mnemonic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Common Exam Traps */}
                  {item.examTraps && item.examTraps.length > 0 && (
                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Common Exam Pitfalls & Traps:</span>
                      </div>
                      <ul className="space-y-1 text-xs text-rose-900/90 list-disc list-inside">
                        {item.examTraps.map((trap, tIdx) => (
                          <li key={tIdx} className="leading-snug">
                            {trap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mnemonic Hook */}
                  {item.mnemonic && (
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Memory Palace / Mnemonic Hook:</span>
                      </div>
                      <p className="text-xs font-medium text-amber-900 leading-relaxed">
                        {item.mnemonic}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
