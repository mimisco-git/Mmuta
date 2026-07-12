import React from "react";
import { Printer, X } from "lucide-react";

export interface ResultSlipProps {
  type: "exam" | "quiz";
  data: any;
  onClose?: () => void;
  onPrint?: () => void;
}

export default function ResultSlip({ type, data, onClose, onPrint }: ResultSlipProps) {
  const handlePrint = () => {
    if (onPrint) { onPrint(); } else { window.print(); }
  };

  if (!data) return null;

  const isExam = type === "exam";

  // Normalise fields for both exam and quiz
  const school = data.school || {};
  const student = data.student || {};
  const score = data.score ?? null;
  const totalMarks = data.totalMarks ?? null;
  const feedback = data.feedback ?? null;
  const submittedAt = isExam
    ? (data.submission?.submittedAt ?? data.submittedAt ?? null)
    : (data.submittedAt ?? data.attempt?.submittedAt ?? null);
  const title = isExam ? (data.exam?.title ?? "Exam") : (data.quiz?.title ?? "Quiz");
  const courseCode = isExam
    ? (data.course?.code ?? data.exam?.course?.code ?? "")
    : (data.quiz?.course?.code ?? "");
  const durationMinutes = isExam ? null : (data.quiz?.durationMinutes ?? null);

  const percentage = (() => {
    if (score === null) return null;
    if (totalMarks) return (score / totalMarks) * 100;
    return score as number;
  })();

  const passThreshold = 50;
  const isPassing = percentage !== null ? percentage >= passThreshold : null;

  const fmt = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("en-NG", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return d; }
  };

  return (
    <>
      {/* Print-specific CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .result-slip-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      <div className="result-slip-card max-w-[680px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[16px] overflow-hidden shadow-xl print:shadow-none print:rounded-none print:border-slate-300 print:bg-white">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between print:bg-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Institution</p>
            <p className="text-[16px] font-bold text-slate-800 dark:text-white">{school.name || "—"}</p>
            {school.code && <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{school.code}</p>}
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">Powered by</p>
            <p className="text-[13px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight">Mmuta</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-600">mmuta.ng</p>
          </div>
        </div>

        {/* Title rule */}
        <div className="bg-slate-800 dark:bg-slate-950 py-2.5 text-center print:bg-slate-800">
          <p className="text-white text-[11px] font-bold uppercase tracking-[0.25em]">Result Slip</p>
        </div>

        {/* Candidate details */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
          {[
            { label: "Candidate", value: student.fullName || "—" },
            { label: "Reg. Number", value: student.regNumber || "—" },
            { label: isExam ? "Examination" : "Quiz", value: title },
            { label: "Course", value: courseCode || "—" },
            { label: "Submitted", value: fmt(submittedAt) },
            ...(durationMinutes ? [{ label: "Duration", value: `${durationMinutes} min` }] : []),
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Score section */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-6 py-5 text-center print:bg-white">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Score</p>
          {score !== null ? (
            <>
              <p className="text-[40px] font-black text-slate-800 dark:text-white leading-none mb-1">
                {totalMarks ? `${score} / ${totalMarks}` : `${typeof score === "number" ? score.toFixed(1) : score}%`}
              </p>
              {percentage !== null && (
                <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">{percentage.toFixed(1)}%</p>
              )}
              {isPassing !== null && (
                <span className={`inline-flex items-center mt-3 px-5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide border ${
                  isPassing
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40"
                }`}>
                  {isPassing ? "PASS" : "FAIL"}
                </span>
              )}
            </>
          ) : (
            <p className="text-[16px] font-semibold text-slate-400 dark:text-slate-500 italic">Pending grading</p>
          )}
        </div>

        {/* AI Feedback */}
        {feedback && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 print:border-slate-300">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">AI Feedback</p>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{feedback}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-600">This result was generated by Mmuta · mmuta.ng</p>
          <p className="text-[9.5px] text-slate-300 dark:text-slate-700 mt-0.5">Not an official transcript — for reference only</p>
        </div>

        {/* Actions */}
        <div className="no-print border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
          {onClose && (
            <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition rounded-[8px] hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer">
              <X className="h-3.5 w-3.5" /> Close
            </button>
          )}
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[12px] rounded-[10px] transition shadow-sm cursor-pointer ml-auto">
            <Printer className="h-3.5 w-3.5" /> Print Result
          </button>
        </div>
      </div>
    </>
  );
}
