/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TeamInfo, 
  Question, 
  ExamResult, 
  AdminSettings, 
  ViolationRecord,
  LockedExamInfo 
} from './types/exam';
import { 
  DEFAULT_QUESTIONS, 
  getStoredQuestions, 
  saveStoredQuestions, 
  resetToDefaultQuestions,
  STORAGE_KEYS,
  DEFAULT_ADMIN_SETTINGS
} from './data/defaultQuestions';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Navbar } from './components/Navbar';
import { RegistrationPage } from './components/RegistrationPage';
import { InstructionsPage } from './components/InstructionsPage';
import { ExamPage } from './components/ExamPage';
import { ResultPage } from './components/ResultPage';
import { AdminPortal } from './components/AdminPortal';
import { TestLockedPage } from './components/TestLockedPage';

type AppView = 'registration' | 'instructions' | 'exam' | 'result' | 'admin' | 'locked';

const EXAM_DURATION_SECONDS = 15 * 60; // 15 Minutes = 900s

export default function App() {
  // Questions list (backed by localStorage)
  const [questions, setQuestions] = useState<Question[]>(() => getStoredQuestions());

  // Active view
  const [view, setView] = useState<AppView>('registration');

  // Candidate Team Information
  const [team, setTeam] = useState<TeamInfo | null>(() => {
    try {
      const saved = localStorage.getItem('logic_hunt_team');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Locked Exam State (Section C, G)
  const [lockedExamInfo, setLockedExamInfo] = useState<LockedExamInfo | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCKED_EXAM);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Exam Progress State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<number, boolean>>({ 1: true });
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(EXAM_DURATION_SECONDS);
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESULT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin Policy & Anti-Cheating Settings (Section I)
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      if (saved) return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_ADMIN_SETTINGS };
  });

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('logic_hunt_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [registrationTab, setRegistrationTab] = useState<'student' | 'admin'>('student');

  // Check on mount if candidate was locked
  useEffect(() => {
    try {
      const rawLocked = localStorage.getItem(STORAGE_KEYS.LOCKED_EXAM);
      if (rawLocked) {
        const parsed = JSON.parse(rawLocked);
        if (parsed) {
          setLockedExamInfo(parsed);
          setView('locked');
          return;
        }
      }

      // Restore active test session on refresh if any
      const rawSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed.isExamActive && parsed.team && parsed.timeRemainingSeconds > 0) {
          setTeam(parsed.team);
          setAnswers(parsed.answers || {});
          setMarkedForReview(parsed.markedForReview || {});
          setVisitedQuestions(parsed.visitedQuestions || { 1: true });
          setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
          setTimeRemainingSeconds(parsed.timeRemainingSeconds);
          setIsExamActive(true);
          setView('exam');
        }
      }
    } catch (err) {
      console.error("Session restore failed:", err);
    }
  }, []);

  // Sync settings with backend
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setAdminSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  // Save session to localStorage when in exam to protect against accidental browser reload
  useEffect(() => {
    if (isExamActive && team) {
      const sessionData = {
        team,
        answers,
        markedForReview,
        visitedQuestions,
        currentQuestionIndex,
        timeRemainingSeconds,
        isExamActive: true
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

      // Sync answers with server
      fetch('/api/exam/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: team.teamName,
          answers,
          timeRemainingSeconds,
        }),
      }).catch(() => {});
    }
  }, [isExamActive, team, answers, markedForReview, visitedQuestions, currentQuestionIndex, timeRemainingSeconds]);

  // Real-time Countdown Timer (Runs every second when exam is active)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isExamActive && timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExamActive, timeRemainingSeconds]);

  // Team Registration Handlers
  const handleRegisterTeam = (teamInfo: TeamInfo) => {
    setTeam(teamInfo);
    localStorage.setItem('logic_hunt_team', JSON.stringify(teamInfo));
    setView('instructions');
  };

  // Start Test Handler (Enters Fullscreen per Section A)
  const handleStartExam = async () => {
    if (adminSettings.fullscreenRequired) {
      try {
        const docEl = document.documentElement;
        if (!document.fullscreenElement) {
          if (docEl.requestFullscreen) {
            await docEl.requestFullscreen();
          } else if ((docEl as any).webkitRequestFullscreen) {
            await (docEl as any).webkitRequestFullscreen();
          }
        }
      } catch (err) {
        console.warn("Fullscreen request was dismissed or blocked by browser:", err);
      }
    }

    if (team) {
      fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team,
          durationSeconds: EXAM_DURATION_SECONDS,
        }),
      }).catch(() => {});
    }

    setIsExamActive(true);
    setTimeRemainingSeconds(EXAM_DURATION_SECONDS);
    setAnswers({});
    setMarkedForReview({});
    setCurrentQuestionIndex(0);
    setVisitedQuestions({ [questions[0]?.id || 1]: true });
    setView('exam');
  };

  // Question Interaction Handlers
  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleClearOption = (questionId: number) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleToggleReview = (questionId: number) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      const targetQ = questions[index];
      if (targetQ) {
        setVisitedQuestions((prev) => ({ ...prev, [targetQ.id]: true }));
      }
    }
  };

  // Automatic Test Lock Handler (Section C & G)
  const handleLockExam = useCallback(async (violations: ViolationRecord[], reason: string) => {
    setIsExamActive(false);
    localStorage.removeItem(STORAGE_KEYS.SESSION);

    if (!team) return;

    const lockedData: LockedExamInfo = {
      team,
      roundNumber: 'Round 1',
      violationCount: violations.length,
      violations,
      submittedAt: Date.now(),
      lockReason: reason,
      status: 'Locked / Submitted'
    };

    setLockedExamInfo(lockedData);
    localStorage.setItem(STORAGE_KEYS.LOCKED_EXAM, JSON.stringify(lockedData));

    // Save current answers on server and mark as locked
    try {
      await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: team.teamName,
          answers,
          autoSubmitted: true,
          timeTakenSeconds: EXAM_DURATION_SECONDS - timeRemainingSeconds,
        }),
      });
    } catch (err) {
      console.warn("Failed to sync locked submission to server:", err);
    }

    setView('locked');
  }, [team, answers, timeRemainingSeconds]);

  // Final Exam Submission & Score Calculation
  const handleSubmitExam = useCallback((autoSubmitted = false) => {
    setIsExamActive(false);
    localStorage.removeItem(STORAGE_KEYS.SESSION);

    if (!team) return;

    let scoredMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const round1Questions = questions.filter(q => (q.roundId || 'round-1') === 'round-1');
    const totalPossibleMarks = round1Questions.reduce((acc, q) => acc + q.marks, 0);

    const questionResults = round1Questions.map((q) => {
      const userChoice = answers[q.id] !== undefined ? answers[q.id] : null;
      const isAnswered = userChoice !== null;
      const isCorrect = userChoice === q.correctAnswer;

      if (!isAnswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
        scoredMarks += q.marks;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        questionText: q.question,
        options: q.options,
        userAnswer: userChoice,
        correctAnswer: q.correctAnswer,
        isCorrect,
        marks: q.marks,
        earnedMarks: isCorrect ? q.marks : 0,
        explanation: q.explanation
      };
    });

    const timeTaken = EXAM_DURATION_SECONDS - timeRemainingSeconds;
    const percentage = Math.round((scoredMarks / Math.max(1, totalPossibleMarks)) * 100);

    const finalResult: ExamResult = {
      team,
      totalQuestions: round1Questions.length,
      totalPossibleMarks,
      score: scoredMarks,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage,
      timeTakenSeconds: timeTaken,
      submittedAt: Date.now(),
      autoSubmitted,
      questionResults
    };

    setExamResult(finalResult);
    localStorage.setItem(STORAGE_KEYS.RESULT, JSON.stringify(finalResult));

    try {
      const historyRaw = localStorage.getItem('logic_hunt_submissions_history');
      const historyList: any[] = historyRaw ? JSON.parse(historyRaw) : [];
      const updatedList = [
        finalResult,
        ...historyList.filter((item: any) => item?.team?.teamName?.toLowerCase() !== team.teamName.toLowerCase())
      ];
      localStorage.setItem('logic_hunt_submissions_history', JSON.stringify(updatedList));
    } catch {}

    // Sync final score to server
    fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: team.teamName,
        answers,
        autoSubmitted,
        timeTakenSeconds: timeTaken,
      }),
    }).catch(() => {});

    setView('result');
  }, [answers, questions, team, timeRemainingSeconds]);

  // Retake / Start Fresh Session
  const handleResetSession = () => {
    // If currently locked, cannot simply reset without proctor unlock
    if (lockedExamInfo) {
      alert("This workstation is locked under an active exam disciplinary hold. Please contact the exam controller.");
      return;
    }
    setIsExamActive(false);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setAnswers({});
    setMarkedForReview({});
    setVisitedQuestions({ 1: true });
    setCurrentQuestionIndex(0);
    setTimeRemainingSeconds(EXAM_DURATION_SECONDS);
    setView('registration');
  };

  // Proctor Unlock Handler
  const handleUnlockTeam = (teamName: string) => {
    if (team?.teamName.toLowerCase() === teamName.toLowerCase()) {
      localStorage.removeItem(STORAGE_KEYS.LOCKED_EXAM);
      setLockedExamInfo(null);
      setView('instructions');
    }
  };

  // Question Administration
  const handleUpdateQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    saveStoredQuestions(newQuestions);
  };

  const handleResetQuestions = () => {
    const defaults = resetToDefaultQuestions();
    setQuestions(defaults);
  };

  const handleUpdateAdminSettings = (settings: AdminSettings) => {
    setAdminSettings(settings);
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    }).catch(() => {});
  };

  // Admin Hub Authentication Handlers
  const handleRequestAdmin = () => {
    if (isAdminAuthenticated) {
      setView('admin');
    } else {
      setRegistrationTab('admin');
      setView('registration');
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('logic_hunt_admin_auth', 'true');
    } catch {}
    setView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('logic_hunt_admin_auth');
    } catch {}
    setRegistrationTab('student');
    if (lockedExamInfo) {
      setView('locked');
    } else if (examResult) {
      setView('result');
    } else if (team) {
      setView('instructions');
    } else {
      setView('registration');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background ambient lighting and subtle grid */}
      <BackgroundEffects />

      {/* Top Navbar Contract */}
      <Navbar
        currentView={view}
        onNavigate={(newView) => {
          if (newView === 'admin') {
            handleRequestAdmin();
          } else {
            if (newView === 'registration') {
              setRegistrationTab('student');
            }
            setView(newView);
          }
        }}
        team={team}
        timeRemaining={isExamActive ? timeRemainingSeconds : undefined}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onResetSession={handleResetSession}
        onRequestAdmin={handleRequestAdmin}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Main Content Router */}
      <div className="flex-1">
        {view === 'registration' && (
          <RegistrationPage
            initialTeam={team}
            onSubmitTeam={handleRegisterTeam}
            onAdminLoginSuccess={handleAdminLoginSuccess}
            defaultTab={registrationTab}
          />
        )}

        {view === 'instructions' && team && (
          <InstructionsPage
            team={team}
            totalQuestions={questions.filter(q => (q.roundId || 'round-1') === 'round-1').length}
            durationMinutes={15}
            maxViolations={adminSettings.maxViolations}
            onStartTest={handleStartExam}
            onBackToRegistration={() => {
              setRegistrationTab('student');
              setView('registration');
            }}
          />
        )}

        {view === 'exam' && team && (
          <ExamPage
            questions={questions.filter(q => (q.roundId || 'round-1') === 'round-1')}
            team={team}
            timeRemainingSeconds={timeRemainingSeconds}
            answers={answers}
            markedForReview={markedForReview}
            visitedQuestions={visitedQuestions}
            currentQuestionIndex={currentQuestionIndex}
            adminSettings={adminSettings}
            isSubmitModalOpen={isSubmitModalOpen}
            setIsSubmitModalOpen={setIsSubmitModalOpen}
            onSelectOption={handleSelectOption}
            onClearOption={handleClearOption}
            onToggleReview={handleToggleReview}
            onJumpToQuestion={handleJumpToQuestion}
            onSubmitExam={handleSubmitExam}
            onLockExam={handleLockExam}
          />
        )}

        {view === 'locked' && lockedExamInfo && (
          <TestLockedPage
            lockedInfo={lockedExamInfo}
            onOpenAdminPortal={handleRequestAdmin}
          />
        )}

        {view === 'result' && examResult && (
          <ResultPage
            result={examResult}
            allowCandidateSolutionReview={adminSettings.allowCandidateSolutionReview}
            onRetakeTest={handleResetSession}
            onToggleAdminSolutionReview={() => {
              handleUpdateAdminSettings({
                ...adminSettings,
                allowCandidateSolutionReview: true
              });
            }}
          />
        )}

        {view === 'admin' && (
          isAdminAuthenticated ? (
            <AdminPortal
              questions={questions}
              adminSettings={adminSettings}
              onUpdateQuestions={handleUpdateQuestions}
              onResetQuestions={handleResetQuestions}
              onUpdateAdminSettings={handleUpdateAdminSettings}
              onUnlockTeam={handleUnlockTeam}
              onLogout={handleAdminLogout}
              onBackToApp={() => {
                if (lockedExamInfo) {
                  setView('locked');
                } else if (examResult) {
                  setView('result');
                } else if (team) {
                  setView('instructions');
                } else {
                  setRegistrationTab('student');
                  setView('registration');
                }
              }}
            />
          ) : (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 text-center">
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 max-w-md">
                <h3 className="text-lg font-bold text-white mb-2">Admin Login Required</h3>
                <p className="text-xs text-slate-400 mb-4">Please log in with admin username and password.</p>
                <button
                  onClick={() => {
                    setRegistrationTab('admin');
                    setView('registration');
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Go to Admin Login
                </button>
              </div>
            </div>
          )
        )}
      </div>

    </div>
  );
}
