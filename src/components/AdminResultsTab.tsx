import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Eye, 
  X, 
  Building2, 
  User, 
  Users, 
  FileSpreadsheet, 
  Award, 
  BarChart3, 
  Check, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Question } from '../types/exam';

export interface SubmissionItem {
  sessionId?: string;
  team: {
    teamName: string;
    leaderName: string;
    collegeName: string;
    membersCount?: number;
  };
  score: number;
  totalPossibleMarks: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeTakenSeconds: number;
  status: 'SUBMITTED' | 'LOCKED' | 'IN_PROGRESS';
  autoSubmitted?: boolean;
  violationCount: number;
  submittedAt: number;
  questionResults?: Array<{
    questionId: number;
    questionText: string;
    options: string[];
    userAnswer?: number;
    correctAnswer: number;
    isCorrect: boolean;
    marks: number;
    earnedMarks: number;
    explanation?: string;
  }>;
}

interface AdminResultsTabProps {
  serverSessions: any[];
  onRefresh: () => void;
  isLoading: boolean;
  questions: Question[];
}

export const AdminResultsTab: React.FC<AdminResultsTabProps> = ({
  serverSessions,
  onRefresh,
  isLoading,
  questions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUBMITTED' | 'LOCKED'>('ALL');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'time_asc' | 'recent' | 'name_asc'>('score_desc');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

  // Merge server sessions with local storage history
  const allSubmissions: SubmissionItem[] = useMemo(() => {
    let localHistory: any[] = [];
    try {
      const raw = localStorage.getItem('logic_hunt_submissions_history');
      if (raw) localHistory = JSON.parse(raw);
    } catch {}

    const map = new Map<string, SubmissionItem>();

    // 1. Process server sessions
    serverSessions.forEach((s) => {
      if (!s.team || !s.team.teamName) return;
      const key = s.team.teamName.toLowerCase().trim();
      const rec: SubmissionItem = {
        sessionId: s.sessionId,
        team: s.team,
        score: s.score ?? 0,
        totalPossibleMarks: s.totalPossibleMarks ?? 15,
        percentage: s.percentage ?? (s.score !== undefined ? Math.round(((s.score || 0) / (s.totalPossibleMarks || 15)) * 100) : 0),
        correctCount: s.correctCount ?? 0,
        wrongCount: s.wrongCount ?? 0,
        unansweredCount: s.unansweredCount ?? 0,
        timeTakenSeconds: s.timeTakenSeconds ?? (s.submittedAt && s.startedAt ? Math.floor((s.submittedAt - s.startedAt) / 1000) : 0),
        status: s.status || 'SUBMITTED',
        autoSubmitted: s.autoSubmitted || false,
        violationCount: s.violationCount ?? 0,
        submittedAt: s.submittedAt || s.startedAt || Date.now(),
        questionResults: s.questionResults || []
      };
      map.set(key, rec);
    });

    // 2. Process local submissions history
    localHistory.forEach((h) => {
      if (!h.team || !h.team.teamName) return;
      const key = h.team.teamName.toLowerCase().trim();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          sessionId: 'local_' + (h.submittedAt || Date.now()),
          team: h.team,
          score: h.score ?? 0,
          totalPossibleMarks: h.totalPossibleMarks ?? 15,
          percentage: h.percentage ?? 0,
          correctCount: h.correctCount ?? 0,
          wrongCount: h.wrongCount ?? 0,
          unansweredCount: h.unansweredCount ?? 0,
          timeTakenSeconds: h.timeTakenSeconds ?? 0,
          status: 'SUBMITTED',
          autoSubmitted: h.autoSubmitted || false,
          violationCount: 0,
          submittedAt: h.submittedAt || Date.now(),
          questionResults: h.questionResults || []
        });
      } else {
        // If existing record lacks questionResults, enrich from local history
        if ((!existing.questionResults || existing.questionResults.length === 0) && h.questionResults) {
          existing.questionResults = h.questionResults;
        }
      }
    });

    return Array.from(map.values());
  }, [serverSessions]);

  // Compute key metrics
  const metrics = useMemo(() => {
    const total = allSubmissions.length;
    if (total === 0) {
      return {
        total: 0,
        highestScore: 0,
        topTeam: null as string | null,
        avgScore: 0,
        avgPercentage: 0,
        avgTimeSeconds: 0,
        lockouts: 0
      };
    }

    let maxScore = -1;
    let topTeam = '';
    let sumScore = 0;
    let sumPct = 0;
    let sumTime = 0;
    let locks = 0;

    allSubmissions.forEach((sub) => {
      if (sub.score > maxScore) {
        maxScore = sub.score;
        topTeam = sub.team.teamName;
      }
      sumScore += sub.score;
      sumPct += sub.percentage;
      sumTime += sub.timeTakenSeconds;
      if (sub.status === 'LOCKED' || sub.violationCount >= 3) {
        locks++;
      }
    });

    return {
      total,
      highestScore: maxScore >= 0 ? maxScore : 0,
      topTeam,
      avgScore: Math.round((sumScore / total) * 10) / 10,
      avgPercentage: Math.round(sumPct / total),
      avgTimeSeconds: Math.round(sumTime / total),
      lockouts: locks
    };
  }, [allSubmissions]);

  // Filter and sort
  const filteredSubmissions = useMemo(() => {
    return allSubmissions
      .filter((sub) => {
        // Status filter
        if (statusFilter === 'SUBMITTED' && sub.status === 'LOCKED') return false;
        if (statusFilter === 'LOCKED' && sub.status !== 'LOCKED') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = sub.team.teamName.toLowerCase().includes(q);
          const matchesLeader = sub.team.leaderName.toLowerCase().includes(q);
          const matchesCollege = sub.team.collegeName.toLowerCase().includes(q);
          return matchesName || matchesLeader || matchesCollege;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score_desc') {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTakenSeconds - b.timeTakenSeconds;
        }
        if (sortBy === 'score_asc') {
          return a.score - b.score;
        }
        if (sortBy === 'time_asc') {
          return a.timeTakenSeconds - b.timeTakenSeconds;
        }
        if (sortBy === 'recent') {
          return b.submittedAt - a.submittedAt;
        }
        if (sortBy === 'name_asc') {
          return a.team.teamName.localeCompare(b.team.teamName);
        }
        return 0;
      });
  }, [allSubmissions, searchQuery, statusFilter, sortBy]);

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (allSubmissions.length === 0) {
      alert("No submission records available to export.");
      return;
    }

    const headers = [
      "Rank",
      "Team Name",
      "Team Leader",
      "College / Institution",
      "Members Count",
      "Score",
      "Total Marks",
      "Percentage (%)",
      "Correct Answers",
      "Wrong Answers",
      "Unanswered",
      "Time Taken (MM:SS)",
      "Time Taken (Seconds)",
      "Status",
      "Auto Submitted",
      "Violations Count",
      "Submission Timestamp"
    ];

    const sortedForExport = [...allSubmissions].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTakenSeconds - b.timeTakenSeconds;
    });

    const rows = sortedForExport.map((sub, idx) => [
      idx + 1,
      `"${(sub.team?.teamName || '').replace(/"/g, '""')}"`,
      `"${(sub.team?.leaderName || '').replace(/"/g, '""')}"`,
      `"${(sub.team?.collegeName || '').replace(/"/g, '""')}"`,
      sub.team?.membersCount || 1,
      sub.score,
      sub.totalPossibleMarks,
      `${sub.percentage}%`,
      sub.correctCount,
      sub.wrongCount,
      sub.unansweredCount,
      `"${formatSeconds(sub.timeTakenSeconds)}"`,
      sub.timeTakenSeconds,
      sub.status,
      sub.autoSubmitted ? "Yes" : "No",
      sub.violationCount,
      `"${new Date(sub.submittedAt).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `logic_hunt_submissions_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <Trophy className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-white font-display">
              Candidate Submissions & Results
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time examination roster, candidate scores, accuracy analytics, and question response audits.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh submissions from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={allSubmissions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export all submissions to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Print printable leaderboard roster"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Roster</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Metric 1: Total Submissions */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total Submissions</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Registered test sessions
          </div>
        </div>

        {/* Metric 2: Highest Score */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Top Score (1st Place)</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {metrics.highestScore} <span className="text-sm font-normal text-slate-400">/ 15</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate" title={metrics.topTeam || 'None yet'}>
            {metrics.topTeam ? `Team: ${metrics.topTeam}` : 'No submissions yet'}
          </div>
        </div>

        {/* Metric 3: Average Score */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Average Score</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.avgScore} <span className="text-sm font-normal text-slate-400">/ 15</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-semibold mt-1">
            {metrics.avgPercentage}% accuracy rate
          </div>
        </div>

        {/* Metric 4: Avg Time Taken */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Avg Completion Time</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300">
            {formatSeconds(metrics.avgTimeSeconds)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Out of 15 min limit
          </div>
        </div>

        {/* Metric 5: Disciplinary Locks */}
        <div className={`rounded-2xl p-4 border col-span-2 sm:col-span-1 ${
          metrics.lockouts > 0 
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span>Violations & Locks</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.lockouts > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.lockouts}
          </div>
          <div className="text-[11px] mt-1 text-slate-400">
            {metrics.lockouts > 0 ? 'Workstations locked' : 'Zero lockouts recorded'}
          </div>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Team Name, Leader, or College..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({allSubmissions.length})
            </button>
            <button
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'SUBMITTED' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setStatusFilter('LOCKED')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'LOCKED' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Locked ({metrics.lockouts})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="score_desc">Rank: Highest Score First</option>
              <option value="score_asc">Lowest Score First</option>
              <option value="time_asc">Fastest Completion Time</option>
              <option value="recent">Most Recent Submission</option>
              <option value="name_asc">Team Name (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Submissions Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">
              No Submissions Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? "No submission records match your active search or filter criteria. Try clearing filters."
                : "When candidates complete or auto-submit their Round 1 examination, their scored results and answer choices will appear here in real time."}
            </p>
            {(searchQuery || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-400 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Candidate / Team</th>
                  <th className="py-3.5 px-4">College / Institution</th>
                  <th className="py-3.5 px-4 text-center">Score & Marks</th>
                  <th className="py-3.5 px-4 text-center">Accuracy</th>
                  <th className="py-3.5 px-4 text-center">Time Taken</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubmissions.map((sub, idx) => {
                  const rank = idx + 1;
                  const isTop1 = rank === 1 && sortBy === 'score_desc';
                  const isTop2 = rank === 2 && sortBy === 'score_desc';
                  const isTop3 = rank === 3 && sortBy === 'score_desc';

                  return (
                    <tr 
                      key={sub.sessionId || idx} 
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono text-xs shadow-sm">
                            🥇 1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/40 font-bold font-mono text-xs">
                            🥈 2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700/20 text-amber-500 border border-amber-700/40 font-bold font-mono text-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 font-bold">
                            #{rank}
                          </span>
                        )}
                      </td>

                      {/* Candidate / Team */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{sub.team.teamName}</span>
                          {sub.team.membersCount && sub.team.membersCount > 1 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                              {sub.team.membersCount}P
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <User className="w-3 h-3 text-cyan-400" />
                          <span>Leader: {sub.team.leaderName}</span>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="flex items-center gap-1 text-slate-300 truncate" title={sub.team.collegeName}>
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{sub.team.collegeName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>

                      {/* Score & Marks */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="font-mono font-bold text-base text-white">
                          <span className="text-cyan-400">{sub.score}</span>
                          <span className="text-slate-500 text-xs"> / {sub.totalPossibleMarks}</span>
                        </div>
                        <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono mt-0.5 bg-slate-950 border border-slate-800 text-cyan-300">
                          {sub.percentage}%
                        </div>
                      </td>

                      {/* Accuracy Breakdown */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30" title="Correct Answers">
                            ✓ {sub.correctCount}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30" title="Wrong Answers">
                            ✗ {sub.wrongCount}
                          </span>
                          {sub.unansweredCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800" title="Unanswered">
                              - {sub.unansweredCount}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Time Taken */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatSeconds(sub.timeTakenSeconds)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {sub.status === 'LOCKED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono bg-rose-950 text-rose-300 border border-rose-500/50">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Locked</span>
                          </span>
                        ) : sub.autoSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            <span>Auto Sub</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Submitted</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm group-hover:border-cyan-500/40"
                          title="View question-by-question responses"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Responses</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          DETAILED RESPONSES BREAKDOWN MODAL
         ========================================================================= */}
      {selectedSubmission && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden bg-slate-950">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/60">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono text-[11px] font-bold">
                    Candidate Audit Record
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                  <span>{selectedSubmission.team.teamName}</span>
                  <span className="text-xs font-normal text-slate-400 font-sans">
                    (Leader: {selectedSubmission.team.leaderName} • {selectedSubmission.team.collegeName})
                  </span>
                </h3>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Score Summary Card */}
            <div className="p-4 bg-slate-900/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Score</span>
                <span className="text-lg font-mono font-bold text-cyan-400">
                  {selectedSubmission.score} / {selectedSubmission.totalPossibleMarks}
                </span>
                <span className="text-[10px] text-slate-400 block">({selectedSubmission.percentage}%)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Answers</span>
                <span className="text-sm font-mono font-bold text-white flex items-center justify-center gap-2 mt-1">
                  <span className="text-emerald-400">{selectedSubmission.correctCount} Correct</span>
                  <span className="text-rose-400">{selectedSubmission.wrongCount} Wrong</span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Time Elapsed</span>
                <span className="text-base font-mono font-bold text-sky-300 mt-0.5 block">
                  {formatSeconds(selectedSubmission.timeTakenSeconds)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Violations</span>
                <span className={`text-base font-mono font-bold mt-0.5 block ${
                  selectedSubmission.violationCount > 0 ? 'text-rose-400' : 'text-slate-300'
                }`}>
                  {selectedSubmission.violationCount} Strikes
                </span>
              </div>
            </div>

            {/* Questions Breakdown List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Question Responses & Correct Solution Keys</span>
              </h4>

              {selectedSubmission.questionResults && selectedSubmission.questionResults.length > 0 ? (
                selectedSubmission.questionResults.map((qr, qIdx) => (
                  <div 
                    key={qr.questionId || qIdx}
                    className={`p-4 rounded-xl border transition-all ${
                      qr.isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : qr.userAnswer === undefined
                        ? 'bg-slate-900/60 border-slate-800'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-800">
                          Q{qIdx + 1}
                        </span>
                        {qr.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Correct (+{qr.earnedMarks} mark)</span>
                          </span>
                        ) : qr.userAnswer === undefined ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            <span>Not Answered (0 marks)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Incorrect (0 marks)</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        {qr.marks} {qr.marks === 1 ? 'Mark' : 'Marks'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-100 mb-3">
                      {qr.questionText}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {qr.options.map((opt, oIdx) => {
                        const isUserChoice = qr.userAnswer === oIdx;
                        const isCorrectAnswer = qr.correctAnswer === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg text-xs border flex items-start gap-2 ${
                              isCorrectAnswer
                                ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 font-semibold'
                                : isUserChoice
                                ? 'bg-rose-950/50 border-rose-500/60 text-rose-200 line-through font-medium'
                                : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                            }`}
                          >
                            <span className="font-mono text-[10px] w-5 h-5 rounded flex items-center justify-center bg-slate-900 border border-slate-800 shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectAnswer && (
                              <span className="text-[10px] font-bold text-emerald-400 shrink-0">✓ Key</span>
                            )}
                            {isUserChoice && !isCorrectAnswer && (
                              <span className="text-[10px] font-bold text-rose-400 shrink-0">Selected</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {qr.explanation && (
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
                        <span className="font-bold text-cyan-400">Explanation: </span>
                        <span>{qr.explanation}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  Detailed question-by-question response breakdown is not attached to this session record.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Workstation Session: <span className="font-mono text-slate-400">{selectedSubmission.sessionId || 'Recorded'}</span>
              </span>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
