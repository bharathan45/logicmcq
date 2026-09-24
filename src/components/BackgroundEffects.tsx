import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-slate-950">
      {/* Radial soft gradient orbs */}
      <div 
        className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[130px]" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-violet-600/10 blur-[140px]" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-indigo-900/15 blur-[150px]" 
        aria-hidden="true" 
      />
      
      {/* Subtle digital grid pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-70"
        aria-hidden="true"
      />
    </div>
  );
};
