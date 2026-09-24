import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  GraduationCap, 
  ArrowRight, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { TeamInfo } from '../types/exam';

interface RegistrationPageProps {
  initialTeam: TeamInfo | null;
  onSubmitTeam: (team: TeamInfo) => void;
  onAdminLoginSuccess?: () => void;
  defaultTab?: 'student' | 'admin';
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  initialTeam,
  onSubmitTeam,
  onAdminLoginSuccess,
  defaultTab = 'student'
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>(defaultTab);

  // Student Form State
  const [teamName, setTeamName] = useState(initialTeam?.teamName || '');
  const [leaderName, setLeaderName] = useState(initialTeam?.leaderName || '');
  const [collegeName, setCollegeName] = useState(initialTeam?.collegeName || '');
  const [membersCount, setMembersCount] = useState<number>(initialTeam?.membersCount || 2);

  const [studentErrors, setStudentErrors] = useState<{
    teamName?: string;
    leaderName?: string;
    collegeName?: string;
  }>({});

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  const validateStudentForm = () => {
    const newErrors: typeof studentErrors = {};
    if (!teamName.trim()) {
      newErrors.teamName = 'Please enter your team name.';
    } else if (teamName.trim().length < 2) {
      newErrors.teamName = 'Team name must be at least 2 characters.';
    }

    if (!leaderName.trim()) {
      newErrors.leaderName = 'Team leader name is required.';
    } else if (leaderName.trim().length < 2) {
      newErrors.leaderName = 'Leader name must be at least 2 characters.';
    }

    if (!collegeName.trim()) {
      newErrors.collegeName = 'College / Institution name is required.';
    } else if (collegeName.trim().length < 2) {
      newErrors.collegeName = 'College name must be at least 2 characters.';
    }

    setStudentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStudentForm()) {
      onSubmitTeam({
        teamName: teamName.trim(),
        leaderName: leaderName.trim(),
        collegeName: collegeName.trim(),
        membersCount
      });
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsAdminSubmitting(true);

    const trimmedUsername = adminUsername.trim();

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: adminPassword }),
      });
      if (res.ok) {
        setIsAdminSubmitting(false);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
        return;
      }
    } catch {
      // Fallback to client verification if server unreachable
    }

    if (
      trimmedUsername.toLowerCase() === 'bharathan' &&
      adminPassword === 'Bharath@123@'
    ) {
      setIsAdminSubmitting(false);
      if (onAdminLoginSuccess) {
        onAdminLoginSuccess();
      }
    } else {
      setIsAdminSubmitting(false);
      setAdminError('Invalid username or password. Please verify credentials.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inter-College Reasoning Championship</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">
            LOGIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">HUNT</span>
          </h1>

          <p className="text-sm sm:text-base font-medium text-slate-400 tracking-wide">
            Think <span className="text-cyan-400">·</span> Analyze <span className="text-indigo-400">·</span> Solve
          </p>
        </div>

        {/* Dual Tab Navigator (Student Login vs Admin Login) */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1.5 border border-slate-800 mb-4 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student / Team Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Centered Glass Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* =========================================================================
              STUDENT / TEAM LOGIN TAB
             ========================================================================= */}
          {activeTab === 'student' && (
            <div>
              <div className="border-b border-slate-800 pb-5 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-display">
                  Candidate / Team Login
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your team details to proceed to the Round 1 test rules
                </p>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-5" noValidate>
                
                {/* 1. Team Name */}
                <div>
                  <label htmlFor="teamName" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Team Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="teamName"
                      type="text"
                      value={teamName}
                      onChange={(e) => {
                        setTeamName(e.target.value);
                        if (studentErrors.teamName) setStudentErrors((prev) => ({ ...prev, teamName: undefined }));
                      }}
                      placeholder="e.g., Turing Titans"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        studentErrors.teamName 
                          ? 'border-rose-500/70 focus:ring-rose-500/30' 
                          : 'border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-500/20'
                      }`}
                    />
                  </div>
                  {studentErrors.teamName && (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
                      {studentErrors.teamName}
                    </p>
                  )}
                </div>

                {/* 2. Team Leader Name */}
                <div>
                  <label htmlFor="leaderName" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Team Leader Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="leaderName"
                      type="text"
                      value={leaderName}
                      onChange={(e) => {
                        setLeaderName(e.target.value);
                        if (studentErrors.leaderName) setStudentErrors((prev) => ({ ...prev, leaderName: undefined }));
                      }}
                      placeholder="e.g., Ada Lovelace"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        studentErrors.leaderName 
                          ? 'border-rose-500/70 focus:ring-rose-500/30' 
                          : 'border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-500/20'
                      }`}
                    />
                  </div>
                  {studentErrors.leaderName && (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
                      {studentErrors.leaderName}
                    </p>
                  )}
                </div>

                {/* 3. College Name */}
                <div>
                  <label htmlFor="collegeName" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    College / Institution Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="collegeName"
                      type="text"
                      value={collegeName}
                      onChange={(e) => {
                        setCollegeName(e.target.value);
                        if (studentErrors.collegeName) setStudentErrors((prev) => ({ ...prev, collegeName: undefined }));
                      }}
                      placeholder="e.g., National Institute of Technology"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900/90 border text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all ${
                        studentErrors.collegeName 
                          ? 'border-rose-500/70 focus:ring-rose-500/30' 
                          : 'border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-500/20'
                      }`}
                    />
                  </div>
                  {studentErrors.collegeName && (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
                      {studentErrors.collegeName}
                    </p>
                  )}
                </div>

                {/* 4. Number of Members */}
                <div>
                  <label htmlFor="membersCount" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Number of Team Members <span className="text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="membersCount"
                      value={membersCount}
                      onChange={(e) => setMembersCount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                    >
                      <option value={1}>1 (Individual participant)</option>
                      <option value={2}>2 Members</option>
                      <option value={3}>3 Members</option>
                      <option value={4}>4 Members</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    <span>Start Round 1</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* =========================================================================
              ADMIN LOGIN TAB (Username: bharathan, Password: Bharath@123@)
             ========================================================================= */}
          {activeTab === 'admin' && (
            <div>
              <div className="border-b border-slate-800 pb-5 mb-6">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-[10px] font-mono uppercase font-bold tracking-wider mb-1.5">
                  <KeyRound className="w-3 h-3" />
                  <span>Proctor / Admin Desk</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-display">
                  Admin Login
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in with authorized administrator credentials to manage examination settings
                </p>
              </div>

              {adminError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-5" noValidate>
                
                {/* Admin Username */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => {
                        setAdminUsername(e.target.value);
                        if (adminError) setAdminError(null);
                      }}
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (adminError) setAdminError(null);
                      }}
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Admin Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAdminSubmitting || !adminUsername || !adminPassword}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-wide text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-purple-950/40 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isAdminSubmitting ? 'Authenticating...' : 'Login to Admin Hub'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
