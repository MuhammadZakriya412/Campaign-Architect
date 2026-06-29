import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, User, RefreshCw, MessageSquare, Compass, PenTool, Edit3, 
  AlertCircle, X, ChevronRight, Zap, TrendingUp, BookOpen, Terminal, 
  HelpCircle, Star, ArrowRight, CornerDownLeft
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface GeminiBotProps {
  onSendMessage: (role: 'strategist' | 'copywriter' | 'editor', history: ChatMessage[]) => Promise<string>;
  isSending: boolean;
  className?: string;
}

const ROLES = [
  {
    id: 'strategist',
    name: 'Growth Consultant',
    tagline: 'Funnels & Audience Architecture',
    accentColor: 'text-[#0284c7]',
    accentBg: 'bg-[#F0F9FF]',
    accentBorder: 'border-[#BAE6FD]',
    badge: 'bg-white text-slate-500 border-[#1A1A1A]/10 hover:text-[#1A1A1A]',
    activeBadge: 'bg-[#1A1A1A] text-white border-[#1A1A1A]',
    icon: Compass,
    intro: "I am your Senior Growth Strategy Coach. I can analyze your campaign types, map deep customer profiles, design engagement funnels, and advise on high-level brand positioning. What business objective are we aiming for today?",
    stats: [
      { label: 'Primary Focus', value: 'Conversion Funnels' },
      { label: 'Recommended For', value: 'Audience Alignment & Goals' },
    ],
    prompts: [
      { text: "Design an acquisition funnel for an organic coffee subscription brand.", label: "Sub Funnel" },
      { text: "How can I map customer profiles for eco-conscious home organizers?", label: "User Profiles" },
      { text: "Give me a high-retention 3-part email sequence structure for SaaS users.", label: "SaaS Retention" },
      { text: "Suggest high-converting lead magnet ideas for professional creatives.", label: "Lead Magnets" }
    ],
    tips: [
      "Sequence consistency builds subscriber momentum.",
      "Align user triggers with real emotional needs.",
      "Clear, upfront value statements prevent early unsubscribes."
    ]
  },
  {
    id: 'copywriter',
    name: 'Direct Copywriter',
    tagline: 'Hooks, Subject Lines & CTAs',
    accentColor: 'text-[#E11D48]',
    accentBg: 'bg-[#FFF1F2]',
    accentBorder: 'border-[#FECDD3]',
    badge: 'bg-white text-slate-500 border-[#1A1A1A]/10 hover:text-[#1A1A1A]',
    activeBadge: 'bg-[#1A1A1A] text-white border-[#1A1A1A]',
    icon: PenTool,
    intro: "I am your Direct Response Copywriting Specialist. I write high-impact hooks, emotional value props, A/B variant subject lines, and persuasive call-to-actions. Give me a draft, or let's write from scratch!",
    stats: [
      { label: 'Primary Focus', value: 'Hook & CTA Polish' },
      { label: 'Recommended For', value: 'Subject Lines & Body Copy' },
    ],
    prompts: [
      { text: "Write 5 high-converting subject line options for a holiday catalog launch.", label: "Subject Lines" },
      { text: "Draft a persuasive 'Last Call' email using authentic, non-spam urgency.", label: "Cart Abandon" },
      { text: "Create a direct response pitch for a luxury gourmet cooking class.", label: "Gourmet Pitch" },
      { text: "Suggest 3 emotional hooks targeting busy professional parents.", label: "Hooks Finder" }
    ],
    tips: [
      "Direct response copy is 23% better when starting with a question.",
      "Active verbs drive more actions than descriptive language.",
      "Place your main CTA within the first 150 words of copy."
    ]
  },
  {
    id: 'editor',
    name: 'Spam Editor',
    tagline: 'Proofing & Spam Filter Shield',
    accentColor: 'text-[#059669]',
    accentBg: 'bg-[#ECFDF5]',
    accentBorder: 'border-[#A7F3D0]',
    badge: 'bg-white text-slate-500 border-[#1A1A1A]/10 hover:text-[#1A1A1A]',
    activeBadge: 'bg-[#1A1A1A] text-white border-[#1A1A1A]',
    icon: Edit3,
    intro: "I am your Speed Proofreader & Optimizer. I perform rapid spelling/grammar checks, highlight sales-y spam trigger phrases, and streamline text length. Pass me any copy, and I will clean it up instantly!",
    stats: [
      { label: 'Primary Focus', value: 'Inbox Deliverability' },
      { label: 'Recommended For', value: 'Spam Checks & Length Trim' },
    ],
    prompts: [
      { text: "Analyze this subject line for spam risks: 'FREE CASH TODAY! OPEN QUICK!!!'", label: "Spam Analyzer" },
      { text: "Make this 150-word product description tighter and double its punchiness.", label: "Trim Prose" },
      { text: "Scan my cold outreach message and adjust the tone to be less sales-y.", label: "Outreach Warmth" },
      { text: "Review this text to check if it triggers Gmail promotional tab filters.", label: "Promo Tab Shield" }
    ],
    tips: [
      "Keep spam triggers below 1% to stay in the primary inbox.",
      "Subject lines under 45 characters have higher mobile open rates.",
      "Avoid using all-caps and multiple exclamation points."
    ]
  },
] as const;

export default function GeminiBot({ onSendMessage, isSending, className = "" }: GeminiBotProps) {
  const [activeRole, setActiveRole] = useState<'strategist' | 'copywriter' | 'editor'>('strategist');
  const [mobileSubTab, setMobileSubTab] = useState<'chat' | 'advisors' | 'playbook'>('chat');
  const [sessionHistory, setSessionHistory] = useState<Record<string, ChatMessage[]>>({
    strategist: [],
    copywriter: [],
    editor: [],
  });
  const [input, setInput] = useState('');
  const [isSendingLocal, setIsSendingLocal] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeRoleData = ROLES.find(r => r.id === activeRole)!;

  // Auto-scroll inside container to the bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [sessionHistory, activeRole, isSendingLocal]);

  const currentMessages = sessionHistory[activeRole];

  const handleSend = async (textToSend?: string) => {
    const rawMessage = textToSend !== undefined ? textToSend : input;
    if (!rawMessage.trim() || isSendingLocal) return;

    setChatError(null);
    setIsSendingLocal(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: rawMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...currentMessages, userMessage];

    // Update state with user message immediately
    setSessionHistory(prev => ({
      ...prev,
      [activeRole]: updatedHistory,
    }));
    
    if (textToSend === undefined) {
      setInput('');
    }

    try {
      // Call endpoint
      const aiReply = await onSendMessage(activeRole, updatedHistory);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessionHistory(prev => ({
        ...prev,
        [activeRole]: [...updatedHistory, assistantMessage],
      }));
    } catch (error: any) {
      console.error("Chat message send error:", error);
      setChatError(error?.message || "Failed to receive guidance. Please retry.");
    } finally {
      setIsSendingLocal(false);
    }
  };

  const handleClear = () => {
    setSessionHistory(prev => ({
      ...prev,
      [activeRole]: [],
    }));
  };

  const handleLoadPrompt = (text: string, executeImmediately: boolean = false) => {
    if (executeImmediately) {
      handleSend(text);
    } else {
      setInput(text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    // Switch back to chat tab on mobile automatically
    setMobileSubTab('chat');
  };

  // Helper to format assistant messages with markdown correctly and professionally
  const renderMarkdown = (text: string, isAI: boolean) => {
    return (
      <div className="markdown-body text-xs space-y-1">
        <Markdown
          components={{
            h1: ({ children }) => <h1 className={`text-sm font-bold ${isAI ? 'text-[#1A1A1A]' : 'text-white'} mt-2 mb-1 uppercase tracking-wider`}>{children}</h1>,
            h2: ({ children }) => <h2 className={`text-xs font-bold ${isAI ? 'text-[#1A1A1A]' : 'text-white'} mt-2 mb-1 tracking-wider`}>{children}</h2>,
            h3: ({ children }) => <h3 className={`text-[11px] font-bold ${isAI ? 'text-[#1A1A1A]' : 'text-white'} mt-1.5 mb-1`}>{children}</h3>,
            p: ({ children }) => <p className={`text-xs ${isAI ? 'text-slate-700' : 'text-[#F9F7F2]/90'} leading-relaxed my-1`}>{children}</p>,
            strong: ({ children }) => <strong className={`font-bold ${isAI ? 'text-[#1A1A1A]' : 'text-white'}`}>{children}</strong>,
            ul: ({ children }) => <ul className={`list-disc pl-4 space-y-0.5 my-1 text-xs ${isAI ? 'text-slate-700' : 'text-[#F9F7F2]/90'}`}>{children}</ul>,
            ol: ({ children }) => <ol className={`list-decimal pl-4 space-y-0.5 my-1 text-xs ${isAI ? 'text-slate-700' : 'text-[#F9F7F2]/90'}`}>{children}</ol>,
            li: ({ children }) => <li className="text-xs leading-relaxed">{children}</li>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-[#1A1A1A]/20 pl-2 py-0.5 my-1 italic text-slate-500 text-xs">{children}</blockquote>,
            code: ({ children }) => <code className={`bg-[#F9F7F2]/80 ${isAI ? 'text-[#1A1A1A]' : 'text-slate-800'} border border-[#1A1A1A]/10 px-1 py-0.5 rounded-none font-mono text-[10px]`}>{children}</code>,
          }}
        >
          {text}
        </Markdown>
      </div>
    );
  };

  return (
    <div className={`flex flex-col lg:grid lg:grid-cols-12 gap-6 h-full w-full min-h-0 ${className}`} id="gemini-chatbot-component">
      
      {/* Mobile Top Navigation Subtabs */}
      <div className="lg:hidden flex border-b border-[#1A1A1A]/10 bg-white" id="mobile-subtabs">
        <button
          onClick={() => setMobileSubTab('chat')}
          className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
            mobileSubTab === 'chat' ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FDFCFB]' : 'border-transparent text-slate-400'
          }`}
        >
          Active Chat ({currentMessages.length})
        </button>
        <button
          onClick={() => setMobileSubTab('advisors')}
          className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
            mobileSubTab === 'advisors' ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FDFCFB]' : 'border-transparent text-slate-400'
          }`}
        >
          Advisors
        </button>
        <button
          onClick={() => setMobileSubTab('playbook')}
          className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
            mobileSubTab === 'playbook' ? 'border-[#1A1A1A] text-[#1A1A1A] bg-[#FDFCFB]' : 'border-transparent text-slate-400'
          }`}
        >
          Playbook
        </button>
      </div>

      {/* COLUMN 1: Expert Advisors Board (Col Span: 3) */}
      <div className={`lg:col-span-3 flex-col gap-4 lg:flex lg:h-full lg:overflow-y-auto pr-1 pb-4 text-left ${
        mobileSubTab === 'advisors' ? 'flex w-full' : 'hidden lg:flex'
      }`}>
        <div className="p-1">
          <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Expert Board</h3>
          <h2 className="text-sm font-serif italic text-[#1A1A1A] mb-4">Advisory Board Lounge</h2>
        </div>

        <div className="space-y-4">
          {ROLES.map((role) => {
            const isActive = activeRole === role.id;
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id);
                  setMobileSubTab('chat');
                }}
                whileHover={{ y: -2 }}
                className={`w-full p-5 text-left rounded-none border transition-all relative flex flex-col gap-3 group cursor-pointer ${
                  isActive 
                    ? 'border-[#1A1A1A] bg-white shadow-xs' 
                    : 'border-[#1A1A1A]/10 bg-[#FDFCFB] hover:border-[#1A1A1A]/30'
                }`}
              >
                {/* Active Indicator Pin */}
                {isActive && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#1A1A1A]" />
                )}

                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-none border border-[#1A1A1A]/10 ${isActive ? 'bg-[#1A1A1A] text-[#F9F7F2]' : 'bg-white text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">
                      {role.name}
                    </h4>
                    <span className="text-[8px] font-mono text-slate-400">
                      {role.id === 'strategist' ? 'Strategy Advisor' : role.id === 'copywriter' ? 'Tone Copywriter' : 'Delivery Editor'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Specialization</p>
                  <p className="text-[11px] text-[#1A1A1A]/80 font-serif italic leading-relaxed">
                    {role.tagline}
                  </p>
                </div>

                <div className="border-t border-[#1A1A1A]/5 pt-3 mt-1 flex flex-col gap-1.5">
                  {role.stats.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-[9px] font-mono">
                      <span className="text-slate-400">{s.label}:</span>
                      <span className="text-slate-700 font-bold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2: Luxury Chat Arena (Col Span: 6) */}
      <div className={`lg:col-span-6 flex flex-col h-full bg-white border border-[#1A1A1A]/10 overflow-hidden relative ${
        mobileSubTab === 'chat' ? 'flex flex-1 min-h-[500px] lg:min-h-0' : 'hidden lg:flex'
      }`}>
        {/* Chat Header */}
        <div className="bg-[#FDFCFB] border-b border-[#1A1A1A]/10 p-4 text-left flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none ${activeRoleData.accentBg} ${activeRoleData.accentColor} border ${activeRoleData.accentBorder}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  {activeRoleData.name}
                </h3>
                <span className="text-[8px] px-1.5 py-0.5 border border-[#1A1A1A]/10 bg-slate-50 text-slate-500 font-mono">
                  ACTIVE COACH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-serif italic mt-0.5">{activeRoleData.tagline}</p>
            </div>
          </div>

          {currentMessages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[9px] uppercase tracking-wider text-slate-400 hover:text-rose-600 font-bold cursor-pointer py-1 px-2.5 border border-transparent hover:border-rose-100 transition-all rounded-none"
            >
              Reset Chat
            </button>
          )}
        </div>

        {/* Messages Scroll Panel */}
        <div 
          ref={containerRef} 
          className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F9F7F2]/25 scroll-smooth relative"
          style={{ backgroundImage: 'radial-gradient(#1a1a1a/0.015 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        >
          {/* Ambient Welcome Prompt */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 max-w-[85%] text-left"
          >
            <div className="w-7 h-7 rounded-none bg-[#E5E1D8] text-[#1A1A1A] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#1A1A1A]/15 font-mono">
              COACH
            </div>
            <div className="bg-white p-5 rounded-none border border-[#1A1A1A]/10 shadow-none space-y-2">
              <div className="flex items-center justify-between gap-4 border-b border-[#1A1A1A]/5 pb-1 mb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  {activeRoleData.name}
                </span>
                <span className="text-[8px] font-mono text-slate-300">
                  SYSTEM READY
                </span>
              </div>
              <div className="text-xs leading-relaxed text-[#1A1A1A]/85 font-serif italic">
                "{activeRoleData.intro}"
              </div>
            </div>
          </motion.div>

          <AnimatePresence initial={false}>
            {currentMessages.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex gap-3 max-w-[85%] text-left ${isAI ? '' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                    isAI
                      ? 'bg-[#E5E1D8] text-[#1A1A1A] border-[#1A1A1A]/15'
                      : 'bg-[#1A1A1A] text-[#F9F7F2] border-[#1A1A1A]'
                  } font-mono shadow-xs`}>
                    {isAI ? 'AI' : 'US'}
                  </div>

                  <div className={`p-5 rounded-none shadow-none space-y-2 border ${
                    isAI
                      ? 'bg-white border-[#1A1A1A]/10'
                      : 'bg-[#1D1C1A] text-[#F9F7F2] border-[#1A1A1A]/10'
                  }`}>
                    <div className="flex items-center justify-between gap-4 border-b border-[#1A1A1A]/5 pb-1.5 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${isAI ? 'text-slate-400' : 'text-slate-300'}`}>
                        {isAI ? activeRoleData.name : 'Campaign Author'}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div className={`text-xs space-y-1.5 ${isAI ? 'text-slate-700' : 'text-[#F9F7F2]/90'}`}>
                      {renderMarkdown(msg.text, isAI)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading Indicator inside Chat */}
          {isSendingLocal && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[85%] text-left"
            >
              <div className="w-7 h-7 rounded-none bg-[#E5E1D8] text-[#1A1A1A] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#1A1A1A]/15 font-mono">
                AI
              </div>
              <div className="bg-white p-5 rounded-none border border-[#1A1A1A]/10 shadow-none flex items-center gap-2.5 text-xs text-slate-500 font-serif italic">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 text-[#1A1A1A]" />
                </motion.div>
                <span>Formulating expert recommendations...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Single-line Inline Banner for errors */}
        {chatError && (
          <div className="bg-rose-50 border-t border-b border-rose-200 px-4 py-2.5 flex items-center justify-between gap-3 text-rose-800 text-[11px] animate-fadeIn" id="chat-error-banner">
            <div className="flex items-center gap-2 min-w-0 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate font-sans font-semibold">{chatError}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setChatError(null)} 
              className="p-1 hover:bg-rose-100 rounded-none transition-colors cursor-pointer text-rose-600 flex items-center justify-center shrink-0"
              title="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Control Console */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
          className="p-4 border-t border-[#1A1A1A]/10 bg-white flex items-center gap-2.5 relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Instruct ${activeRoleData.name} regarding your emails...`}
            disabled={isSendingLocal}
            className="flex-1 text-xs px-4 py-3.5 rounded-none border border-[#1A1A1A]/15 bg-[#FDFCFB] focus:outline-none focus:border-[#1A1A1A]/40 transition-colors placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={isSendingLocal || !input.trim()}
            className={`p-3.5 rounded-none transition-all cursor-pointer flex items-center justify-center border ${
              isSendingLocal || !input.trim()
                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-black hover:border-black'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* COLUMN 3: Campaign Playbook & Interactive Strategy Prompts (Col Span: 3) */}
      <div className={`lg:col-span-3 flex-col gap-5 lg:flex lg:h-full lg:overflow-y-auto pl-1 pb-4 text-left ${
        mobileSubTab === 'playbook' ? 'flex w-full' : 'hidden lg:flex'
      }`}>
        <div className="p-1">
          <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Interactive Playbook</h3>
          <h2 className="text-sm font-serif italic text-[#1A1A1A] mb-4">Prompt Book & Strategy</h2>
        </div>

        {/* Prompt Card Triggers */}
        <div className="bg-white border border-[#1A1A1A]/10 p-5 rounded-none space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[#1A1A1A]/5 pb-2 mb-2">
            <Zap className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Predefined Scenarios</h3>
          </div>
          
          <p className="text-[10px] text-slate-500 leading-relaxed font-serif italic mb-1">
            Click to load a high-conversion scenario prompt directly into the console, or tap the arrow to send it instantly.
          </p>

          <div className="space-y-2.5">
            {activeRoleData.prompts.map((p, idx) => (
              <div 
                key={idx} 
                className="group border border-[#1A1A1A]/10 bg-[#FDFCFB] hover:border-[#1A1A1A]/30 transition-all text-left relative overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleLoadPrompt(p.text, false)}
                  className="w-full p-3 pr-10 text-left text-xs font-serif italic text-slate-700 hover:text-[#1A1A1A] cursor-pointer"
                  title="Load prompt into edit console"
                >
                  <span className="block text-[8px] uppercase font-mono tracking-wider text-slate-400 font-bold not-italic mb-1">
                    Scenario 0{idx + 1} / {p.label}
                  </span>
                  "{p.text}"
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPrompt(p.text, true)}
                  className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center border-l border-[#1A1A1A]/5 bg-slate-50 hover:bg-[#1A1A1A] hover:text-[#F9F7F2] transition-colors cursor-pointer group-hover:border-l-[#1A1A1A]/15"
                  title="Execute query instantly"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Tips Book */}
        <div className="bg-white border border-[#1A1A1A]/10 p-5 rounded-none flex-1">
          <div className="flex items-center gap-1.5 border-b border-[#1A1A1A]/5 pb-2 mb-3">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Coaching Guidelines</h3>
          </div>

          <ul className="space-y-3">
            {activeRoleData.tips.map((tip, idx) => (
              <li key={idx} className="flex gap-2 text-xs">
                <span className="font-mono text-[9px] text-slate-300 mt-0.5 shrink-0">
                  [{idx + 1}]
                </span>
                <span className="text-slate-600 leading-relaxed font-sans text-[11px]">
                  {tip}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-3 bg-[#F9F7F2]/60 border border-[#1A1A1A]/5 text-[10px] font-mono text-slate-500 text-left leading-relaxed">
            <span className="font-bold text-[#1A1A1A] block mb-1">💡 ADVANCED STRATEGY:</span>
            Switch between consultants freely. Active conversation streams remain intact under each advisor until manually reset.
          </div>
        </div>

      </div>

    </div>
  );
}
