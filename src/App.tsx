/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sampleDistributedSystems } from './data/sampleMaterials';
import { StudyMaterial, SampleDocument, Flashcard, ExamQuestion } from './types';
import { DiagramViewer } from './components/DiagramViewer';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ExamConceptsList } from './components/ExamConceptsList';
import { ExamQuestionsSection } from './components/ExamQuestionsSection';
import { StudySummarySection } from './components/StudySummarySection';
import { UploadStage } from './components/UploadStage';
import { DoubtModal } from './components/DoubtModal';
import { DriveExportModal } from './components/DriveExportModal';
import {
  BookOpen,
  GitBranch,
  Brain,
  HelpCircle,
  FileCheck,
  Upload,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  Flame,
  Clock,
  GraduationCap,
  Share2,
  Check,
  HardDrive
} from 'lucide-react';

export default function App() {
  const [currentMaterial, setCurrentMaterial] = useState<StudyMaterial>(sampleDistributedSystems);
  const [showUploadStage, setShowUploadStage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'flowcharts' | 'summary' | 'concepts' | 'questions' | 'flashcards'>('flowcharts');
  const [doubtModalOpen, setDoubtModalOpen] = useState<boolean>(false);
  const [doubtTopic, setDoubtTopic] = useState<string>('');
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [driveExportOpen, setDriveExportOpen] = useState<boolean>(false);

  const handleShareLink = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ExamFlow - PDF Visualizer & Study Engine',
          text: 'Check out ExamFlow to convert study PDFs into flowcharts, exam concepts, and flashcards!',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSelectSample = (sample: SampleDocument) => {
    setCurrentMaterial(sample.defaultData);
    setShowUploadStage(false);
    setActiveTab('flowcharts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyzeSuccess = (material: StudyMaterial) => {
    setCurrentMaterial(material);
    setShowUploadStage(false);
    setActiveTab('flowcharts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateFlashcards = (updated: Flashcard[]) => {
    setCurrentMaterial((prev) => ({
      ...prev,
      flashcards: updated,
    }));
  };

  const handleUpdateQuestion = (questionId: string, updated: Partial<ExamQuestion>) => {
    setCurrentMaterial((prev) => ({
      ...prev,
      examQuestions: prev.examQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updated } : q
      ),
    }));
  };

  const handleAskTutorAboutConcept = (conceptTitle: string) => {
    setDoubtTopic(conceptTitle);
    setDoubtModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Universal Top Bar Contract: Brand — 4-5 nav links — 1 primary action */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8 print:hidden">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setShowUploadStage(false);
            setActiveTab('flowcharts');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
            E
          </div>
          <span>ExamFlow</span>
        </a>

        {/* Zone 2: 4-5 single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => {
              setShowUploadStage(false);
              setActiveTab('flowcharts');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              !showUploadStage && activeTab === 'flowcharts' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Visual Flowcharts
          </button>
          <button
            onClick={() => {
              setShowUploadStage(false);
              setActiveTab('summary');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              !showUploadStage && activeTab === 'summary' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Study Summary
          </button>
          <button
            onClick={() => {
              setShowUploadStage(false);
              setActiveTab('concepts');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              !showUploadStage && activeTab === 'concepts' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Exam Concepts
          </button>
          <button
            onClick={() => {
              setShowUploadStage(false);
              setActiveTab('questions');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              !showUploadStage && activeTab === 'questions' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Question Bank
          </button>
          <button
            onClick={() => {
              setShowUploadStage(false);
              setActiveTab('flashcards');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              !showUploadStage && activeTab === 'flashcards' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Spaced Repetition
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleShareLink}
            title="Share or copy website link"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            {copiedShareLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Share Link</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowUploadStage((prev) => !prev)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{showUploadStage ? 'Back to Study Notes' : 'Upload PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUploadStage ? (
          <UploadStage
            onSelectSample={handleSelectSample}
            onAnalyzeSuccess={handleAnalyzeSuccess}
            currentDocumentTitle={currentMaterial.meta.title}
            onCancel={() => setShowUploadStage(false)}
          />
        ) : (
          <>
            {/* Document Hero & Metadata Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-8 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                <div className="max-w-2xl">
                  {/* Metadata bar with typographic separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">{currentMaterial.meta.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium">{currentMaterial.meta.targetExamLevel}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {currentMaterial.meta.estimatedStudyTime}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate max-w-[200px] text-slate-400">
                      {currentMaterial.meta.sourceFileName}
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                    {currentMaterial.meta.title}
                  </h1>

                  {/* Themes preview */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Themes:
                    </span>
                    {currentMaterial.meta.keyThemes.map((theme, idx) => (
                      <span
                        key={idx}
                        className="text-xs text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hero side visual badge */}
                <div className="hidden lg:block w-72 h-36 rounded-xl overflow-hidden border border-slate-200 relative shrink-0 shadow-xs">
                  <img
                    src="/src/assets/images/pdf_visual_flowchart_hero_1792402026923.jpg"
                    alt="Visual Knowledge Graph Flowchart"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-[11px] font-semibold text-white">
                      Interactive Visual Diagrams
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Jump Interactive Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('flowcharts')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'flowcharts'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Visual Flowcharts ({currentMaterial.diagrams.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'summary'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Summary</span>
                </button>

                <button
                  onClick={() => setActiveTab('concepts')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'concepts'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Exam Concepts ({currentMaterial.examConcepts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'questions'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Question Bank ({currentMaterial.examQuestions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'flashcards'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Spaced Repetition Deck ({currentMaterial.flashcards.length})</span>
                </button>

                {/* Google Drive Export Action */}
                <div className="ml-auto">
                  <button
                    onClick={() => setDriveExportOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-xs"
                    title="Export full study guide to Google Drive"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Save to Drive</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Tab 1: Visual Flowcharts & Diagrams */}
            {activeTab === 'flowcharts' && (
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Visual Concept Diagrams & Flowcharts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Interactive maps of key algorithms, biochemical pathways, and conceptual hierarchies.
                      Export high-resolution 300 DPI PNGs or SVGs for study notes.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {currentMaterial.diagrams.length} Diagrams Available
                  </span>
                </div>

                <div className="space-y-6">
                  {currentMaterial.diagrams.map((diagram) => (
                    <DiagramViewer
                      key={diagram.id}
                      diagram={diagram}
                      subjectTitle={currentMaterial.meta.title}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Content Tab 2: Study Summary */}
            {activeTab === 'summary' && (
              <StudySummarySection
                summary={currentMaterial.studySummary}
                meta={currentMaterial.meta}
                onOpenDoubtModal={() => {
                  setDoubtTopic(currentMaterial.meta.title);
                  setDoubtModalOpen(true);
                }}
              />
            )}

            {/* Content Tab 3: Exam Concepts to Remember */}
            {activeTab === 'concepts' && (
              <ExamConceptsList
                concepts={currentMaterial.examConcepts}
                onAskTutorAboutConcept={handleAskTutorAboutConcept}
              />
            )}

            {/* Content Tab 4: Exam Questions */}
            {activeTab === 'questions' && (
              <ExamQuestionsSection
                questions={currentMaterial.examQuestions}
                onUpdateQuestion={handleUpdateQuestion}
              />
            )}

            {/* Content Tab 5: Spaced Repetition Flashcards */}
            {activeTab === 'flashcards' && (
              <FlashcardDeck
                cards={currentMaterial.flashcards}
                onUpdateCards={handleUpdateFlashcards}
                documentTitle={currentMaterial.meta.title}
              />
            )}
          </>
        )}
      </main>

      {/* Academic Tutor Doubt Clarification Modal */}
      <DoubtModal
        isOpen={doubtModalOpen}
        onClose={() => setDoubtModalOpen(false)}
        documentTitle={currentMaterial.meta.title}
        initialTopic={doubtTopic}
      />

      <DriveExportModal
        isOpen={driveExportOpen}
        onClose={() => setDriveExportOpen(false)}
        material={currentMaterial}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>ExamFlow AI Visualizer</span>
          <span aria-hidden="true">·</span>
          <span>High-Resolution Diagram Export & Spaced Repetition</span>
          <span aria-hidden="true">·</span>
          <span>Powered by Gemini 3.8 Flash</span>
        </div>
      </footer>
    </div>
  );
}
