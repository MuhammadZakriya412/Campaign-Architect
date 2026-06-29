import React, { useState } from 'react';
import { 
  Mail, Lock, User, Building, ArrowRight, ShieldCheck, 
  HelpCircle, Sparkles, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface UserAccount {
  email: string;
  passwordHash: string; // stored plainly or simple hash for client sandbox
  fullName: string;
  companyName: string;
  createdAt: string;
}

interface AuthScreenProps {
  onAuthSuccess: (user: UserAccount) => void;
  onGuestAccess: () => void;
}

export default function AuthScreen({ onAuthSuccess, onGuestAccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Error / Status
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Get users from localStorage
  const getStoredUsers = (): UserAccount[] => {
    try {
      const stored = localStorage.getItem('campaign_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper: Save users to localStorage
  const saveStoredUsers = (users: UserAccount[]) => {
    try {
      localStorage.setItem('campaign_users', JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users database", e);
    }
  };

  // Password strength check helper
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "None", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, text: "Weak", color: "bg-rose-400" };
    if (score === 2) return { score, text: "Fair", color: "bg-amber-400" };
    if (score === 3) return { score, text: "Good", color: "bg-indigo-400" };
    return { score, text: "Strong", color: "bg-emerald-400" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    // Simulate small latency for realistic luxurious premium feel
    setTimeout(() => {
      const users = getStoredUsers();

      if (mode === 'login') {
        if (!email || !password) {
          setError("Please provide both email and password.");
          setIsLoading(false);
          return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email === normalizedEmail);

        if (!user || user.passwordHash !== password) {
          setError("Invalid email or password combination. Try Hamilton demo or register a new account.");
          setIsLoading(false);
          return;
        }

        onAuthSuccess(user);
      } 
      
      else if (mode === 'register') {
        if (!email || !password || !fullName || !companyName) {
          setError("All profile fields are mandatory for identity establishment.");
          setIsLoading(false);
          return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (users.some(u => u.email === normalizedEmail)) {
          setError("This email is already associated with an active brand license.");
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("For integrity, passwords must be at least 6 characters in length.");
          setIsLoading(false);
          return;
        }

        const newUser: UserAccount = {
          email: normalizedEmail,
          passwordHash: password,
          fullName: fullName.trim(),
          companyName: companyName.trim(),
          createdAt: new Date().toISOString()
        };

        const updatedUsers = [...users, newUser];
        saveStoredUsers(updatedUsers);

        // Pre-fill initial profile data for the new user in localStorage
        const initialProfile = {
          fullName: newUser.fullName,
          role: "Creative Director",
          companyName: newUser.companyName,
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
        localStorage.setItem(`campaign_user_profile_${newUser.email}`, JSON.stringify(initialProfile));

        onAuthSuccess(newUser);
      } 
      
      else if (mode === 'forgot') {
        if (!email) {
          setError("Please provide your email address to recover your key.");
          setIsLoading(false);
          return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = users.find(u => u.email === normalizedEmail);

        if (user) {
          setInfoMessage(`Security Reset: Your password is "${user.passwordHash}". (In a production environment, a secure cryptographic link would be dispatched).`);
        } else {
          setError("No registered account found with that email address.");
        }
        setIsLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-4 selection:bg-[#1A1A1A]/10 text-left" id="auth-screen-layout">
      {/* Background elegant accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#1A1A1A]" />
      
      <div className="w-full max-w-md bg-white border border-[#1A1A1A]/10 p-8 md:p-10 shadow-xs relative" id="auth-card-panel">
        
        {/* Curated Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1A1A1A] text-white font-serif italic text-xl font-bold mb-4">
            C
          </div>
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-slate-400 block mb-1">Campaign Intelligence Gate</span>
          <h2 className="text-2xl font-serif tracking-tight text-[#1A1A1A]">
            {mode === 'login' && "Sign In to Campaign"}
            {mode === 'register' && "Create Publisher Account"}
            {mode === 'forgot' && "Access Recovery Key"}
          </h2>
          <p className="text-xs text-slate-500 font-serif italic mt-1">
            {mode === 'login' && "Access your saved variants, historical copy, and voice profiles."}
            {mode === 'register' && "Establish your branding identity and generate custom newsletters."}
            {mode === 'forgot' && "Submit your email to fetch credentials stored in this local sandbox."}
          </p>
        </div>

        {/* Error / Info Banner */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="mb-5 bg-rose-50 border border-rose-200/50 p-3.5 text-rose-800 text-xs flex items-start gap-2.5"
              id="auth-error-banner"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="font-serif italic leading-relaxed">{error}</div>
            </motion.div>
          )}

          {infoMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="mb-5 bg-indigo-50 border border-indigo-200/50 p-3.5 text-indigo-900 text-xs flex items-start gap-2.5"
              id="auth-info-banner"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
              <div className="font-sans leading-relaxed text-left">
                <span className="font-bold block text-[10px] uppercase tracking-wider text-slate-800 mb-0.5">Sandbox Recovery</span>
                {infoMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Register Mode only) */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Eleanor Vance"
                  className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                />
              </div>
            </div>
          )}

          {/* Company Name (Register Mode only) */}
          {mode === 'register' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Company / Agency Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Atelier & Co."
                  className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor@atelier.co"
                className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
              />
            </div>
          </div>

          {/* Password (Login & Register modes) */}
          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase tracking-widest font-bold text-slate-500">Account Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[9px] text-[#1A1A1A] hover:underline font-mono"
                  >
                    Forgot Credentials?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-sans bg-[#FDFCFB] border border-[#1A1A1A]/15 p-2.5 pl-9 focus:outline-hidden focus:border-[#1A1A1A] hover:border-[#1A1A1A]/40 transition-all rounded-none"
                />
              </div>

              {/* Password strength bar for Register */}
              {mode === 'register' && password && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex justify-between text-[8px] font-mono text-slate-400">
                    <span>Password Security: {strength.text}</span>
                    <span>{strength.score}/4 criteria met</span>
                  </div>
                  <div className="h-1 bg-slate-100 w-full flex gap-1">
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A1A1A] hover:bg-black text-white p-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:bg-slate-400"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && "Verify & Enter"}
                  {mode === 'register' && "Establish Account"}
                  {mode === 'forgot' && "Recover Sandbox Credentials"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Bottom Switch Links */}
        <div className="mt-6 pt-5 border-t border-[#1A1A1A]/5 flex flex-col items-center gap-3">
          {mode === 'login' ? (
            <p className="text-xs text-slate-500 font-serif">
              New to Campaign Intelligence?{" "}
              <button 
                type="button" 
                onClick={() => { setMode('register'); setError(null); }}
                className="text-[#1A1A1A] font-sans font-bold hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 font-serif">
              Already have a brand license?{" "}
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(null); }}
                className="text-[#1A1A1A] font-sans font-bold hover:underline"
              >
                Sign in instead
              </button>
            </p>
          )}

          {/* Guest / Demo curation trigger */}
          <div className="relative w-full flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1A1A]/5" />
            </div>
            <span className="relative px-3 bg-white text-[8px] font-mono uppercase text-slate-400">or bypass</span>
          </div>

          <button
            type="button"
            onClick={onGuestAccess}
            className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-[#1A1A1A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Explore as Hamilton Demo (Curated)
          </button>
        </div>

      </div>
    </div>
  );
}
