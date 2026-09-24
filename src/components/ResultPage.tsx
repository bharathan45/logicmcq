import React, { useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Percent, 
  RotateCcw, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Unlock, 
  Sparkles,
  FileCheck2,
  Award
} from 'lucide-react';
import { ExamResult } from '../types/exam';

interface ResultPageProps {
  result: ExamResult;
  allowCandidateSolutionReview: boolean;
  onRetakeTest: () => void;
  onToggleAdminSolutionReview: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  result,
  allowCandidateSolutionReview,
  onRetakeTest,
  onToggleAdminSolutionReview
}) => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const getRankTier = (percentage: number) => {
    if (percentage >= 90) return { title: "Master Tactician", color: "text-amber-400", badge: "Gold Tier" };
    if (percentage >= 75) return { title: "Logic Specialist", color: "text-cyan-400", badge: "Silver Tier" };
    if (percentage >= 50) return { title: "Aptitude Qualifier", color: "text-emerald-400", badge: "Bronze Tier" };
    return { title: "Round 1 Contender", color: "text-slate-400", badge: "Participant" };
  };

  const rank = getRankTier(result.percentage);

  const filteredQuestions = result.questionResults.filter((q) => {
    if (selectedFilter === 'correct') return q.isCorrect;
    if (selectedFilter === 'wrong') return !q.isCorrect && q.userAnswer !== null;
    if (selectedFilter === 'unanswered') return q.userAnswer === null;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Printable Scorecard Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Glow backdrop behind badge */}
        <div className="absolute -top-24 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 print:border-slate-300 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Examination Scorecard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white print:text-black font-display tracking-tight">
              LOGIC HUNT
            </h1>
            <p className="text-sm font-medium text-slate-400 print:text-slate-600 mt-0.5">
              Round 1 Result · {result.autoSubmitted ? 'Auto-submitted at time limit' : 'Verified Candidate Submission'}
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Scorecard</span>
            </button>

            <button
              onClick={onRetakeTest}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-950 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Register New Team</span>
            </button>
          </div>
        </div>

        {/* Team Identity Banner */}
        <div className="bg-slate-900/80 print:bg-slate-100 rounded-2xl p-5 sm:p-6 border border-slate-800 print:border-slate-300 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 print:text-slate-500 font-semibold block mb-0.5">Team Name</span>
            <span className="text-lg font-bold text-white print:text-black">{result.team.teamName}</span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 print:text-slate-500 font-semibold block mb-0.5">Team Leader</span>
            <span className="text-base font-semibold text-slate-200 print:text-slate-800">{result.team.leaderName}</span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 print:text-slate-500 font-semibold block mb-0.5">College / Institution</span>
            <span className="text-base font-semibold text-slate-200 print:text-slate-800 truncate block">{result.team.collegeName}</span>
          </div>
        </div>

        {/* Primary Score Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-center">
          
          {/* Main Big Score Card (5 Cols) */}
          <div className="md:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-800 print:border-slate-300 rounded-2xl p-6 text-center flex flex-col items-center justify-center relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-cyan-400" />
            </div>

            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 print:text-slate-600 mb-1">
              Total Score Obtained
            </span>

            <div className="flex items-baseline justify-center gap-1 my-2">
              <span className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 font-mono">
                {result.score}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-500 font-mono">
                / {result.totalPossibleMarks}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                {result.percentage}% Accuracy
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${rank.color}`}>
                {rank.title}
              </span>
            </div>
          </div>

          {/* Breakdown Statistics Grid (7 Cols) */}
          <div className="md:col-span-7 grid grid-cols-2 gap-3.5">
            
            <div className="bg-slate-900/70 print:bg-slate-50 border border-slate-800/90 print:border-slate-200 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Correct Answers</span>
                <span className="text-xl font-bold text-white print:text-black font-mono">{result.correctCount}</span>
              </div>
            </div>

            <div className="bg-slate-900/70 print:bg-slate-50 border border-slate-800/90 print:border-slate-200 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Incorrect Answers</span>
                <span className="text-xl font-bold text-white print:text-black font-mono">{result.wrongCount}</span>
              </div>
            </div>

            <div className="bg-slate-900/70 print:bg-slate-50 border border-slate-800/90 print:border-slate-200 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Unanswered</span>
                <span className="text-xl font-bold text-white print:text-black font-mono">{result.unansweredCount}</span>
              </div>
            </div>

            <div className="bg-slate-900/70 print:bg-slate-50 border border-slate-800/90 print:border-slate-200 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Time Taken</span>
                <span className="text-sm font-bold text-white print:text-black font-mono">
                  {formatTime(result.timeTakenSeconds)}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Accuracy Progress Bar */}
        <div className="bg-slate-900/60 print:hidden border border-slate-800 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
            <span>Overall Examination Performance</span>
            <span className="font-mono text-cyan-400">{result.percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div 
              style={{ width: `${(result.correctCount / result.totalQuestions) * 100}%` }}
              className="bg-emerald-500 h-full transition-all duration-700" 
              title={`Correct: ${result.correctCount}`}
            />
            <div 
              style={{ width: `${(result.wrongCount / result.totalQuestions) * 100}%` }}
              className="bg-rose-500 h-full transition-all duration-700" 
              title={`Wrong: ${result.wrongCount}`}
            />
            <div 
              style={{ width: `${(result.unansweredCount / result.totalQuestions) * 100}%` }}
              className="bg-slate-700 h-full transition-all duration-700" 
              title={`Unanswered: ${result.unansweredCount}`}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Correct ({result.correctCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Wrong ({result.wrongCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Unanswered ({result.unansweredCount})</span>
            </div>
          </div>
        </div>

        {/* Answer Key & Detailed Explanations Section (Controlled by Admin Setting) */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span>Question Responses & Solution Explanations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {allowCandidateSolutionReview 
                  ? "Admin has unlocked detailed step-by-step reasoning solutions for this round."
                  : "Detailed answers are locked by admin examination policy for competitive integrity."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {allowCandidateSolutionReview ? (
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(!isReviewOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer"
                >
                  <span>{isReviewOpen ? "Hide Explanations" : "View Explanations"}</span>
                  {isReviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleAdminSolutionReview}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  title="Admin toggle to unlock answers"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Admin Unlock</span>
                </button>
              )}
            </div>
          </div>

          {/* Solution List Accordion */}
          {allowCandidateSolutionReview && isReviewOpen && (
            <div className="mt-6 space-y-4 animate-in fade-in duration-300">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs w-fit">
                {(['all', 'correct', 'wrong', 'unanswered'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                      selectedFilter === tab
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Questions review list */}
              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => {
                  const optionLetters = ['A', 'B', 'C', 'D'];
                  return (
                    <div 
                      key={q.questionId}
                      className="bg-slate-900/60 rounded-xl p-5 border border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Q{q.questionId}.
                        </span>
                        <div>
                          {q.isCorrect ? (
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded">
                              Correct (+{q.marks})
                            </span>
                          ) : q.userAnswer === null ? (
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                              Unanswered (0)
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/70 border border-rose-500/40 px-2 py-0.5 rounded">
                              Incorrect (0)
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-200 mb-3">
                        {q.questionText}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctAnswer;
                          const isChosen = oIdx === q.userAnswer;

                          let badgeClass = "bg-slate-900 text-slate-300 border-slate-800";
                          if (isCorrect) {
                            badgeClass = "bg-emerald-950/60 text-emerald-300 border-emerald-500/50 font-semibold";
                          } else if (isChosen && !isCorrect) {
                            badgeClass = "bg-rose-950/60 text-rose-300 border-rose-500/50 line-through";
                          }

                          return (
                            <div 
                              key={oIdx}
                              className={`p-2.5 rounded-lg border flex items-center gap-2 ${badgeClass}`}
                            >
                              <span className="font-mono font-bold">{optionLetters[oIdx]}.</span>
                              <span>{opt}</span>
                              {isCorrect && <span className="ml-auto text-[10px] text-emerald-400">✓ Correct</span>}
                              {isChosen && !isCorrect && <span className="ml-auto text-[10px] text-rose-400">✗ Your Choice</span>}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-cyan-400 block mb-0.5">Solution Logic:</span>
                          {q.explanation}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
