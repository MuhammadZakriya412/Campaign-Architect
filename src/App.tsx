import React, { useState, useEffect } from 'react';
import { 
  Mail, Sparkles, History, Trash2, ArrowRight, CheckCircle, 
  ExternalLink, MessageSquare, AlertCircle, FileText, LayoutGrid, Zap,
  Sliders, Eye, EyeOff, PanelLeftClose, PanelLeftOpen, ClipboardCheck, ArrowUpRight,
  Pin, PinOff, Minimize2, Maximize2, SlidersHorizontal, Scaling, Columns, ChevronDown, ChevronUp,
  X
} from 'lucide-react';
import { EmailCampaign, ChatMessage } from './types';
import CampaignSetup from './components/CampaignSetup';
import ABVariants from './components/A_BVariants';
import EmailPreview from './components/EmailPreview';
import ImageGenerator from './components/ImageGenerator';
import DiagnosticStats from './components/DiagnosticStats';
import GeminiBot from './components/GeminiBot';
import CustomCursor from './components/CustomCursor';
import DocsPage from './components/DocsPage';
import UserProfile, { UserProfileData } from './components/UserProfile';
import AuthScreen, { UserAccount } from './components/AuthScreen';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Authentication & Session States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const [activeCampaign, setActiveCampaign] = useState<EmailCampaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeVariant, setActiveVariant] = useState<number>(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<EmailCampaign[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'canvas' | 'assistant' | 'docs' | 'profile'>('canvas');
  const [profileInitials, setProfileInitials] = useState<string>('EV');
  
  // Clean Progressive Workspace States
  const [isSetupCollapsed, setIsSetupCollapsed] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<'copy' | 'preview' | 'screener'>('preview');

  // Progressive Workspace Layout Customization States
  const [leftColSpan, setLeftColSpan] = useState<number>(4); // Default grid span out of 12 for Left Column: 3, 4, 5, or 6
  const [isSetupMinimized, setIsSetupMinimized] = useState<boolean>(false);
  const [isLogsMinimized, setIsLogsMinimized] = useState<boolean>(false);
  const [isSetupHidden, setIsSetupHidden] = useState<boolean>(false);
  const [isLogsHidden, setIsLogsHidden] = useState<boolean>(false);
  const [isSetupPinned, setIsSetupPinned] = useState<boolean>(true);
  const [isLogsPinned, setIsLogsPinned] = useState<boolean>(true);

  // 1. Initial Mount: Recover active session or guest token
  useEffect(() => {
    try {
      const activeUserStr = localStorage.getItem('campaign_current_user');
      if (activeUserStr) {
        setCurrentUser(JSON.parse(activeUserStr));
        setIsGuest(false);
      } else {
        const guestSession = localStorage.getItem('campaign_guest_session');
        if (guestSession === 'active') {
          setIsGuest(true);
        }
      }
    } catch (e) {
      console.error('Session recovery failed', e);
    } finally {
      setAuthReady(true);
    }
  }, []);

  // 2. Load history & images from localStorage (dynamically scoped to user key)
  useEffect(() => {
    if (!authReady) return;

    try {
      const suffix = currentUser ? `_${currentUser.email}` : '';
      
      // Load History Log
      const storedHistory = localStorage.getItem(`campaign_history${suffix}`);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory([]);
      }

      // Load Saved Visuals
      const storedImages = localStorage.getItem(`generated_images${suffix}`);
      if (storedImages) {
        setGeneratedImages(JSON.parse(storedImages));
      } else {
        setGeneratedImages([]);
      }

      // Determine Profile Initials
      const storedProfile = localStorage.getItem(`campaign_user_profile${suffix}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.fullName) {
          const parts = parsed.fullName.trim().split(/\s+/);
          const initials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
          setProfileInitials(initials || 'EV');
        } else {
          setProfileInitials(currentUser ? currentUser.fullName.charAt(0) : 'EV');
        }
      } else {
        if (currentUser) {
          const parts = currentUser.fullName.trim().split(/\s+/);
          const initials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
          setProfileInitials(initials || 'US');
        } else {
          setProfileInitials('EV'); // Eleanor Vance demo initial
        }
      }
    } catch (e) {
      console.error('Failed to load storage assets', e);
    }
  }, [currentUser, isGuest, authReady]);

  // Auto-dismiss success message after 10 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Save history helper
  const saveHistory = (newHistory: EmailCampaign[]) => {
    setHistory(newHistory);
    const suffix = currentUser ? `_${currentUser.email}` : '';
    localStorage.setItem(`campaign_history${suffix}`, JSON.stringify(newHistory));
  };

  // Save images helper
  const saveImages = (newImages: string[]) => {
    setGeneratedImages(newImages);
    const suffix = currentUser ? `_${currentUser.email}` : '';
    localStorage.setItem(`generated_images${suffix}`, JSON.stringify(newImages));
  };

  // 1. Generate core campaign copywriting & structure
  const handleGenerateCampaign = async (setupData: any) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Read active brand profile from storage to pass to Gemini
    let profileSuffix = currentUser ? `_${currentUser.email}` : '';
    let brandProfileObj = null;
    try {
      const storedProfile = localStorage.getItem(`campaign_user_profile${profileSuffix}`);
      if (storedProfile) {
        brandProfileObj = JSON.parse(storedProfile);
      }
    } catch (err) {
      console.error("Failed to parse profile for generation", err);
    }

    try {
      const res = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...setupData,
          brandProfile: brandProfileObj
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate campaign.');
      }

      const data = await res.json();

      let autoGeneratedImage: string | undefined = undefined;
      if (data.suggestedVisualPrompt) {
        try {
          setIsGeneratingImage(true);
          const imgRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: data.suggestedVisualPrompt,
              size: "1K",
              aspectRatio: "16:9"
            }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            autoGeneratedImage = imgData.imageUrl;
            if (autoGeneratedImage) {
              const updatedImages = [autoGeneratedImage, ...generatedImages];
              saveImages(updatedImages);
              setSelectedImage(autoGeneratedImage);
            }
          }
        } catch (imgErr) {
          console.warn("Failed to auto-generate campaign header image", imgErr);
        } finally {
          setIsGeneratingImage(false);
        }
      }

      const newCampaign: EmailCampaign = {
        id: `campaign-${Date.now()}`,
        name: `${setupData.campaignType} - ${setupData.audience.slice(0, 20)}...`,
        campaignType: setupData.campaignType,
        audience: setupData.audience,
        description: setupData.description,
        tone: setupData.tone,
        extraOffer: setupData.extraOffer,
        ctaLink: setupData.ctaLink,
        brandingColor: setupData.brandingColor,
        subjectLines: data.subjectLines,
        previewTexts: data.previewTexts,
        headline: data.headline,
        bodyMarkdown: data.bodyMarkdown,
        bodyHtml: data.bodyHtml,
        ctaText: data.ctaText,
        spamScore: data.spamScore,
        spamTriggers: data.spamTriggers,
        readabilityGrade: data.readabilityGrade,
        readTime: data.readTime,
        optimizationTips: data.optimizationTips,
        suggestedVisualPrompt: data.suggestedVisualPrompt,
        bannerImage: autoGeneratedImage,
        createdAt: new Date().toLocaleString(),
        predictedCTR: data.predictedCTR,
        predictedOpenRate: data.predictedOpenRate,
        predictedSentiment: data.predictedSentiment,
        spamSafeRating: data.spamSafeRating,
        copyLengthOption: setupData.copyLengthOption,
        selectedElements: setupData.selectedElements,
        variants: data.variants ? data.variants.map((v: any) => ({
          ...v,
          bannerImage: autoGeneratedImage
        })) : [],
      };

      setActiveCampaign(newCampaign);
      setActiveVariant(0);
      setSelectedImage(null);

      // Auto-collapse layout if not pinned to maximize workspace focus
      if (!isSetupPinned) {
        setIsSetupCollapsed(true);
      }

      // Add to history list
      saveHistory([newCampaign, ...history]);
      setSuccessMsg('Email Campaign generated successfully! Preview applied.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during campaign generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Generate HD visuals
  const handleGenerateImage = async (prompt: string, size: string, aspectRatio: string) => {
    setIsGeneratingImage(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, aspectRatio }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to render image asset.');
      }

      const { imageUrl } = await res.json();

      // Add to images gallery
      const newImages = [imageUrl, ...generatedImages];
      saveImages(newImages);

      setSelectedImage(imageUrl);

      // Inject into current active campaign & active variant
      if (activeCampaign) {
        const updatedVariants = activeCampaign.variants ? [...activeCampaign.variants] : [];
        if (updatedVariants[activeVariant]) {
          updatedVariants[activeVariant] = {
            ...updatedVariants[activeVariant],
            bannerImage: imageUrl,
          };
        }
        const updatedCampaign = {
          ...activeCampaign,
          bannerImage: imageUrl,
          variants: updatedVariants.length > 0 ? updatedVariants : undefined,
        };
        setActiveCampaign(updatedCampaign);
        
        // Update history too
        const updatedHistory = history.map(h => h.id === activeCampaign.id ? updatedCampaign : h);
        saveHistory(updatedHistory);
      }

      setSuccessMsg(`HD Visual (${size}) generated and injected successfully!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during image generation.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 3. Multi-turn chatbot model API runner
  const handleSendChatMessage = async (role: 'strategist' | 'copywriter' | 'editor', chatHistory: ChatMessage[]) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          messages: chatHistory.map(msg => ({
            role: msg.role,
            text: msg.text,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch chatbot response.');
      }

      const data = await res.json();
      return data.reply;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Apply selected image from gallery to the template
  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (activeCampaign) {
      const updatedVariants = activeCampaign.variants ? [...activeCampaign.variants] : [];
      if (updatedVariants[activeVariant]) {
        updatedVariants[activeVariant] = {
          ...updatedVariants[activeVariant],
          bannerImage: imageUrl,
        };
      }
      const updated = { 
        ...activeCampaign, 
        bannerImage: imageUrl,
        variants: updatedVariants.length > 0 ? updatedVariants : undefined,
      };
      setActiveCampaign(updated);

      const updatedHistory = history.map(h => h.id === activeCampaign.id ? updated : h);
      saveHistory(updatedHistory);
    }
  };

  // Switch between A/B variants and reveal details in Live Card
  const handleSelectVariant = (idx: number) => {
    setActiveVariant(idx);
    setWorkspaceView('preview');
    if (activeCampaign) {
      const varImage = activeCampaign.variants?.[idx]?.bannerImage || null;
      setSelectedImage(varImage);
    }
  };

  // Load old campaign from history logs
  const handleLoadCampaign = (campaign: EmailCampaign) => {
    setActiveCampaign(campaign);
    setActiveVariant(0);
    setSelectedImage(campaign.bannerImage || null);
    
    // Auto-collapse layout if not pinned to maximize workspace focus
    if (!isSetupPinned) {
      setIsSetupCollapsed(true);
    }
    
    setSuccessMsg(`Loaded campaign: "${campaign.name}"`);
    window.scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: 'smooth' });
  };

  // Delete campaign from history logs
  const handleDeleteCampaign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(c => c.id !== id);
    saveHistory(updated);
    
    if (activeCampaign && activeCampaign.id === id) {
      setActiveCampaign(null);
      setSelectedImage(null);
    }
    setSuccessMsg('Campaign removed from history logs.');
  };

  // Sync profile initials when profile is saved
  const handleProfileSave = (profileData: UserProfileData) => {
    if (profileData.fullName) {
      const parts = profileData.fullName.trim().split(/\s+/);
      const initials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
      setProfileInitials(initials || 'EV');
    } else {
      setProfileInitials('AI');
    }
  };

  // Auth Handler callbacks
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsGuest(false);
    localStorage.setItem('campaign_current_user', JSON.stringify(user));
    localStorage.removeItem('campaign_guest_session');
    setActiveTab('canvas');
  };

  const handleGuestAccess = () => {
    setCurrentUser(null);
    setIsGuest(true);
    localStorage.setItem('campaign_guest_session', 'active');
    localStorage.removeItem('campaign_current_user');
    setActiveTab('canvas');
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    setIsGuest(false);
    localStorage.removeItem('campaign_current_user');
    localStorage.removeItem('campaign_guest_session');
    setActiveTab('canvas');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center font-mono text-xs text-slate-400">
        Booting Campaign Intelligence Systems...
      </div>
    );
  }

  if (!currentUser && !isGuest) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onGuestAccess={handleGuestAccess} />;
  }

  return (
    <div className={`min-h-screen bg-[#F9F7F2] font-sans text-[#1A1A1A] flex flex-col ${(activeTab !== 'docs' && activeTab !== 'profile') ? 'lg:h-screen lg:overflow-hidden' : ''}`} id="main-application-container">
      <CustomCursor />
      {/* Upper Navigation / Editorial Brand Header */}
      <nav className="border-b border-[#1A1A1A]/10 px-8 py-4 flex flex-col md:flex-row justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <span className="font-serif italic text-2xl tracking-tighter text-[#1A1A1A]">Campaign Architect.</span>
          <div className="hidden md:block h-4 w-px bg-[#1A1A1A]/20"></div>
          <div className="flex gap-4 md:gap-6 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/60">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`pb-1 hover:text-[#1A1A1A] transition-all relative ${
                activeTab === 'canvas' ? 'text-[#1A1A1A]' : ''
              }`}
            >
              Campaign Canvas
              {activeTab === 'canvas' && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`pb-1 hover:text-[#1A1A1A] transition-all relative ${
                activeTab === 'assistant' ? 'text-[#1A1A1A]' : ''
              }`}
            >
              Strategy Advisor
              {activeTab === 'assistant' && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`pb-1 hover:text-[#1A1A1A] transition-all relative ${
                activeTab === 'docs' ? 'text-[#1A1A1A]' : ''
              }`}
            >
              Docs Portal
              {activeTab === 'docs' && (
                <motion.div 
                  layoutId="activeTabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <button 
            onClick={() => setActiveTab(activeTab === 'profile' ? 'canvas' : 'profile')}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer border ${
              activeTab === 'profile'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md ring-2 ring-[#1A1A1A]/10'
                : 'bg-[#E5E1D8] text-[#1A1A1A] border-[#1A1A1A]/15 hover:bg-[#E5E1D8]/80 hover:border-[#1A1A1A]/30'
            }`}
            title="View & Edit Brand Profile"
            id="profile-avatar-button"
          >
            {profileInitials}
          </button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <main className={`w-full px-4 md:px-8 lg:px-10 py-4 lg:py-5 flex flex-col min-h-0 ${(activeTab !== 'docs' && activeTab !== 'profile') ? 'lg:flex-1 lg:overflow-hidden' : 'max-w-7xl mx-auto space-y-8'}`}>
        
        {/* Toast / Status Notifications */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-none flex items-center justify-between gap-3 text-rose-800 animate-fadeIn" id="toast-error">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
              <div className="text-xs font-sans font-medium text-left truncate">
                <span className="font-bold uppercase tracking-wider text-[10px] mr-2">Error:</span>
                {errorMsg}
              </div>
            </div>
            <button 
              onClick={() => setErrorMsg(null)} 
              className="p-1 hover:bg-rose-100 text-rose-600 rounded-none transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-none flex items-center justify-between gap-3 text-emerald-900 animate-fadeIn" id="toast-success">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="text-xs font-serif italic text-left">
                <span className="font-sans font-bold uppercase tracking-wider not-italic block mb-0.5 text-[#1A1A1A]">Execution Complete</span> {successMsg}
              </div>
            </div>
            <button 
              onClick={() => setSuccessMsg(null)} 
              className="font-sans font-black uppercase tracking-widest text-[9px] text-emerald-800 hover:text-emerald-950 px-3 py-1.5 bg-emerald-100/50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shrink-0"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Dynamic Tab Rendering with AnimatePresence wait-mode Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'canvas' && (() => {
            const isLeftColumnEmpty = isSetupHidden && isLogsHidden;
            const isLeftColumnCollapsed = isSetupCollapsed || isLeftColumnEmpty;

            const leftColClass = isLeftColumnCollapsed 
              ? 'hidden' 
              : leftColSpan === 3 
              ? 'lg:col-span-3' 
              : leftColSpan === 5 
              ? 'lg:col-span-5' 
              : leftColSpan === 6 
              ? 'lg:col-span-6' 
              : 'lg:col-span-4';

            const rightColClass = isLeftColumnCollapsed 
              ? 'lg:col-span-12' 
              : leftColSpan === 3 
              ? 'lg:col-span-9' 
              : leftColSpan === 5 
              ? 'lg:col-span-7' 
              : leftColSpan === 6 
              ? 'lg:col-span-6' 
              : 'lg:col-span-8';

            return (
              <motion.div
                key="canvas-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col lg:flex-row gap-6 items-stretch lg:flex-1 lg:h-full lg:overflow-hidden min-h-0 w-full"
              >
                {/* Collapsed Workspace Sidebar Rail */}
                {(isSetupHidden || isLogsHidden) && (
                  <div className="w-fit h-auto bg-white border border-[#1A1A1A]/10 flex flex-row items-center justify-start p-2 gap-2 shrink-0 rounded-none lg:w-12 lg:h-full lg:flex-col lg:py-6 lg:px-0 lg:gap-3.5 animate-fadeIn" id="collapsed-sidebar-rail">
                    <div className="hidden lg:block text-[8px] uppercase tracking-widest font-black text-slate-400 rotate-180 mb-1" style={{ writingMode: 'vertical-rl' }}>
                      Workspace Rail
                    </div>
                    <div className="hidden lg:block h-px w-6 bg-[#1A1A1A]/10 mb-1" />
                    
                    {isSetupHidden && (
                      <button
                        onClick={() => setIsSetupHidden(false)}
                        className="w-8 h-8 flex items-center justify-center border border-[#1A1A1A]/10 bg-[#FDFCFB] hover:bg-[#1A1A1A] hover:text-white transition-all text-[#1A1A1A] cursor-pointer shadow-xs rounded-none hover:scale-105"
                        title="Restore Guidelines Engine"
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    )}
                    
                    {isLogsHidden && (
                      <button
                        onClick={() => setIsLogsHidden(false)}
                        className="w-8 h-8 flex items-center justify-center border border-[#1A1A1A]/10 bg-[#FDFCFB] hover:bg-[#1A1A1A] hover:text-white transition-all text-[#1A1A1A] cursor-pointer shadow-xs rounded-none hover:scale-105"
                        title="Restore Campaign Logs"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Grid layout */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:h-full lg:overflow-hidden text-left">
                  {/* Left Column: Config Panel - Collapsible & Independently Scrollable */}
                  {!isLeftColumnCollapsed && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`${leftColClass} space-y-6 lg:h-full lg:overflow-y-auto pr-1 pb-10 transition-all duration-300 scrollbar-thin`}
                    >
                      {!isSetupHidden && (
                        <CampaignSetup 
                          onGenerate={handleGenerateCampaign} 
                          isLoading={isGenerating} 
                          isMinimized={isSetupMinimized}
                          onToggleMinimize={() => setIsSetupMinimized(!isSetupMinimized)}
                          isPinned={isSetupPinned}
                          onTogglePin={() => setIsSetupPinned(!isSetupPinned)}
                          onHide={() => setIsSetupHidden(true)}
                          currentUser={currentUser}
                        />
                      )}

                      {!isLogsHidden && (
                        /* History Log Panel with Hover Controls & Independent Minimize/Pin state */
                        <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-6 text-left relative group transition-all">
                          {/* Hover action bar for History Panel */}
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 bg-white/95 backdrop-blur-xs p-1 border border-[#1A1A1A]/10 shadow-xs">
                            <button
                              type="button"
                              onClick={() => setIsLogsHidden(true)}
                              className="p-1 border border-transparent hover:border-[#1A1A1A]/10 text-slate-400 hover:text-[#1A1A1A] transition-all cursor-pointer"
                              title="Hide Logs Panel Completely"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsLogsPinned(!isLogsPinned)}
                              className={`p-1 border transition-all cursor-pointer ${
                                isLogsPinned ? 'border-[#1A1A1A]/10 bg-[#F9F7F2] text-[#1A1A1A]' : 'border-transparent text-slate-400 hover:text-slate-700'
                              }`}
                              title={isLogsPinned ? "Unpin Logs Panel" : "Pin Logs Panel"}
                            >
                              {isLogsPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsLogsMinimized(!isLogsMinimized)}
                              className="p-1 border border-transparent hover:border-[#1A1A1A]/10 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                              title={isLogsMinimized ? "Expand Logs Panel" : "Minimize Logs Panel"}
                            >
                              {isLogsMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {isLogsMinimized ? (
                            <div className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-[#1A1A1A]/60" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">02 / Campaign Logs ({history.length})</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setIsLogsHidden(true)}
                                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Hide Logs Panel Completely"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setIsLogsMinimized(false)}
                                  className="text-[9px] uppercase font-bold border border-[#1A1A1A]/15 bg-[#FDFCFB] px-2 py-0.5 text-slate-500 hover:text-[#1A1A1A] hover:bg-[#F9F7F2] transition-colors cursor-pointer"
                                >
                                  expand
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] flex items-center gap-1.5 mb-4 border-b border-[#1A1A1A]/10 pb-2">
                                <History className="w-4 h-4 text-[#1A1A1A]/60" />
                                02 / Campaign Logs ({history.length})
                              </h3>

                              {history.length === 0 ? (
                                <p className="text-xs font-serif italic text-slate-400">No previous campaigns saved in local storage.</p>
                              ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                  {history.map((campaign) => (
                                    <div
                                      key={campaign.id}
                                      onClick={() => handleLoadCampaign(campaign)}
                                      className={`p-3 rounded-none border text-left cursor-pointer transition-all flex items-center justify-between group/item ${
                                        activeCampaign && activeCampaign.id === campaign.id
                                          ? 'border-[#1A1A1A] bg-[#F9F7F2]'
                                          : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 bg-[#FDFCFB]'
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-[#1A1A1A] truncate">{campaign.name}</p>
                                        <p className="text-[9px] text-slate-400 font-mono mt-1">{campaign.createdAt}</p>
                                      </div>

                                      <button
                                        onClick={(e) => handleDeleteCampaign(campaign.id, e)}
                                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 opacity-0 group-hover/item:opacity-100 transition-opacity animate-pulse cursor-pointer"
                                        title="Delete draft log"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Right Column: Active Canvas Sandbox - Independently Scrollable */}
                  <div className={`${rightColClass} space-y-6 lg:h-full lg:overflow-y-auto pr-1 pb-10 transition-all duration-300 scrollbar-thin`}>
                  {activeCampaign ? (
                    <>
                      {/* Floating Campaign Context Banner, Size Slider, & View Switcher */}
                      <div className="bg-white border border-[#1A1A1A]/15 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left relative group">
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => setIsSetupCollapsed(!isSetupCollapsed)}
                            className="px-3 py-1.5 border border-[#1A1A1A]/10 bg-[#FDFCFB] text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#F9F7F2] transition-colors cursor-pointer shadow-xs shrink-0"
                            title={isSetupCollapsed ? "Show configuration panel" : "Hide configuration panel for focused view"}
                          >
                            {isSetupCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
                            {isSetupCollapsed ? 'Show Guidelines' : 'Focus Studio'}
                          </button>

                          {/* Dynamic Width / Split Presets Switcher (Resizing) - Only shows on hover or focus! */}
                          {!isSetupCollapsed && (
                            <div className="hidden sm:flex items-center gap-1 border-l border-[#1A1A1A]/10 pl-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <span className="text-[8px] uppercase font-bold text-slate-400 mr-1.5 tracking-wider font-mono">Grid Size:</span>
                              <div className="flex bg-[#E5E1D8]/30 p-0.5 border border-[#1A1A1A]/5 rounded-none">
                                {[
                                  { val: 3, label: 'Compact' },
                                  { val: 4, label: 'Balanced' },
                                  { val: 5, label: 'Wide' },
                                  { val: 6, label: 'Equal' }
                                ].map(opt => (
                                  <button
                                    key={opt.val}
                                    onClick={() => setLeftColSpan(opt.val)}
                                    className={`px-1.5 py-0.5 text-[8px] uppercase font-bold tracking-tight transition-all cursor-pointer ${
                                      leftColSpan === opt.val 
                                        ? 'bg-white text-[#1A1A1A] shadow-xs border border-[#1A1A1A]/5' 
                                        : 'text-slate-400 hover:text-[#1A1A1A]'
                                    }`}
                                    title={`Set Left Panel width to ${opt.val}/12`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="min-w-0 border-l border-[#1A1A1A]/10 pl-3">
                            <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-widest font-mono">Active Campaign Workspace</span>
                            <h4 className="text-xs font-bold text-[#1A1A1A] truncate font-sans uppercase tracking-tight">{activeCampaign.name}</h4>
                          </div>
                        </div>

                        {/* Editorial Workspace Sub-Tabs (Progressive Disclosure) */}
                        <div className="flex bg-[#E5E1D8]/45 p-0.5 border border-[#1A1A1A]/10 rounded-none items-center gap-0.5 shrink-0 self-start md:self-auto">
                          <button
                            onClick={() => setWorkspaceView('copy')}
                            className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                              workspaceView === 'copy'
                                ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-xs'
                                : 'text-slate-500 hover:text-[#1A1A1A]'
                            }`}
                          >
                            <FileText className="w-3 h-3 text-[#1A1A1A]/60" />
                            <span>01 / Copy variants</span>
                          </button>
                          <button
                            onClick={() => setWorkspaceView('preview')}
                            className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                              workspaceView === 'preview'
                                ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-xs'
                                : 'text-slate-500 hover:text-[#1A1A1A]'
                            }`}
                          >
                            <Eye className="w-3 h-3 text-[#1A1A1A]/60" />
                            <span>02 / Live Canvas</span>
                          </button>
                          <button
                            onClick={() => setWorkspaceView('screener')}
                            className={`px-3 py-1.5 text-[9px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                              workspaceView === 'screener'
                                ? 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/5 shadow-xs'
                                : 'text-slate-500 hover:text-[#1A1A1A]'
                            }`}
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-[#1A1A1A]/60" />
                            <span>03 / Deliverability</span>
                          </button>
                        </div>
                      </div>

                      {/* Stage Rendering under AnimatePresence */}
                      <AnimatePresence mode="wait">
                        {workspaceView === 'copy' && (
                          <motion.div
                            key="stage-copy"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Subject Line & A/B variants */}
                            <ABVariants
                              subjectLines={activeCampaign.subjectLines}
                              previewTexts={activeCampaign.previewTexts}
                              activeVariant={activeVariant}
                              setActiveVariant={handleSelectVariant}
                              predictedCTR={activeCampaign.predictedCTR}
                              predictedOpenRate={activeCampaign.predictedOpenRate}
                              predictedSentiment={activeCampaign.predictedSentiment}
                              spamSafeRating={activeCampaign.spamSafeRating}
                            />
                          </motion.div>
                        )}

                        {workspaceView === 'preview' && (() => {
                          const activeVarData = activeCampaign.variants?.[activeVariant] || activeCampaign;
                          return (
                            <motion.div
                              key="stage-preview"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="grid grid-cols-1 xl:grid-cols-12 gap-6"
                            >
                              {/* Visual Preview (span 7 or 8 based on width) */}
                              <div className="xl:col-span-7">
                                <EmailPreview
                                  html={activeVarData.bodyHtml}
                                  markdown={activeVarData.bodyMarkdown}
                                  activeSubject={activeCampaign.subjectLines[activeVariant]}
                                  activePreheader={activeCampaign.previewTexts[activeVariant]}
                                  bannerImage={activeCampaign.variants?.[activeVariant]?.bannerImage || activeCampaign.bannerImage || (selectedImage || undefined)}
                                  brandingColor={activeCampaign.brandingColor}
                                />
                              </div>

                              {/* Image visualizer sidebar (span 5) */}
                              <div className="xl:col-span-5">
                                <ImageGenerator
                                  suggestedPrompt={activeCampaign.variants?.[activeVariant]?.suggestedVisualPrompt || activeCampaign.suggestedVisualPrompt}
                                  onGenerateImage={handleGenerateImage}
                                  isGenerating={isGeneratingImage}
                                  generatedImages={generatedImages}
                                  selectedImage={activeCampaign.variants?.[activeVariant]?.bannerImage || selectedImage}
                                  onSelectImage={handleSelectImage}
                                />
                              </div>
                            </motion.div>
                          );
                        })()}

                        {workspaceView === 'screener' && (() => {
                          const activeVarData = activeCampaign.variants?.[activeVariant] || activeCampaign;
                          return (
                            <motion.div
                              key="stage-screener"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Spam, readability, checklist analytics */}
                              <DiagnosticStats
                                spamScore={activeVarData.spamScore}
                                spamTriggers={activeVarData.spamTriggers}
                                readabilityGrade={activeVarData.readabilityGrade}
                                readTime={activeVarData.readTime}
                                optimizationTips={activeVarData.optimizationTips}
                              />
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </>
                  ) : (
                    /* Empty onboarding state */
                    <div className="bg-white border border-[#1A1A1A]/10 rounded-none p-12 text-center flex flex-col items-center justify-center min-h-[520px]" id="empty-canvas-onboarding">
                      <div className="w-16 h-16 border border-[#1A1A1A]/20 flex items-center justify-center font-serif italic text-2xl mb-6 bg-[#FDFCFB]">
                        AI
                      </div>
                      <h2 className="font-serif text-3xl tracking-tight text-[#1A1A1A]">Design Your Campaign Narrative.</h2>
                      <p className="text-xs text-slate-500 max-w-sm mt-2 mb-8 font-serif italic">
                        Configure your guidelines and parameters. Our platform constructs multi-touch copies, responsive HTML drafts, and custom header visuals instantly.
                      </p>
                      
                      {/* Example prompt placeholders for fast fill */}
                      <div className="space-y-3 w-full max-w-md text-left bg-[#FDFCFB] p-6 border border-[#1A1A1A]/10">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-2">Selected Creative Prompts</span>
                        <button
                          onClick={() => handleGenerateCampaign({
                            campaignType: 'Product Launch',
                            audience: 'Remote Software Engineers & Tech Professionals',
                            description: 'A noise-canceling high-fidelity desk focus light with integrated ambient productivity wave sounds. It helps designers enter deep flow states faster.',
                            tone: 'Direct & Bold',
                            extraOffer: 'Use code FLOWLIGHT for 15% off and free shipping.',
                            brandingColor: '#0284c7'
                          })}
                          className="w-full text-left p-3.5 bg-white hover:bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs font-semibold flex items-center justify-between group transition-colors cursor-pointer"
                        >
                          <span className="font-serif italic text-[#1A1A1A]/80">Productivity Focus Desk Light Launch</span>
                          <ArrowRight className="w-4 h-4 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button
                          onClick={() => handleGenerateCampaign({
                            campaignType: 'Welcome Series',
                            audience: 'Culinary Enthusiasts & Home Bakers',
                            description: 'A monthly gourmet ingredient subscription box delivering rare artisanal salts, spices, and small-batch extra virgin olive oils straight from Greek and Italian orchards.',
                            tone: 'Friendly & Casual',
                            extraOffer: 'First month free on any 6-month membership.',
                            brandingColor: '#059669'
                          })}
                          className="w-full text-left p-3.5 bg-white hover:bg-[#F9F7F2] border border-[#1A1A1A]/10 text-xs font-semibold flex items-center justify-between group transition-colors cursor-pointer"
                        >
                          <span className="font-serif italic text-[#1A1A1A]/80">Gourmet Culinary Welcome Box</span>
                          <ArrowRight className="w-4 h-4 text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
          })()}

          {activeTab === 'assistant' && (
            <motion.div
              key="assistant-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full lg:flex lg:flex-col lg:overflow-hidden flex-1"
            >
              <GeminiBot onSendMessage={handleSendChatMessage} isSending={isGenerating} className="lg:flex-1 lg:h-full lg:min-h-0" />
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div
              key="docs-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-6xl mx-auto"
            >
              <DocsPage />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-6xl mx-auto"
            >
              <UserProfile 
                currentUser={currentUser} 
                isGuest={isGuest} 
                onLogOut={handleLogOut} 
                onSave={handleProfileSave} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      {(activeTab === 'docs' || activeTab === 'profile') && (
        <footer className="bg-white text-slate-400 text-[10px] py-6 text-center border-t border-[#1A1A1A]/10 mt-16 font-mono shrink-0">
          <p className="font-sans font-bold text-[#1A1A1A]/60 uppercase tracking-widest text-[9px]">Campaign Architect & Email Generator</p>
          <p className="mt-1">Styled in Editorial Aesthetic. Pure typographic hierarchy. Connected to Campaign Intelligence.</p>
        </footer>
      )}
    </div>
  );
}
