import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Save, 
  Download, 
  Upload, 
  Check, 
  X, 
  ArrowLeft,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  MonitorX,
  FileText,
  Sliders,
  Radio,
  Users,
  LogOut,
  Trophy
} from 'lucide-react';
import { Question, Difficulty, AdminSettings, ViolationRecord, TeamInfo } from '../types/exam';
import { DEFAULT_ADMIN_SETTINGS } from '../data/defaultQuestions';
import { AdminResultsTab } from './AdminResultsTab';

interface AdminPortalProps {
  questions: Question[];
  adminSettings: AdminSettings;
  onUpdateQuestions: (questions: Question[]) => void;
  onResetQuestions: () => void;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  onBackToApp: () => void;
  onUnlockTeam?: (teamName: string) => void;
  onLogout?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  questions,
  adminSettings,
  onUpdateQuestions,
  onResetQuestions,
  onUpdateAdminSettings,
  onBackToApp,
  onUnlockTeam,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'security' | 'questions' | 'audit'>('results');
  const [selectedRound, setSelectedRound] = useState<string>('round-1');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Server-synced sessions state for audit tab
  const [serverSessions, setServerSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Form fields for create/edit questions
  const [formText, setFormText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState<number>(0);
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('Medium');
  const [formMarks, setFormMarks] = useState<number>(1);
  const [formCategory, setFormCategory] = useState('Logical Reasoning');
  const [formExplanation, setFormExplanation] = useState('');

  const roundsList = [
    { id: 'round-1', name: 'Round 1 (MCQ Challenge)' },
    { id: 'round-2', name: 'Round 2 (Advanced Logic)' },
    { id: 'round-3', name: 'Round 3 (Finals)' }
  ];

  const roundQuestions = questions.filter((q) => (q.roundId || 'round-1') === selectedRound);

  // Fetch server sessions when on audit tab
  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        setServerSessions(data.sessions || []);
      }
    } catch (err) {
      console.warn('Could not fetch server sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit' || activeTab === 'results') {
      fetchSessions();
    }
  }, [activeTab]);

  const handleManualUnlock = async (teamName: string, sessionId?: string) => {
    if (!window.confirm(`Proctor Action: Are you sure you want to unlock examination session for "${teamName}" and reset violations?`)) {
      return;
    }

    try {
      await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, sessionId }),
      });
      if (onUnlockTeam) {
        onUnlockTeam(teamName);
      }
      setStatusMessage(`Session for "${teamName}" successfully unlocked.`);
      fetchSessions();
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      alert("Failed to unlock session on server.");
    }
  };

  const handleResetSecurityDefaults = () => {
    if (window.confirm("Reset all anti-cheating configurations to recommended defaults (Strict Mode: ON, Max 3 strikes, Fullscreen: Required)?")) {
      onUpdateAdminSettings({
        ...DEFAULT_ADMIN_SETTINGS,
        allowCandidateSolutionReview: adminSettings.allowCandidateSolutionReview,
        passcode: adminSettings.passcode,
      });
      setStatusMessage("Anti-cheating settings reset to default policy.");
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const startEdit = (q: Question) => {
    setEditingQuestion(q);
    setIsAddingNew(false);
    setFormText(q.question);
    setFormOptions([...q.options]);
    setFormCorrect(q.correctAnswer);
    setFormDifficulty(q.difficulty);
    setFormMarks(q.marks);
    setFormCategory(q.category || 'Logical Reasoning');
    setFormExplanation(q.explanation || '');
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setEditingQuestion(null);
    setFormText('');
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setFormDifficulty('Medium');
    setFormMarks(1);
    setFormCategory('Logical Reasoning');
    setFormExplanation('');
  };

  const handleCancelForm = () => {
    setEditingQuestion(null);
    setIsAddingNew(false);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) {
      alert("Please enter the question statement.");
      return;
    }
    if (formOptions.some((opt) => !opt.trim())) {
      alert("Please fill in all 4 options.");
      return;
    }

    if (isAddingNew) {
      const nextId = questions.length > 0 ? Math.max(...questions.map((q) => q.id)) + 1 : 1;
      const newQ: Question = {
        id: nextId,
        question: formText.trim(),
        options: formOptions.map((o) => o.trim()),
        correctAnswer: formCorrect,
        difficulty: formDifficulty,
        marks: formMarks,
        roundId: selectedRound,
        category: formCategory.trim(),
        explanation: formExplanation.trim()
      };
      const updated = [...questions, newQ];
      onUpdateQuestions(updated);
      setStatusMessage("New question added successfully!");
    } else if (editingQuestion) {
      const updated = questions.map((q) => {
        if (q.id === editingQuestion.id) {
          return {
            ...q,
            question: formText.trim(),
            options: formOptions.map((o) => o.trim()),
            correctAnswer: formCorrect,
            difficulty: formDifficulty,
            marks: formMarks,
            roundId: selectedRound,
            category: formCategory.trim(),
            explanation: formExplanation.trim()
          };
        }
        return q;
      });
      onUpdateQuestions(updated);
      setStatusMessage(`Question ${editingQuestion.id} updated!`);
    }

    handleCancelForm();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(`Are you sure you want to delete Question ${id}?`)) {
      const updated = questions.filter((q) => q.id !== id);
      onUpdateQuestions(updated);
      setStatusMessage(`Question ${id} deleted.`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `logic_hunt_questions_${selectedRound}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onUpdateQuestions(parsed);
          setStatusMessage(`Successfully imported ${parsed.length} questions.`);
          setTimeout(() => setStatusMessage(null), 3000);
        } else {
          alert("Invalid questions JSON structure.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  // Locked sessions list
  const lockedSessions = serverSessions.filter((s) => s.status === 'LOCKED' || s.violationCount >= adminSettings.maxViolations);
  // All recorded violations flat list
  const allViolations = serverSessions.flatMap((s) => 
    (s.violations || []).map((v: any) => ({ ...v, teamName: s.team?.teamName || 'Unknown Team' }))
  ).sort((a: any, b: any) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onBackToApp}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Test Portal</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-xs font-mono text-slate-400">
              User: <span className="text-cyan-400 font-bold">bharathan</span>
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors cursor-pointer ml-1"
                title="Sign out of Admin Hub"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display flex items-center gap-3">
            <span>Exam Controller & Security Portal</span>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              Proctor Access
            </span>
          </h1>
        </div>

        {/* Global tab navigator */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'results'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Results & Submissions</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Anti-Cheating Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Questions Management</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Violations & Locked Tests</span>
            {lockedSessions.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping absolute -top-1 -right-1" />
            )}
          </button>
        </div>
      </div>

      {/* Status Notice if any */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-xs font-semibold text-cyan-200 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 0: CANDIDATE SUBMISSIONS & RESULTS LEADERBOARD
         ========================================================================= */}
      {activeTab === 'results' && (
        <div className="animate-in fade-in">
          <AdminResultsTab
            serverSessions={serverSessions}
            onRefresh={fetchSessions}
            isLoading={isLoadingSessions}
            questions={questions}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 1: ANTI-CHEATING SETTINGS PANEL (Requirement I)
         ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header Banner */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 text-xs font-mono mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Strict Lockdown System</span>
              </div>
              <h2 className="text-xl font-bold text-white font-display">
                Anti-Cheating & Proctored Enforcement Rules
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Configure browser-based restrictions, fullscreen enforcement, tab-switch penalties, and auto-submission thresholds.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetSecurityDefaults}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold cursor-pointer transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Policy Defaults</span>
            </button>
          </div>

          {/* Core Anti-Cheating Toggles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Strict Mode Main Switch */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Strict Mode Enforcement</span>
                <span className="text-xs text-slate-400">Enables active browser isolation and restriction listeners</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateAdminSettings({ ...adminSettings, strictModeEnabled: !adminSettings.strictModeEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  adminSettings.strictModeEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  adminSettings.strictModeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Fullscreen Requirement */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Fullscreen Requirement</span>
                <span className="text-xs text-slate-400">Candidate must stay in full-screen; exiting triggers a violation strike</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateAdminSettings({ ...adminSettings, fullscreenRequired: !adminSettings.fullscreenRequired })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  adminSettings.fullscreenRequired ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  adminSettings.fullscreenRequired ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Tab Switch Detection */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Tab Switch & Window Focus Tracking</span>
                <span className="text-xs text-slate-400">Detects switching tabs, minimizing browser, or opening external apps/AI tools</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateAdminSettings({ ...adminSettings, tabSwitchDetection: !adminSettings.tabSwitchDetection })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  adminSettings.tabSwitchDetection ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  adminSettings.tabSwitchDetection ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Copy / Paste / Context Menu Restrictions */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Copy / Paste / Right-Click Block</span>
                <span className="text-xs text-slate-400">Disables right-click context menu, clipboard cut/copy/paste, and text dragging</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateAdminSettings({ ...adminSettings, copyPasteBlocked: !adminSettings.copyPasteBlocked })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  adminSettings.copyPasteBlocked ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  adminSettings.copyPasteBlocked ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Keyboard Shortcuts Restrictions */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Keyboard Shortcut Restrictions</span>
                <span className="text-xs text-slate-400">Blocks Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+Shift+I, F12 developer inspection</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateAdminSettings({ ...adminSettings, keyboardShortcutsBlocked: !adminSettings.keyboardShortcutsBlocked })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  adminSettings.keyboardShortcutsBlocked ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  adminSettings.keyboardShortcutsBlocked ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Auto Submit on Max Violations */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">Auto-Submit on Max Violations</span>
                <span className="text-xs text-slate-400">Instantly locks the test and submits responses when threshold is reached</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateAdminSettings({ ...adminSettings, autoSubmitOnMaxViolations: !adminSettings.autoSubmitOnMaxViolations })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  adminSettings.autoSubmitOnMaxViolations ? 'bg-rose-500' : 'bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  adminSettings.autoSubmitOnMaxViolations ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>

          {/* Strike Threshold Setting */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-sm font-bold text-white block">Maximum Allowed Violation Strikes</span>
                <span className="text-xs text-slate-400">
                  Number of strikes permitted before the examination is automatically locked and submitted.
                </span>
              </div>
              <span className="font-mono text-xl font-black text-rose-400 bg-rose-950/80 border border-rose-500/40 px-3.5 py-1 rounded-xl">
                {adminSettings.maxViolations} Strikes
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={adminSettings.maxViolations}
                onChange={(e) => onUpdateAdminSettings({ ...adminSettings, maxViolations: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>1 Strike (Strict instant lock)</span>
              <span>3 Strikes (Contest Standard)</span>
              <span>5 Strikes (Lenient)</span>
            </div>
          </div>

          {/* Solution Review Setting */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">Candidate Solution Review On Scorecard</span>
              <span className="text-xs text-slate-400">Allow candidates to see correct options and detailed explanations after submission</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateAdminSettings({ ...adminSettings, allowCandidateSolutionReview: !adminSettings.allowCandidateSolutionReview })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                adminSettings.allowCandidateSolutionReview
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {adminSettings.allowCandidateSolutionReview ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Solutions Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  <span>Solutions Hidden (Secure)</span>
                </>
              )}
            </button>
          </div>

          {/* Important Technical Limitation Notice (Requirement J) */}
          <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200/90 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Technical Security Disclosure (Requirement J)</span>
            </div>
            <p>
              A standard browser cannot intercept every hardware operating-system shortcut (e.g. specialized hardware hotkeys, multi-monitor OS setups, secondary devices, or external phones). This platform enforces the strongest practical browser sandboxing via Page Visibility APIs, Blur events, Fullscreen APIs, and keyboard traps.
            </p>
            <p className="text-[11px] text-slate-400">
              For high-stakes lab environments, physical proctors or managed kiosk configurations (such as Safe Exam Browser) should be deployed in conjunction with these software controls.
            </p>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: QUESTION MANAGEMENT & ROUNDS
         ========================================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Round:</span>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {roundsList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRound(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedRound === r.id
                        ? 'bg-slate-800 text-cyan-300 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (window.confirm("Reset questions to original 15 reasoning contest defaults?")) {
                    onResetQuestions();
                    setStatusMessage("Questions reset to PDF defaults.");
                    setTimeout(() => setStatusMessage(null), 3000);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default Questions</span>
              </button>

              <button
                onClick={startAddNew}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Question Edit / Add Form */}
          {(isAddingNew || editingQuestion) && (
            <div className="glass-panel rounded-2xl p-6 border-2 border-cyan-500/60 shadow-xl mb-6">
              <h3 className="text-base font-bold text-white mb-4">
                {isAddingNew ? "Add New Examination Question" : `Edit Question ${editingQuestion?.id}`}
              </h3>
              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Question Statement
                  </label>
                  <textarea
                    rows={3}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Enter full question text..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Option {String.fromCharCode(65 + idx)}</span>
                        <label className="flex items-center gap-1.5 text-xs text-cyan-400 cursor-pointer">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={formCorrect === idx}
                            onChange={() => setFormCorrect(idx)}
                            className="text-cyan-500 bg-slate-900"
                          />
                          <span>Correct Answer</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...formOptions];
                          next[idx] = e.target.value;
                          setFormOptions(next);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Difficulty Level
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as Difficulty)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Marks
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formMarks}
                      onChange={(e) => setFormMarks(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="e.g. Coding-Decoding"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Explanation / Solution Details
                  </label>
                  <textarea
                    rows={2}
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Step-by-step reasoning or mathematical proof..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Question</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-3">
            {roundQuestions.map((q, idx) => (
              <div key={q.id} className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-cyan-400 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-relaxed mb-2">
                        {q.question}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border ${
                              oIdx === q.correctAnswer
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-semibold'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-mono mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt}</span>
                            {oIdx === q.correctAnswer && <span className="ml-2 text-[10px] text-emerald-400">(Correct)</span>}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">{q.difficulty}</span>
                        <span>{q.marks} Mark</span>
                        {q.category && <span>Category: {q.category}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(q)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 cursor-pointer"
                      title="Edit question"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 3: INCIDENT AUDIT & LOCKED CANDIDATES (Requirement C, G, I)
         ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Candidate Lockouts & Violation Log</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time security audit trails and proctor manual review operations.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchSessions}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Locked Tests Card List */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Currently Locked Examinations ({lockedSessions.length})</span>
            </h3>

            {lockedSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <span>No candidates currently locked. All competitive integrity thresholds are clear.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedSessions.map((s) => (
                  <div key={s.sessionId} className="p-5 rounded-xl bg-rose-950/20 border-2 border-rose-500/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="font-bold text-white text-base">{s.team?.teamName}</span>
                          <span className="text-xs text-slate-400 block">{s.team?.leaderName} · {s.team?.collegeName}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950 border border-rose-500 text-rose-300 font-mono text-xs font-extrabold">
                          {s.violationCount} Strikes
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lock Reason</span>
                        <span>{s.lockReason || "Maximum violation limit exceeded."}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-rose-500/30">
                      <span className="text-[11px] font-mono text-slate-400">
                        Status: <strong className="text-rose-400">Locked / Submitted</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleManualUnlock(s.team?.teamName, s.sessionId)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow cursor-pointer transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock Candidate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full Live Violations Audit Trail */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Full Incident Audit Log ({allViolations.length})</span>
            </h3>

            {allViolations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No violation incidents recorded yet during this server session.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Candidate / Team</th>
                      <th className="py-2.5 px-3">Violation Event</th>
                      <th className="py-2.5 px-3">Details</th>
                      <th className="py-2.5 px-3">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {allViolations.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                          {new Date(v.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                          {v.teamName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300 whitespace-nowrap">
                          {v.type}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                          {v.message}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            v.severity === 'critical'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          }`}>
                            {v.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
