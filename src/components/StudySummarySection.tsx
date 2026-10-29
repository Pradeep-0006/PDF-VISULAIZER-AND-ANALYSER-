import React from 'react';
import { StudySummary } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Layers,
  Printer,
  Sparkles,
  HelpCircle,
  Clock,
  GraduationCap
} from 'lucide-react';

interface StudySummarySectionProps {
  summary: StudySummary;
  meta: {
    title: string;
    subject: string;
    targetExamLevel: string;
    estimatedStudyTime: string;
    keyThemes: string[];
    sourceFileName: string;
  };
  onOpenDoubtModal: () => void;
}

export const StudySummarySection: React.FC<StudySummarySectionProps> = ({
  summary,
  meta,
  onOpenDoubtModal,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mb-8 print:border-none print:shadow-none">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 print:bg-transparent print:border-b-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Core Chapter Breakdown
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                High-Yield Summary
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Study Summary & Executive Overview
            </h3>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              title="Print or save as PDF Study Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Study Sheet</span>
            </button>
            <button
              onClick={onOpenDoubtModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ask Tutor Doubt</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Executive Overview Box */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            Executive Conceptual Overview
          </h4>
          <p className="text-sm md:text-base text-slate-800 leading-relaxed bg-slate-50/70 border border-slate-200 rounded-xl p-5">
            {summary.executiveOverview}
          </p>
        </div>

        {/* Key Takeaways Grid */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Essential Exam Takeaways
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.keyTakeaways.map((takeaway, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {takeaway}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Principles & Mechanisms */}
        {summary.corePrinciples && summary.corePrinciples.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              Fundamental Principles & Invariants
            </h4>
            <div className="space-y-3">
              {summary.corePrinciples.map((principle, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-bold text-slate-900">
                      {idx + 1}. {principle.title}
                    </span>
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200/60">
                      {principle.importance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {summary.prerequisites && summary.prerequisites.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Recommended Prerequisites:</span>
            {summary.prerequisites.map((p, idx) => (
              <span
                key={idx}
                className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
