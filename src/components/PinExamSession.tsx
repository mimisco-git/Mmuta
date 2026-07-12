import React, { useState, useEffect, useRef } from "react";
import { Clock, Send, AlertTriangle, LogOut } from "lucide-react";
import ResultSlip from "./ResultSlip";

interface PinExamSessionProps {
  token: string;
  examId: string;
  label: string;
  onFinish: () => void;
}

type Phase = "loading" | "writing" | "submitted" | "error";

export default function PinExamSession({ token, examId, label, onFinish }: PinExamSessionProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [exam, setExam] = useState<any>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load exam and start session
  useEffect(() => {
    const init = async () => {
      try {
        const r = await fetch(`/api/exams/${examId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) { setError("Could not load exam. Please contact your invigilator."); setPhase("error"); return; }
        const examData = await r.json();
        setExam(examData);
        // Calculate time from availableUntil or a default of 3 hours
        const until = examData.availableUntil ? new Date(examData.availableUntil).getTime() : Date.now() + 3 * 60 * 60 * 1000;
        const secs = Math.max(0, Math.floor((until - Date.now()) / 1000));
        setTimeLeft(secs);
        setPhase("writing");
      } catch {
        setError("Failed to connect to the exam server. Please try again.");
        setPhase("error");
      }
    };
    init();
  }, [examId, token]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "writing" || timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, timeLeft === null]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const answersText = Object.entries(answers)
        .map(([label, ans]) => `${label}:\n${ans}`)
        .join("\n\n");
      const r = await fetch("/api/exam-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ examId, answersText }),
      });
      if (r.ok) {
        const d = await r.json();
        setSubmissionId(d.id || null);
        // Fetch result slip if we have a submission id
        if (d.id) {
          const rr = await fetch(`/api/results/exam/${d.id}`, { headers: { Authorization: `Bearer ${token}` } });
          if (rr.ok) setResultData(await rr.json());
        }
        setPhase("submitted");
      } else {
        const d = await r.json();
        setError(d.error || "Submission failed. Please contact your invigilator.");
        setPhase("error");
      }
    } catch {
      setError("Network error during submission. Please contact your invigilator immediately.");
      setPhase("error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  // Parse questions from exam
  const getQuestions = () => {
    if (!exam) return [];
    try {
      if (exam.questionsStructureJson) {
        const parsed = JSON.parse(exam.questionsStructureJson);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    // Fallback: split questionsText by numbered lines
    if (exam.questionsText) {
      return exam.questionsText
        .split(/\n(?=\d+[\.\)])/gm)
        .filter(Boolean)
        .map((q: string, i: number) => ({ label: `Q${i + 1}`, text: q.trim() }));
    }
    return [];
  };

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading exam…</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/40 rounded-2xl p-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-white text-lg font-bold">Exam Error</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <button onClick={onFinish} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition mx-auto cursor-pointer">
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitted") {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <Send className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-white text-xl font-bold">Exam Submitted</h2>
            <p className="text-slate-400 text-sm">Your answers have been recorded. Thank you, {label}.</p>
          </div>
          {resultData ? (
            <ResultSlip type="exam" data={resultData} />
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center text-slate-400 text-sm">
              Your submission has been recorded. Results will be available after grading.
            </div>
          )}
          <div className="text-center pt-2">
            <button onClick={onFinish} className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition mx-auto cursor-pointer">
              <LogOut className="h-4 w-4" /> Exit Exam Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = getQuestions();
  const urgentTime = timeLeft !== null && timeLeft < 300; // < 5 min

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Exam</p>
          <h1 className="text-white text-[14px] font-semibold truncate">{exam?.title || "Examination"}</h1>
          <p className="text-slate-500 text-[11px] truncate">{label}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-mono font-bold ${
              urgentTime
                ? "bg-red-950/30 border-red-800/40 text-red-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-white"
            }`}>
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </header>

      {/* Questions */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full space-y-6">
        {questions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Exam Questions</p>
            <pre className="text-slate-300 text-[13px] leading-relaxed whitespace-pre-wrap">{exam?.questionsText || "No questions available."}</pre>
            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Your Answers</label>
              <textarea
                rows={12}
                value={answers["all"] || ""}
                onChange={e => setAnswers({ all: e.target.value })}
                placeholder="Type your answers here…"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-[13px] placeholder-slate-600 resize-y outline-none focus:border-emerald-500/50 transition"
              />
            </div>
          </div>
        ) : (
          questions.map((q: any, idx: number) => {
            const qLabel = q.label || `Q${idx + 1}`;
            const qText = q.text || "";
            const subQs: any[] = q.subqs || q.subQuestions || [];
            return (
              <div key={qLabel} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1">{qLabel}</p>
                  <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap">{qText}</p>
                </div>
                {subQs.length > 0 ? (
                  subQs.map((sq: any, si: number) => {
                    const sqLabel = sq.label || `${qLabel}(${String.fromCharCode(97 + si)})`;
                    return (
                      <div key={sqLabel} className="px-5 py-4 border-b border-slate-800/50 last:border-0">
                        <p className="text-slate-400 text-[12px] mb-1.5">{sqLabel}: <span className="text-slate-300">{sq.text || ""}</span></p>
                        <textarea
                          rows={3}
                          value={answers[sqLabel] || ""}
                          onChange={e => setAnswers(prev => ({ ...prev, [sqLabel]: e.target.value }))}
                          placeholder="Your answer…"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-[13px] placeholder-slate-600 resize-y outline-none focus:border-emerald-500/50 transition"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-4">
                    <textarea
                      rows={4}
                      value={answers[qLabel] || ""}
                      onChange={e => setAnswers(prev => ({ ...prev, [qLabel]: e.target.value }))}
                      placeholder="Your answer…"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-[13px] placeholder-slate-600 resize-y outline-none focus:border-emerald-500/50 transition"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>

      {/* Submit bar */}
      <footer className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-between">
        <p className="text-[11px] text-slate-500">
          {Object.values(answers).filter(Boolean).length} / {Math.max(questions.length, 1)} answered
        </p>
        <button
          onClick={() => { if (confirm("Are you sure you want to submit? You cannot make changes after submitting.")) handleSubmit(); }}
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[13px] rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {submitting ? (
            <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
          ) : (
            <><Send className="h-3.5 w-3.5" /> Submit Exam</>
          )}
        </button>
      </footer>
    </div>
  );
}
