import React from 'react';
import { 
  Lock, 
  ShieldAlert, 
  Clock, 
  AlertOctagon, 
  FileText, 
  Building2, 
  User, 
  Users,
  Printer
} from 'lucide-react';
import { LockedExamInfo } from '../types/exam';

interface TestLockedPageProps {
  lockedInfo: LockedExamInfo;
  onOpenAdminPortal?: () => void;
}

export const TestLockedPage: React.FC<TestLockedPageProps> = ({
  lockedInfo,
  onOpenAdminPortal
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-rose-500/80 relative overflow-hidden bg-slate-950 text-slate-100">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-rose-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-600/10 blur-[100px] pointer-events-none" />

        {/* Top critical accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600" />

        {/* Header Block */}
        <div className="text-center mb-8">
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-950/80 border-2 border-rose-500 text-rose-400 mb-4 shadow-xl shadow-rose-950/60 animate-pulse">
            <Lock className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-500/50 text-rose-300 text-xs font-mono uppercase font-bold tracking-widest mb-2">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>EXAM DISCIPLINARY ACTION</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
            TEST LOCKED
          </h1>

          <p className="text-sm sm:text-base text-rose-200 mt-2 max-w-lg mx-auto font-medium leading-relaxed">
            Your examination has been locked due to a violation of exam rules.
          </p>

          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Your test has been automatically locked because the maximum number of exam rule violations has been reached.
          </p>
        </div>

        {/* Candidate & Institution Profile */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Team Name</span>
              <span className="text-sm font-bold text-white">{lockedInfo.team.teamName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Team Leader</span>
              <span className="text-sm font-bold text-white">{lockedInfo.team.leaderName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">College / Institution</span>
              <span className="text-sm font-semibold text-slate-200 truncate block">{lockedInfo.team.collegeName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">Round Number</span>
              <span className="text-sm font-bold text-white">{lockedInfo.roundNumber}</span>
            </div>
          </div>

        </div>

        {/* Status & Violation Metric Tiles */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-center">
            <span className="text-[11px] uppercase tracking-wider text-rose-300 block mb-1 font-semibold">
              Test Status
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-rose-400">
              {lockedInfo.status}
            </span>
          </div>

          <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 text-center">
            <span className="text-[11px] uppercase tracking-wider text-rose-300 block mb-1 font-semibold">
              Violation Count
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-rose-400">
              {lockedInfo.violationCount} Strikes
            </span>
          </div>

        </div>

        {/* Incident Audit Log */}
        <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Violation Audit Record</span>
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {lockedInfo.violations && lockedInfo.violations.length > 0 ? (
              lockedInfo.violations.map((v, i) => (
                <div key={v.id || i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-rose-400 mr-2">#{i + 1}</span>
                    <span className="text-slate-200">{v.message}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {new Date(v.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">
                {lockedInfo.lockReason || "Maximum violation limit exceeded."}
              </div>
            )}
          </div>
        </div>

        {/* Security Policy Advisory */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 mb-6 space-y-1.5 leading-relaxed">
          <p className="text-slate-300 font-semibold">Important Security Notice:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Answers marked before the lock have been securely preserved on the exam server.</li>
            <li>In accordance with exam regulations, correct answers are not displayed for locked tests.</li>
            <li>You cannot resume or restart this exam session. Contact the exam proctor or administration desk.</li>
          </ul>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Incident Report</span>
          </button>

          {onOpenAdminPortal && (
            <button
              type="button"
              onClick={onOpenAdminPortal}
              className="w-full sm:w-auto text-xs text-slate-500 hover:text-cyan-400 underline transition-colors cursor-pointer"
            >
              Proctor / Exam Controller Access
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
