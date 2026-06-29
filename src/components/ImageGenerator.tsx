import React, { useEffect } from 'react';
import { Image, Sparkles, Sliders, RefreshCw, Layers, CheckCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageGeneratorProps {
  suggestedPrompt: string;
  onGenerateImage: (prompt: string, size: string, aspectRatio: string) => Promise<void>;
  isGenerating: boolean;
  generatedImages: string[];
  selectedImage: string | null;
  onSelectImage: (imageUrl: string) => void;
}

const RESOLUTIONS = [
  { id: '1K', name: '1K Standard', desc: '1024 x 1024 px' },
  { id: '2K', name: '2K High Definition', desc: '2048 x 2048 px' },
  { id: '4K', name: '4K Ultra HD', desc: '4096 x 4096 px' },
];

const ASPECT_RATIOS = [
  { id: '16:9', name: '16:9', desc: 'Banner' },
  { id: '4:3', name: '4:3', desc: 'Card' },
  { id: '1:1', name: '1:1', desc: 'Square' },
  { id: '9:16', name: '9:16', desc: 'Portrait' },
];

const STYLE_PRESETS = [
  { id: 'none', label: 'Default', keyword: '' },
  { id: 'minimalist', label: 'Line Art', keyword: 'Minimalist clean flat vector line art illustration, solid background, elegant' },
  { id: 'watercolor', label: 'Watercolor', keyword: 'Warm watercolor texture, hand-painted look, soft pastels' },
  { id: 'render', label: '3D Render', keyword: 'High-fidelity isometric 3D clay render, smooth surfaces, warm studio lighting' },
  { id: 'cinematic', label: 'Retro Film', keyword: 'Classic high-contrast warm film style, dramatic lighting, subtle organic grain' },
  { id: 'cosmic', label: 'Cosmic Slate', keyword: 'Dark cosmic theme, raw basalt slate, subtle glowing neon accent vector lines' },
];

export default function ImageGenerator({
  suggestedPrompt,
  onGenerateImage,
  isGenerating,
  generatedImages,
  selectedImage,
  onSelectImage,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = React.useState('');
  const [size, setSize] = React.useState('1K');
  const [aspectRatio, setAspectRatio] = React.useState('16:9');
  const [stylePreset, setStylePreset] = React.useState('none');
  const [isSizeOpen, setIsSizeOpen] = React.useState(false);

  // Auto-fill suggested prompt when it changes
  useEffect(() => {
    if (suggestedPrompt) {
      setPrompt(suggestedPrompt);
    }
  }, [suggestedPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const activeStyle = STYLE_PRESETS.find(p => p.id === stylePreset);
    const compiledPrompt = activeStyle && activeStyle.keyword
      ? `${prompt}. Style: ${activeStyle.keyword}`
      : prompt;

    onGenerateImage(compiledPrompt, size, aspectRatio);
  };

  return (
    <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-6 shadow-none space-y-5" id="image-generator-component">
      <div>
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-1.5 border-b border-[#1A1A1A]/10 pb-1.5">
          <Image className="w-4 h-4 text-[#1A1A1A]/60" />
          02 / HD Campaign Graphics
        </h3>
        <p className="text-[10px] text-slate-500 mt-1 font-serif italic">
          Generate campaign headers and custom-styled visuals to enhance reader engagement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Visual Art Direction</label>
          <textarea
            rows={3}
            required
            placeholder="Describe the aesthetic, e.g. Minimalist layout..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-none border border-[#1A1A1A]/15 focus:outline-none focus:border-[#1A1A1A]/40 bg-[#FDFCFB] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Size Custom Dropdown */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-[#1A1A1A]/60" />
              Size
            </label>
            <button
              type="button"
              onClick={() => setIsSizeOpen(!isSizeOpen)}
              className="w-full text-xs px-3 py-1.5 rounded-none border border-[#1A1A1A]/15 focus:outline-none bg-white font-mono text-[11px] h-[30px] flex items-center justify-between hover:bg-[#FDFCFB] transition-colors cursor-pointer"
            >
              <span>
                {size} ({size === '1K' ? '1024px' : size === '2K' ? '2048px' : '4096px'})
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSizeOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isSizeOpen && (
                <>
                  {/* Backdrop overlay for closing */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsSizeOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-0 right-0 mt-1 bg-white border border-[#1A1A1A] rounded-none shadow-lg z-50 overflow-hidden text-left"
                  >
                    {RESOLUTIONS.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => {
                          setSize(res.id);
                          setIsSizeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-mono flex flex-col hover:bg-[#F9F7F2] transition-colors border-b border-[#1A1A1A]/5 last:border-b-0 cursor-pointer ${
                          size === res.id ? 'bg-[#F9F7F2] font-bold' : ''
                        }`}
                      >
                        <span className="text-[#1A1A1A] font-bold">{res.name}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{res.desc}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Aspect Ratio Select */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#1A1A1A]/60" />
              Ratio
            </label>
            <div className="grid grid-cols-4 gap-1">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`py-1.5 rounded-none text-[10px] font-bold border transition-all h-[30px] flex items-center justify-center ${
                    aspectRatio === ratio.id
                      ? 'border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A]'
                      : 'border-[#1A1A1A]/10 bg-white text-slate-500 hover:text-[#1A1A1A]'
                  }`}
                  title={ratio.name}
                >
                  {ratio.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Artistic Style Preset Choice */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#1A1A1A]/60" />
            Art Style Preset
          </label>
          <div className="flex flex-wrap gap-1">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setStylePreset(preset.id)}
                className={`px-2.5 py-1 text-[9px] font-bold border rounded-none transition-all cursor-pointer ${
                  stylePreset === preset.id
                    ? 'border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A]'
                    : 'border-[#1A1A1A]/10 bg-white text-slate-500 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className={`relative overflow-hidden w-full py-2.5 px-4 rounded-none text-xs font-black uppercase tracking-[0.2em] text-white shadow-none flex items-center justify-center gap-1.5 transition-all group ${
            isGenerating
              ? 'bg-[#1A1A1A]/70 cursor-not-allowed'
              : 'bg-[#1A1A1A] hover:bg-black cursor-pointer'
          }`}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
          />
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.div>
              Rendering Graphic...
            </>
          ) : (
            <>
              <Image className="w-3.5 h-3.5" />
              Render Graphic
            </>
          )}
        </motion.button>
      </form>

      {/* Image Gallery */}
      {generatedImages.length > 0 && (
        <div className="space-y-2 border-t border-[#1A1A1A]/10 pt-4">
          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Creative Asset Gallery ({generatedImages.length})
          </label>
          <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-36 pr-1">
            {generatedImages.map((img, idx) => {
              const isSelected = selectedImage === img;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectImage(img)}
                  className={`aspect-video rounded-none overflow-hidden border cursor-pointer relative group transition-all ${
                    isSelected ? 'ring-2 ring-[#1A1A1A] border-[#1A1A1A]' : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
                  }`}
                >
                  <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#1A1A1A]/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white bg-[#1A1A1A] rounded-full shadow-md" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-[#1A1A1A]/80 text-white text-[8px] py-0.5 text-center uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Set Banner
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
