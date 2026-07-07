import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import DottedWave from './DottedWave';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('m.vance@vanguardfreight.com');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A14] flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      {/* 1. Signature Exception: Ambient Dotted Wave Texture */}
      <DottedWave />

      {/* 2. Soft background light overlays */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C6FE0]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#D946C4]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Fine grain noise overlay */}
      <div className="grain-overlay" />

      {/* 3. Centered login card (Frosted violet-tinted glass) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[rgba(217,70,196,0.04)] backdrop-blur-2xl border border-[rgba(217,70,196,0.14)] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden"
      >
        {/* Decorative inner highlights */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#D946C4]/35 to-transparent pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#D946C4]/10 border border-[#D946C4]/30 items-center justify-center shadow-lg shadow-[#D946C4]/10 mb-4">
            <Shield className="text-[#D946C4]" size={28} />
          </div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-[#F2EEF9]">
            VANGUARD
          </h1>
          <p className="text-[10px] uppercase font-bold text-[#D946C4] tracking-[0.25em] mt-1">
            Logistics Command Hub
          </p>
          <p className="text-xs text-[#9090A6] mt-2 max-w-xs mx-auto">
            Authorize with security credentials to access fleet networks and dispatch ledgers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase text-[#9090A6] tracking-wider pl-1">
              Command Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9090A6] group-focus-within:text-[#D946C4] transition-colors">
                <Mail size={15} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/4 border border-[rgba(217,70,196,0.1)] text-xs text-[#F2EEF9] placeholder-[#9090A6]/50 focus:outline-none focus:border-[#D946C4] focus:bg-[rgba(217,70,196,0.06)] transition-all duration-200"
                placeholder="m.vance@vanguardfreight.com"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label className="block text-[10px] font-mono uppercase text-[#9090A6] tracking-wider">
                Access Token
              </label>
              <a href="#reset" className="text-[10px] text-[#7C6FE0] hover:text-[#D946C4] font-medium transition-colors">
                Reset Token
              </a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9090A6] group-focus-within:text-[#D946C4] transition-colors">
                <Lock size={15} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/4 border border-[rgba(217,70,196,0.1)] text-xs text-[#F2EEF9] placeholder-[#9090A6]/50 focus:outline-none focus:border-[#D946C4] focus:bg-[rgba(217,70,196,0.06)] transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#D946C4] hover:bg-[#c33eb0] text-stone-950 font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-[#D946C4]/15 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Access Command Hub</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="mt-6 pt-5 border-t border-[rgba(217,70,196,0.06)] flex items-center justify-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#9090A6]">
          <Sparkles size={11} className="text-[#D946C4] animate-pulse" />
          <span>AES-256 Encrypted Portal</span>
        </div>
      </motion.div>
    </div>
  );
}
