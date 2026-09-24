import React from 'react';
import { AlertCircle, Clock, CheckCircle, HelpCircle, Bookmark, ArrowRight } from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  isTimeUp?: boolean;
  totalQuestions: number;
  answeredCount: number;
  notAnsweredCount: number;
  markedForReviewCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  isTimeUp = false,
  totalQuestions,
  answeredCount,
  notAnsweredCount,
  markedForReviewCount,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      <div 
        className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-700 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Accent top gradient bar */}
        <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${isTimeUp ? 'from-rose-500 to-amber-500' : 'from-cyan-500 to-indigo-500'}`} />

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className={`p-2.5 rounded-xl border ${
            isTimeUp 
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-400' 
              : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
          }`}>
            {isTimeUp ? <Clock className="w-6 h-6 animate-pulse" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-display">
              {isTimeUp ? "Time's Up!" : "Are you sure you want to submit?"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isTimeUp 
                ? "Your 15-minute test duration has elapsed. Your answers have been automatically secured."
                : "Please review your test status summary before final submission. Once submitted, you cannot change your answers."}
            </p>
          </div>
        </div>

        {/* Summary Metric Pills */}
        <div className="grid grid-cols-3 gap-2.5 my-6">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Answered</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {answeredCount} <span className="text-xs text-slate-500 font-normal">/ {totalQuestions}</span>
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">Not Answered</span>
            <span className="text-lg font-bold text-slate-300 font-mono">
              {notAnsweredCount}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
            <span className="text-[11px] font-medium text-slate-400 block mb-1">For Review</span>
            <span className="text-lg font-bold text-violet-400 font-mono">
              {markedForReviewCount}
            </span>
          </div>

        </div>

        {/* Advisory Warning if unanswered */}
        {!isTimeUp && notAnsweredCount > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You still have {notAnsweredCount} unanswered question{notAnsweredCount > 1 ? 's' : ''}. Remember there is no negative marking!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!isTimeUp && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
            >
              Continue Test
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-lg transition-all cursor-pointer active:scale-95 ${
              isTimeUp 
                ? 'w-full justify-center bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 shadow-rose-900/40' 
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-cyan-900/40'
            }`}
          >
            <span>{isTimeUp ? "View Scorecard" : "Confirm & Submit"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
