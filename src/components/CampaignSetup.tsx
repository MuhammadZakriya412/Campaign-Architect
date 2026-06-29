import React from 'react';
import { Mail, Sparkles, User, FileText, Gift, Palette, Volume2, Pin, PinOff, Minimize2, Maximize2, Sliders, EyeOff, FileInput, Loader2, Link2, CheckCircle2, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { CampaignTypePreset, TonePreset } from '../types';
import { UserAccount } from './AuthScreen';

interface CampaignSetupProps {
  onGenerate: (data: any) => void;
  isLoading: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onHide?: () => void;
  currentUser?: UserAccount | null;
}

const CAMPAIGN_PRESETS: CampaignTypePreset[] = [
  { id: 'welcome', name: 'Welcome Series', description: 'Introduce your brand and deliver your welcome offer.', icon: 'Mail' },
  { id: 'launch', name: 'Product Launch', description: 'Build anticipation and announce a new product/feature.', icon: 'Sparkles' },
  { id: 'newsletter', name: 'Weekly Newsletter', description: 'Curate industry updates, value, and brand stories.', icon: 'FileText' },
  { id: 'abandoned', name: 'Abandoned Cart', description: 'Recover lost sales by addressing customer hesitation.', icon: 'Gift' },
  { id: 'promo', name: 'Promo / Seasonal Sale', description: 'Promote a holiday, flash, or clearing discount.', icon: 'Tag' },
  { id: 'winback', name: 'Win-back Campaign', description: 'Re-engage cold subscribers with customized value.', icon: 'RefreshCw' },
  { id: 'event', name: 'Event Invitation', description: 'Drive RSVPs and signups for a webinar or live launch.', icon: 'Calendar' },
];

const TONE_PRESETS: TonePreset[] = [
  { id: 'friendly', name: 'Friendly & Casual', emoji: '😊', description: 'Approachable, warm, and conversational.' },
  { id: 'professional', name: 'Professional', emoji: '💼', description: 'Authoritative, clear, and trustworthy.' },
  { id: 'persuasive', name: 'Urgently Persuasive', emoji: '🔥', description: 'High-energy, benefit-focused, driving direct action.' },
  { id: 'bold', name: 'Direct & Bold', emoji: '🚀', description: 'Punchy, minimalist, and confident.' },
  { id: 'playful', name: 'Playful & Witty', emoji: '🤪', description: 'Lighthearted, humorous, and engaging.' },
];

const BRAND_COLORS = [
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Coral Red', hex: '#dc2626' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Slate', hex: '#475569' },
];

export default function CampaignSetup({ 
  onGenerate, 
  isLoading,
  isMinimized = false,
  onToggleMinimize,
  isPinned = true,
  onTogglePin,
  onHide,
  currentUser
}: CampaignSetupProps) {
  const [selectedType, setSelectedType] = React.useState('welcome');
  const [audience, setAudience] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [tone, setTone] = React.useState('friendly');
  const [extraOffer, setExtraOffer] = React.useState('');
  const [ctaLink, setCtaLink] = React.useState('https://example.com');
  const [brandingColor, setBrandingColor] = React.useState('#0284c7');
  const [customColor, setCustomColor] = React.useState('');
  const [copyLengthOption, setCopyLengthOption] = React.useState('medium');
  const [selectedElements, setSelectedElements] = React.useState<string[]>([]);
  const [autofilledFields, setAutofilledFields] = React.useState<string[]>([]);
  const [isImmersive, setIsImmersive] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState('gemma 4 26B');

  const handleAutofill = () => {
    const userKeySuffix = currentUser ? `_${currentUser.email}` : '';
    let storedProfile: any = null;
    try {
      const stored = localStorage.getItem(`campaign_user_profile${userKeySuffix}`);
      if (stored) {
        storedProfile = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored profile", e);
    }

    const defaultProfile = {
      targetAudience: "Discerning urban professionals valuing minimalism, craftsmanship, and tactile excellence.",
      brandVoice: "Understated, literary, warm, confident, and deeply narrative-focused.",
      valueProposition: "Bringing timeless aesthetic utility and tactile joy to modern everyday workspaces.",
      brandColor: "#7c3aed",
      keyProducts: "Hand-stitched vegetable-tanned desk pads, raw architectural brass pens, and heavy-linen archival notebooks."
    };

    const effectiveProfile = {
      targetAudience: storedProfile?.targetAudience || defaultProfile.targetAudience,
      keyProducts: storedProfile?.keyProducts || defaultProfile.keyProducts,
      valueProposition: storedProfile?.valueProposition || defaultProfile.valueProposition,
      brandColor: storedProfile?.brandColor || defaultProfile.brandColor,
      brandVoice: storedProfile?.brandVoice || defaultProfile.brandVoice
    };

    if (effectiveProfile.targetAudience) {
      setAudience(effectiveProfile.targetAudience);
      setAutofilledFields(prev => [...new Set([...prev, 'audience'])]);
    }
    
    const combinedDesc = [effectiveProfile.keyProducts, effectiveProfile.valueProposition].filter(Boolean).join(' - ');
    if (combinedDesc) {
      setDescription(combinedDesc);
      setAutofilledFields(prev => [...new Set([...prev, 'description'])]);
    }
    
    if (effectiveProfile.brandColor) {
      setBrandingColor(effectiveProfile.brandColor);
      setCustomColor('');
      setAutofilledFields(prev => [...new Set([...prev, 'color'])]);
    }
    
    if (effectiveProfile.brandVoice) {
      const lowerVoice = effectiveProfile.brandVoice.toLowerCase();
      if (lowerVoice.includes('bold') || lowerVoice.includes('direct')) {
        setTone('bold');
      } else if (lowerVoice.includes('professional') || lowerVoice.includes('authoritative')) {
        setTone('professional');
      } else if (lowerVoice.includes('playful') || lowerVoice.includes('witty') || lowerVoice.includes('humorous')) {
        setTone('playful');
      } else if (lowerVoice.includes('persuasive') || lowerVoice.includes('urgent')) {
        setTone('persuasive');
      } else {
        setTone('friendly');
      }
      setAutofilledFields(prev => [...new Set([...prev, 'tone'])]);
    }
  };

  const handleToggleElement = (element: string) => {
    if (selectedElements.includes(element)) {
      setSelectedElements(selectedElements.filter(e => e !== element));
    } else {
      setSelectedElements([...selectedElements, element]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audience.trim() || !description.trim()) return;
    
    onGenerate({
      campaignType: CAMPAIGN_PRESETS.find(p => p.id === selectedType)?.name || selectedType,
      audience,
      description,
      tone: TONE_PRESETS.find(t => t.id === tone)?.name || tone,
      extraOffer,
      ctaLink: ctaLink || 'https://example.com',
      brandingColor: customColor || brandingColor,
      copyLengthOption: copyLengthOption === 'short' ? 'Short & Punchy (under 100 words)' : copyLengthOption === 'long' ? 'Deep Editorial (250+ words)' : 'Medium Newsletter (100 - 250 words)',
      selectedElements: selectedElements.map(id => {
        if (id === 'faq') return 'Interactive FAQ Section';
        if (id === 'social') return 'Social Media Links block';
        if (id === 'table') return 'Product Benefits Comparison Table';
        if (id === 'unsubscribe') return 'Elegant Legal Unsubscribe Footer block';
        return id;
      }),
      isImmersive,
      selectedModel
    });
  };

  if (isMinimized) {
    return (
      <div className="bg-white p-5 rounded-none border border-[#1A1A1A]/10 text-left relative group flex items-center justify-between transition-all" id="campaign-setup-minimized">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#1A1A1A]/60" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">01 / Guidelines Engine</span>
        </div>
        
        {/* Hover Controls in Minimized Mode too! */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              className="p-1 border border-transparent hover:border-[#1A1A1A]/10 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              title="Hide Setup Panel Completely"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
          {onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 border transition-all ${
                isPinned ? 'border-[#1A1A1A]/10 bg-[#F9F7F2] text-[#1A1A1A]' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
              title={isPinned ? "Unpin Setup Panel" : "Pin Setup Panel"}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
          )}
          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="px-2 py-1 text-[9px] uppercase tracking-wider font-bold border border-[#1A1A1A]/15 bg-[#FDFCFB] text-slate-500 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] transition-colors cursor-pointer"
            >
              Expand
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-none border border-[#1A1A1A]/10 relative group" id="campaign-setup-form">
      {/* Absolute Hover Workspace Customization Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 bg-white/95 backdrop-blur-xs p-1 border border-[#1A1A1A]/10 shadow-xs">
        {onHide && (
          <button
            type="button"
            onClick={onHide}
            className="p-1 border border-transparent hover:border-[#1A1A1A]/10 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            title="Hide Setup Panel Completely"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        )}
        {onTogglePin && (
          <button
            type="button"
            onClick={onTogglePin}
            className={`p-1 border transition-all cursor-pointer ${
              isPinned ? 'border-[#1A1A1A]/10 bg-[#F9F7F2] text-[#1A1A1A]' : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
            title={isPinned ? "Unpin Setup Panel (Auto-collapses on generate)" : "Pin Setup Panel"}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
        )}
        {onToggleMinimize && (
          <button
            type="button"
            onClick={onToggleMinimize}
            className="p-1 border border-transparent hover:border-[#1A1A1A]/10 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            title="Minimize Setup Panel"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      {/* Brand Sync Toolbar (Phase 1) */}
      <div className="bg-[#E5E1D8]/20 border border-[#1A1A1A]/10 p-3 flex flex-col gap-2 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Brand Synchronization</span>
          <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 uppercase flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-serif italic">Accelerate your workflow by binding your saved Brand Intelligence to the active canvas.</p>
        
        <div className="grid grid-cols-1 gap-2 mt-1">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleAutofill}
            className="relative overflow-hidden flex items-center justify-center gap-1.5 py-2 bg-[#1A1A1A] text-white hover:bg-black text-[9px] uppercase font-bold tracking-wider transition-colors cursor-pointer group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
            />
            Load Brand Defaults
          </motion.button>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3 flex items-center gap-2 border-b border-[#1A1A1A]/10 pb-1.5">
          <Mail className="w-4 h-4 text-[#1A1A1A]/60" />
          01 / Campaign Type
        </h3>
        <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
          {CAMPAIGN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedType(preset.id)}
              className={`text-left p-3 rounded-none border text-xs transition-all flex flex-col ${
                selectedType === preset.id
                  ? 'border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A]'
                  : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 text-[#1A1A1A]/80 hover:bg-[#FDFCFB]'
              }`}
            >
              <span className="font-bold tracking-tight">{preset.name}</span>
              <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#1A1A1A]/10 pb-1.5">
          <User className="w-4 h-4 text-[#1A1A1A]/60" />
          02 / Core Details
        </h3>
        
        <div>
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">
            Target Audience Segment
            {autofilledFields.includes('audience') && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-[8px] text-[#7c3aed] bg-[#7c3aed]/10 px-1.5 py-0.5 rounded-sm"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                Auto-Synced
              </motion.span>
            )}
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Eco-conscious millenial pet owners"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-none border border-[#1A1A1A]/15 focus:outline-none focus:border-[#1A1A1A]/40 bg-[#FDFCFB]"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">
            Product, Offer, or Event Description
            {autofilledFields.includes('description') && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-[8px] text-[#7c3aed] bg-[#7c3aed]/10 px-1.5 py-0.5 rounded-sm"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                Auto-Synced
              </motion.span>
            )}
          </label>
          <textarea
            required
            rows={3}
            placeholder="e.g. Announcing our new dog leash..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-none border border-[#1A1A1A]/15 focus:outline-none focus:border-[#1A1A1A]/40 bg-[#FDFCFB] resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Special Code or Link CTA (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Use code ECOPUP for 15% off..."
            value={extraOffer}
            onChange={(e) => setExtraOffer(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-none border border-[#1A1A1A]/15 focus:outline-none focus:border-[#1A1A1A]/40 bg-[#FDFCFB]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Primary CTA Link URL</label>
          <input
            type="url"
            placeholder="e.g. https://yourbrand.com/claim-keyboard"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-none border border-[#1A1A1A]/15 focus:outline-none focus:border-[#1A1A1A]/40 bg-[#FDFCFB]"
          />
        </div>

        {/* Dynamic Formatting Density Controls */}
        <div className="pt-2 border-t border-[#1A1A1A]/5">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Copy Density & Length</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'short', label: 'Punchy', desc: '< 100 words' },
              { id: 'medium', label: 'Balanced', desc: '100-250' },
              { id: 'long', label: 'Editorial', desc: '250+ words' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCopyLengthOption(opt.id)}
                className={`p-2 border text-center transition-all flex flex-col items-center justify-center rounded-none cursor-pointer ${
                  copyLengthOption === opt.id
                    ? 'border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A]'
                    : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20 text-[#1A1A1A]/70 bg-white'
                }`}
              >
                <span className="text-[11px] font-bold tracking-tight">{opt.label}</span>
                <span className="text-[8px] text-slate-400 font-mono mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Layout Blocks Selectors */}
        <div className="pt-2 border-t border-[#1A1A1A]/5">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Include Structure Components</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'faq', label: 'FAQ Accordion' },
              { id: 'table', label: 'Benefits Table' },
              { id: 'social', label: 'Social Follow block' },
              { id: 'unsubscribe', label: 'Unsubscribe Footer' },
            ].map((blk) => {
              const isChecked = selectedElements.includes(blk.id);
              return (
                <button
                  key={blk.id}
                  type="button"
                  onClick={() => handleToggleElement(blk.id)}
                  className={`p-2 border text-left transition-all flex items-center gap-2 rounded-none text-[10px] font-bold tracking-tight cursor-pointer ${
                    isChecked
                      ? 'border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A]'
                      : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20 text-[#1A1A1A]/70 bg-white'
                  }`}
                >
                  <div className={`w-3 h-3 border flex items-center justify-center shrink-0 ${
                    isChecked ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-[#1A1A1A]/30 bg-white'
                  }`}>
                    {isChecked && <span className="text-white text-[8px]">✓</span>}
                  </div>
                  <span>{blk.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3 flex items-center gap-2 border-b border-[#1A1A1A]/10 pb-1.5">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#1A1A1A]/60" />
            03 / Tone of Voice
          </div>
          {autofilledFields.includes('tone') && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-[8px] text-[#7c3aed] bg-[#7c3aed]/10 px-1.5 py-0.5 rounded-sm ml-auto"
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              Auto-Synced
            </motion.span>
          )}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {TONE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTone(preset.id)}
              className={`px-3 py-1.5 rounded-none text-[11px] font-medium border transition-all flex items-center gap-1 ${
                tone === preset.id
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xs'
                  : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 bg-white text-[#1A1A1A]'
              }`}
              title={preset.description}
            >
              <span>{preset.emoji}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3 flex items-center gap-2 border-b border-[#1A1A1A]/10 pb-1.5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#1A1A1A]/60" />
            04 / Brand Accent Color
          </div>
          {autofilledFields.includes('color') && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-[8px] text-[#7c3aed] bg-[#7c3aed]/10 px-1.5 py-0.5 rounded-sm ml-auto"
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              Auto-Synced
            </motion.span>
          )}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {BRAND_COLORS.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => {
                setBrandingColor(color.hex);
                setCustomColor('');
              }}
              style={{ backgroundColor: color.hex }}
              className={`w-6 h-6 rounded-none border transition-all ${
                brandingColor === color.hex && !customColor
                  ? 'border-[#1A1A1A] scale-110 ring-1 ring-[#1A1A1A]'
                  : 'border-transparent hover:scale-105'
              }`}
              title={color.name}
            />
          ))}
          <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-[#1A1A1A]/10">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Custom:</span>
            <input
              type="color"
              value={customColor || brandingColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
              }}
              className="w-6 h-6 p-0 border border-[#1A1A1A]/10 rounded-none cursor-pointer bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-indigo-50/50 border border-indigo-100 mb-2">
        <input
          type="checkbox"
          id="immersive-toggle"
          checked={isImmersive}
          onChange={(e) => setIsImmersive(e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="immersive-toggle" className="text-[10px] text-indigo-900 font-bold uppercase tracking-widest cursor-pointer select-none flex flex-col">
          <span>Enable Immersive Details</span>
          <span className="text-[9px] text-indigo-500 normal-case font-serif tracking-normal mt-0.5">Generate highly detailed, visually stunning content</span>
        </label>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={isLoading || !audience.trim() || !description.trim()}
        className={`relative overflow-hidden w-full py-3 px-4 rounded-none text-xs font-black uppercase tracking-[0.2em] text-white transition-all flex items-center justify-center gap-2 group ${
          isLoading
            ? 'bg-[#1A1A1A]/70 cursor-not-allowed'
            : 'bg-[#1A1A1A] hover:bg-black cursor-pointer'
        }`}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
        />
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-4 h-4" />
          </motion.div>
        )}
        {isLoading ? 'Crafting Strategy...' : 'Generate Campaign'}
      </motion.button>
    </form>
  );
}
