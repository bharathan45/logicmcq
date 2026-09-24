import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_QUESTIONS } from './src/data/defaultQuestions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory server-side security store
interface ServerViolation {
  id: string;
  timestamp: number;
  type: string;
  message: string;
  violationNumber: number;
  severity: 'warning' | 'critical';
}

interface ServerSession {
  sessionId: string;
  team: {
    teamName: string;
    leaderName: string;
    collegeName: string;
    membersCount: number;
  };
  startedAt: number;
  expectedEndTime: number;
  durationSeconds: number;
  submittedAt?: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'LOCKED';
  violations: ServerViolation[];
  violationCount: number;
  lockReason?: string;
  score?: number;
  totalPossibleMarks?: number;
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  percentage?: number;
  questionResults?: any[];
  answers: Record<number, number>;
  timeTakenSeconds?: number;
  autoSubmitted?: boolean;
}

const sessions: Map<string, ServerSession> = new Map();

// Admin security settings on server
let adminSettings = {
  strictModeEnabled: true,
  fullscreenRequired: true,
  tabSwitchDetection: true,
  copyPasteBlocked: true,
  keyboardShortcutsBlocked: true,
  maxViolations: 3,
  autoSubmitOnMaxViolations: true,
  allowCandidateSolutionReview: false,
  activeRoundId: 'round-1',
  passcode: 'admin123',
};

// -------------------------------------------------------------
// API Endpoints for Exam Security & Session Lifecycle
// -------------------------------------------------------------

// Start or register an exam session
app.post('/api/exam/start', (req, res) => {
  try {
    const { team, durationSeconds = 900 } = req.body;
    if (!team || !team.teamName) {
      return res.status(400).json({ error: 'Team information is required' });
    }

    const sessionId = `${team.teamName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const now = Date.now();
    const expectedEndTime = now + durationSeconds * 1000;

    const newSession: ServerSession = {
      sessionId,
      team,
      startedAt: now,
      expectedEndTime,
      durationSeconds,
      status: 'IN_PROGRESS',
      violations: [],
      violationCount: 0,
      answers: {},
    };

    sessions.set(sessionId, newSession);
    sessions.set(team.teamName.toLowerCase(), newSession); // Quick key

    return res.json({
      success: true,
      sessionId,
      startedAt: now,
      expectedEndTime,
      maxViolations: adminSettings.maxViolations,
      strictMode: adminSettings.strictModeEnabled,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Periodic answer & time sync
app.post('/api/exam/sync', (req, res) => {
  try {
    const { sessionId, teamName, answers = {}, timeRemainingSeconds } = req.body;
    const session = sessions.get(sessionId) || (teamName && sessions.get(teamName.toLowerCase()));

    if (!session) {
      return res.json({ status: 'ACTIVE', isLocked: false });
    }

    if (session.status === 'LOCKED') {
      return res.json({
        status: 'LOCKED',
        isLocked: true,
        violationCount: session.violationCount,
        lockReason: session.lockReason,
      });
    }

    // Server-side timer check
    const now = Date.now();
    const serverRemaining = Math.max(0, Math.floor((session.expectedEndTime - now) / 1000));
    
    session.answers = { ...session.answers, ...answers };

    // Auto-expire check
    if (serverRemaining <= 0 && session.status === 'IN_PROGRESS') {
      session.status = 'SUBMITTED';
      session.submittedAt = now;
      session.autoSubmitted = true;
      return res.json({ status: 'EXPIRED', isLocked: false, serverRemaining: 0 });
    }

    return res.json({
      status: session.status,
      isLocked: false,
      serverRemaining,
      violationCount: session.violationCount,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Report violation server-side
app.post('/api/exam/violation', (req, res) => {
  try {
    const { sessionId, teamName, type, message } = req.body;
    let session = sessions.get(sessionId) || (teamName && sessions.get(teamName.toLowerCase()));

    if (!session && teamName) {
      // Create session fallback
      const now = Date.now();
      session = {
        sessionId: `${teamName.toLowerCase()}_${now}`,
        team: { teamName, leaderName: 'Candidate', collegeName: 'Institution', membersCount: 1 },
        startedAt: now,
        expectedEndTime: now + 900 * 1000,
        durationSeconds: 900,
        status: 'IN_PROGRESS',
        violations: [],
        violationCount: 0,
        answers: {},
      };
      sessions.set(session.sessionId, session);
      sessions.set(teamName.toLowerCase(), session);
    }

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.violationCount += 1;
    const isCritical = session.violationCount >= adminSettings.maxViolations;

    const violation: ServerViolation = {
      id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      type: type || 'RESTRICTED_KEY',
      message: message || 'Exam rule policy violation detected',
      violationNumber: session.violationCount,
      severity: isCritical ? 'critical' : 'warning',
    };

    session.violations.push(violation);

    // If max violations reached and autoSubmitOnMaxViolations is enabled:
    if (adminSettings.strictModeEnabled && isCritical && adminSettings.autoSubmitOnMaxViolations) {
      session.status = 'LOCKED';
      session.lockReason = `Maximum violation limit (${adminSettings.maxViolations}) exceeded due to ${type}: ${message}`;
      session.submittedAt = Date.now();
      session.autoSubmitted = true;

      // Calculate score server-side
      let scoredMarks = 0;
      const round1Questions = DEFAULT_QUESTIONS.filter((q) => (q.roundId || 'round-1') === 'round-1');
      round1Questions.forEach((q) => {
        if (session.answers[q.id] === q.correctAnswer) {
          scoredMarks += q.marks;
        }
      });
      session.score = scoredMarks;
      session.totalPossibleMarks = round1Questions.reduce((a, b) => a + b.marks, 0);

      return res.json({
        locked: true,
        violationCount: session.violationCount,
        maxViolations: adminSettings.maxViolations,
        lockReason: session.lockReason,
        violations: session.violations,
        status: 'LOCKED',
      });
    }

    return res.json({
      locked: false,
      violationCount: session.violationCount,
      maxViolations: adminSettings.maxViolations,
      remaining: Math.max(0, adminSettings.maxViolations - session.violationCount),
      violations: session.violations,
      status: session.status,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Final Exam Submission & Server-side Score Calculation
app.post('/api/exam/submit', (req, res) => {
  try {
    const { sessionId, teamName, answers = {}, autoSubmitted = false, timeTakenSeconds } = req.body;
    let session = sessions.get(sessionId) || (teamName && sessions.get(teamName.toLowerCase()));

    const now = Date.now();
    const round1Questions = DEFAULT_QUESTIONS.filter((q) => (q.roundId || 'round-1') === 'round-1');
    const totalPossibleMarks = round1Questions.reduce((a, b) => a + b.marks, 0);

    let scoredMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

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
        explanation: q.explanation,
      };
    });

    const percentage = Math.round((scoredMarks / Math.max(1, totalPossibleMarks)) * 100);

    if (session) {
      session.status = session.status === 'LOCKED' ? 'LOCKED' : 'SUBMITTED';
      session.submittedAt = now;
      session.answers = answers;
      session.score = scoredMarks;
      session.totalPossibleMarks = totalPossibleMarks;
      session.correctCount = correctCount;
      session.wrongCount = wrongCount;
      session.unansweredCount = unansweredCount;
      session.percentage = percentage;
      session.timeTakenSeconds = timeTakenSeconds;
      session.autoSubmitted = autoSubmitted;
      session.questionResults = questionResults;
    }

    return res.json({
      success: true,
      score: scoredMarks,
      totalPossibleMarks,
      correctCount,
      wrongCount,
      unansweredCount,
      percentage,
      timeTakenSeconds: timeTakenSeconds || (session ? Math.floor((now - session.startedAt) / 1000) : 900),
      submittedAt: now,
      autoSubmitted,
      questionResults,
      violations: session ? session.violations : [],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin endpoints
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username &&
    typeof username === 'string' &&
    username.trim().toLowerCase() === 'bharathan' &&
    password === 'Bharath@123@'
  ) {
    return res.json({ success: true, message: 'Authentication successful', user: 'bharathan' });
  }
  return res.status(401).json({ success: false, error: 'Invalid username or password' });
});

app.get('/api/admin/sessions', (_req, res) => {
  const list = Array.from(new Set(sessions.values())).map((s) => ({
    sessionId: s.sessionId,
    team: s.team,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt,
    status: s.status,
    violationCount: s.violationCount,
    violations: s.violations,
    lockReason: s.lockReason,
    score: s.score ?? 0,
    totalPossibleMarks: s.totalPossibleMarks ?? 15,
    correctCount: s.correctCount ?? 0,
    wrongCount: s.wrongCount ?? 0,
    unansweredCount: s.unansweredCount ?? 0,
    percentage: s.percentage ?? (s.score !== undefined ? Math.round(((s.score || 0) / (s.totalPossibleMarks || 15)) * 100) : 0),
    timeTakenSeconds: s.timeTakenSeconds ?? (s.submittedAt ? Math.floor((s.submittedAt - s.startedAt) / 1000) : 0),
    autoSubmitted: s.autoSubmitted ?? false,
    questionResults: s.questionResults || [],
  }));
  return res.json({ sessions: list });
});

app.get('/api/admin/settings', (_req, res) => {
  return res.json({ settings: adminSettings });
});

app.post('/api/admin/settings', (req, res) => {
  const { settings } = req.body;
  if (settings) {
    adminSettings = { ...adminSettings, ...settings };
  }
  return res.json({ success: true, settings: adminSettings });
});

// Proctor manual unlock
app.post('/api/admin/unlock', (req, res) => {
  const { sessionId, teamName } = req.body;
  const session = sessions.get(sessionId) || (teamName && sessions.get(teamName.toLowerCase()));
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  session.status = 'IN_PROGRESS';
  session.violationCount = 0;
  session.lockReason = undefined;
  return res.json({ success: true, message: `Session for ${session.team.teamName} unlocked and violations cleared.` });
});

// -------------------------------------------------------------
// Vite middleware in dev / Static server in prod
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const portNum = Number(PORT);
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`Logic Hunt Exam Server running on port ${portNum}`);
  });
}

startServer();
