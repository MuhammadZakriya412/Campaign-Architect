import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, Globe, Building, Award, Megaphone, 
  Sparkles, CheckCircle, Save, RotateCcw, 
  ShieldAlert, LogOut, Lock, Mail, Calendar, Key
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserAccount } from './AuthScreen';

export interface UserProfileData {
  fullName: string;
  role: string;
  companyName: string;
  website: string;
  industry: string;
  targetAudience: string;
  brandVoice: string;
  valueProposition: string;
  brandColor: string;
  keyProducts: string;
  brandStory: string;
  copywritingRules: string;
}

const DEFAULT_PROFILE: UserProfileData = {
  fullName: "Eleanor Vance",
  role: "Lead Creative Director",
  companyName: "Atelier & Co.",
  website: "https://atelier.co",
  industry: "Bespoke Lifestyle & Design Accessories",
  targetAudience: "Discerning urban professionals valuing minimalism, craftsmanship, and tactile excellence.",
  brandVoice: "Understated, literary, warm, confident, and deeply narrative-focused.",
  valueProposition: "Bringing timeless aesthetic utility and tactile joy to modern everyday workspaces.",
  brandColor: "#7c3aed",
  keyProducts: "Hand-stitched vegetable-tanned desk pads, raw architectural brass pens, and heavy-linen archival notebooks.",
  brandStory: "Atelier was founded in a sun-drenched timber loft with a single guiding principle: that our physical workspace tools should inspire the abstract intellectual labor we put into them.",
  copywritingRules: "Strictly avoid hyper-salesy adjectives, multiple exclamation marks, false urgency count-downs, or shouting in capitals."
};

interface UserProfileProps {
  currentUser: UserAccount | null;
  isGuest: boolean;
  onLogOut: () => void;
  onSave?: (profile: UserProfileData) => void;
  className?: string;
}

export default function UserProfile({ currentUser, isGuest, onLogOut, onSave, className = "" }: UserProfileProps) {
  // Key suffix for multiple users
  const userKeySuffix = currentUser ? `_${currentUser.email}` : '';

  const [profile, setProfile] = useState<UserProfileData>(() => {
    try {
      const stored = localStorage.getItem(`campaign_user_profile${userKeySuffix}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load user profile", e);
    }
    
    // Fallback/Initial Setup
    if (currentUser) {
      return {
        fullName: currentUser.fullName,
        role: "Creative Director",
        companyName: currentUser.companyName,
        website: "",
        industry: "",
        targetAudience: "",
        brandVoice: "Authentic, high-end, and editorial.",
        valueProposition: "",
        brandColor: "#0284c7",
        keyProducts: "",
        brandStory: "",
        copywritingRules: "Strictly avoid hyper-salesy adjectives or shouting in capitals."
      };
    }
    return DEFAULT_PROFILE;
  });

  const [isSavedToast, setIsSavedToast] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'identity' | 'dna' | 'rules'>('all');

  // Sync profile when currentUser changes
  useEffect(() => {
    let active = true;
    async function loadProfile() {
      if (!currentUser || !currentUser.uid) {
        setProfile(DEFAULT_PROFILE);
        return;
      }
      
      // Load from localStorage as fast initial cache
      try {
        const stored = localStorage.getItem(`campaign_user_profile${userKeySuffix}`);
        if (stored && active) {
          setProfile(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Local profile read failed", err);
      }

      // Fetch from Firestore to ensure synced latest version
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        const docRef = doc(db, "profiles", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && active) {
          const remoteProfile = docSnap.data() as UserProfileData;
          setProfile(remoteProfile);
          localStorage.setItem(`campaign_user_profile${userKeySuffix}`, JSON.stringify(remoteProfile));
          if (onSave) {
            onSave(remoteProfile);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile from Firestore", err);
      }
    }
    
    if (currentUser && currentUser.uid) {
      loadProfile();
    } else {
      setProfile(DEFAULT_PROFILE);
    }
    
    return () => {
      active = false;
    };
  }, [currentUser, userKeySuffix]);

  const handleChange = (key: keyof UserProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem(`campaign_user_profile${userKeySuffix}`, JSON.stringify(profile));
      
      if (currentUser && currentUser.uid) {
        const { doc, setDoc } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        await setDoc(doc(db, "profiles", currentUser.uid), profile);
      }
      
      if (onSave) {
        onSave(profile);
      }
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 4000);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  const handleLoadInspiration = async () => {
    if (window.confirm("Overwrite your current profile entries with the Eleanor Vance (Atelier & Co.) curated demo?")) {
      setProfile(DEFAULT_PROFILE);
      localStorage.setItem(`campaign_user_profile${userKeySuffix}`, JSON.stringify(DEFAULT_PROFILE));
      
      if (currentUser && currentUser.uid) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("../lib/firebase");
          await setDoc(doc(db, "profiles", currentUser.uid), DEFAULT_PROFILE);
        } catch (err) {
          console.error("Failed to sync Eleanor Vance profile to Firestore", err);
        }
      }
      
      if (onSave) {
        onSave(DEFAULT_PROFILE);
      }
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 4000);
    }
  };

  const handleClearProfile = () => {
    if (window.confirm("Are you sure you want to clear your profile info? This will reset all fields to empty.")) {
      const emptyProfile: UserProfileData = {
        fullName: "",
        role: "",
        companyName: "",
        website: "",
        industry: "",
        targetAudience: "",
        brandVoice: "",
        valueProposition: "",
        brandColor: "#0284c7",
        keyProducts: "",
        brandStory: "",
        copywritingRules: ""
      };
      setProfile(emptyProfile);
      localStorage.setItem(`campaign_user_profile${userKeySuffix}`, JSON.stringify(emptyProfile));
      if (onSave) {
        onSave(emptyProfile);
      }
    }
  };

  return (
    <div className={`w-full max-w-5xl mx-auto flex flex-col gap-8 text-left pb-16 px-4 md:px-0 ${className}`} id="user-profile-editor">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1A1A1A]/10 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#1A1A1A]/40 uppercase block mb-1">
            Persisted Workspace Profile
          </span>
          <h1 className="text-3xl font-serif text-[#1A1A1A] tracking-tight">
            Sender & Brand Intelligence
          </h1>
          <p className="text-xs text-slate-500 font-serif italic mt-1.5 max-w-2xl">
            Configure your professional profile, audience specifications, and brand voice guardrails. This metadata integrates as deep context for generating personalized email variants and strategy recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleLoadInspiration}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#1A1A1A]/15 bg-[#E5E1D8]/20 hover:bg-[#E5E1D8]/40 text-[#1A1A1A] text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer"
            title="Pre-fill form with editorial inspiration data"
          >
            <RotateCcw className="w-3 h-3" />
            Load Inspiration
          </button>
          
          <button
            type="button"
            onClick={handleClearProfile}
            className="flex items-center gap-2 px-3 py-1.5 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-[10px] uppercase tracking-wider font-bold transition-all cursor-pointer"
          >
            Clear Fields
          </button>
        </div>
      </div>

      {/* Account Info Bar */}
      <div className="bg-white border border-[#1A1A1A]/10 p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center" id="auth-info-card">
        <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center text-lg font-serif italic">
            {profile.fullName ? profile.fullName.trim().charAt(0) : (isGuest ? 'G' : 'U')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-sans font-black uppercase tracking-wider text-[#1A1A1A]">
                {isGuest ? "Curated Hamilton Demo Account" : profile.fullName}
              </h2>
              {isGuest ? (
                <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[8px] font-mono uppercase px-1.5 py-0.5 font-bold animate-pulse">
                  Guest Session
                </span>
              ) : (
                <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8px] font-mono uppercase px-1.5 py-0.5 font-bold">
                  Registered Publisher
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-1 text-xs text-slate-500 font-sans">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{isGuest ? "guest@sandbox.campaign.architect" : (currentUser?.email)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{isGuest ? "Atelier & Co. (Hamilton Trial)" : (profile.companyName || "N/A")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex justify-start md:justify-end shrink-0">
          <button
            type="button"
            onClick={onLogOut}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-700 text-[10px] uppercase tracking-widest font-black transition-all cursor-pointer shadow-xs"
            id="sign-out-button"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out / Revoke Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation panel */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1.5 border-b lg:border-b-0 border-[#1A1A1A]/10 pb-4 lg:pb-0 lg:pr-6 overflow-x-auto shrink-0 h-full">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-none transition-all cursor-pointer text-left whitespace-nowrap ${
              activeSection === 'all'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-[#E5E1D8]/30 hover:text-[#1A1A1A]'
            }`}
          >
            Show All Parameters
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('identity')}
            className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-none transition-all cursor-pointer text-left whitespace-nowrap ${
              activeSection === 'identity'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-[#E5E1D8]/30 hover:text-[#1A1A1A]'
            }`}
          >
            Personal & Org Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('dna')}
            className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-none transition-all cursor-pointer text-left whitespace-nowrap ${
              activeSection === 'dna'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-[#E5E1D8]/30 hover:text-[#1A1A1A]'
            }`}
          >
            Brand DNA & Voice
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('rules')}
            className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border rounded-none transition-all cursor-pointer text-left whitespace-nowrap ${
              activeSection === 'rules'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-transparent text-slate-500 border-transparent hover:bg-[#E5E1D8]/30 hover:text-[#1A1A1A]'
            }`}
          >
            Guardrails & Styles
          </button>
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSave} className="lg:col-span-9 space-y-8">
          
          {/* Toast Alert */}
          {isSavedToast && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-none flex items-center justify-between gap-3 text-emerald-900 animate-fadeIn" id="profile-success-toast">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <div className="text-xs font-serif italic text-left">
                  <span className="font-sans font-bold uppercase tracking-wider not-italic block mb-0.5 text-[#1A1A1A]">Intelligence Synchronized</span>
                  Your profile and brand metadata has been successfully saved to your private cloud container session.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: Personal & Professional Identity */}
          {(activeSection === 'all' || activeSection === 'identity') && (
            <div className="bg-white p-6 border border-[#1A1A1A]/10 space-y-5 rounded-none animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-[#1A1A1A]/5 pb-3 mb-2">
                <div className="p-1.5 bg-[#E5E1D8]/30 text-[#1A1A1A]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-sans font-black uppercase tracking-widest text-[#1A1A1A]">01 / Personal & Professional Identity</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-serif italic">This identity is embedded into signature blocks, welcome notes, and personalized strategy reports.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Full Professional Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="e.g. Alexander Hamilton"
                      className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Your Role / Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      value={profile.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      placeholder="e.g. Growth & Lifecycle Marketer"
                      className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Company / Brand Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                    />
                  </div>
                </div>

                {/* Website / Portfolio */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="e.g. https://example.com"
                      className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                    />
                  </div>
                </div>

                {/* Industry / Niche */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Industry / Vertical</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      value={profile.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      placeholder="e.g. Direct-To-Consumer Gourmet Food & Kitchenware"
                      className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Brand DNA & Voice */}
          {(activeSection === 'all' || activeSection === 'dna') && (
            <div className="bg-white p-6 border border-[#1A1A1A]/10 space-y-5 rounded-none animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-[#1A1A1A]/5 pb-3 mb-2">
                <div className="p-1.5 bg-[#E5E1D8]/30 text-[#1A1A1A]">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-sans font-black uppercase tracking-widest text-[#1A1A1A]">02 / Brand DNA & Voice</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-serif italic">Provide core structural context so generated emails precisely target your audience and echo your brand's unique character.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Brand Value Proposition */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Core Value Proposition</label>
                    <span className="text-[8px] text-slate-400 font-mono">Recommended length: 1-2 sentences</span>
                  </div>
                  <textarea 
                    value={profile.valueProposition}
                    onChange={(e) => handleChange('valueProposition', e.target.value)}
                    placeholder="Describe what unique problem you solve and for whom..."
                    rows={2}
                    className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none resize-none"
                  />
                </div>

                {/* Target Audience Persona */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Target Audience Persona & Habits</label>
                  <textarea 
                    value={profile.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    placeholder="Explain who your primary buyers are, what they care about, and their daily behaviors..."
                    rows={2}
                    className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none resize-none"
                  />
                </div>

                {/* Brand Voice / Tone Guidelines */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Brand Voice & Style Guide</label>
                  <textarea 
                    value={profile.brandVoice}
                    onChange={(e) => handleChange('brandVoice', e.target.value)}
                    placeholder="e.g. Understated, literary, confident, zero marketing jargon, warm but professional..."
                    rows={2}
                    className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none resize-none"
                  />
                </div>

                {/* Key Products/Services */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Flagship Products & Services</label>
                  <textarea 
                    value={profile.keyProducts}
                    onChange={(e) => handleChange('keyProducts', e.target.value)}
                    placeholder="List or describe your main offerings, prices, and features..."
                    rows={2}
                    className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none resize-none"
                  />
                </div>

                {/* Core Brand Story */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Founder story / Why we exist</label>
                  <textarea 
                    value={profile.brandStory}
                    onChange={(e) => handleChange('brandStory', e.target.value)}
                    placeholder="The emotional hook of your brand that can be woven into welcome campaigns or newsletter stories..."
                    rows={3}
                    className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Guardrails & Styles */}
          {(activeSection === 'all' || activeSection === 'rules') && (
            <div className="bg-white p-6 border border-[#1A1A1A]/10 space-y-5 rounded-none animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-[#1A1A1A]/5 pb-3 mb-2">
                <div className="p-1.5 bg-[#E5E1D8]/30 text-[#1A1A1A]">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-sans font-black uppercase tracking-widest text-[#1A1A1A]">03 / Guardrails & Style Preferences</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-serif italic">Fine-tune formatting details and set rules on words to avoid to stay clear of spam filters.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {/* Default Brand Color */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Default Brand Color (Hex Code)</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-2.5 font-mono text-xs text-slate-400">#</span>
                      <input 
                        type="text"
                        value={profile.brandColor.replace('#', '')}
                        onChange={(e) => handleChange('brandColor', `#${e.target.value}`)}
                        placeholder="7c3aed"
                        maxLength={7}
                        className="w-full text-xs font-mono bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-7 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                      />
                    </div>
                    <div 
                      className="w-10 h-10 border border-[#1A1A1A]/20 transition-all shrink-0" 
                      style={{ backgroundColor: profile.brandColor || '#0284c7' }} 
                    />
                  </div>
                </div>

                {/* Custom Copywriting Rules */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Spam & Tone Exclusions / Forbidden Words</label>
                  <textarea 
                    value={profile.copywritingRules}
                    onChange={(e) => handleChange('copywritingRules', e.target.value)}
                    placeholder="e.g. Never use words like 'FREE', 'BUY NOW', or 'GUARANTEED' in subject lines. Avoid passive voice..."
                    rows={3}
                    className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Persistent Action Bar */}
          <div className="flex justify-end pt-4 border-t border-[#1A1A1A]/10 gap-3">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-black rounded-none border border-[#1A1A1A] transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              Save Brand Intelligence
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
