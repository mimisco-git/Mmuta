import { useState } from "react";
import { Shield, Zap, BarChart2, CheckCircle, ChevronRight, Menu, X } from "lucide-react";

interface LandingPageProps {
  onGetStarted?: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    if (onGetStarted) { onGetStarted(); return; }
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] text-slate-800 dark:text-slate-100 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0f1e]/90 border-b border-slate-100 dark:border-white/[0.06] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Mmuta" className="h-8 w-8 rounded-[10px]" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            <span className="text-[17px] font-black tracking-tight text-slate-900 dark:text-white">Mmuta</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-[13.5px] font-medium text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-[13.5px] font-semibold text-[#1a7fe8] hover:text-[#1568cc] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleLogin}
              className="px-5 py-2 text-[13.5px] font-semibold rounded-[10px] text-white transition-all cursor-pointer"
              style={{ background: "linear-gradient(135deg, #1a7fe8 0%, #0f5fbf 100%)" }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button className="sm:hidden p-2 cursor-pointer text-slate-500" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#0a0f1e] px-5 py-4 space-y-3">
            {["#features", "#how-it-works", "#pricing"].map(href => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block text-[14px] font-medium text-slate-600 dark:text-slate-300 capitalize">
                {href.replace("#", "").replace(/-/g, " ")}
              </a>
            ))}
            <button onClick={handleLogin} className="w-full mt-2 py-2.5 text-[14px] font-semibold rounded-[10px] text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #1a7fe8 0%, #0f5fbf 100%)" }}>
              Get Started Free
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 dark:from-[#0d1530] dark:via-[#0a0f1e] dark:to-[#0d1530]" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #1a7fe8, transparent)" }} />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 text-[12px] font-semibold text-blue-600 dark:text-blue-400 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Built for Nigerian Schools
          </div>

          <h1 className="text-[40px] sm:text-[56px] font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white mb-5" style={{ textWrap: "balance" } as React.CSSProperties}>
            Teach. Test. Trust.
          </h1>
          <p className="text-[17px] sm:text-[19px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10" style={{ textWrap: "balance" } as React.CSSProperties}>
            One platform for CBT exams, AI grading, and academic results —
            no more paper scripts, no more WhatsApp-sent results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold rounded-[14px] text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: "linear-gradient(135deg, #1a7fe8 0%, #0f5fbf 100%)" }}
            >
              Start Free Trial <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold rounded-[14px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-[12px] text-slate-400 dark:text-slate-500">
            {["Multi-school support", "AI-powered grading", "Secure exam proctoring", "Real-time results"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product Pillars */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-[#0d1224]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <h2 className="text-[30px] sm:text-[36px] font-black text-slate-900 dark:text-white tracking-tight mb-3">Everything your school needs</h2>
            <p className="text-[15.5px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto">From creating questions to delivering instant AI-graded results — all under one roof.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                color: "#1a7fe8",
                bg: "bg-blue-50 dark:bg-blue-900/20",
                title: "Mmuta Exams",
                desc: "Conduct fully digital CBT exams and written tests. Built-in proctoring detects tab switching and flags violations automatically.",
                bullets: ["Multiple-choice & written exams", "Anti-cheat proctoring", "Scheduled availability windows", "Exam PIN system for walk-ins"],
              },
              {
                icon: Zap,
                color: "#8b5cf6",
                bg: "bg-violet-50 dark:bg-violet-900/20",
                title: "Mmuta Grade",
                desc: "AI reads and marks essay-style exams against your answer key. No more days of manual marking — get results in minutes.",
                bullets: ["AI grades written answers", "Custom marks allocation", "Detailed per-question feedback", "Bulk grading with progress tracker"],
              },
              {
                icon: BarChart2,
                color: "#10b981",
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                title: "Mmuta Results",
                desc: "Students and school admins see results instantly. Share quiz leaderboards, download transcripts, and track performance trends.",
                bullets: ["Instant score display", "Leaderboard per quiz", "Historical grade reports", "School-wide analytics"],
              },
            ].map(({ icon: Icon, color, bg, title, desc, bullets }) => (
              <div key={title} className="bg-white dark:bg-[#111827] rounded-[20px] border border-slate-100 dark:border-white/[0.06] p-6 space-y-4">
                <div className={`w-11 h-11 rounded-[12px] ${bg} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" style={{ color }} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
                  <p className="text-[13.5px] text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
                <ul className="space-y-2">
                  {bullets.map(b => (
                    <li key={b} className="flex items-start gap-2 text-[13px] text-slate-600 dark:text-slate-300">
                      <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <h2 className="text-[30px] sm:text-[36px] font-black text-slate-900 dark:text-white tracking-tight mb-3">Up and running in minutes</h2>
            <p className="text-[15.5px] text-slate-500 dark:text-slate-400 max-w-lg mx-auto">No IT team needed. A school admin can set up Mmuta and conduct the first exam the same day.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 relative">
            {[
              { step: "1", title: "Register school", desc: "Super admin creates your school profile and issues your unique school code." },
              { step: "2", title: "Add students & lecturers", desc: "Bulk-import students via CSV or add individually. Lecturers self-register with your school code." },
              { step: "3", title: "Create & publish exams", desc: "Upload a question paper (PDF or typed), set a time window, and publish to specific courses." },
              { step: "4", title: "Get instant results", desc: "AI grades written submissions. MCQ exams are marked automatically. Results appear in seconds." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-black text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1a7fe8, #0f5fbf)" }}>
                    {step}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">{title}</h4>
                    <p className="text-[13.5px] text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-50 dark:bg-[#0d1224]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <h2 className="text-[30px] sm:text-[36px] font-black text-slate-900 dark:text-white tracking-tight mb-3">Simple, credit-based pricing</h2>
            <p className="text-[15.5px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Buy exam credits and use them as you go. No monthly subscriptions, no per-seat fees.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                price: "₦120,000",
                period: "/ term",
                credits: "500 exam credits",
                description: "For small schools with up to 200 students.",
                features: ["500 quiz/exam attempts", "All exam types", "AI grading included", "Email support"],
                highlight: false,
              },
              {
                name: "School",
                price: "₦350,000",
                period: "/ term",
                credits: "2,000 exam credits",
                description: "For schools with up to 1,000 students.",
                features: ["2,000 quiz/exam attempts", "All exam types", "AI grading included", "Priority support", "Analytics dashboard"],
                highlight: true,
              },
              {
                name: "Institution",
                price: "Custom",
                period: "",
                credits: "Unlimited credits",
                description: "For universities and large institutions.",
                features: ["Unlimited attempts", "All exam types", "Dedicated account manager", "Custom integrations", "SLA guarantee"],
                highlight: false,
              },
            ].map(({ name, price, period, credits, description, features, highlight }) => (
              <div key={name} className={`rounded-[20px] border p-6 space-y-5 relative ${
                highlight
                  ? "bg-[#1a7fe8] border-[#1a7fe8] text-white"
                  : "bg-white dark:bg-[#111827] border-slate-100 dark:border-white/[0.06]"
              }`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-[11px] font-black text-amber-900 uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <div>
                  <p className={`text-[12px] font-bold uppercase tracking-widest mb-1 ${highlight ? "text-blue-200" : "text-[#1a7fe8]"}`}>{name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[32px] font-black tracking-tight ${highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>{price}</span>
                    <span className={`text-[13px] font-medium ${highlight ? "text-blue-200" : "text-slate-400"}`}>{period}</span>
                  </div>
                  <p className={`text-[12px] font-semibold mt-0.5 ${highlight ? "text-blue-100" : "text-emerald-600 dark:text-emerald-400"}`}>{credits}</p>
                  <p className={`text-[13px] mt-2 leading-snug ${highlight ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>{description}</p>
                </div>
                <ul className="space-y-2">
                  {features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-[13px] ${highlight ? "text-blue-50" : "text-slate-600 dark:text-slate-300"}`}>
                      <CheckCircle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${highlight ? "text-blue-200" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleLogin}
                  className={`w-full py-3 rounded-[12px] text-[14px] font-bold transition-all cursor-pointer ${
                    highlight
                      ? "bg-white text-[#1a7fe8] hover:bg-blue-50"
                      : "text-white hover:opacity-90"
                  }`}
                  style={highlight ? {} : { background: "linear-gradient(135deg, #1a7fe8 0%, #0f5fbf 100%)" }}
                >
                  {name === "Institution" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-[#0a0f1e]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-[28px] sm:text-[36px] font-black text-slate-900 dark:text-white tracking-tight mb-4" style={{ textWrap: "balance" } as React.CSSProperties}>
            Ready to modernise your school's exams?
          </h2>
          <p className="text-[15.5px] text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Join schools across Nigeria running secure, AI-graded CBT exams on Mmuta.
          </p>
          <button
            onClick={handleLogin}
            className="px-8 py-3.5 text-[15px] font-bold rounded-[14px] text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            style={{ background: "linear-gradient(135deg, #1a7fe8 0%, #0f5fbf 100%)" }}
          >
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-[#0d1224] py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Mmuta" className="h-6 w-6 rounded-[7px]" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            <span className="text-[14px] font-black text-slate-700 dark:text-white">Mmuta</span>
            <span className="text-slate-300 dark:text-white/20 mx-1">·</span>
            <span className="text-[12.5px] text-slate-400">Teach. Test. Trust.</span>
          </div>
          <div className="flex items-center gap-5 text-[12.5px] text-slate-400 dark:text-slate-500">
            <a href="mailto:support@mmuta.ng" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">support@mmuta.ng</a>
            <span>© {new Date().getFullYear()} Mmuta</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
