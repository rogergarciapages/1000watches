import React from 'react';

export default function OAuthConsentPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl text-center space-y-6">
        <h1 className="text-2xl font-display font-light text-amber-500">Authorization Request</h1>
        <p className="text-white/50 text-sm">
          1,000 Watches is requesting access to your account to provide a personalized experience.
        </p>
        
        <div className="pt-6 flex flex-col gap-3">
          <button className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-widest transition-all">
            Approve Access
          </button>
          <button className="w-full py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 font-bold text-xs uppercase tracking-widest transition-all">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
