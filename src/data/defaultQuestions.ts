import { Question } from '../types/exam';

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "If 'DEV' is coded as '27', how is 'RAM' coded in that same language?",
    options: ["28", "32", "31", "30"],
    correctAnswer: 0,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Coding-Decoding",
    explanation: "Sum of alphabetical positions for DEV: D(4) + E(5) + V(22) = 31. Subtracting 4 gives 31 - 4 = 27. For RAM: R(18) + A(1) + M(13) = 32. Applying the same rule: 32 - 4 = 28."
  },
  {
    id: 2,
    question: "Identify the odd one out from the given options.",
    options: ["Copper", "Brass", "Silver", "Gold"],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Easy",
    roundId: "round-1",
    category: "Classification & Analogy",
    explanation: "Brass is an alloy composed of copper and zinc, whereas Copper, Silver, and Gold are pure elementary metallic elements on the periodic table."
  },
  {
    id: 3,
    question: "Find the missing number in the following sequence: 4, 9, 19, 39, 79, ___",
    options: ["119", "139", "159", "149"],
    correctAnswer: 2,
    marks: 1,
    difficulty: "Easy",
    roundId: "round-1",
    category: "Number Series",
    explanation: "The pattern is: (Previous term × 2) + 1. Specifically: (4 × 2) + 1 = 9; (9 × 2) + 1 = 19; (19 × 2) + 1 = 39; (39 × 2) + 1 = 79; (79 × 2) + 1 = 159."
  },
  {
    id: 4,
    question: "Pointing to a man, a woman says, \"His mother is the only daughter of my mother.\" How is the woman related to the man?",
    options: ["Sister", "Mother", "Aunt", "Grandmother"],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Blood Relations",
    explanation: "\"The only daughter of my mother\" means the woman herself. Therefore, \"his mother\" is the woman herself, which means she is the man's Mother."
  },
  {
    id: 5,
    question: "In a row of students facing North, Priya is 18th from the left end and Divya is 22nd from the right end. If they interchange their positions, Priya becomes 29th from the left end. How many total students are in the row?",
    options: ["48", "50", "51", "49"],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Ranking & Order",
    explanation: "After interchanging, Priya takes Divya's original position. That position is 29th from the left and 22nd from the right. Total students = Left + Right - 1 = 29 + 22 - 1 = 50."
  },
  {
    id: 6,
    question: "If P * Q means P is the sister of Q; P # Q means P is the father of Q; and P @ Q means P is the mother of Q. Which of the following expressions indicates that M is the maternal grandmother of T?",
    options: [
      "M @ R * K # T",
      "M @ R * K @ T",
      "M # R @ K * T",
      "M * R @ K # T"
    ],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Hard",
    roundId: "round-1",
    category: "Coded Relations",
    explanation: "In 'M @ R * K @ T': M is mother of R (M @ R); R is sister of K (R * K, so M is also mother of K); K is mother of T (K @ T). Thus, M is mother of T's mother (K), making M the maternal grandmother of T."
  },
  {
    id: 7,
    question: "Eight friends A, B, C, D, E, F, G, and H are sitting around a circular table facing the center. B is 3rd to the right of A. F is 2nd to the left of B. D is not an immediate neighbor of A or B. C and H are immediate neighbors of each other, and C is not a neighbor of B. Who sits exactly opposite to F?",
    options: ["C", "D", "G", "H"],
    correctAnswer: 0,
    marks: 1,
    difficulty: "Hard",
    roundId: "round-1",
    category: "Seating Arrangement",
    explanation: "Numbering positions 1 to 8 clockwise: Let A = 1. B is 3rd right = position 4. F is 2nd left of B = position 2. D cannot be at 8, 2, 3, 5, so D is at 7. C and H are neighbors, and C is not neighbor of B (pos 4), so H = 5 and C = 6. Position opposite to F (pos 2) is pos (2+4) = 6, which is occupied by C."
  },
  {
    id: 8,
    question: "An accurate clock shows 4:40 PM. Through how many degrees will the hour hand rotate when the clock shows 8:10 PM on the same day?",
    options: ["100 deg", "105 deg", "110 deg", "115 deg"],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Clocks & Time",
    explanation: "Time duration from 4:40 PM to 8:10 PM is 3 hours and 30 minutes = 210 minutes. The hour hand rotates 360° in 12 hours (720 minutes), which is 0.5° per minute. Rotation = 210 × 0.5° = 105 degrees."
  },
  {
    id: 9,
    question: "If January 26th, 2016 was a Tuesday, on which day of the week did January 26th, 2020 fall?",
    options: ["Sunday", "Monday", "Saturday", "Tuesday"],
    correctAnswer: 0,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Calendar Logic",
    explanation: "2016 was a leap year (includes Feb 29), giving 2 odd days up to Jan 26, 2017. 2017 gives 1 odd day; 2018 gives 1 odd day; 2019 gives 1 odd day. Total odd days = 2 + 1 + 1 + 1 = 5 odd days. Tuesday + 5 days = Sunday."
  },
  {
    id: 10,
    question: "Statements: K >= L > M = N <= O < P. Which of the following conclusions is DEFINITELY TRUE?",
    options: ["K > N", "L <= O", "M < P", "Both A and C"],
    correctAnswer: 3,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Logical Inequalities",
    explanation: "1) K >= L > M = N directly yields K > N (True). 2) L > M and M <= O have opposing signs, so L <= O cannot be determined. 3) M = N <= O < P directly yields M < P (True). Since both A and C are definitely true, Option D is the correct choice."
  },
  {
    id: 11,
    question: "Arun walks 12 km North, turns right and walks 5 km. He then turns right again and walks 7 km, and finally turns right and walks 17 km. How far and in which direction is he from his initial starting point?",
    options: [
      "13 km North-West",
      "13 km South-West",
      "15 km North-West",
      "12 km South-East"
    ],
    correctAnswer: 0,
    marks: 1,
    difficulty: "Hard",
    roundId: "round-1",
    category: "Direction Sense",
    explanation: "Displacement along North-South axis: +12 km (North) - 7 km (South) = +5 km (North). Displacement along East-West axis: +5 km (East) - 17 km (West) = -12 km (West). Distance = √(5² + 12²) = √(25 + 144) = √169 = 13 km. Direction from start = North-West."
  },
  {
    id: 12,
    question: "Among five colleagues P, Q, R, S, and T, each has a different experience level. R has more experience than S but less than T. Q is more experienced than only P. Who is the second most experienced person among them?",
    options: ["T", "R", "S", "Q"],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Order & Ranking",
    explanation: "T > R > S. Since Q is more experienced than only P, Q is 4th and P is 5th (lowest): Q > P. The complete ordering from highest to lowest experience is T > R > S > Q > P. The second most experienced person is R."
  },
  {
    id: 13,
    question: "Look at this series: 80, 10, 70, 15, 60, ___ What number should come next?",
    options: ["20", "25", "50", "30"],
    correctAnswer: 0,
    marks: 1,
    difficulty: "Easy",
    roundId: "round-1",
    category: "Number Series",
    explanation: "This is an alternating series of two sequences: Sequence 1 (odd positions): 80, 70, 60, ... (subtracting 10). Sequence 2 (even positions): 10, 15, ... (adding 5). The 6th term is in Sequence 2: 15 + 5 = 20."
  },
  {
    id: 14,
    question: "Five friends P, Q, R, S, and T scored different marks in an exam. Q scored more than R but less than T. S scored more than only P. Who scored the second lowest marks?",
    options: ["P", "S", "R", "Q"],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Order & Ranking",
    explanation: "T > Q > R. \"S scored more than only P\" means S is 4th and P is 5th (the absolute lowest). The full marks order from highest to lowest is T > Q > R > S > P. P scored the lowest, and S scored the second lowest marks."
  },
  {
    id: 15,
    question: "Pointing to a photograph of a boy, Suresh said, \"He is the son of the only daughter of the father of my mother's husband.\" How is the boy in the photograph related to Suresh?",
    options: ["Brother", "Cousin", "Nephew", "Son"],
    correctAnswer: 1,
    marks: 1,
    difficulty: "Medium",
    roundId: "round-1",
    category: "Blood Relations",
    explanation: "Step 1: \"my mother's husband\" = Suresh's father. Step 2: \"the father of Suresh's father\" = Suresh's paternal grandfather. Step 3: \"the only daughter of Suresh's grandfather\" = Suresh's paternal aunt (father's sister). Step 4: \"the son of Suresh's aunt\" = Suresh's Cousin."
  }
];

export const STORAGE_KEYS = {
  QUESTIONS: 'logic_hunt_questions_v1',
  SESSION: 'logic_hunt_session_v1',
  RESULT: 'logic_hunt_result_v1',
  ADMIN_SETTINGS: 'logic_hunt_admin_settings_v1',
  LOCKED_EXAM: 'logic_hunt_locked_exam_v1',
  VIOLATIONS_LOG: 'logic_hunt_violations_log_v1',
};

export const DEFAULT_ADMIN_SETTINGS = {
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

export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
      return DEFAULT_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_QUESTIONS;
  } catch {
    return DEFAULT_QUESTIONS;
  }
}

export function saveStoredQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (err) {
    console.error("Failed to save questions:", err);
  }
}

export function resetToDefaultQuestions(): Question[] {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
  } catch (err) {
    console.error("Failed to reset questions:", err);
  }
  return DEFAULT_QUESTIONS;
}
