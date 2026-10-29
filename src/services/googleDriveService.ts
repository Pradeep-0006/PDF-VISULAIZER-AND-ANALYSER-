import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudyMaterial } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Google Drive Scopes
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token management
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

/**
 * List files from user's Google Drive matching PDF, Google Docs, or text files
 */
export const listDriveFiles = async (
  searchQuery?: string,
  filter: 'all' | 'pdf' | 'doc' = 'all'
): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in.');
  }

  const mimeFilters: string[] = [];
  if (filter === 'pdf') {
    mimeFilters.push("mimeType = 'application/pdf'");
  } else if (filter === 'doc') {
    mimeFilters.push("mimeType = 'application/vnd.google-apps.document'");
  } else {
    mimeFilters.push(
      "mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain'"
    );
  }

  let query = `trashed = false and (${mimeFilters.join(' or ')})`;
  if (searchQuery && searchQuery.trim()) {
    const cleanSearch = searchQuery.trim().replace(/['\\]/g, '');
    query += ` and name contains '${cleanSearch}'`;
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', query);
  url.searchParams.set('fields', 'files(id, name, mimeType, size, modifiedTime, iconLink, webViewLink, thumbnailLink)');
  url.searchParams.set('orderBy', 'modifiedTime desc');
  url.searchParams.set('pageSize', '35');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch Drive files (${response.status})`);
  }

  const data = await response.json();
  return (data.files || []) as DriveFile[];
};

/**
 * Download a file from Google Drive and convert to base64 DataURL or text
 */
export const downloadDriveFile = async (
  file: DriveFile
): Promise<{ pdfBase64?: string; text?: string; fileName: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in.');
  }

  if (file.mimeType === 'application/pdf') {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF from Drive (${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = bufferToBase64(buffer);
    return {
      pdfBase64: `data:application/pdf;base64,${base64}`,
      fileName: file.name,
    };
  } else if (file.mimeType === 'application/vnd.google-apps.document') {
    // Export Google Doc as PDF
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=application/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to export Google Doc to PDF (${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = bufferToBase64(buffer);
    return {
      pdfBase64: `data:application/pdf;base64,${base64}`,
      fileName: `${file.name}.pdf`,
    };
  } else {
    // Text file
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download text file from Drive (${response.status})`);
    }

    const text = await response.text();
    return {
      text,
      fileName: file.name,
    };
  }
};

/**
 * Export Study Material to Google Drive as an organized study guide file
 */
export const exportStudyGuideToDrive = async (
  material: StudyMaterial
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in.');
  }

  // Generate structured study content in Markdown format
  const content = `# ExamFlow Study Package: ${material.meta.title}
**Subject:** ${material.meta.subject}
**Target Exam Level:** ${material.meta.targetExamLevel}
**Estimated Study Time:** ${material.meta.estimatedStudyTime}
**Generated Date:** ${new Date().toLocaleDateString()}

---

## 1. Executive Study Summary
${material.studySummary.executiveOverview}

### Key Takeaways
${material.studySummary.keyTakeaways.map((k) => `- ${k}`).join('\n')}

### Core Principles
${material.studySummary.corePrinciples
  .map((p) => `#### ${p.title} (${p.importance})\n${p.description}`)
  .join('\n\n')}

---

## 2. Visual Flowcharts & Concept Diagrams
${material.diagrams
  .map(
    (d, i) => `### Diagram ${i + 1}: ${d.title} (${d.type})
${d.description}

\`\`\`mermaid
${d.mermaidCode}
\`\`\`

**Key Diagram Nodes:**
${d.keyNodesExplaining.map((n) => `- **${n.node}:** ${n.explanation} *(Exam Note: ${n.examSignificance})*`).join('\n')}
`
  )
  .join('\n\n')}

---

## 3. High-Weightage Exam Concepts & Traps
${material.examConcepts
  .map(
    (c) => `### ${c.concept} [Weightage: ${c.weightage.toUpperCase()} - ~${c.weightagePercentage}% Marks]
- **Definition:** ${c.coreDefinition}
- **Why High Weightage:** ${c.whyHighWeightage}
- **Rules/Formulas:** ${c.keyFormulasOrRules.join(', ')}
- **Common Exam Traps:** ${c.examTraps.map((t) => `\n  * ⚠️ ${t}`).join('')}
- **Mnemonic / Memory Aid:** 💡 ${c.mnemonic}
`
  )
  .join('\n\n')}

---

## 4. Exam Questions & Model Rubrics
${material.examQuestions
  .map(
    (q, i) => `### Question ${i + 1} [${q.category} - ${q.marks} Marks]
**Prompt:** ${q.question}

**Examiner Tip:** ${q.examinerTip}

**Key Rubric Keywords:** ${q.expectedKeywords.join(', ')}

**Model Answer:**
${q.modelAnswer}
`
  )
  .join('\n\n')}

---

## 5. Spaced Repetition Flashcards Deck (${material.flashcards.length} Cards)
${material.flashcards
  .map(
    (fc, i) => `### Card ${i + 1} [${fc.weightage.toUpperCase()} Priority - ${fc.topic}]
- **Front (Prompt):** ${fc.front}
- **Back (Answer):** ${fc.back}
`
  )
  .join('\n\n')}
`;

  const fileName = `ExamFlow Study Guide - ${material.meta.title.replace(/[^\w\s-]/gi, '')}.md`;

  const metadata = {
    name: fileName,
    mimeType: 'text/markdown',
    description: `Exam study guide and diagrams generated by ExamFlow for ${material.meta.title}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/markdown\r\n\r\n' +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create file in Google Drive (${response.status})`);
  }

  return await response.json();
};

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
