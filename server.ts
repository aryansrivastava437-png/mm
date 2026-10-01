import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for AI Study Agent
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  try {
    const { messages, studentContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.',
      });
      return;
    }

    // System instruction tailored specifically for Class 9 students
    const systemInstruction = `You are "StudyOS Mentor", an encouraging, clear, and highly practical personal AI study agent and academic advisor designed specifically for Class 9 students (covering CBSE, ICSE, and standard secondary school syllabi).

Your capabilities:
1. Explain Class 9 concepts clearly (Mathematics, Science [Physics, Chemistry, Biology], Social Science [History, Geography, Civics, Economics], English, Hindi, Computer Applications).
2. Help students plan their study day, prioritize homework, avoid procrastination, and organize Pomodoro focus sessions.
3. When helpful, suggest specific, actionable study tasks with realistic duration estimates (15 to 45 mins).
4. If the student asks for a study plan, give an hour-by-hour or session-by-session breakdown with short 5-minute recharge breaks.
5. If the student asks you to generate or break down tasks, format each actionable task using this structured syntax at the end of your response so the student can click 1-button to add it directly to their mission:
   [TASK_ACTION: {"title": "Task title here", "subject": "Mathematics", "estimatedMinutes": 30, "priority": "high"}]
   (Allowed subjects: Mathematics, Science, English, Social Science, Hindi, Computer)

Tone guidelines:
- Friendly, calm, motivating, and student-focused. Never condescending.
- Keep explanations structured: use bullet points, bold key terms, and step-by-step examples.
- Do not ramble; teenagers appreciate clarity and actionable advice.

Current Student Context:
- Student Name: ${studentContext?.studentName || 'Student'}
- Grade: ${studentContext?.grade || 'Class 9'}
- Today's Completed Tasks: ${studentContext?.tasksCompleted || 0} / ${studentContext?.totalTasks || 0}
- Deep Study Time Logged Today: ${studentContext?.focusMinutes || 0} minutes
- Active Pomodoros Today: ${studentContext?.pomodoros || 0}
- Current Study Streak: ${studentContext?.streak || 0} days
- Today's Pending Tasks: ${JSON.stringify(studentContext?.pendingTasks || [])}
- Backlog Tasks: ${JSON.stringify(studentContext?.backlogTasks || [])}
- Daily Study Goal: ${studentContext?.dailyGoalMinutes || 120} minutes
`;

    // Map conversation history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here to help you study! What would you like to focus on right now?";

    res.json({ reply: replyText });
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error during AI generation';
    res.status(500).json({ error: message });
  }
});

// Quick AI Plan Generator endpoint
app.post('/api/agent/generate-plan', async (req: Request, res: Response) => {
  try {
    const { availableMinutes, studentContext } = req.body;

    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const prompt = `Based on the student's current tasks and ${availableMinutes || 120} minutes of study time available today, generate a tailored, realistic study plan.
Student Tasks: ${JSON.stringify(studentContext?.pendingTasks || [])}
Backlog Tasks: ${JSON.stringify(studentContext?.backlogTasks || [])}
Subjects: Mathematics, Science, English, Social Science, Hindi, Computer.

Return an encouraging 2-3 sentence recommendation followed by 2 to 4 actionable tasks the student should add to their mission today using:
[TASK_ACTION: {"title": "Title", "subject": "Subject", "estimatedMinutes": 25, "priority": "high"}]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert Class 9 study planner assistant. Create efficient, balanced study schedules.',
        temperature: 0.6,
      },
    });

    res.json({ reply: response.text || '' });
  } catch (error: unknown) {
    console.error('Plan Generation Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate plan';
    res.status(500).json({ error: message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!apiKey });
});

// Dev vs Production server handler
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`StudyOS Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
