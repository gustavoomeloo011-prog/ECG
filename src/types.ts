export type ModuleId = "ondas" | "ritmo" | "bloqueios";
export type SkillId =
  | "onda_p" | "intervalo_pr" | "complexo_qrs" | "segmento_st" | "onda_t"
  | "frequencia" | "regularidade" | "ritmo_sinusal"
  | "qrs_alargado" | "morfologia_v1" | "morfologia_lateral" | "diferenciar_brd_bre";
export type QuestionType = "choice" | "boolean" | "visual" | "order" | "compare" | "report";
export type ErrorType =
  | "conceitual" | "reconhecimento_visual" | "calculo" | "medicao"
  | "sequencia" | "confusao_diagnostica" | "resposta_precipitada"
  | "dependencia_de_dicas" | "acerto_por_tentativa" | "aplicacao";

export interface Lesson {
  id: string;
  module: ModuleId;
  title: string;
  shortConcept: string;
  intuitive: string;
  technical: string;
  visual: "normal" | "slow" | "fast" | "rbbb" | "lbbb" | "av1" | "mobitz1" | "mobitz2" | "avcomplete" | "vt" | "vf" | "pvt" | "asystole" | "pea";
  reviewed: boolean;
}

export interface Question {
  id: string;
  module: ModuleId;
  topic: string;
  prompt: string;
  type: QuestionType;
  options: string[];
  answer: number;
  explanation: string;
  alternativeExplanation: string;
  skills: SkillId[];
  difficulty: 1 | 2 | 3;
  points: number;
  errorType: ErrorType;
  trace: Lesson["visual"];
  secondaryTrace?: Lesson["visual"];
  visualFocus?: "p" | "pr" | "qrs" | "st" | "t" | "rr" | "terminal";
  visualInstruction?: string;
  reviewed: boolean;
  sourceIds: string[];
  exam?: boolean;
}

export interface Attempt {
  questionId: string;
  module: ModuleId;
  correct: boolean;
  selectedAnswer: number;
  correctSkills: SkillId[];
  incorrectSkills: SkillId[];
  timeSeconds: number;
  hintsUsed: number;
  confidence: number;
  attemptNumber: number;
  errorType?: ErrorType;
  createdAt: string;
}

export interface ReviewItem {
  questionId: string;
  dueAt: string;
  intervalDays: number;
  repetitions: number;
  understood: boolean;
}

export interface Progress {
  version: 1;
  points: number;
  streak: number;
  studyStreak: number;
  lastStudyDate?: string;
  completedLessons: string[];
  attempts: Attempt[];
  reviews: ReviewItem[];
  achievements: string[];
}

export interface ReferenceItem {
  id: string;
  title: string;
  role: "pedagogical" | "validation";
  url?: string;
  note: string;
}
