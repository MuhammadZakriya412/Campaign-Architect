import React, { useRef, useEffect } from 'react';
import { Monitor, Smartphone, Code, FileText, Copy, Check, Eye, Sliders, Type, AlignJustify, Square, Maximize2, Minimize2 } from 'lucide-react';

interface EmailPreviewProps {
  html: string;
  markdown: string;
  activeSubject: string;
  activePreheader: string;
  bannerImage?: string;
  brandingColor: string;
}

export default function EmailPreview({
  html,
  markdown,
  activeSubject,
  activePreheader,
  bannerImage,
  brandingColor,
}: EmailPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<'preview' | 'html' | 'text'>('preview');
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  
  // Interactive Style States
  const [fontFamily, setFontFamily] = React.useState<'sans' | 'serif' | 'mono'>('sans');
  const [padding, setPadding] = React.useState<'compact' | 'standard' | 'editorial'>('standard');
  const [borderRadius, setBorderRadius] = React.useState<'sharp' | 'rounded' | 'soft'>('rounded');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fallback image when no AI image is generated
  const currentBanner = bannerImage || `https://picsum.photos/seed/campaign-${brandingColor.replace('#', '')}/1200/500`;

  // Swap placeholder in HTML
  const finalHtml = React.useMemo(() => {
    if (!html) return '';
    return html.replace(/\[HEADER_IMAGE\]/g, currentBanner);
  }, [html, currentBanner]);

  // Style properties calculation
  const styleFont = fontFamily === 'serif' 
    ? 'Georgia, Cambria, serif' 
    : fontFamily === 'mono' 
      ? 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace' 
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const stylePadding = padding === 'compact' ? '12px' : padding === 'editorial' ? '36px' : '24px';
  const styleRadius = borderRadius === 'sharp' ? '0px' : borderRadius === 'soft' ? '24px' : '12px';

  // Update iframe contents
  useEffect(() => {
    if (activeTab === 'preview' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: ${stylePadding};
                  background-color: #f8fafc;
                  font-family: ${styleFont};
                }
                .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: ${styleRadius};
                  overflow: hidden;
                  border: 1px solid #e2e8f0;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
                  padding: 32px;
                  box-sizing: border-box;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  display: block;
                  border-radius: ${styleRadius === '0px' ? '0px' : '6px'};
                  margin-bottom: 24px;
                }
                /* Elegant default typography & spacing */
                p {
                  margin-top: 0;
                  margin-bottom: 20px !important;
                  line-height: 1.7 !important;
                  font-size: 15px !important;
                  color: #334155 !important;
                }
                h1, h2, h3, h4 {
                  margin-top: 28px !important;
                  margin-bottom: 14px !important;
                  line-height: 1.35 !important;
                  color: #1e293b !important;
                  font-weight: 700 !important;
                }
                ul, ol {
                  margin-top: 0;
                  margin-bottom: 20px !important;
                  padding-left: 20px !important;
                }
                li {
                  margin-bottom: 8px !important;
                  line-height: 1.6 !important;
                  font-size: 15px !important;
                  color: #334155 !important;
                }
                /* Enforce interactive styling variables throughout */
                body, p, div, h1, h2, h3, h4, a, li, span, b, i {
                  font-family: ${styleFont} !important;
                }
                /* Prevent links/buttons clicks in preview */
                a, button, [role="button"], input[type="submit"] {
                  pointer-events: none !important;
                  cursor: default !important;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                ${finalHtml}
              </div>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [finalHtml, activeTab, styleFont, stylePadding, styleRadius, isFullScreen]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'html' ? finalHtml : markdown;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!html) {
    return (
      <div className="bg-white border border-dashed border-[#1A1A1A]/20 rounded-none h-[500px] flex flex-col items-center justify-center text-center p-6" id="empty-preview-container">
        <Eye className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">No Campaign Generated</p>
        <p className="text-xs font-serif italic text-slate-500 max-w-sm mt-1.5">
          Select campaign parameters or fill one of our prompt templates to render responsive HTML copy instantly.
        </p>
      </div>
    );
  }

  // Pure Fullscreen mode for the Live Card preview only (completely distraction-free)
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex flex-col p-4 md:p-8 animate-fadeIn h-screen w-screen" id="email-preview-fullscreen-mode">
        {/* Immersive Toolbar */}
        <div className="w-full max-w-4xl mx-auto bg-white border border-[#1A1A1A] p-4 flex items-center justify-between shadow-md mb-4 shrink-0">
          <div className="text-left">
            <span className="text-[8px] uppercase tracking-widest font-black text-slate-400 block font-mono">Live Card Fullscreen View</span>
            <span className="font-serif italic text-[11px] font-semibold text-[#1A1A1A] line-clamp-1">"{activeSubject}"</span>
          </div>
          <div className="flex items-center gap-4">
            {/* View Mode */}
            <div className="flex items-center gap-1 bg-[#E5E1D8]/30 p-0.5 rounded-none border border-[#1A1A1A]/10">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                  viewMode === 'desktop' ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/10' : 'text-slate-400 hover:text-[#1A1A1A]'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                  viewMode === 'mobile' ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/10' : 'text-slate-400 hover:text-[#1A1A1A]'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
              onClick={() => setIsFullScreen(false)}
              className="font-sans font-black uppercase tracking-widest text-[9px] text-white hover:bg-black bg-[#1A1A1A] px-4 py-2 border border-[#1A1A1A] transition-colors cursor-pointer"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>

        {/* Live Card Viewport */}
        <div className="flex-1 w-full max-w-4xl mx-auto flex justify-center items-start overflow-hidden">
          <div
            className={`transition-all duration-300 w-full h-full bg-white border border-[#1A1A1A] shadow-2xl flex justify-center ${
              viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[640px]'
            }`}
          >
            <iframe
              ref={iframeRef}
              title="Email Template Live Preview Fullscreen"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-none border border-[#1A1A1A]/10 shadow-none overflow-hidden flex flex-col h-[580px]"
      id="email-preview-component"
    >
      {/* Tab controls & Preview settings */}
      <div className="bg-[#FDFCFB] border-b border-[#1A1A1A]/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-[#E5E1D8]/40 p-1 rounded-none border border-[#1A1A1A]/10">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-none text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 shadow-xs'
                : 'text-slate-500 hover:text-[#1A1A1A]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`px-3 py-1 rounded-none text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'html'
                ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 shadow-xs'
                : 'text-slate-500 hover:text-[#1A1A1A]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            HTML Code
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1 rounded-none text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/10 shadow-xs'
                : 'text-slate-500 hover:text-[#1A1A1A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Markdown
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 bg-[#E5E1D8]/30 p-0.5 rounded-none border border-[#1A1A1A]/10">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                  viewMode === 'desktop' ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/10' : 'text-slate-400 hover:text-[#1A1A1A]'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-none transition-colors cursor-pointer ${
                  viewMode === 'mobile' ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/10' : 'text-slate-400 hover:text-[#1A1A1A]'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-1.5 rounded-none border border-[#1A1A1A]/15 text-slate-500 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] transition-all cursor-pointer flex items-center justify-center ${
              isFullScreen ? 'bg-[#1A1A1A] text-white hover:bg-black border-[#1A1A1A]' : 'bg-white'
            }`}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen / Detached Mode"}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {activeTab !== 'preview' && (
            <button
              onClick={handleCopy}
              className="bg-[#1A1A1A] hover:bg-black text-white font-bold py-1 px-3 rounded-none text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : `Copy ${activeTab === 'html' ? 'HTML' : 'Markdown'}`}
            </button>
          )}
        </div>
      </div>

      {/* Email Inbox mock header */}
      <div className="border-b border-[#1A1A1A]/10 p-4 space-y-1.5 bg-[#F9F7F2] text-left">
        <div className="flex items-start text-xs gap-1.5">
          <span className="font-bold text-slate-400 w-16 shrink-0 uppercase tracking-widest text-[9px]">From:</span>
          <span className="text-slate-700 font-bold text-[11px]">Campaign Architect <code className="bg-white/70 px-1 py-0.2 rounded-none border border-[#1A1A1A]/5 text-[10px] font-mono">ai-campaign@workspace.internal</code></span>
        </div>
        <div className="flex items-start text-xs gap-1.5">
          <span className="font-bold text-slate-400 w-16 shrink-0 uppercase tracking-widest text-[9px]">To:</span>
          <span className="text-slate-600 font-medium text-[11px]">customer@segment-preview.internal</span>
        </div>
        <div className="flex items-start text-xs gap-1.5">
          <span className="font-bold text-slate-400 w-16 shrink-0 uppercase tracking-widest text-[9px]">Subject:</span>
          <span className="text-[#1A1A1A] font-serif italic text-xs font-semibold line-clamp-1">{activeSubject || 'Active Campaign Subject'}</span>
        </div>
        <div className="flex items-start text-[11px] gap-1.5">
          <span className="font-bold text-slate-400 w-16 shrink-0 uppercase tracking-widest text-[9px]">Preheader:</span>
          <span className="text-slate-500 font-serif italic line-clamp-1">{activePreheader || 'Campaign preheader...'}</span>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 bg-[#FDFCFB]/80 overflow-y-auto p-4 flex flex-col justify-between items-stretch">
        <div className="flex-1 flex justify-center items-start overflow-hidden">
          {activeTab === 'preview' ? (
            <div
              className={`transition-all duration-300 w-full h-full flex justify-center ${
                viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[640px]'
              }`}
            >
              <iframe
                ref={iframeRef}
                title="Email Template Live Preview"
                className="w-full h-full border border-[#1A1A1A]/10 rounded-none bg-white overflow-hidden shadow-none"
              />
            </div>
          ) : activeTab === 'html' ? (
            <pre className="w-full h-full bg-[#1D1C1A] text-[#F9F7F2] p-5 rounded-none text-[10px] font-mono overflow-auto text-left border border-[#1A1A1A]/20">
              <code>{finalHtml}</code>
            </pre>
          ) : (
            <div className="w-full h-full bg-white p-6 rounded-none border border-[#1A1A1A]/10 text-left overflow-y-auto prose prose-sm text-xs text-[#1A1A1A]/90">
              <h1 className="font-serif text-lg italic text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2 mb-3">"{activeSubject}"</h1>
              <p className="text-[10px] text-slate-400 italic mb-4 font-serif">Preheader: {activePreheader}</p>
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{markdown}</div>
            </div>
          )}
        </div>

        {/* Dynamic Styling Toolbar Panel */}
        {activeTab === 'preview' && (
          <div className="mt-3 p-3 bg-[#FDFCFB] border border-[#1A1A1A]/10 rounded-none flex flex-wrap items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
              <span className="text-[9px] uppercase tracking-widest font-black text-[#1A1A1A]">Sandbox Styling Options</span>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Font selector */}
              <div className="flex items-center gap-1.5">
                <Type className="w-3 h-3 text-slate-400" />
                <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Typography:</span>
                <div className="flex gap-1 text-[9px] bg-[#E5E1D8]/40 p-0.5 border border-[#1A1A1A]/10">
                  {(['sans', 'serif', 'mono'] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`px-1.5 py-0.5 rounded-none font-bold capitalize cursor-pointer ${
                        fontFamily === font ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-xs' : 'text-slate-400 hover:text-[#1A1A1A]'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing selector */}
              <div className="flex items-center gap-1.5">
                <AlignJustify className="w-3 h-3 text-slate-400" />
                <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Spacing:</span>
                <div className="flex gap-1 text-[9px] bg-[#E5E1D8]/40 p-0.5 border border-[#1A1A1A]/10">
                  {(['compact', 'standard', 'editorial'] as const).map((space) => (
                    <button
                      key={space}
                      onClick={() => setPadding(space)}
                      className={`px-1.5 py-0.5 rounded-none font-bold capitalize cursor-pointer ${
                        padding === space ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-xs' : 'text-slate-400 hover:text-[#1A1A1A]'
                      }`}
                    >
                      {space === 'compact' ? 'Tight' : space === 'editorial' ? 'Spacious' : 'Mid'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corner style selector */}
              <div className="flex items-center gap-1.5">
                <Square className="w-3 h-3 text-slate-400" />
                <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400">Corners:</span>
                <div className="flex gap-1 text-[9px] bg-[#E5E1D8]/40 p-0.5 border border-[#1A1A1A]/10">
                  {(['sharp', 'rounded', 'soft'] as const).map((corner) => (
                    <button
                      key={corner}
                      onClick={() => setBorderRadius(corner)}
                      className={`px-1.5 py-0.5 rounded-none font-bold capitalize cursor-pointer ${
                        borderRadius === corner ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-xs' : 'text-slate-400 hover:text-[#1A1A1A]'
                      }`}
                    >
                      {corner}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
