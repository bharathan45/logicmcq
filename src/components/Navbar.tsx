import React from 'react';
import { Sparkles, Settings, RotateCcw, AlertTriangle, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { TeamInfo } from '../types/exam';

interface NavbarProps {
  currentView: 'registration' | 'instructions' | 'exam' | 'result' | 'admin' | 'locked';
  onNavigate: (view: 'registration' | 'instructions' | 'exam' | 'result' | 'admin' | 'locked') => void;
  team: TeamInfo | null;
  timeRemaining?: number;
  onOpenSubmitModal?: () => void;
  onResetSession?: () => void;
  onRequestAdmin?: () => void;
  isAdminAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  team,
  timeRemaining,
  onOpenSubmitModal,
  onResetSession,
  onRequestAdmin,
  isAdminAuthenticated = false
}) => {
  const formatTime = (totalSeconds?: number) => {
    if (totalSeconds === undefined) return '15:00';
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeRemaining !== undefined && timeRemaining <= 300 && timeRemaining > 120;
  const isCritical = timeRemaining !== undefined && timeRemaining <= 120;

  const handleAdminClick = () => {
    if (currentView === 'admin') {
      onNavigate(team ? 'instructions' : 'registration');
    } else if (onRequestAdmin) {
      onRequestAdmin();
    } else {
      onNavigate('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Zone 1: Brand Title Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (currentView === 'locked') return;
              if (currentView !== 'exam' || window.confirm("Are you sure you want to exit the exam view? Your progress will be saved in session.")) {
                onNavigate('registration');
              }
            }}
            className={`flex items-center gap-2.5 text-left group transition-transform focus:outline-none ${
              currentView === 'locked' ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-lg transition-all ${
              currentView === 'locked'
                ? 'bg-gradient-to-tr from-rose-600 to-amber-600 shadow-rose-950/40'
                : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-cyan-500/20 group-hover:shadow-cyan-500/40'
            }`}>
              {currentView === 'locked' ? (
                <Lock className="h-5 w-5 text-white" />
              ) : (
                <Sparkles className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-wider text-white flex items-center gap-1.5">
                LOGIC HUNT
                <span className={`text-xs font-mono font-medium tracking-normal px-1.5 py-0.5 rounded border ${
                  currentView === 'locked'
                    ? 'text-rose-400 bg-rose-950/80 border-rose-500/40'
                    : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
                }`}>
                  {currentView === 'locked' ? 'LOCKED' : 'R1'}
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean Status / Section Prose */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-400">
          {currentView === 'locked' ? (
            <div className="flex items-center gap-2 text-rose-300 font-mono">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-bold tracking-wide uppercase">EXAMINATION LOCKED • VIOLATION LIMIT REACHED</span>
            </div>
          ) : currentView === 'exam' ? (
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-display font-semibold tracking-wide text-slate-200 uppercase">ROUND 1 – ONLINE MCQ CHALLENGE</span>
              {team && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 truncate max-w-[200px]">Team: {team.teamName}</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-medium">Think</span>
              <span className="text-cyan-500">·</span>
              <span className="text-slate-300 font-medium">Analyze</span>
              <span className="text-indigo-400">·</span>
              <span className="text-slate-300 font-medium">Solve</span>
            </div>
          )}
        </div>

        {/* Zone 3: Primary Actions & Real-Time Timer if in exam */}
        <div className="flex items-center gap-3">
          {currentView === 'exam' && timeRemaining !== undefined ? (
            <div className="flex items-center gap-3">
              {/* Real-time countdown timer */}
              <div 
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-sm font-semibold tracking-wider transition-all duration-300 ${
                  isCritical 
                    ? 'timer-critical bg-rose-950/70 border-rose-500/80 text-rose-300' 
                    : isWarning 
                    ? 'bg-amber-950/60 border-amber-500/60 text-amber-300' 
                    : 'bg-slate-900/80 border-slate-700 text-cyan-300 shadow-sm'
                }`}
                title="Time remaining until automatic submission"
              >
                {isCritical && <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" />}
                <span className="text-xs text-slate-400 font-sans hidden sm:inline">Time Left:</span>
                <span className="text-base tabular-nums font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {onOpenSubmitModal && (
                <button
                  onClick={onOpenSubmitModal}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-lg shadow-sm shadow-cyan-900/40 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  Submit
                </button>
              )}
            </div>
          ) : currentView === 'locked' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/80 transition-all cursor-pointer"
                title="Proctor unlock login"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Proctor Desk Login</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {team && onResetSession && currentView !== 'registration' && (
                <button
                  onClick={() => {
                    if (window.confirm("Restart a new session? Current test responses will be cleared.")) {
                      onResetSession();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Start with another team"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New Session</span>
                </button>
              )}

              <button
                onClick={handleAdminClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : isAdminAuthenticated
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
                title="Admin & Security Manager"
              >
                {currentView === 'admin' ? (
                  <>
                    <Settings className="h-3.5 w-3.5" />
                    <span>Back to App</span>
                  </>
                ) : isAdminAuthenticated ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Admin Hub</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </>
                ) : (
                  <>
                    <Settings className="h-3.5 w-3.5" />
                    <span>Admin Hub</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
