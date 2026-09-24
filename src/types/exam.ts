export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  marks: number;
  difficulty: Difficulty;
  roundId: string;
  category?: string;
  explanation?: string;
}

export interface TeamInfo {
  teamName: string;
  leaderName: string;
  collegeName: string;
  membersCount: number;
}

export type ViolationType = 
  | 'TAB_SWITCH' 
  | 'WINDOW_BLUR' 
  | 'FULLSCREEN_EXIT' 
  | 'DEVTOOLS_SHORTCUT' 
  | 'COPY_PASTE' 
  | 'CONTEXT_MENU' 
  | 'RESTRICTED_KEY' 
  | 'EXTERNAL_FOCUS_LOST';

export interface ViolationRecord {
  id: string;
  timestamp: number;
  type: ViolationType;
  message: string;
  violationNumber: number;
  severity: 'warning' | 'critical';
}

export interface ExamState {
  team: TeamInfo | null;
  currentQuestionIndex: number;
  answers: Record<number, number>; // questionId -> optionIndex
  markedForReview: Record<number, boolean>; // questionId -> boolean
  visitedQuestions: Record<number, boolean>; // questionId -> boolean
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  isStarted: boolean;
  isSubmitted: boolean;
  submittedAt?: number;
  startedAt?: number;
  autoSubmitted?: boolean;
  isLocked?: boolean;
  violations: ViolationRecord[];
}

export interface ExamResult {
  team: TeamInfo;
  totalQuestions: number;
  totalPossibleMarks: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  timeTakenSeconds: number;
  submittedAt: number;
  autoSubmitted: boolean;
  isLocked?: boolean;
  lockReason?: string;
  violations?: ViolationRecord[];
  questionResults: {
    questionId: number;
    questionText: string;
    options: string[];
    userAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    marks: number;
    earnedMarks: number;
    explanation?: string;
  }[];
}

export interface AdminSettings {
  strictModeEnabled: boolean;
  fullscreenRequired: boolean;
  tabSwitchDetection: boolean;
  copyPasteBlocked: boolean;
  keyboardShortcutsBlocked: boolean;
  maxViolations: number;
  autoSubmitOnMaxViolations: boolean;
  allowCandidateSolutionReview: boolean;
  activeRoundId: string;
  passcode: string;
}

export interface ExamSessionRecord {
  sessionId: string;
  team: TeamInfo;
  startedAt: number;
  expectedEndTime: number;
  submittedAt?: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'LOCKED';
  violations: ViolationRecord[];
  violationCount: number;
  lockReason?: string;
  score?: number;
  totalPossibleMarks?: number;
  answers: Record<number, number>;
  timeTakenSeconds?: number;
}

export interface LockedExamInfo {
  team: TeamInfo;
  roundNumber: string;
  violationCount: number;
  violations: ViolationRecord[];
  submittedAt: number;
  lockReason: string;
  status: 'Locked / Submitted';
}
