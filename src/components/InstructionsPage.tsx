import React, { useState } from 'react';
import { 
  Clock, 
  HelpCircle, 
  Award, 
  Layers, 
  ShieldAlert, 
  Play, 
  ArrowLeft,
  Info,
  Maximize2,
  Lock,
  AlertTriangle,
  MonitorX
} from 'lucide-react';
import { TeamInfo } from '../types/exam';

interface InstructionsPageProps {
  team: TeamInfo;
  totalQuestions: number;
  durationMinutes: number;
  maxViolations?: number;
  onStartTest: () => void;
  onBackToRegistration: () => void;
}

export const InstructionsPage: React.FC<InstructionsPageProps> = ({
  team,
  totalQuestions,
  durationMinutes,
  maxViolations = 3,
  onStartTest,
  onBackToRegistration
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);

  const rules = [
    "Read each question carefully before choosing an option.",
    "Select one answer for each question. You can change your choice anytime before submission.",
    "Use 'Next' and 'Previous' buttons or the Question Navigator to switch between questions.",
    "Questions can be marked for review using the 'Mark for Review' button to revisit them later.",
    "Your answers are saved automatically as soon as you select an option.",
    "The countdown timer runs continuously and will not pause during question navigation or security warnings.",
    "The test will automatically submit when the timer reaches 00:00, or you may manually submit anytime."
  ];

  const securityRules = [
    {
      title: "Mandatory Fullscreen Mode",
      desc: "Starting the test requests Fullscreen mode. Exiting fullscreen triggers a critical violation warning."
    },
    {
      title: "Tab Switch & Window Focus Tracking",
      desc: "Switching tabs, minimizing the browser, or opening external applications (including AI tools like ChatGPT, Gemini, or search engines) will immediately log a violation."
    },
    {
      title: "Clipboard & Context Menu Lock",
      desc: "Copying, cutting, pasting, right-clicking, and text selection are disabled inside the examination environment."
    },
    {
      title: `Strict ${maxViolations}-Strike Violation Lockout`,
      desc: `Violation 1 & 2 trigger high-visibility warning overlays. Violation ${maxViolations} immediately locks your test and auto-submits your current answers without recourse.`
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-center">
      
      {/* Top back action */}
      <div className="mb-6">
        <button
          onClick={onBackToRegistration}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Team Registration</span>
        </button>
      </div>

      {/* Main Instructions Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-9 shadow-2xl border border-slate-800">
        
        {/* Header with Candidate Summary */}
        <div className="border-b border-slate-800 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-medium text-cyan-400 uppercase tracking-wider">
                Logic Hunt Examination Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1">
                Round 1 – Online MCQ Challenge
              </h1>
            </div>

            {/* Team details badge */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300">
              <div className="font-semibold text-white">{team.teamName}</div>
              <div className="text-slate-400 truncate max-w-xs">{team.leaderName} · {team.collegeName}</div>
            </div>
          </div>
        </div>

        {/* Test Overview Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
          
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Questions</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">{totalQuestions}</span>
            <span className="text-[11px] text-slate-500">1 mark each</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Duration</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">{durationMinutes} Mins</span>
            <span className="text-[11px] text-slate-500">Countdown timer</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Total Marks</span>
            </div>
            <span className="text-xl font-bold text-white font-mono">{totalQuestions}</span>
            <span className="text-[11px] text-slate-500">No negative marks</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Question Type</span>
            </div>
            <span className="text-sm font-bold text-white leading-tight mt-1">Single Choice</span>
            <span className="text-[11px] text-slate-500">One question at a time</span>
          </div>

        </div>

        {/* Anti-Cheating & Exam Lock Notice (Prominent Callout) */}
        <div className="mb-8 rounded-2xl p-5 bg-rose-950/30 border border-rose-500/50">
          <div className="flex items-center gap-2 text-rose-300 text-sm font-bold uppercase tracking-wider mb-3">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Strict Anti-Cheating & Proctored Lockout Policy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {securityRules.map((sec, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-rose-900/40 text-xs">
                <span className="font-bold text-rose-300 block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{sec.title}</span>
                </span>
                <p className="text-slate-300 leading-relaxed">{sec.desc}</p>
              </div>
            ))}
          </div>

          {/* Technical limitation advisory */}
          <div className="text-[11px] text-slate-400 leading-relaxed border-t border-rose-900/40 pt-2.5 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Technical Note:</strong> Normal browsers cannot prevent all OS-level shortcuts or secondary devices. The platform enforces strict browser-level sandboxing. Do not attempt to leave the active screen.
            </span>
          </div>
        </div>

        {/* Examination Guidelines / General Rules */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>General Instructions</span>
          </h2>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-mono text-cyan-400 mt-0.5">
                  {index + 1}
                </span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Indicators preview */}
        <div className="mb-8 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Navigator Palette Legend:
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-400" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-300" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-violet-500/30 border border-violet-400 text-violet-300" />
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative w-3.5 h-3.5 rounded bg-violet-600/40 border border-violet-400 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              <span>Answered & Review</span>
            </div>
          </div>
        </div>

        {/* Checkbox Agreement */}
        <div className="pt-4 border-t border-slate-800">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 bg-slate-900 focus:ring-cyan-500/30 focus:ring-offset-slate-950 transition-colors cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
              I have read and understood the instructions and agree to abide by the <strong>Strict Anti-Cheating & Fullscreen Examination Policy</strong>.
            </span>
          </label>
        </div>

        {/* Start Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onStartTest}
            disabled={!hasAgreed}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              hasAgreed
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95'
                : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START EXAM</span>
          </button>
        </div>

      </div>

    </div>
  );
};
