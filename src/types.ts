export type ExamWeightage = 'crucial' | 'high' | 'medium';

export interface VisualDiagramNode {
  node: string;
  explanation: string;
  examSignificance: string;
}

export interface VisualDiagram {
  id: string;
  title: string;
  type: 'flowchart' | 'mindmap' | 'sequence' | 'stateDiagram';
  description: string;
  mermaidCode: string;
  keyNodesExplaining: VisualDiagramNode[];
}

export interface ExamConcept {
  id: string;
  concept: string;
  weightage: ExamWeightage;
  weightagePercentage: number; // e.g. 30 -> 30% of chapter marks
  whyHighWeightage: string;
  coreDefinition: string;
  keyFormulasOrRules: string[];
  examTraps: string[];
  mnemonic: string;
}

export interface ExamQuestion {
  id: string;
  category: '2-Mark Conceptual' | '5-Mark Analytical' | '10-Mark Deep Dive';
  marks: number;
  question: string;
  expectedKeywords: string[];
  modelAnswer: string;
  examinerTip: string;
  userAnswer?: string;
  evaluation?: {
    score: number;
    maxScore: number;
    feedback: string;
    missingKeywords: string[];
    strengths: string[];
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  weightage: ExamWeightage;
  leitnerBox: number; // 1 to 5
  intervalDays: number;
  nextReviewDate: string; // ISO date
  reviewCount: number;
  lastRating?: 'again' | 'hard' | 'good' | 'easy';
}

export interface StudySummary {
  executiveOverview: string;
  keyTakeaways: string[];
  corePrinciples: {
    title: string;
    description: string;
    importance: string;
  }[];
  prerequisites: string[];
}

export interface StudyMaterial {
  id: string;
  meta: {
    title: string;
    subject: string;
    targetExamLevel: string;
    estimatedStudyTime: string;
    keyThemes: string[];
    sourceFileName: string;
    generatedAt: string;
  };
  studySummary: StudySummary;
  diagrams: VisualDiagram[];
  examConcepts: ExamConcept[];
  examQuestions: ExamQuestion[];
  flashcards: Flashcard[];
}

export interface SampleDocument {
  id: string;
  title: string;
  subject: string;
  badge: string;
  description: string;
  content: string;
  defaultData: StudyMaterial;
}
