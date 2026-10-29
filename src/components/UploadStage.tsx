import React, { useState, useRef } from 'react';
import { sampleMaterialsList } from '../data/sampleMaterials';
import { StudyMaterial, SampleDocument } from '../types';
import {
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  Flame,
  HardDrive
} from 'lucide-react';
import { GoogleDrivePicker } from './GoogleDrivePicker';

interface UploadStageProps {
  onSelectSample: (sample: SampleDocument) => void;
  onAnalyzeSuccess: (material: StudyMaterial) => void;
  currentDocumentTitle?: string;
  onCancel?: () => void;
}

export const UploadStage: React.FC<UploadStageProps> = ({
  onSelectSample,
  onAnalyzeSuccess,
  currentDocumentTitle,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'samples' | 'drive'>('samples');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [examLevel, setExamLevel] = useState<string>('University / Engineering Exam');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDriveFileReady = async (data: {
    pdfBase64?: string;
    text?: string;
    fileName: string;
  }) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep(`Imported "${data.fileName}" from Google Drive. Reading document structure...`);

    try {
      const stepTimer1 = setTimeout(() => {
        setAnalysisStep('Synthesizing visual flowcharts, state transitions & architectural diagrams...');
      }, 3500);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStep('Formulating exam questions (2, 5, 10 marks), expected keywords & marking rubrics...');
      }, 7000);

      const stepTimer3 = setTimeout(() => {
        setAnalysisStep('Generating spaced-repetition flashcards prioritized by exam weightage...');
      }, 10500);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: data.pdfBase64 || undefined,
          text: data.text ? data.text.trim() : undefined,
          fileName: data.fileName,
          examLevel,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const result: StudyMaterial = await response.json();
      onAnalyzeSuccess(result);
    } catch (err: any) {
      console.error('Drive file analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze document from Google Drive.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setErrorMessage('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setFileBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!fileBase64 && !pastedText.trim()) {
      setErrorMessage('Please upload a PDF or enter study text to begin.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStep('Reading PDF document structure and extracting high-yield academic concepts...');

    try {
      const stepTimer1 = setTimeout(() => {
        setAnalysisStep('Synthesizing visual flowcharts, state transitions & architectural diagrams...');
      }, 3500);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStep('Formulating exam questions (2, 5, 10 marks), expected keywords & marking rubrics...');
      }, 7000);

      const stepTimer3 = setTimeout(() => {
        setAnalysisStep('Generating spaced-repetition flashcards prioritized by exam weightage...');
      }, 10500);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64: fileBase64 || undefined,
          text: pastedText.trim() || undefined,
          fileName: selectedFile?.name || documentTitle || 'Academic Material',
          examLevel,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data: StudyMaterial = await response.json();
      onAnalyzeSuccess(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze document. Please check the file and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-4xl mx-auto mb-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full mb-3 inline-block">
          AI-Powered Academic Visualizer
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Transform Any PDF into Visual Diagrams & Exam Mastery
        </h2>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
          Upload textbook chapters, research papers, or syllabus notes. Get interactive flowcharts
          with high-resolution export, scoring summaries, exam questions with model answers, and
          high-weightage spaced-repetition flashcards.
        </p>
      </div>

      {/* Target Exam Level Selector */}
      <div className="mb-6 bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-semibold text-slate-700">Target Exam Standard:</span>
        </div>
        <div className="flex items-center gap-2">
          {[
            'University / Engineering Exam',
            'Competitive (GATE / MCAT / GRE)',
            'High School / AP Board Exam',
          ].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setExamLevel(level)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                examLevel === level
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Method Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('samples')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'samples'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Pre-loaded Academic Modules</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'upload'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload PDF Document</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'text'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Notes / Text</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'drive'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HardDrive className="w-4 h-4 text-emerald-600" />
          <span>Google Drive</span>
        </button>
      </div>

      {/* Tab 1: Preloaded Samples */}
      {activeTab === 'samples' && (
        <div>
          <p className="text-xs text-slate-500 text-center mb-4">
            Click any curated academic chapter below to immediately test the interactive flowcharts,
            high-res image export, and Leitner flashcards:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleMaterialsList.map((sample) => (
              <div
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className="group border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer bg-white relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
                      {sample.subject}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-500" />
                      {sample.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors mb-2 leading-snug">
                    {sample.title}
                  </h3>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {sample.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-sky-600">
                  <span>Load Interactive Diagrams & Deck</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Upload PDF */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-sky-400 bg-sky-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6 text-slate-700" />
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-bold text-slate-900 mb-1">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for AI Visualizer
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  Click to select or drag and drop your PDF here
                </p>
                <p className="text-xs text-slate-500">
                  Textbooks, syllabus units, lecture slides, research papers (up to 20MB)
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!selectedFile || isAnalyzing}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing PDF...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Flowcharts, Exam Questions & Flashcards</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 3: Paste Text */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chapter Title or Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Operating Systems: Deadlocks & Banker's Algorithm"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste Academic Notes or Textbook Section
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste study text, lecture transcript, definitions, or textbook chapter here..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-sans"
            />
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!pastedText.trim() || isAnalyzing}
            className="w-full py-3 px-4 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Flowcharts, Exam Questions & Flashcards</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 4: Google Drive Import */}
      {activeTab === 'drive' && (
        <div className="space-y-4">
          <GoogleDrivePicker
            onFileReady={handleDriveFileReady}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {/* Loading Progress Overlay */}
      {isAnalyzing && (
        <div className="mt-6 p-4 rounded-xl border border-sky-200 bg-sky-50/60 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-sky-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-sky-900">
                Gemini 3.8 Flash Engine Active
              </p>
              <p className="text-xs text-sky-800">{analysisStep}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Cancel button if already reviewing an active document */}
      {currentDocumentTitle && onCancel && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
          >
            Return to current document: {currentDocumentTitle}
          </button>
        </div>
      )}
    </div>
  );
};
