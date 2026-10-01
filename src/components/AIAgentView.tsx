import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Plus,
  Check,
  Calendar,
  BookOpen,
  HelpCircle,
  Flame,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { SubjectId, Priority } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ParsedTaskAction {
  title: string;
  subject: string;
  estimatedMinutes?: number;
  priority?: Priority;
}

export const AIAgentView: React.FC = () => {
  const {
    todayTasks,
    backlogTasks,
    subjects,
    todayStats,
    streak,
    settings,
    addTask,
    setActiveTab,
  } = useStudy();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${settings.studentName || 'there'}! 👋 I'm your **StudyOS Personal AI Agent**.

I'm here to help you conquer your Class 9 studies:
* **Plan your day**: Give me your available study hours and I'll build an optimal schedule.
* **Explain tough concepts**: Ask about Newton's laws, coordinate geometry, French revolution, tissues, or grammar rules.
* **Break down chapters**: I can break complex homework into 20-30 minute actionable Pomodoro missions.
* **Test your understanding**: Ask me to quiz you on any chapter.

What would you like to work on right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Student context builder to send to the server
  const getStudentContext = () => {
    return {
      studentName: settings.studentName,
      grade: settings.grade,
      tasksCompleted: todayStats.tasksCompleted,
      totalTasks: todayStats.totalTasks,
      focusMinutes: todayStats.focusMinutes,
      pomodoros: todayStats.pomodoros,
      streak: streak.currentStreak,
      dailyGoalMinutes: settings.dailyGoalMinutes,
      pendingTasks: todayTasks
        .filter((t) => !t.completed)
        .map((t) => ({
          title: t.title,
          subject: subjects.find((s) => s.id === t.subjectId)?.name,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes,
        })),
      backlogTasks: backlogTasks.slice(0, 5).map((t) => ({
        title: t.title,
        subject: subjects.find((s) => s.id === t.subjectId)?.name,
      })),
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          studentContext: getStudentContext(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm ready to help with your study plan. What shall we tackle next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error('AI chat failed:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I ran into an issue connecting to the study server. Please ensure the Gemini API key is configured in the AI Studio Secrets panel. Error: ${
          err instanceof Error ? err.message : 'Connection failed'
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to add task action suggested by AI directly into student's mission
  const handleAddSuggestedTask = (action: ParsedTaskAction, key: string) => {
    // Find matching subject
    const matchedSubject = subjects.find(
      (s) => s.name.toLowerCase() === action.subject?.toLowerCase()
    );

    addTask({
      title: action.title,
      subjectId: (matchedSubject?.id as SubjectId) || subjects[0]?.id || 'math',
      priority: action.priority || 'medium',
      estimatedMinutes: action.estimatedMinutes || 25,
      isBacklog: false,
    });

    setAddedTasks((prev) => ({ ...prev, [key]: true }));
  };

  // Helper to parse message content and render task buttons
  const renderMessageContent = (content: string, messageId: string) => {
    // Check for [TASK_ACTION: {...}]
    const actionRegex = /\[TASK_ACTION:\s*({.*?})\]/g;
    const actions: Array<{ raw: string; data: ParsedTaskAction }> = [];

    let match;
    while ((match = actionRegex.exec(content)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        actions.push({ raw: match[0], data: parsed });
      } catch {
        // Ignore json parse error
      }
    }

    // Strip task actions from clean body text
    const cleanText = content.replace(actionRegex, '').trim();

    return (
      <div className="space-y-3">
        {/* Render text with basic markdown formatting */}
        <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {cleanText.split('\n').map((line, i) => {
            // Header
            if (line.startsWith('### ')) {
              return (
                <h4 key={i} className="font-bold text-sm sm:text-base mt-2 mb-1 text-neutral-900 dark:text-white">
                  {line.replace('### ', '')}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={i} className="font-bold text-base mt-3 mb-1 text-neutral-900 dark:text-white">
                  {line.replace('## ', '')}
                </h3>
              );
            }
            // Bullets
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
              return (
                <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{renderBold(line.trim().substring(2))}</span>
                </div>
              );
            }
            // Numbered list
            if (/^\d+\.\s/.test(line.trim())) {
              return (
                <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
                  <span className="text-neutral-400 font-mono text-xs">{line.trim().split(' ')[0]}</span>
                  <span>{renderBold(line.trim().replace(/^\d+\.\s/, ''))}</span>
                </div>
              );
            }
            return (
              <p key={i} className="my-1">
                {renderBold(line)}
              </p>
            );
          })}
        </div>

        {/* Suggested Task Action Cards */}
        {actions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Suggested Missions to Add
            </span>

            <div className="space-y-1.5">
              {actions.map((act, idx) => {
                const actionKey = `${messageId}-${idx}`;
                const isAdded = !!addedTasks[actionKey];

                return (
                  <div
                    key={actionKey}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {act.data.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span>{act.data.subject}</span>
                        <span>·</span>
                        <span>{act.data.estimatedMinutes || 25} min</span>
                        {act.data.priority && (
                          <>
                            <span>·</span>
                            <span className="capitalize">{act.data.priority} Priority</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddSuggestedTask(act.data, actionKey)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                        isAdded
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Mission</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper for bold formatting
  const renderBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-neutral-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const quickPrompts = [
    { label: '📅 Plan my study day', query: 'Help me plan my study schedule for today based on my pending tasks and goals.' },
    { label: '💡 Explain Physics Motion formulas', query: 'Explain the 3 equations of motion in Class 9 Physics simply with real-world examples.' },
    { label: '📝 Break down Chemistry Chapter 2', query: 'Break down Class 9 Chemistry "Is Matter Around Us Pure" into 3 bite-sized study tasks with time estimates.' },
    { label: '🎯 How to prioritize my tasks?', query: 'Look at my current tasks and advise me which one I should tackle first and why.' },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-130px)] min-h-[550px] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs overflow-hidden">
      {/* Agent Top Header */}
      <div className="px-5 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                StudyOS Personal AI Mentor
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Context
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Personalized guidance for Class 9 syllabus & schedules
            </p>
          </div>
        </div>

        {/* Live context badge */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="tabular-nums">
            Tasks: <strong className="text-neutral-900 dark:text-white">{todayStats.tasksCompleted}/{todayStats.totalTasks}</strong>
          </span>
          <span>·</span>
          <span className="tabular-nums">
            Focus: <strong className="text-indigo-600 dark:text-indigo-400">{todayStats.focusMinutes}m</strong>
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-neutral-800 dark:bg-neutral-700 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-2xs rounded-tr-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 rounded-tl-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                ) : (
                  renderMessageContent(message.content, message.id)
                )}

                <span
                  className={`block text-[10px] mt-1.5 text-right tabular-nums ${
                    isUser ? 'text-indigo-200' : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {message.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-neutral-500 ml-1">Analyzing syllabus & schedule...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.query)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl whitespace-nowrap hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors shadow-2xs shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200/90 dark:border-neutral-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for study help, concept explanations, or study plans..."
          className="flex-1 px-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80 rounded-2xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 sm:px-4 sm:py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask Agent</span>
        </button>
      </form>
    </div>
  );
};
