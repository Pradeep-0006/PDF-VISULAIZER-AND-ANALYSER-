import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { VisualDiagram } from '../types';
import { exportSvgToPng, exportSvgFile, copySvgToClipboard } from '../utils/diagramExport';
import {
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileCode,
  Info,
  Sparkles
} from 'lucide-react';

interface DiagramViewerProps {
  diagram: VisualDiagram;
  subjectTitle?: string;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ diagram, subjectTitle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      themeVariables: {
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        primaryColor: '#0284c7',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#0369a1',
        lineColor: '#475569',
        secondaryColor: '#f1f5f9',
        tertiaryColor: '#ffffff',
      },
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
      },
    });

    let isMounted = true;

    async function renderDiagram() {
      setRenderError(null);
      try {
        const uniqueId = `mermaid-${diagram.id}-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, diagram.mermaidCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setRenderError(err?.message || 'Could not render diagram format.');
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [diagram.id, diagram.mermaidCode]);

  const handleDownloadPng = async () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (svgEl) {
      const fileName = `${diagram.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_highres.png`;
      await exportSvgToPng(svgEl, fileName, 3);
    }
  };

  const handleDownloadSvg = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (svgEl) {
      const fileName = `${diagram.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`;
      exportSvgFile(svgEl, fileName);
    }
  };

  const handleCopyClipboard = async () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (svgEl) {
      const success = await copySvgToClipboard(svgEl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative shadow-xs mb-8'
      }`}
    >
      {/* Diagram Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight truncate">
              {diagram.title}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-xl">
              {diagram.description}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-500 tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.4, z + 0.2))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export Action Buttons */}
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
            title="Copy diagram image to clipboard for Notion/Docs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied Image' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs shrink-0"
            title="Export as Ultra High-Resolution PNG (300 DPI for sharing/printing)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export High-Res PNG</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
            title="Export Vector SVG"
          >
            <span>SVG</span>
          </button>

          <button
            onClick={() => setShowCode(!showCode)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="View Mermaid Syntax"
          >
            <FileCode className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Inspector Toggle */}
      {showCode && (
        <div className="bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto border-b border-slate-700">
          <div className="flex justify-between items-center mb-2 text-slate-400">
            <span>Mermaid Definition:</span>
            <button
              onClick={() => navigator.clipboard.writeText(diagram.mermaidCode)}
              className="text-xs hover:text-white transition-colors"
            >
              Copy Code
            </button>
          </div>
          <pre>{diagram.mermaidCode}</pre>
        </div>
      )}

      {/* Main Diagram Canvas Area */}
      <div
        className={`relative overflow-auto bg-slate-50/40 p-6 flex items-center justify-center min-h-[360px] ${
          isFullscreen ? 'flex-1 min-h-0' : 'max-h-[580px]'
        }`}
      >
        {renderError ? (
          <div className="p-6 max-w-lg text-center bg-white border border-rose-200 rounded-xl">
            <p className="text-sm font-semibold text-rose-700 mb-1">Diagram Formatting Notice</p>
            <p className="text-xs text-slate-600 mb-3">{renderError}</p>
            <button
              onClick={() => setShowCode(true)}
              className="text-xs font-medium text-slate-900 underline"
            >
              Inspect Source Code
            </button>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 inline-block p-4"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Key Node Explanation Cards & Exam Significance */}
      {diagram.keyNodesExplaining && diagram.keyNodesExplaining.length > 0 && (
        <div className="px-6 py-5 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Key Concept Nodes & Exam Significance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diagram.keyNodesExplaining.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-slate-900">
                    {item.node}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-sky-50 text-sky-800">
                    Step {idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                  {item.explanation}
                </p>
                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-amber-800 font-medium flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold shrink-0">Exam Note:</span>
                  <span>{item.examSignificance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
