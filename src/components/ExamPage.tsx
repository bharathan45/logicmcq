import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  RotateCcw, 
  Send, 
  Menu, 
  X, 
  HelpCircle, 
  Check, 
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Maximize2,
  Lock
} from 'lucide-react';
import { Question, TeamInfo, AdminSettings, ViolationRecord } from '../types/exam';
import { SubmitModal } from './SubmitModal';
import { ViolationWarningOverlay } from './ViolationWarningOverlay';
import { useAntiCheating } from '../hooks/useAntiCheating';

interface ExamPageProps {
  questions: Question[];
  team: TeamInfo;
  timeRemainingSeconds: number;
  answers: Record<number, number>;
  markedForReview: Record<number, boolean>;
  visitedQuestions: Record<number, boolean>;
  currentQuestionIndex: number;
  adminSettings: AdminSettings;
  isSubmitModalOpen: boolean;
  setIsSubmitModalOpen: (open: boolean) => void;
  onSelectOption: (questionId: number, optionIndex: number) => void;
  onClearOption: (questionId: number) => void;
  onToggleReview: (questionId: number) => void;
  onJumpToQuestion: (index: number) => void;
  onSubmitExam: (autoSubmitted?: boolean) => void;
  onLockExam: (violations: ViolationRecord[], reason: string) => void;
  onViolationRecorded?: (record: ViolationRecord) => void;
}

export const ExamPage: React.FC<ExamPageProps> = ({
  questions,
  team,
  timeRemainingSeconds,
  answers,
  markedForReview,
  visitedQuestions,
  currentQuestionIndex,
  adminSettings,
  isSubmitModalOpen,
  setIsSubmitModalOpen,
  onSelectOption,
  onClearOption,
  onToggleReview,
  onJumpToQuestion,
  onSubmitExam,
  onLockExam,
  onViolationRecorded
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isTimeUpModalOpen, setIsTimeUpModalOpen] = useState(false);

  // Strict Anti-Cheating & Exam Lock System Hook
  const {
    violations,
    violationCount,
    currentWarning,
    isWarningOverlayOpen,
    isFullscreenExitWarning,
    requestFullscreen,
    acknowledgeWarning
  } = useAntiCheating({
    isActive: true,
    team,
    adminSettings,
    onViolationOccurred: onViolationRecorded,
    onLockTriggered: (viols, reason) => {
      onLockExam(viols, reason);
    }
  });

  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const totalQuestions = questions.length;

  // Track counts
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const notAnsweredCount = totalQuestions - answeredCount;

  // Auto-submit trigger when timer hits 0
  useEffect(() => {
    if (timeRemainingSeconds <= 0 && !isTimeUpModalOpen) {
      setIsTimeUpModalOpen(true);
      const timeout = setTimeout(() => {
        onSubmitExam(true);
      }, 1600);
      return () => clearTimeout(timeout);
    }
  }, [timeRemainingSeconds, isTimeUpModalOpen, onSubmitExam]);

  // Keyboard navigation shortcuts (suspended if warning overlay is active)
  useEffect(() => {
    if (isWarningOverlayOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' && currentQuestionIndex < totalQuestions - 1) {
        onJumpToQuestion(currentQuestionIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        onJumpToQuestion(currentQuestionIndex - 1);
      } else if (['1', 'a', 'A'].includes(e.key)) {
        onSelectOption(currentQuestion.id, 0);
      } else if (['2', 'b', 'B'].includes(e.key)) {
        onSelectOption(currentQuestion.id, 1);
      } else if (['3', 'c', 'C'].includes(e.key)) {
        onSelectOption(currentQuestion.id, 2);
      } else if (['4', 'd', 'D'].includes(e.key)) {
        onSelectOption(currentQuestion.id, 3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, totalQuestions, currentQuestion, onJumpToQuestion, onSelectOption, isWarningOverlayOpen]);

  // Difficulty badge colors
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-500/30';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/70 border-amber-500/30';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/70 border-rose-500/30';
      default:
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-500/30';
    }
  };

  // Helper for question button styling in navigator
  const getQuestionState = (index: number) => {
    const q = questions[index];
    const isCurrent = index === currentQuestionIndex;
    const isAnswered = answers[q.id] !== undefined;
    const isMarked = !!markedForReview[q.id];
    const isVisited = !!visitedQuestions[q.id];

    return { isCurrent, isAnswered, isMarked, isVisited };
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col select-none">
      
      {/* Top Proctored Anti-Cheating Status Bar */}
      <div className="w-full bg-slate-950/90 border-b border-slate-800/80 px-4 py-2 backdrop-blur-md flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-300 font-medium">
            Strict Exam Lockdown Active
          </span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tab Switch & Shortcut Restrictions ON</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Strikes Counter Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold ${
            violationCount === 0 
              ? 'bg-slate-900 border-slate-800 text-slate-400' 
              : violationCount === 1 
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' 
                : 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Strikes: {violationCount} / {adminSettings.maxViolations}</span>
          </div>

          <button
            type="button"
            onClick={requestFullscreen}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors cursor-pointer"
            title="Ensure fullscreen active"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden md:inline">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Mobile Bar: Question progress & Drawer trigger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Q {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getDifficultyBadge(currentQuestion.difficulty)}`}>
            {currentQuestion.difficulty}
          </span>
        </div>

        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-700"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Question Grid</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className={`flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-opacity duration-200 ${
        isWarningOverlayOpen ? 'opacity-40 pointer-events-none' : ''
      }`}>
        
        {/* =========================================================================
            LEFT ZONE: QUESTION AREA & ACTION CONTROLS (8 Cols on Desktop)
           ========================================================================= */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-xl relative border border-slate-800 flex flex-col justify-between min-h-[520px]">
            
            <div>
              {/* Question Header Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-6">
                
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-white bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
                    Question {currentQuestionIndex + 1} <span className="text-slate-500 font-normal">/ {totalQuestions}</span>
                  </span>

                  <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg border ${getDifficultyBadge(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty}
                  </span>

                  {currentQuestion.category && (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {currentQuestion.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    +{currentQuestion.marks} Mark
                  </span>

                  {markedForReview[currentQuestion.id] && (
                    <span className="text-xs font-medium text-violet-300 bg-violet-950/70 border border-violet-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Bookmark className="w-3 h-3 fill-current" />
                      <span>Review</span>
                    </span>
                  )}
                </div>

              </div>

              {/* Question Statement */}
              <div className="mb-8">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-slate-100 leading-relaxed tracking-normal font-sans select-none">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options Grid (A, B, C, D) */}
              <div className="space-y-3.5" role="radiogroup" aria-label="Answer options">
                {currentQuestion.options.map((optionText, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      type="button"
                      key={optIdx}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onSelectOption(currentQuestion.id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 group cursor-pointer select-none ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300'
                      }`}
                    >
                      {/* Option Letter Key Badge */}
                      <span
                        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white border border-slate-700'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </span>

                      {/* Option Text */}
                      <span className={`text-sm sm:text-base font-medium flex-1 pt-0.5 leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}>
                        {optionText}
                      </span>

                      {/* Selection Check Circle */}
                      <div className="flex-shrink-0 pt-1">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                            : 'border-slate-700 bg-slate-900/80 group-hover:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Bottom Action Controls Bar */}
            <div className="pt-8 mt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              
              {/* Left group: Previous & Clear Answer */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => onJumpToQuestion(currentQuestionIndex - 1)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    currentQuestionIndex === 0
                      ? 'bg-slate-900/40 text-slate-600 border-slate-800/50 cursor-not-allowed'
                      : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-800 active:scale-95'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {answers[currentQuestion.id] !== undefined && (
                  <button
                    type="button"
                    onClick={() => onClearOption(currentQuestion.id)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                    title="Remove selected option"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear Answer</span>
                  </button>
                )}
              </div>

              {/* Right group: Mark for Review & Next */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onToggleReview(currentQuestion.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    markedForReview[currentQuestion.id]
                      ? 'bg-violet-950/80 text-violet-300 border-violet-500/60 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-violet-300 border-slate-700 hover:border-violet-500/40 hover:bg-slate-800'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${markedForReview[currentQuestion.id] ? 'fill-current' : ''}`} />
                  <span>{markedForReview[currentQuestion.id] ? 'Marked' : 'Mark for Review'}</span>
                </button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => onJumpToQuestion(currentQuestionIndex + 1)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-950/50 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Quick Keyboard shortcuts hint */}
          <div className="hidden sm:flex items-center justify-between text-[11px] text-slate-500 px-2 font-mono">
            <span>Keys [1-4] or [A-D]: Select option</span>
            <span>Keys [← / →]: Previous / Next</span>
          </div>

        </main>

        {/* =========================================================================
            RIGHT ZONE: QUESTION NAVIGATOR & TEST SUMMARY (4 Cols on Desktop)
           ========================================================================= */}
        <aside className="hidden lg:block lg:col-span-4">
          
          <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800 sticky top-24">
            
            {/* Panel Title & Team info */}
            <div className="border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-sm tracking-wide uppercase">
                  Question Navigator
                </h3>
                <span className="text-[11px] font-mono text-cyan-400">
                  {answeredCount}/{totalQuestions} Done
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-400 truncate">
                {team.teamName} · {team.collegeName}
              </div>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 shrink-0" />
                <span>Unvisited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/25 border border-emerald-500 text-emerald-400 shrink-0" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-300 shrink-0" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-violet-600/30 border border-violet-400 text-violet-300 shrink-0" />
                <span>For Review</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-slate-800">
                <span className="relative w-3 h-3 rounded bg-violet-600/30 border border-violet-400 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>
                <span>Answered + Marked for Review</span>
              </div>
            </div>

            {/* 15 Question Matrix Buttons */}
            <div className="mb-6">
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const { isCurrent, isAnswered, isMarked } = getQuestionState(idx);

                  let btnStyle = "bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white";

                  if (isCurrent) {
                    btnStyle = "bg-cyan-500/30 text-cyan-200 border-cyan-400 ring-2 ring-cyan-500/40 font-bold shadow-md shadow-cyan-950";
                  } else if (isAnswered && isMarked) {
                    btnStyle = "bg-violet-950/80 text-violet-200 border-violet-400 font-semibold shadow-sm";
                  } else if (isAnswered) {
                    btnStyle = "bg-emerald-950/70 text-emerald-300 border-emerald-500/70 font-semibold shadow-sm";
                  } else if (isMarked) {
                    btnStyle = "bg-violet-950/60 text-violet-300 border-violet-500/60";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => onJumpToQuestion(idx)}
                      className={`relative h-10 rounded-xl text-xs font-mono transition-all flex items-center justify-center cursor-pointer active:scale-90 border ${btnStyle}`}
                      title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Not Answered'}${isMarked ? ' (Marked for review)' : ''}`}
                    >
                      <span>{idx + 1}</span>

                      {isAnswered && isMarked && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Tallies */}
            <div className="space-y-2 mb-6 text-xs">
              <div className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-800/60">
                <span>Total Questions</span>
                <span className="font-mono text-white font-semibold">{totalQuestions}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400 py-1 border-b border-slate-800/60">
                <span>Answered</span>
                <span className="font-mono font-semibold">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 py-1 border-b border-slate-800/60">
                <span>Unanswered</span>
                <span className="font-mono text-slate-300 font-semibold">{notAnsweredCount}</span>
              </div>
              <div className="flex items-center justify-between text-violet-400 py-1">
                <span>Marked for Review</span>
                <span className="font-mono font-semibold">{markedCount}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-950/60 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Test</span>
            </button>

          </div>

        </aside>

      </div>

      {/* =========================================================================
          MOBILE DRAWER / MODAL FOR QUESTION NAVIGATOR
         ========================================================================= */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs bg-slate-950 border-l border-slate-800 h-full p-5 overflow-y-auto flex flex-col justify-between">
            
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Question Navigator</h3>
                  <p className="text-[11px] text-slate-400">Round 1 ({answeredCount}/{totalQuestions} Answered)</p>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((q, idx) => {
                  const { isCurrent, isAnswered, isMarked } = getQuestionState(idx);

                  let btnStyle = "bg-slate-900 text-slate-400 border-slate-800";
                  if (isCurrent) {
                    btnStyle = "bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold ring-2 ring-cyan-500/40";
                  } else if (isAnswered && isMarked) {
                    btnStyle = "bg-violet-950 text-violet-200 border-violet-400 font-semibold";
                  } else if (isAnswered) {
                    btnStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-500 font-semibold";
                  } else if (isMarked) {
                    btnStyle = "bg-violet-950/60 text-violet-300 border-violet-500/60";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        onJumpToQuestion(idx);
                        setIsMobileNavOpen(false);
                      }}
                      className={`relative h-10 rounded-xl text-xs font-mono flex items-center justify-center border ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isAnswered && isMarked && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Legend */}
              <div className="space-y-1.5 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500/25 border border-emerald-500" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                  <span>Unanswered ({notAnsweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-violet-600/30 border border-violet-400" />
                  <span>Marked for Review ({markedCount})</span>
                </div>
              </div>
            </div>

            {/* Mobile Submit Action */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  setIsSubmitModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 shadow-lg"
              >
                Submit Test
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Strict Anti-Cheating Violation Warning Overlay */}
      <ViolationWarningOverlay
        isOpen={isWarningOverlayOpen}
        currentViolation={currentWarning}
        violationCount={violationCount}
        maxViolations={adminSettings.maxViolations}
        isFullscreenExit={isFullscreenExitWarning}
        onRequestFullscreen={requestFullscreen}
        onAcknowledge={acknowledgeWarning}
      />

      {/* Manual Submission Confirmation Modal */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        isTimeUp={false}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        notAnsweredCount={notAnsweredCount}
        markedForReviewCount={markedCount}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={() => {
          setIsSubmitModalOpen(false);
          onSubmitExam(false);
        }}
      />

      {/* Time's Up Auto Submission Modal */}
      <SubmitModal
        isOpen={isTimeUpModalOpen}
        isTimeUp={true}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        notAnsweredCount={notAnsweredCount}
        markedForReviewCount={markedCount}
        onCancel={() => {}}
        onConfirm={() => {
          setIsTimeUpModalOpen(false);
          onSubmitExam(true);
        }}
      />

    </div>
  );
};
