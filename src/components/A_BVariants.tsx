import React from 'react';
import { Copy, Check, Info, TrendingUp, Compass, HeartHandshake, Eye } from 'lucide-react';

interface ABVariantsProps {
  subjectLines: string[];
  previewTexts: string[];
  activeVariant: number;
  setActiveVariant: (idx: number) => void;
  predictedCTR?: string[];
  predictedOpenRate?: string[];
  predictedSentiment?: string[];
  spamSafeRating?: string[];
}

const HOOKS = [
  { type: 'Direct & Urgent', desc: 'Creates instant scarcity or clear direct utility. Perfect for promo sales and last-chance alerts.' },
  { type: 'Benefit-driven', desc: 'Focuses entirely on the ultimate gain, solution, or savings for the customer.' },
  { type: 'Curiosity Loop', desc: 'Uses psychological gaps or stories to entice readers to click open.' },
];

export default function ABVariants({ 
  subjectLines, 
  previewTexts, 
  activeVariant, 
  setActiveVariant,
  predictedCTR,
  predictedOpenRate,
  predictedSentiment,
  spamSafeRating
}: ABVariantsProps) {
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  const handleCopy = (subject: string, preview: string, idx: number) => {
    const textToCopy = `Subject: ${subject}\nPreheader: ${preview}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  // Safe fallback arrays for backward compatibility
  const fallbackCTR = ['4.1%', '6.5%', '3.2%'];
  const fallbackOpenRate = ['38.2%', '51.4%', '46.0%'];
  const fallbackSentiment = ['Urgency & Loss Aversion', 'Direct Benefit & Gain', 'Curiosity & Mystery Hook'];
  const fallbackSpamSafe = ['90% Safe', '100% Safe', '100% Safe'];

  return (
    <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-6 space-y-4" id="ab-testing-variants">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A]">01 / Copy Variants & Predictive Analytics</h3>
          <p className="text-[10px] text-slate-500 mt-0.5 font-serif italic">Select a copy hook variant below to see instant predictive performance grading and engagement scores.</p>
        </div>
        <span className="bg-[#FDFCFB] text-[#1A1A1A] text-[9px] font-bold px-2.5 py-1 rounded-none border border-[#1A1A1A]/10 flex items-center gap-1 uppercase tracking-wider">
          <Info className="w-2.5 h-2.5 text-[#1A1A1A]/60" />
          Predictive Grading Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HOOKS.map((hook, idx) => {
          const subject = subjectLines[idx] || 'Subject Line Variant';
          const preview = previewTexts[idx] || 'Preheader text variant description.';
          const isActive = activeVariant === idx;

          // Metrics resolve
          const ctr = (predictedCTR && predictedCTR[idx]) || fallbackCTR[idx];
          const openRate = (predictedOpenRate && predictedOpenRate[idx]) || fallbackOpenRate[idx];
          const sentiment = (predictedSentiment && predictedSentiment[idx]) || fallbackSentiment[idx];
          const spamSafe = (spamSafeRating && spamSafeRating[idx]) || fallbackSpamSafe[idx];

          return (
            <div
              key={hook.type}
              onClick={() => setActiveVariant(idx)}
              className={`p-5 rounded-none border text-left cursor-pointer transition-all relative flex flex-col justify-between group ${
                isActive
                  ? 'border-[#1A1A1A] bg-[#F9F7F2]'
                  : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 bg-[#FDFCFB]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-none ${
                    isActive ? 'bg-[#1A1A1A] text-white' : 'bg-[#E5E1D8] text-[#1A1A1A]'
                  }`}>
                    {hook.type}
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(subject, preview, idx);
                    }}
                    className="p-1 rounded-none hover:bg-[#E5E1D8]/40 text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    title="Copy both Subject and Preheader"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider">Subject Line</span>
                    <p className="font-serif text-xs italic font-medium text-[#1A1A1A] line-clamp-2 mt-0.5">"{subject}"</p>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wider">Preheader</span>
                    <p className="text-[11px] text-[#1A1A1A]/70 line-clamp-2 mt-0.5">{preview}</p>
                  </div>
                </div>
              </div>

              {/* Predictive Performance Panel */}
              <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10 space-y-2">
                <span className="text-[8px] font-black text-[#1A1A1A] block uppercase tracking-widest mb-1.5">Performance Forecast</span>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-white/65 p-1.5 border border-[#1A1A1A]/5 flex flex-col justify-center">
                    <span className="text-[8px] text-slate-400 flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5 text-slate-500" /> Open Rate
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-xs">{openRate}</span>
                  </div>
                  <div className="bg-white/65 p-1.5 border border-[#1A1A1A]/5 flex flex-col justify-center">
                    <span className="text-[8px] text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5 text-slate-500" /> CTR Goal
                    </span>
                    <span className="font-bold text-slate-800 font-mono text-xs">{ctr}</span>
                  </div>
                </div>

                <div className="text-[9px] flex items-center justify-between mt-1 text-[#1A1A1A]/80">
                  <span className="text-[8px] text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                    <Compass className="w-2.5 h-2.5 text-slate-500" /> Psychological Angle
                  </span>
                  <span className="font-medium font-serif italic text-right truncate max-w-[120px]">{sentiment}</span>
                </div>

                <div className="text-[9px] flex items-center justify-between mt-0.5 text-[#1A1A1A]/80">
                  <span className="text-[8px] text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                    <HeartHandshake className="w-2.5 h-2.5 text-slate-500" /> Deliver Safe
                  </span>
                  <span className="font-bold text-emerald-700 font-mono text-[9px]">{spamSafe}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1A1A1A]/5 text-[9px] text-slate-400 font-serif italic group-hover:text-[#1A1A1A]/60 line-clamp-2">
                {hook.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
