import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Maximize, 
  Clock, 
  CheckCircle2, 
  XOctagon 
} from 'lucide-react';
import { ViolationRecord } from '../types/exam';

interface ViolationWarningOverlayProps {
  isOpen: boolean;
  currentViolation: ViolationRecord | null;
  violationCount: number;
  maxViolations: number;
  isFullscreenExit: boolean;
  onRequestFullscreen: () => void;
  onAcknowledge: () => void;
}

export const ViolationWarningOverlay: React.FC<ViolationWarningOverlayProps> = ({
  isOpen,
  currentViolation,
  violationCount,
  maxViolations,
  isFullscreenExit,
  onRequestFullscreen,
  onAcknowledge
}) => {
  if (!isOpen) return null;

  const isFinalWarning = violationCount === maxViolations - 1;
  const remainingAttempts = Math.max(0, maxViolations - violationCount);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="violation-title"
    >
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-rose-500/80 relative overflow-hidden bg-slate-950 text-slate-100">
        
        {/* Pulsing warning indicator bar */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

        {/* Header Icon and Title */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border-2 border-rose-500 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/50">
            {isFinalWarning ? (
              <XOctagon className="w-8 h-8 animate-bounce text-rose-400" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/50 text-rose-300 text-[11px] font-mono uppercase font-bold tracking-wider mb-1.5">
              <span>Exam Security Protocol</span>
            </div>
            <h2 id="violation-title" className="text-xl sm:text-2xl font-extrabold text-white font-display">
              {isFinalWarning ? "FINAL SECURITY WARNING" : "EXAM RULE VIOLATION DETECTED"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active test interactions are temporarily suspended. Your test timer continues to run.
            </p>
          </div>
        </div>

        {/* Strike Counter Box */}
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Violation Strike
            </span>
            <span className="font-mono text-base font-extrabold text-rose-400">
              {violationCount} / {maxViolations}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm font-semibold text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{currentViolation?.message || "Restricted activity detected."}</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Timestamp: {currentViolation ? new Date(currentViolation.timestamp).toLocaleTimeString() : 'Just now'}
            </div>
          </div>

          {/* Warning Message Bar */}
          <div className="mt-4 pt-3 border-t border-rose-500/20 text-xs text-rose-200/90 leading-relaxed">
            {isFinalWarning ? (
              <strong className="text-rose-400 font-bold block">
                CRITICAL: One more violation will immediately lock your test, save your current responses, and submit the examination automatically!
              </strong>
            ) : (
              <span>
                You have <strong>{remainingAttempts}</strong> remaining violation attempt{remainingAttempts > 1 ? 's' : ''} before automatic test termination.
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          {isFullscreenExit ? (
            <button
              type="button"
              onClick={onRequestFullscreen}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-lg shadow-rose-950/60 transition-all cursor-pointer active:scale-95"
            >
              <Maximize className="w-4 h-4" />
              <span>Re-Enter Fullscreen & Resume</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAcknowledge}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-950/60 transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Acknowledge & Resume Test</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
