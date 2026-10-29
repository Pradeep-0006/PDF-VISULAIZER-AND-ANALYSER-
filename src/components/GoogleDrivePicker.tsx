import React, { useState, useEffect } from 'react';
import {
  initDriveAuth,
  googleSignIn,
  logoutGoogleDrive,
  getAccessToken,
  listDriveFiles,
  downloadDriveFile,
  DriveFile,
} from '../services/googleDriveService';
import { User } from 'firebase/auth';
import {
  Search,
  FileText,
  FileCheck2,
  RefreshCw,
  LogOut,
  Loader2,
  AlertCircle,
  FileCode,
  HardDrive,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface GoogleDrivePickerProps {
  onFileReady: (data: { pdfBase64?: string; text?: string; fileName: string }) => void;
  isAnalyzing?: boolean;
}

export const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({
  onFileReady,
  isAnalyzing,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fileFilter, setFileFilter] = useState<'all' | 'pdf' | 'doc'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hasToken) {
      loadFiles();
    }
  }, [hasToken, fileFilter]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(
        err.message || 'Failed to sign in with Google Drive. Please try again.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogleDrive();
      setCurrentUser(null);
      setHasToken(false);
      setFiles([]);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const loadFiles = async (query = searchQuery) => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const driveFiles = await listDriveFiles(query, fileFilter);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      if (err.message?.includes('token') || err.message?.includes('401')) {
        setHasToken(false);
      }
      setErrorMessage(err.message || 'Unable to load files from Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(searchQuery);
  };

  const handleSelectFile = async (file: DriveFile) => {
    setDownloadingFileId(file.id);
    setErrorMessage(null);
    try {
      const result = await downloadDriveFile(file);
      onFileReady(result);
    } catch (err: any) {
      console.error('Download error:', err);
      setErrorMessage(
        `Failed to import "${file.name}" from Google Drive: ${err.message}`
      );
    } finally {
      setDownloadingFileId(null);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'Google Doc';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return 'Unknown size';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // If user is not authenticated with Google Drive
  if (!hasToken || !currentUser) {
    return (
      <div className="py-12 px-6 text-center max-w-lg mx-auto bg-slate-50/70 border border-slate-200/80 rounded-2xl">
        <div className="w-14 h-14 bg-white shadow-xs rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
          <svg className="w-8 h-8" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.25z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.25z" fill="#2684fc"/>
            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Connect Your Google Drive
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Select syllabus PDFs, lecture slides, and Google Docs directly from your Google Drive without manual downloading.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="inline-flex items-center justify-center gap-3 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50"
        >
          {isSigningIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 mt-4">
          ExamFlow accesses your Drive only with your permission to read selected files for study analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Account Info & Drive Status Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'Google Account'}
              className="w-8 h-8 rounded-full border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              {currentUser.email?.[0].toUpperCase() || 'G'}
            </div>
          )}
          <div>
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{currentUser.displayName || 'Connected Account'}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded-full">
                Google Drive Connected
              </span>
            </div>
            <div className="text-[11px] text-slate-500">{currentUser.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadFiles()}
            disabled={isLoadingFiles}
            title="Refresh files"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name in Google Drive..."
            className="w-full pl-9 pr-20 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFileFilter('all')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              fileFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Docs
          </button>
          <button
            type="button"
            onClick={() => setFileFilter('pdf')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              fileFilter === 'pdf'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            PDFs
          </button>
          <button
            type="button"
            onClick={() => setFileFilter('doc')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              fileFilter === 'doc'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Google Docs
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File List */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[380px] overflow-y-auto">
        {isLoadingFiles ? (
          <div className="py-16 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            <p className="text-xs">Fetching documents from your Google Drive...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium text-slate-600">No matching study documents found.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Upload a PDF or Google Doc to your Drive, or adjust your search term.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {files.map((file) => {
              const isPdf = file.mimeType === 'application/pdf';
              const isDoc = file.mimeType.includes('document');
              const isDownloading = downloadingFileId === file.id;

              return (
                <div
                  key={file.id}
                  className="p-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isPdf
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : isDoc
                          ? 'bg-sky-50 text-sky-600 border border-sky-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {isPdf ? (
                        <FileText className="w-4 h-4" />
                      ) : isDoc ? (
                        <FileCode className="w-4 h-4" />
                      ) : (
                        <HardDrive className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-900 truncate">
                        {file.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{formatFileSize(file.size)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(file.modifiedTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        title="View in Google Drive"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelectFile(file)}
                      disabled={isDownloading || isAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Import & Analyze</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
