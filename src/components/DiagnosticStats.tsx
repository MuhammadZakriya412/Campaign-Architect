import React from 'react';
import { AlertTriangle, Clock, BookOpen, ThumbsUp, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';

interface DiagnosticStatsProps {
  spamScore: number;
  spamTriggers: string[];
  readabilityGrade: string;
  readTime: string;
  optimizationTips: string[];
}

export default function DiagnosticStats({
  spamScore,
  spamTriggers,
  readabilityGrade,
  readTime,
  optimizationTips,
}: DiagnosticStatsProps) {
  const [completedTips, setCompletedTips] = React.useState<Record<number, boolean>>({});
  const [isTipsExpanded, setIsTipsExpanded] = React.useState(false);
  const [isTriggersExpanded, setIsTriggersExpanded] = React.useState(false);

  const toggleTip = (idx: number) => {
    setCompletedTips((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Determine spam risk level
  const spamRisk = React.useMemo(() => {
    if (spamScore <= 3) return { label: 'Low Risk', color: 'text-emerald-700 border-emerald-200 bg-emerald-50', bar: 'bg-[#1A1A1A]' };
    if (spamScore <= 6) return { label: 'Moderate Risk', color: 'text-amber-700 border-amber-200 bg-amber-50', bar: 'bg-[#1A1A1A]' };
    return { label: 'High Risk', color: 'text-rose-700 border-rose-200 bg-rose-50', bar: 'bg-rose-600' };
  }, [spamScore]);

  // Limit displayed lists for collapsible behavior
  const visibleTips = isTipsExpanded ? optimizationTips : optimizationTips.slice(0, 3);
  const visibleTriggers = isTriggersExpanded ? spamTriggers : spamTriggers.slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min" id="diagnostic-performance-panel">
      {/* 1. Spam Score Meter */}
      <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-6 shadow-none text-left flex flex-col justify-between space-y-4 transition-all duration-300">
        <div>
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2 mb-3">
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#1A1A1A]/60" />
              01 / Spam Audit
            </h4>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-none border uppercase tracking-wider font-mono ${spamRisk.color}`}>
              {spamRisk.label}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Trigger Score</span>
              <span className="font-bold text-[#1A1A1A]">{spamScore} / 10</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#E5E1D8] rounded-none overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${spamRisk.bar}`}
                style={{ width: `${Math.max(spamScore * 10, 5)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest">Detected Triggers</span>
          {spamTriggers.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {visibleTriggers.map((word, idx) => (
                  <span key={idx} className="bg-[#F9F7F2] border border-[#1A1A1A]/10 text-[#1A1A1A] text-[9px] font-mono px-2 py-0.5 rounded-none">
                    {word}
                  </span>
                ))}
              </div>
              {spamTriggers.length > 5 && (
                <button
                  type="button"
                  onClick={() => setIsTriggersExpanded(!isTriggersExpanded)}
                  className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/65 hover:text-[#1A1A1A] transition-colors flex items-center gap-1 cursor-pointer pt-1"
                >
                  {isTriggersExpanded ? (
                    <>Show Less <ChevronUp className="w-2.5 h-2.5" /></>
                  ) : (
                    <>+ {spamTriggers.length - 5} More Triggers <ChevronDown className="w-2.5 h-2.5" /></>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-serif italic">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              Pristine draft copy. No spam metrics flagged.
            </p>
          )}
        </div>
      </div>

      {/* 2. Readability Stats */}
      <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-6 shadow-none text-left flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-1.5 border-b border-[#1A1A1A]/10 pb-2 mb-3">
            <BookOpen className="w-4 h-4 text-[#1A1A1A]/60" />
            02 / Readability & Timing
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FDFCFB] p-3 rounded-none border border-[#1A1A1A]/10">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest">Grade level</span>
              <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 mt-1 font-mono">
                <BookOpen className="w-4 h-4 text-[#1A1A1A]/40" />
                {readabilityGrade || 'Grade 6'}
              </span>
            </div>

            <div className="bg-[#FDFCFB] p-3 rounded-none border border-[#1A1A1A]/10">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest">Est. Read Time</span>
              <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5 mt-1 font-mono">
                <Clock className="w-4 h-4 text-[#1A1A1A]/40" />
                {readTime || '1 min'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-3 border-t border-[#1A1A1A]/10 pt-2 font-serif italic leading-relaxed">
          Best practice is drafting narrative copy at a 5th to 7th-grade readability level to optimize conversion on portable viewport devices.
        </p>
      </div>

      {/* 3. Actionable Checklist */}
      <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-6 shadow-none text-left flex flex-col justify-between space-y-4 transition-all duration-300">
        <div>
          <h4 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-1.5 border-b border-[#1A1A1A]/10 pb-2 mb-3">
            <CheckSquare className="w-4 h-4 text-[#1A1A1A]/60" />
            03 / Optimization Checklist
          </h4>

          <div className="space-y-2">
            {visibleTips.map((tip, idx) => {
              const isDone = completedTips[idx] || false;
              return (
                <div
                  key={idx}
                  onClick={() => toggleTip(idx)}
                  className={`flex items-start gap-2 p-2 rounded-none border cursor-pointer transition-colors ${
                    isDone 
                      ? 'bg-[#F9F7F2] border-[#1A1A1A]/10 text-slate-400' 
                      : 'bg-white border-[#1A1A1A]/10 text-[#1A1A1A] hover:bg-[#F9F7F2]'
                  }`}
                >
                  <span className="shrink-0 mt-0.5 text-[#1A1A1A]">
                    {isDone ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </span>
                  <span className={`text-[10px] leading-relaxed ${isDone ? 'line-through' : ''}`}>
                    {tip}
                  </span>
                </div>
              );
            })}

            {optimizationTips.length > 3 && (
              <button
                type="button"
                onClick={() => setIsTipsExpanded(!isTipsExpanded)}
                className="text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/65 hover:text-[#1A1A1A] transition-colors flex items-center gap-1 cursor-pointer pt-2"
              >
                {isTipsExpanded ? (
                  <>Show Less <ChevronUp className="w-2.5 h-2.5" /></>
                ) : (
                  <>+ {optimizationTips.length - 3} More Tips <ChevronDown className="w-2.5 h-2.5" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
