import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Sparkles, Cpu, Layers, Bookmark, ChevronRight, 
  ExternalLink, CheckCircle2, ShieldCheck, Mail, Sliders, Zap, 
  Info, ArrowUpRight, Award, Flame, RefreshCw, BarChart2, Eye, History, HelpCircle
} from 'lucide-react';

export default function DocsPage() {
  const [activeSubTab, setActiveSubTab] = useState<'about' | 'features'>('about');
  const [selectedQuickLink, setSelectedQuickLink] = useState<string>('');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSelectedQuickLink(id);
    }
  };

  const aboutQuickLinks = [
    { id: 'project-vision', label: '01 / Vision & Mission' },
    { id: 'problem-statement', label: '02 / The Copywriter Dilemma' },
    { id: 'solution-overview', label: '03 / Architectural Blueprint' },
    { id: 'target-audience', label: '04 / Ideal Target Profiles' },
    { id: 'tech-stack', label: '05 / Elite Tech Stack' },
  ];

  const featuresQuickLinks = [
    { id: 'setup-engine', label: '01 / AI Setup Panel' },
    { id: 'brand-intelligence', label: '02 / Brand Sync Engine' },
    { id: 'ab-variants', label: '03 / A/B Testing Suite' },
    { id: 'preview-sandbox', label: '04 / Interactive Sandbox' },
    { id: 'banner-studio', label: '05 / Banner Studio' },
    { id: 'diagnostics-suite', label: '06 / Copy Screener' },
    { id: 'triple-agent-chat', label: '07 / Triple-Agent Bot' },
    { id: 'history-logs', label: '08 / Offline Archiver' },
    { id: 'quota-resilience', label: '09 / Fail-Safe Cascade' },
    { id: 'account-auth', label: '10 / Authentication System' },
  ];

  return (
    <div className="bg-white border border-[#1A1A1A]/10 min-h-[600px] text-left grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-sm">
      
      {/* 1. Docs Left-side Navigation Sidebar */}
      <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#1A1A1A]/10 bg-[#FDFCFB] p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#1A1A1A]/10">
            <div className="w-8 h-8 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center font-serif italic text-base">
              D
            </div>
            <div>
              <span className="font-serif italic text-base font-bold text-[#1A1A1A] block">Knowledge Portal</span>
              <span className="text-[9px] text-slate-400 font-mono tracking-widest block uppercase">Campaign Architect</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => { setActiveSubTab('about'); setSelectedQuickLink(''); }}
              className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold flex items-center justify-between group relative transition-all duration-300 ${
                activeSubTab === 'about' ? 'text-[#1A1A1A]' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <Info className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                About & Concept
              </span>
              <ChevronRight className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 ${activeSubTab === 'about' ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:opacity-100'}`} />
              {activeSubTab === 'about' && (
                <motion.div 
                  layoutId="activeSubTabBg" 
                  className="absolute inset-0 bg-[#F9F7F2] border-l-2 border-[#1A1A1A]" 
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>

            <button
              onClick={() => { setActiveSubTab('features'); setSelectedQuickLink(''); }}
              className={`w-full text-left px-4 py-3 text-xs uppercase tracking-widest font-bold flex items-center justify-between group relative transition-all duration-300 ${
                activeSubTab === 'features' ? 'text-[#1A1A1A]' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <Award className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                Features Catalog
              </span>
              <ChevronRight className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 ${activeSubTab === 'features' ? 'translate-x-0' : '-translate-x-1 opacity-0 group-hover:opacity-100'}`} />
              {activeSubTab === 'features' && (
                <motion.div 
                  layoutId="activeSubTabBg" 
                  className="absolute inset-0 bg-[#F9F7F2] border-l-2 border-[#1A1A1A]" 
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Brand/System Metadata details aligned with editorial design */}
        <div className="mt-8 pt-4 border-t border-[#1A1A1A]/10 text-[9px] font-mono text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>VERSION</span>
            <span className="font-bold text-[#1A1A1A]/70">v1.2.4</span>
          </div>
          <div className="flex justify-between">
            <span>RELEASE</span>
            <span className="font-bold text-[#1A1A1A]/70">JUNE 2026</span>
          </div>
          <div className="flex justify-between">
            <span>STATUS</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main content reading canvas (lg:col-span-7) */}
      <div className="lg:col-span-7 p-6 lg:p-10 overflow-y-auto max-h-[800px] scroll-smooth">
        <AnimatePresence mode="wait">
          {activeSubTab === 'about' ? (
            <motion.div
              key="about-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              {/* Header */}
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono">Section 01 / Overview</span>
                <h1 className="font-serif text-4xl tracking-tight text-[#1A1A1A] mt-2 mb-4 leading-tight">
                  The Copywriting Paradigm Shift
                </h1>
                <p className="font-serif italic text-base text-slate-600 leading-relaxed">
                  "Traditional email campaigns rely on guesswork. Campaign Architect employs a cohesive, unified, deep-learning pipeline to construct perfectly balanced, audience-specific copies with built-in visual synergy."
                </p>
              </div>

              {/* Sub-section 1: Vision */}
              <section id="project-vision" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  01 / Vision & Mission Statement
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    <strong>Campaign Architect</strong> was designed to remove friction from email production. Before this system, executing an email marketing push required bouncing between five distinct environments: formulating strategies in spreadsheets, sketching outlines in collaborative documents, compiling lists in marketing logs, styling responsive frames with template makers, and generating creative header visuals using disparate assets.
                  </p>
                  <p>
                    We have consolidated this pipeline into a high-performance, single-view canvas. By dynamically connecting content copywriting, image styling, automated analytics testing, and collaborative AI strategy consultancies, the suite empowers product teams to transition from concept ideation to high-converting exports inside a unified space.
                  </p>
                </div>
              </section>

              {/* Sub-section 2: Problem Space */}
              <section id="problem-statement" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  02 / The Copywriter Dilemma & The Spam Trap
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    Even the most creative email drafts frequently fail because of three industry-wide obstacles:
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <div>
                        <strong>ESPs Firewalling (Spam Filter Traps)</strong>: Automated filters instantly intercept copy containing hyper-urgent phrases, high density capitalization, or over-hyped marketing flags (e.g. "Instant Earnings!", "100% Free!").
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <div>
                        <strong>Unified Copy Fallacy</strong>: Writing a single, rigid email blast overlooks buyer psychology variations. Conversions require subtle angles tailored to price sensitivity, curiosity, technical clarity, or brand value.
                      </div>
                    </li>
                    <li className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <div>
                        <strong>Visual-Textual Disconnect</strong>: A mismatched header banner creates immediate friction. Layouts need matching branding tones, color palettes, and thematic styles to retain reader focus.
                      </div>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Sub-section 3: Solution Overview */}
              <section id="solution-overview" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  03 / Architectural Blueprint
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    Campaign Architect addresses these dilemmas with a high-fidelity workspace:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                    <div className="p-4 bg-[#F9F7F2]/50 border border-[#1A1A1A]/10 rounded-none hover:border-[#1A1A1A]/30 transition-colors">
                      <h4 className="font-serif italic font-bold text-[#1A1A1A] text-sm mb-1">Dual-Pass Generative Compiler</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Compiles high-quality content variants side-by-side with semantic diagnostic checks to bypass spam filters while maintaining high click-through appeal.
                      </p>
                    </div>
                    <div className="p-4 bg-[#F9F7F2]/50 border border-[#1A1A1A]/10 rounded-none hover:border-[#1A1A1A]/30 transition-colors">
                      <h4 className="font-serif italic font-bold text-[#1A1A1A] text-sm mb-1">Visual Asset Synchronization</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Synthesizes contextual visual prompts to spawn precise high-resolution headers that dynamically lock to the campaign's custom brand coloring scheme.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sub-section 4: Target Audience */}
              <section id="target-audience" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  04 / Ideal Target Profiles
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    The platform is calibrated for teams requiring rapid, bulletproof deployments:
                  </p>
                  <div className="space-y-2">
                    <div className="border border-[#1A1A1A]/10 p-3 flex.col bg-[#FDFCFB]">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#1A1A1A]/60 block">Cohort A / SaaS Founders & Operators</span>
                      <p className="text-slate-600 mt-1">Deploying transaction notification templates, new feature alerts, and subscription recovery sequences designed to mitigate churn.</p>
                    </div>
                    <div className="border border-[#1A1A1A]/10 p-3 flex.col bg-[#FDFCFB]">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#1A1A1A]/60 block">Cohort B / E-Commerce Growth Teams</span>
                      <p className="text-slate-600 mt-1">Accelerating the output of abandoned cart reminders, flash discount alerts, and product launches styled with consistent brand themes.</p>
                    </div>
                    <div className="border border-[#1A1A1A]/10 p-3 flex.col bg-[#FDFCFB]">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#1A1A1A]/60 block">Cohort C / Copywriting & Creative Agencies</span>
                      <p className="text-slate-600 mt-1">Bypassing writer's block by using structured diagnostic frameworks and multi-turn expert chatbots to validate copy deliverability.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sub-section 5: Tech Stack */}
              <section id="tech-stack" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  05 / Elite Tech Stack Specifications
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-sans">
                  <p>The workspace engine runs on a robust, lightweight foundation built for split-second updates:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mt-3">
                    <div className="p-3 bg-[#FDFCFB] border border-[#1A1A1A]/10">
                      <span className="font-mono text-sm font-bold block text-[#1A1A1A]">React 18</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block mt-1">Rendering Engine</span>
                    </div>
                    <div className="p-3 bg-[#FDFCFB] border border-[#1A1A1A]/10">
                      <span className="font-mono text-sm font-bold block text-[#1A1A1A]">Vite</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block mt-1">Build Pipeline</span>
                    </div>
                    <div className="p-3 bg-[#FDFCFB] border border-[#1A1A1A]/10">
                      <span className="font-mono text-sm font-bold block text-[#1A1A1A]">Tailwind 4</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block mt-1">Style Core</span>
                    </div>
                    <div className="p-3 bg-[#FDFCFB] border border-[#1A1A1A]/10">
                      <span className="font-mono text-sm font-bold block text-[#1A1A1A]">Gemini</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block mt-1">AI Cores</span>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="features-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              {/* Header */}
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono">Section 02 / Features Catalog</span>
                <h1 className="font-serif text-4xl tracking-tight text-[#1A1A1A] mt-2 mb-4 leading-tight">
                  Core Feature Manual & Explanations
                </h1>
                <p className="font-serif italic text-base text-slate-600 leading-relaxed font-sans">
                  Explore detailed explanations of every single functional layer currently configured and operational inside the application.
                </p>
              </div>

              {/* Feature 1: Setup Panel */}
              <section id="setup-engine" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#1A1A1A]/70" />
                  01 / AI Campaign Customizer & Setup Panel
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    The control panel translates user parameters into optimized generative blueprints. It supports six specific campaign blueprints:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <li className="p-2.5 bg-[#FDFCFB] border border-[#1A1A1A]/10"><span className="font-bold text-[#1A1A1A]">Product Launch</span>: Engineered for narrative hooks, feature breakdowns, and CTA placements.</li>
                    <li className="p-2.5 bg-[#FDFCFB] border border-[#1A1A1A]/10"><span className="font-bold text-[#1A1A1A]">Welcome Series</span>: Designed to drive user onboarding and establish consistent brand trust.</li>
                    <li className="p-2.5 bg-[#FDFCFB] border border-[#1A1A1A]/10"><span className="font-bold text-[#1A1A1A]">Educational Newsletter</span>: Focuses on structured reading flows and text density.</li>
                    <li className="p-2.5 bg-[#FDFCFB] border border-[#1A1A1A]/10"><span className="font-bold text-[#1A1A1A]">Cart Recovery Flow</span>: Uses targeted, friction-free incentives to win back abandoned carts.</li>
                    <li className="p-2.5 bg-[#FDFCFB] border border-[#1A1A1A]/10"><span className="font-bold text-[#1A1A1A]">Seasonal Sales Push</span>: Emphasizes limited-time deadlines and strong value offers.</li>
                    <li className="p-2.5 bg-[#FDFCFB] border border-[#1A1A1A]/10"><span className="font-bold text-[#1A1A1A]">VIP Event Invitation</span>: Styled with elegant, high-contrast display typography to project exclusivity.</li>
                  </ul>
                  
                  <div className="p-4 bg-[#F9F7F2]/70 border border-[#1A1A1A]/15 rounded-none space-y-2 mt-2">
                    <h4 className="font-bold font-serif italic text-xs text-[#1A1A1A]">Fine-Grained Copy Customization Engine</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      We have incorporated precision customization parameters inside the core setup panel:
                    </p>
                    <ul className="list-disc pl-4 space-y-2 text-[11px] text-slate-500">
                      <li><strong>Precise Copy Length Constraints</strong>: Instructs the model to restrict copywriting to specific bounds:
                        <ul className="list-disc pl-4 mt-1 space-y-1 text-[#1A1A1A]/70">
                          <li><em>Punchy (&lt; 100 words):</em> Constrained to at least 5+ lines highlighting key deals and call-to-actions.</li>
                          <li><em>Balanced (100–250 words):</em> Constrained to at least 10+ lines of standard engaging newsletter copy.</li>
                          <li><em>Editorial (250+ words):</em> Constrained to at least 15+ lines of narrative-driven benefits.</li>
                          <li><em>Immersive + Editorial:</em> At least 20+ lines of fully articulated text detailing offers, terms, and narratives.</li>
                        </ul>
                      </li>
                      <li><strong>Structural Layout Blocks Mandate</strong>: Explicitly guarantees that selected structures are fully rendered in the final markup, avoiding placeholders. Features include:
                        <ul className="list-disc pl-4 mt-1 space-y-1 text-[#1A1A1A]/70">
                          <li><em>Interactive FAQ Accordions:</em> Structured with custom spacing and real Q&As.</li>
                          <li><em>Benefits Comparison Tables:</em> Rendered with thin border styles and padded cells.</li>
                          <li><em>Social & Footer Blocks:</em> Placed at the bottom with elegant separators.</li>
                          <li><em>Legal Unsubscribe Footer:</em> Professionally styled opt-out management.</li>
                        </ul>
                      </li>
                      <li><strong>Primary CTA Link URL</strong>: Directly wires a custom destination URL into the main layout Call-to-Action buttons.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Feature 2: Brand Sync */}
              <section id="brand-intelligence" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1A1A1A]/70" />
                  02 / Brand Intelligence Sync Engine
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    A centralized Brand Intelligence layer that binds your active canvas directly to your overarching corporate identity, preventing context drift across generations.
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong>One-Click Canvas Autofill</strong>: Instantly maps your predefined target audience, flagship products, core value propositions, and exact color hex codes into the generative setup fields.</li>
                    <li><strong>Dynamic Context Preservation</strong>: Displays active tracking indicators when the AI is grounding its output against your saved brand voice and strict copywriting rules.</li>
                    <li><strong>Color Injection Protocol</strong>: Automatically parses the designated accent color into the HTML buttons, thematic highlights, and structural dividing elements of the final email variants.</li>
                  </ul>
                </div>
              </section>

              {/* Feature 3: A/B Testing Suite */}
              <section id="ab-variants" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#1A1A1A]/70" />
                  03 / Multivariate A/B Testing & Predictive Suite
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    Every campaign generation automatically runs three diverse variations side-by-side to target distinct consumer psychologies:
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex gap-3 p-3 bg-[#F9F7F2]/50 border border-[#1A1A1A]/10">
                      <span className="w-6 h-6 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">A</span>
                      <div>
                        <strong className="text-[#1A1A1A] block font-serif italic text-xs">Direct Value & Benefit Angle</strong>
                        <span className="text-[11px] text-slate-500">Focuses on concrete advantages, clear return on investment (ROI), and pricing benefits.</span>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-[#F9F7F2]/50 border border-[#1A1A1A]/10">
                      <span className="w-6 h-6 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">B</span>
                      <div>
                        <strong className="text-[#1A1A1A] block font-serif italic text-xs">Curiosity-Driven Hook</strong>
                        <span className="text-[11px] text-slate-500">Uses narrative storytelling and intriguing questions to drive open rates.</span>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-[#F9F7F2]/50 border border-[#1A1A1A]/10">
                      <span className="w-6 h-6 rounded-none bg-[#1A1A1A] text-white flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">C</span>
                      <div>
                        <strong className="text-[#1A1A1A] block font-serif italic text-xs">High Urgency/Scarcity Angle</strong>
                        <span className="text-[11px] text-slate-500">Emphasizes limited supplies, approaching deadlines, and immediate action steps.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-none space-y-2 mt-2">
                    <h4 className="font-bold font-serif italic text-xs text-emerald-800">Advanced Real-Time Predictive Projections</h4>
                    <p className="text-[11px] text-emerald-900 leading-relaxed font-serif">
                      Rather than static output templates, each variant card leverages advanced copywriting AI analysis to project three core pre-flight indicators:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-emerald-800 font-sans">
                      <li><strong>Predicted Click-Through Goal (CTR)</strong>: Real-time estimate of subscriber clicking interest per layout variant.</li>
                      <li><strong>Predicted Open Rate Probability</strong>: Estimate of reader inbox attention based on subject line length and semantic hooks.</li>
                      <li><strong>Psychological Trigger / Emotional Tone</strong>: Highlights the exact psychological trigger utilized in the copy variant (e.g. FOMO, Value-Gain, Mystery Loop).</li>
                      <li><strong>Spam Safety Index</strong>: Grade indicating filter bypass safety rating before deploying.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Feature 4: Interactive Sandbox */}
              <section id="preview-sandbox" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#1A1A1A]/70" />
                  04 / Interactive Visual Preview Sandbox
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    The visualizer features an interactive sandbox to preview and refine campaigns before exporting:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong>Branding Injector</strong>: Maps custom background accents and text formatting to preserve design consistency.</li>
                    <li><strong>Format Toggle</strong>: Swap between raw HTML template styling and parsed markdown text previews.</li>
                    <li><strong>Link Protection</strong>: Applies strict interaction blocking to buttons and links in the preview canvas to prevent accidental navigation away from the suite.</li>
                    <li><strong>Sizing & Spacing Controller</strong>: Real-time custom controls to scale reading font sizes and container padding.</li>
                    <li><strong>One-Click Exporters</strong>: Exports styled HTML markup, clean markdown, or raw text to your clipboard.</li>
                  </ul>
                </div>
              </section>

              {/* Feature 5: Banner Studio */}
              <section id="banner-studio" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1A1A1A]/70" />
                  05 / AI Banner Illustration Studio
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    A visual banner studio that handles image generation to create clean headers matching your copy:
                  </p>

                  <div className="p-3 bg-[#F9F7F2]/50 border border-[#1A1A1A]/10 mb-4 space-y-1">
                    <h5 className="font-bold text-[#1A1A1A] text-xs font-serif italic mb-1">Deeply Context-Aware Generation</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      The AI synthesizes visual prompts based on the overall mode of the campaign:
                    </p>
                    <ul className="list-disc pl-4 mt-1 space-y-1 text-[10px] text-slate-600">
                      <li><strong>Campaign Type & Core Details:</strong> Drives the energy, textures, shapes, and material parameters.</li>
                      <li><strong>Target Audience Vibe & Tone:</strong> Tailors the visual style directly to the audience's taste and sets the mood.</li>
                      <li><strong>Brand Color:</strong> Injected as lighting highlights or background glow.</li>
                      <li><strong>Immersive Flag:</strong> Scales the visual detail and complexity of the prompt.</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-[#1A1A1A]/10 p-3 bg-[#FDFCFB]">
                      <h5 className="font-bold text-[#1A1A1A] text-xs font-serif italic mb-1">Aspect Ratio Configurations</h5>
                      <p className="text-[11px] text-slate-500">Supports standard aspect ratios like 16:9 (Email Header), 4:3 (Card Layout), 1:1 (Product Display), and 9:16 (Stories Layout).</p>
                    </div>
                    <div className="border border-[#1A1A1A]/10 p-3 bg-[#FDFCFB]">
                      <h5 className="font-bold text-[#1A1A1A] text-xs font-serif italic mb-1">Crisp Quality Scale</h5>
                      <p className="text-[11px] text-slate-500">Includes 1K basic draft, 2K polished, and high-definition 4K options to optimize file sizes and load speeds.</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-[#FDFCFB] border border-[#1A1A1A]/10 space-y-1.5">
                    <h5 className="font-bold text-[#1A1A1A] text-xs font-serif italic">Artistic Presets Integration</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      To match any brand personality, we have added real-time style preset options:
                    </p>
                    <ul className="list-disc pl-4 text-[10px] text-slate-500 font-mono space-y-0.5">
                      <li><strong>Line Art</strong>: Clean flat vector lines with solid backgrounds</li>
                      <li><strong>Watercolor</strong>: Hand-painted editorial with pastel textures</li>
                      <li><strong>3D Render</strong>: Isometric clay render with soft lighting</li>
                      <li><strong>Retro Film</strong>: Warm vintage cinema noir aesthetic</li>
                      <li><strong>Cosmic Slate</strong>: Dark baslat slate with glowing vector accent lines</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Feature 6: Diagnostics */}
              <section id="diagnostics-suite" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1A1A1A]/70" />
                  06 / Spam Screener & Deliverability Analytics
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    Audits campaign draft copy in real-time to optimize deliverability before you send:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong>Deliverability Flags</strong>: Checks text against known spam triggers, flagging issues for correction.</li>
                    <li><strong>Flesch Readability Scoring</strong>: Analyzes text difficulty and highlights reading level requirements.</li>
                    <li><strong>Read-Time Indicator</strong>: Calculates average reading time to help you match optimal subscriber attention spans.</li>
                    <li><strong>Actionable Tips</strong>: Provides suggestions on subject line lengths, CTA visibility, and formatting.</li>
                  </ul>
                </div>
              </section>

              {/* Feature 7: Triple-Agent Bot */}
              <section id="triple-agent-chat" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#1A1A1A]/70" />
                  07 / Triple-Agent Chatbot (Gemini Coach)
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans">
                  <p>
                    The side panel houses three specialized virtual consultants to brainstorm, polish, or rewrite campaigns:
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#F9F7F2]/40 border border-[#1A1A1A]/10">
                      <strong className="text-xs font-serif italic text-[#1A1A1A] block">1. Growth Consultant</strong>
                      <span className="text-[11px] text-slate-600 block mt-0.5">Focuses on marketing strategy, competitive positioning, audience segments, and optimizing conversion metrics.</span>
                    </div>
                    <div className="p-3 bg-[#F9F7F2]/40 border border-[#1A1A1A]/10">
                      <strong className="text-xs font-serif italic text-[#1A1A1A] block">2. Creative Copywriter</strong>
                      <span className="text-[11px] text-slate-600 block mt-0.5">Focuses on punchy creative hooks, alternative subject lines, and crafting persuasive benefits.</span>
                    </div>
                    <div className="p-3 bg-[#F9F7F2]/40 border border-[#1A1A1A]/10">
                      <strong className="text-xs font-serif italic text-[#1A1A1A] block">3. Proofreader & Editor</strong>
                      <span className="text-[11px] text-slate-600 block mt-0.5">Focuses on lightning-fast grammar checking, copy condensation, formatting, and structural polishing.</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Feature 8: History Logs */}
              <section id="history-logs" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#1A1A1A]/70" />
                  08 / Offline Archiver & Local Storage Log
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-sans">
                  <p>
                    To protect your work, Campaign Architect includes a reliable local caching layer:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Saves campaign drafts, options, and brand styles to local storage.</li>
                    <li>Saves generated visual headers locally to ensure persistent access.</li>
                    <li>Restores full editing configurations and layout preferences with a single click.</li>
                  </ul>
                </div>
              </section>

              {/* Feature 9: Quota Resilience */}
              <section id="quota-resilience" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#1A1A1A]/70" />
                  09 / Fail-Safe Model Cascade & Quota Resilience
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-sans">
                  <p>
                    Our backend features a robust fallback system to prevent service disruptions:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Automatic Retry Logic</strong>: Implements exponential backoff to handle transient connection timeouts.</li>
                    <li><strong>Fallback Model Switching</strong>: If a model hits a quota limit or becomes unavailable, the system automatically routes requests through alternate models to keep things running smoothly.</li>
                  </ul>
                </div>
              </section>

              {/* Feature 10: Authentication System */}
              <section id="account-auth" className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1A1A1A]/70" />
                  10 / Account Authentication System
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed space-y-2 font-sans">
                  <p>
                    A fully integrated multi-tenant authentication protocol preserving specific user workspaces:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Guest Previews</strong>: Offers a sandboxed ephemeral workspace with pre-populated demo data, ensuring zero friction for testing.</li>
                    <li><strong>Persistent Identity</strong>: Securely maps campaign variants, brand intelligence settings, and diagnostic histories to individual authenticated accounts.</li>
                    <li><strong>Workspace Isolation</strong>: Prevents cross-contamination between different brand profiles, keeping distinct data layers walled off per user.</li>
                  </ul>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Right-side Quick Index / Anchor links panel (lg:col-span-2) */}
      <div className="lg:col-span-2 bg-[#FDFCFB] border-l border-[#1A1A1A]/10 p-6 hidden lg:block text-left">
        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-4">
          On This Page
        </span>
        <div className="space-y-2">
          {activeSubTab === 'about' ? (
            aboutQuickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`w-full text-left text-[11px] font-medium leading-relaxed block py-1.5 border-l-2 pl-3 transition-all cursor-pointer ${
                  selectedQuickLink === link.id 
                    ? 'border-[#1A1A1A] text-[#1A1A1A] font-bold' 
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))
          ) : (
            featuresQuickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`w-full text-left text-[11px] font-medium leading-relaxed block py-1.5 border-l-2 pl-3 transition-all cursor-pointer ${
                  selectedQuickLink === link.id 
                    ? 'border-[#1A1A1A] text-[#1A1A1A] font-bold' 
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))
          )}
        </div>

        <div className="mt-12 bg-[#F9F7F2] border border-[#1A1A1A]/10 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#1A1A1A]" />
            <h4 className="text-[10px] uppercase tracking-wider font-bold font-serif">Quick Tip</h4>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-serif italic">
            Select high-contrast branding colors to guarantee visual accessibility and clean text rendering in custom styled newsletter cards.
          </p>
        </div>
      </div>
      
    </div>
  );
}
