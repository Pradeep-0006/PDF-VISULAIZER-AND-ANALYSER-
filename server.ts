import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
});
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// JSON Schema for structured analysis output
const studyMaterialSchema = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subject: { type: Type.STRING },
        targetExamLevel: { type: Type.STRING },
        estimatedStudyTime: { type: Type.STRING },
        keyThemes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['title', 'subject', 'keyThemes'],
    },
    studySummary: {
      type: Type.OBJECT,
      properties: {
        executiveOverview: { type: Type.STRING },
        keyTakeaways: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        corePrinciples: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              importance: { type: Type.STRING },
            },
            required: ['title', 'description', 'importance'],
          },
        },
        prerequisites: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['executiveOverview', 'keyTakeaways', 'corePrinciples'],
    },
    diagrams: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          type: {
            type: Type.STRING,
            description: "Must be 'flowchart', 'mindmap', 'sequence', or 'stateDiagram'",
          },
          description: { type: Type.STRING },
          mermaidCode: {
            type: Type.STRING,
            description: "Valid mermaid syntax. Flowcharts must start with flowchart TD or flowchart LR. Avoid special characters inside node text that break mermaid parser; wrap text in double quotes if needed.",
          },
          keyNodesExplaining: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                node: { type: Type.STRING },
                explanation: { type: Type.STRING },
                examSignificance: { type: Type.STRING },
              },
              required: ['node', 'explanation', 'examSignificance'],
            },
          },
        },
        required: ['id', 'title', 'type', 'description', 'mermaidCode', 'keyNodesExplaining'],
      },
    },
    examConcepts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          concept: { type: Type.STRING },
          weightage: {
            type: Type.STRING,
            description: "Must be 'crucial', 'high', or 'medium'",
          },
          weightagePercentage: {
            type: Type.NUMBER,
            description: "Estimated percentage of exam marks (e.g. 35 for 35%)",
          },
          whyHighWeightage: { type: Type.STRING },
          coreDefinition: { type: Type.STRING },
          keyFormulasOrRules: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          examTraps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          mnemonic: { type: Type.STRING },
        },
        required: ['id', 'concept', 'weightage', 'weightagePercentage', 'whyHighWeightage', 'coreDefinition', 'keyFormulasOrRules', 'examTraps'],
      },
    },
    examQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: {
            type: Type.STRING,
            description: "Must be '2-Mark Conceptual', '5-Mark Analytical', or '10-Mark Deep Dive'",
          },
          marks: { type: Type.NUMBER },
          question: { type: Type.STRING },
          expectedKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          modelAnswer: { type: Type.STRING },
          examinerTip: { type: Type.STRING },
        },
        required: ['id', 'category', 'marks', 'question', 'expectedKeywords', 'modelAnswer', 'examinerTip'],
      },
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          front: { type: Type.STRING },
          back: { type: Type.STRING },
          topic: { type: Type.STRING },
          weightage: {
            type: Type.STRING,
            description: "Must be 'crucial', 'high', or 'medium'",
          },
        },
        required: ['id', 'front', 'back', 'topic', 'weightage'],
      },
    },
  },
  required: ['meta', 'studySummary', 'diagrams', 'examConcepts', 'examQuestions', 'flashcards'],
};

// API: Analyze PDF or Text
app.post('/api/analyze', async (req, res) => {
  try {
    const { pdfBase64, text, fileName, examLevel } = req.body;

    if (!pdfBase64 && !text) {
      return res.status(400).json({ error: 'Please provide either a PDF file or text content to analyze.' });
    }

    const systemInstruction = `You are a world-class academic professor, visual educator, and exam strategist.
Your task is to analyze the provided educational material (PDF or text) and generate an exhaustive, high-yield study package designed to help students score top marks and retain information via visual diagrams and spaced repetition.

Specific requirements:
1. SUMMARY: Provide a clear, intuitive executive overview, key takeaways, and core principles.
2. FLOWCHARTS & DIAGRAMS:
   - Provide 2 to 4 distinct visual diagrams that visually map out key concepts, workflows, relationships, and architectures.
   - For diagrams, write 100% valid, beautiful Mermaid syntax (use flowchart TD or flowchart LR for processes, sequenceDiagram for protocols/interactions, or mindmap for conceptual hierarchies).
   - Ensure Mermaid labels do NOT contain unescaped parentheses, brackets, or semicolons that cause parse errors. Wrap text in quotes or use simple alphanumeric characters.
   - For each diagram, identify 2-3 key nodes with an in-depth explanation and its specific exam significance.
3. EXAM CONCEPTS:
   - Identify 3 to 6 high-yield concepts.
   - Assign exam weightage ('crucial' for top tested, 'high', or 'medium') and realistic weightage percentage.
   - Detail the exact core definition required for full marks in exams.
   - Detail key formulas, laws, or rules.
   - Detail common exam traps where students lose marks.
   - Provide a clever mnemonic or memory aid.
4. EXAM QUESTIONS:
   - Generate realistic exam questions categorized into:
     * '2-Mark Conceptual' (short, precise definition/reasoning)
     * '5-Mark Analytical' (step-by-step breakdown or comparative analysis)
     * '10-Mark Deep Dive' (comprehensive multi-part or scenario problem)
   - Include exact expected keywords examiners check in rubrics.
   - Provide a comprehensive, structured model answer.
   - Include an 'examinerTip' highlighting common pitfalls or score boosters.
5. SPACED REPETITION FLASHCARDS:
   - Generate 6 to 12 flashcards directly prioritizing high-weightage topics and critical formulas/definitions.
   - Front: crisp, challenging prompt or question.
   - Back: clear, memorable, structured answer.
   - Explicitly tag each with its weightage ('crucial', 'high', 'medium').

Target Exam Level: ${examLevel || 'University / Competitive Examination'}`;

    const parts: any[] = [];

    if (pdfBase64) {
      // Clean base64 header if present (e.g. data:application/pdf;base64,...)
      const cleanedBase64 = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanedBase64,
        },
      });
      parts.push({
        text: `Analyze this complete PDF document (${fileName || 'uploaded document'}) and generate the study package with diagrams, exam concepts, questions, and flashcards.`,
      });
    } else {
      parts.push({
        text: `Analyze the following academic study text and generate the study package with diagrams, exam concepts, questions, and flashcards:\n\n${text}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: studyMaterialSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini model returned an empty response.');
    }

    const parsedData = JSON.parse(responseText);

    // Enhance flashcards with initial Leitner box state
    const nowIso = new Date().toISOString();
    const flashcardsWithLeitner = (parsedData.flashcards || []).map((fc: any, index: number) => ({
      ...fc,
      id: fc.id || `fc-${Date.now()}-${index}`,
      leitnerBox: 1,
      intervalDays: 1,
      nextReviewDate: nowIso,
      reviewCount: 0,
    }));

    const completeStudyMaterial = {
      id: `study-${Date.now()}`,
      meta: {
        ...parsedData.meta,
        sourceFileName: fileName || 'Uploaded Material',
        targetExamLevel: examLevel || parsedData.meta.targetExamLevel || 'University Examination',
        generatedAt: nowIso,
      },
      studySummary: parsedData.studySummary,
      diagrams: parsedData.diagrams || [],
      examConcepts: parsedData.examConcepts || [],
      examQuestions: parsedData.examQuestions || [],
      flashcards: flashcardsWithLeitner,
    };

    res.json(completeStudyMaterial);
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze document. Please verify your document and try again.',
    });
  }
});

// API: Student Doubt / Concept Q&A
app.post('/api/ask-doubt', async (req, res) => {
  try {
    const { question, contextTopic, documentTitle } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an encouraging, expert academic tutor.
Document Context: ${documentTitle || 'Academic Material'}
Topic Focus: ${contextTopic || 'General Concept'}

Student's Question/Doubt:
"${question}"

Provide a crisp, crystal-clear explanation that:
1. Directly clarifies the doubt in simple everyday intuition.
2. Gives a concrete real-world analogy or technical example.
3. Concludes with an "Exam Tip" on how to phrase this if it appears in a test.`,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error answering doubt:', error);
    res.status(500).json({ error: error.message || 'Failed to process question.' });
  }
});

// API: Evaluate Student's Practice Answer against marking rubrics
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { question, modelAnswer, expectedKeywords, userAnswer, maxMarks } = req.body;

    if (!userAnswer || !question) {
      return res.status(400).json({ error: 'User answer and question are required.' });
    }

    const prompt = `You are a strict yet constructive exam examiner grading a student's answer.
Exam Question: ${question}
Maximum Marks: ${maxMarks || 5}
Expected Marking Keywords: ${(expectedKeywords || []).join(', ')}
Standard Model Answer: ${modelAnswer}

Student's Submitted Answer:
"${userAnswer}"

Grade the student's answer objectively. Return JSON with:
{
  "score": number (between 0 and maxMarks, e.g. 4.5),
  "maxScore": number,
  "feedback": "2-3 sentences of constructive examiner feedback",
  "missingKeywords": ["any essential technical terms missing from student answer"],
  "strengths": ["points student answered accurately"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate answer.' });
  }
});

// Full-stack Vite integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ExamFlow server running on http://0.0.0.0:${PORT}`);
});
