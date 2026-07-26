import { questions } from "./data";
import type { Attempt, Progress, Question, ReviewItem, SkillId } from "./types";

export const emptyProgress: Progress = {
  version: 2, points: 0, streak: 0, studyStreak: 0,
  completedLessons: [], completedAcademyLessons: [], completedChallenges: [],
  attempts: [], reviews: [], achievements: [],
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem("ecg-trainer-progress-v1");
    if (!raw) return emptyProgress;
    const saved = JSON.parse(raw);
    return {
      ...emptyProgress, ...saved, version: 2,
      completedAcademyLessons: saved.completedAcademyLessons ?? [],
      completedChallenges: saved.completedChallenges ?? [...new Set(
        (saved.attempts ?? []).filter((attempt: Attempt)=>attempt.correct).map((attempt: Attempt)=>attempt.questionId),
      )],
    };
  } catch { return emptyProgress; }
}

export function saveProgress(progress: Progress) {
  localStorage.setItem("ecg-trainer-progress-v1", JSON.stringify(progress));
}

export function skillMastery(progress: Progress) {
  const result: Record<string, { score: number; attempts: number; correct: number }> = {};
  progress.attempts.forEach((attempt) => {
    [...attempt.correctSkills, ...attempt.incorrectSkills].forEach((skill) => {
      result[skill] ??= { score: 0, attempts: 0, correct: 0 };
      result[skill].attempts += 1;
      const correct = attempt.correctSkills.includes(skill);
      if (correct) result[skill].correct += 1;
      const confidenceFit = correct ? 0.75 + attempt.confidence * 0.05 : 0;
      const hintFactor = Math.max(0.55, 1 - attempt.hintsUsed * 0.18);
      const speedFactor = attempt.timeSeconds > 90 ? 0.9 : 1;
      result[skill].score += correct ? confidenceFit * hintFactor * speedFactor : 0;
    });
  });
  return Object.fromEntries(Object.entries(result).map(([skill, value]) => [
    skill, Math.round(Math.min(100, (value.score / Math.max(1, value.attempts)) * 100)),
  ])) as Record<SkillId, number>;
}

export function scheduleReview(previous: ReviewItem | undefined, attempt: Attempt): ReviewItem {
  const now = new Date();
  let days = 0;
  if (!attempt.correct) days = previous?.repetitions ? 1 : 0;
  else if (attempt.confidence <= 2 || attempt.hintsUsed > 0) days = 2;
  else days = Math.min(30, Math.max(3, (previous?.intervalDays || 1) * 2));
  now.setDate(now.getDate() + days);
  return {
    questionId: attempt.questionId, dueAt: now.toISOString(), intervalDays: days,
    repetitions: (previous?.repetitions || 0) + 1, understood: attempt.correct,
  };
}

export function recommendation(progress: Progress) {
  if (!progress.attempts.length) return "Comece pelo reconhecimento de ondas e intervalos. O jogo ajustará a revisão após suas primeiras respostas.";
  const mastery = skillMastery(progress);
  const weakest = Object.entries(mastery).sort((a,b) => a[1] - b[1])[0];
  const recent = progress.attempts.slice(-6);
  const sameSkillErrors = recent.filter(a => !a.correct && a.incorrectSkills.includes(weakest?.[0] as SkillId)).length;
  if (weakest && sameSkillErrors === 1 && progress.attempts.length <= 3) {
    return `Sua primeira dificuldade apareceu em ${weakest[0].replaceAll("_"," ")}. Reveja o conceito e repita uma questão focada antes de seguir.`;
  }
  if (weakest && sameSkillErrors >= 2) return `Há dificuldade recente e repetida em ${weakest[0].replaceAll("_"," ")}. Faça duas questões focadas antes de voltar aos casos completos.`;
  const lowConfidence = recent.filter(a => a.correct && a.confidence <= 2).length;
  if (lowConfidence >= 2) return "Você acertou, mas relatou baixa confiança. Revise a explicação alternativa antes de aumentar a dificuldade.";
  return "Seu desempenho está estável. Misture uma questão de revisão com uma questão nova para consolidar a transferência.";
}

export function nextAdaptiveQuestion(progress: Progress, module?: string): Question | undefined {
  const lastQuestionId = progress.attempts.at(-1)?.questionId;
  const completed = new Set(progress.completedChallenges);
  const eligible = questions.filter(q =>
    (!module || q.module === module) &&
    !completed.has(q.id) &&
    (!q.id.startsWith("academy-") || progress.completedAcademyLessons.includes(q.topic))
  );
  if (!eligible.length) return undefined;
  const alternatives = eligible.filter(q => q.id !== lastQuestionId);
  const pool = alternatives.length ? alternatives : eligible;
  const due = progress.reviews
    .filter(r => !r.understood && new Date(r.dueAt) <= new Date() && r.questionId !== lastQuestionId)
    .sort((a,b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const dueQuestion = pool.find(q => q.id === due[0]?.questionId);
  if (dueQuestion) return dueQuestion;
  const mastery = skillMastery(progress);
  const attemptCount = (id: string) => progress.attempts.filter(a => a.questionId === id).length;
  return pool
    .sort((a,b) => {
      const aScore = Math.min(...a.skills.map(s => mastery[s] ?? 45));
      const bScore = Math.min(...b.skills.map(s => mastery[s] ?? 45));
      const exposureDifference = attemptCount(a.id) - attemptCount(b.id);
      return exposureDifference || aScore - bScore || a.difficulty - b.difficulty;
    })[0];
}

export function classifyAttempt(question: Question, selected: number, seconds: number, hints: number, confidence: number, prior: number): Attempt {
  const correct = selected === question.answer;
  const guessed = correct && (confidence <= 1 || prior > 0);
  return {
    questionId: question.id, module: question.module, correct, selectedAnswer: selected,
    correctSkills: correct && !guessed ? question.skills : [],
    incorrectSkills: correct && !guessed ? [] : question.skills,
    timeSeconds: seconds, hintsUsed: hints, confidence, attemptNumber: prior + 1,
    errorType: guessed ? "acerto_por_tentativa" : !correct ? (seconds < 7 ? "resposta_precipitada" : hints > 1 ? "dependencia_de_dicas" : question.errorType) : undefined,
    createdAt: new Date().toISOString(),
  };
}
