import React, { useState } from 'react';
import { StudyMaterial } from '../types';
import {
  exportStudyGuideToDrive,
  googleSignIn,
  getAccessToken,
} from '../services/googleDriveService';
import {
  HardDrive,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  UploadCloud,
} from 'lucide-react';

interface DriveExportModalProps {
  material: StudyMaterial;
  isOpen: boolean;
  onClose: () => void;
}

export const DriveExportModal: React.FC<DriveExportModalProps> = ({
  material,
  isOpen,
  onClose,
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportedFile, setExportedFile] = useState<{ id: string; name: string; webViewLink?: string } | null>(null);

  if (!isOpen) return null;

  const handleConfirmSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsSigningIn(true);
        const signinRes = await googleSignIn();
        if (!signinRes) {
          throw new Error('Please sign in to Google Drive to save your study guide.');
        }
      }

      const result = await exportStudyGuideToDrive(material);
      setExportedFile(result);
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMessage(err.message || 'Failed to save to Google Drive.');
    } finally {
      setIsSaving(false);
      setIsSigningIn(false);
    }
  };

  const handleResetAndClose = () => {
    setExportedFile(null);
    setErrorMessage(null);
    onClose();
  };

  const fileName = `ExamFlow Study Guide - ${material.meta.title.replace(/[^\w\s-]/gi, '')}.md`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Export to Google Drive</h3>
              <p className="text-[11px] text-slate-500">Save study package to your cloud storage</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {exportedFile ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Saved to Google Drive!
              </h4>
              <p className="text-xs text-slate-500 mb-6">
                Your study guide <span className="font-semibold text-slate-700">"{exportedFile.name}"</span> was created successfully.
              </p>

              <div className="flex items-center justify-center gap-3">
                {exportedFile.webViewLink && (
                  <a
                    href={exportedFile.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Drive</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Mandatory User Confirmation Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-900 mb-1">
                  Save "{material.meta.title}" to Google Drive?
                </p>
                <p className="leading-relaxed text-slate-500 mb-3">
                  This action creates a new file in your personal Google Drive containing:
                </p>
                <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                  <li>Executive summary & academic principles</li>
                  <li>{material.diagrams.length} Mermaid flowcharts & visual architecture maps</li>
                  <li>{material.examConcepts.length} High-weightage concepts & mnemonics</li>
                  <li>{material.examQuestions.length} Practice questions & model answers</li>
                  <li>{material.flashcards.length} Spaced repetition flashcards</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-100/70 border border-slate-200 rounded-lg mb-5 text-[11px] text-slate-500 truncate font-mono">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{fileName}</span>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isSigningIn ? 'Connecting...' : 'Uploading to Drive...'}</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Confirm & Save to Drive</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
