import React, { useState } from 'react';
import { HelpCircle, Send, Loader2, Sparkles, X, MessageSquare } from 'lucide-react';

interface DoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  initialTopic?: string;
}

export const DoubtModal: React.FC<DoubtModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  initialTopic,
}) => {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ q: string; a: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ask-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          contextTopic: topic || documentTitle,
          documentTitle,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve tutor response');
      }

      const data = await res.json();
      setHistory((prev) => [...prev, { q: userQ, a: data.answer }]);
      setQuestion('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with tutor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Doubt Tutor</h3>
              <p className="text-xs text-slate-500 truncate max-w-md">
                Context: {documentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Ask any confusion about a diagram step, equation, or tricky definition.
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-800 font-medium">
                  <span className="text-slate-500 font-semibold block mb-1">Your Question:</span>
                  {item.q}
                </div>
                <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 text-xs md:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                  <span className="text-sky-700 font-bold block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tutor Explanation:
                  </span>
                  {item.a}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 text-xs text-slate-500 bg-slate-50 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              <span>Tutor is formulating an intuitive conceptual explanation...</span>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs text-rose-800 bg-rose-50 rounded-xl border border-rose-200">
              {error}
            </div>
          )}
        </div>

        {/* Question form */}
        <form onSubmit={handleAskDoubt} className="pt-3 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question or doubt..."
            className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
