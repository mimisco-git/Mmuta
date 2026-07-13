import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import Lenis from "@studio-freight/lenis";
import {
  Shield, Zap, BarChart2, CheckCircle, ArrowRight,
  Menu, X, BookOpen, Users, Award, ChevronDown,
  WifiOff, Battery, RotateCcw, MessageCircle,
} from "lucide-react";
import * as THREE from "three";

interface LandingPageProps {
  onGetStarted?: () => void;
}

const WHATSAPP_NUMBER = "2348000000000"; // replace with real number before launch

// ── 3D floating orb ──────────────────────────────────────────────────────────
function FloatingOrb() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.12;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.18;
    meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.12;
  });
  return (
    <Sphere ref={meshRef} args={[1, 80, 80]}>
      <MeshDistortMaterial
        color="#1a7fe8"
        attach="material"
        distort={0.38}
        speed={2.2}
        roughness={0}
        metalness={0.1}
        opacity={0.88}
        transparent
      />
    </Sphere>
  );
}

// ── Scroll-in wrapper ─────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stat counter ──────────────────────────────────────────────────────────────
function StatNumber({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    let start = 0;
    const step = to / 60;
    const tick = () => {
      start = Math.min(start + step, to);
      if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString() + suffix;
      if (start < to) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const login = () => {
    if (onGetStarted) { onGetStarted(); return; }
    window.location.href = "/login";
  };

  const bookDemo = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { href: "#platform", label: "Platform" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#schools", label: "Pricing" },
  ];

  return (
    <div className="bg-[#03060d] text-white min-h-screen overflow-x-hidden font-sans">

      {/* ── Floating WhatsApp button ── */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20Mmuta%20for%20my%20school.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl cursor-pointer transition-all hover:scale-105 active:scale-[0.97]"
        style={{ background: "#25d366", boxShadow: "0 4px 32px rgba(37,211,102,0.35)" }}>
        <MessageCircle className="h-5 w-5 text-white fill-white" />
        <span className="text-[13.5px] font-bold text-white pr-1">Chat on WhatsApp</span>
      </a>

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-[62px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] overflow-hidden bg-[#1a7fe8]/10 border border-[#1a7fe8]/20 flex items-center justify-center">
              <img src="/logo.png" alt="Mmuta" className="w-full h-full object-cover" onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span style="color:#1a7fe8;font-weight:900;font-size:13px">M</span>';
              }} />
            </div>
            <span className="text-[16px] font-black tracking-tight">Mmuta</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <a key={l.href} href={l.href}
                className="text-[13.5px] font-medium text-white/50 hover:text-white transition-colors duration-200">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={login}
              className="px-4 py-2 text-[13px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer">
              Log In
            </button>
            <button onClick={bookDemo}
              className="px-5 py-2.5 text-[13px] font-bold rounded-full text-white cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>
              Book a Demo
            </button>
          </div>

          <button className="md:hidden p-2 text-white/60 cursor-pointer" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="absolute inset-0 -z-10 bg-[#03060d]/80 backdrop-blur-xl border-b border-white/[0.04]" />

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full inset-x-0 bg-[#080d1a]/95 backdrop-blur-xl border-b border-white/[0.06] px-5 py-5 space-y-4">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block text-[15px] font-medium text-white/70 hover:text-white">
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={bookDemo}
                className="flex-1 py-3 text-[14px] font-bold rounded-full text-white cursor-pointer"
                style={{ background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>
                Book a Demo
              </button>
              <button onClick={login}
                className="flex-1 py-3 text-[14px] font-semibold rounded-full border border-white/10 text-white/70 cursor-pointer">
                Log In
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }} />

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #1a7fe8 0%, #7c3aed 60%, transparent 100%)" }} />

        {/* 3D Orb */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="absolute right-[5%] top-[12%] w-[280px] h-[280px] sm:w-[480px] sm:h-[480px] opacity-75 hidden sm:block">
          <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} color="#7c3aed" />
            <pointLight position={[-5, -5, -5]} intensity={0.8} color="#1a7fe8" />
            <FloatingOrb />
          </Canvas>
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-24 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[11.5px] font-semibold text-white/50 uppercase tracking-[0.12em] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1a7fe8] animate-pulse" />
            Built for Schools in Nigeria
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.2 }}
            className="text-[48px] sm:text-[68px] lg:text-[84px] font-black leading-[0.95] tracking-[-0.03em] mb-8 max-w-3xl">
            Run your school's exams, grading,{" "}
            <span style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #1a7fe8 0%, #7c3aed 50%, #06b6d4 100%)" }}>
              and results
            </span>{" "}
            in one platform.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="text-[17px] sm:text-[19px] text-white/45 max-w-xl leading-relaxed mb-12">
            Secure CBT exams. AI-graded results. Instant student scores. No paper, no delays, no WhatsApp-forwarded results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4">
            <button onClick={bookDemo}
              className="group flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-bold rounded-full text-white cursor-pointer transition-all hover:brightness-110 active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #1a7fe8 0%, #7c3aed 100%)", boxShadow: "0 0 60px rgba(26,127,232,0.35)" }}>
              Book a Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={login}
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer">
              Log In
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ── School logos ticker ── */}
      <div className="border-y border-white/[0.05] bg-white/[0.015] py-5 overflow-hidden">
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-white/25 mb-4">
          Trusted by schools across Nigeria
        </div>
        <div className="flex gap-12 overflow-hidden whitespace-nowrap">
          <motion.div
            animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 shrink-0 text-[13px] font-semibold text-white/20">
            {["Alvan Ikoku", "FUTO", "UNIZIK", "Madonna Univ.", "Renaissance Univ.", "IMO State Polytechnic", "Federal Poly Nekede", "ESUT", "Alvan Ikoku", "FUTO", "UNIZIK", "Madonna Univ.", "Renaissance Univ.", "Federal Poly Nekede", "ESUT"].map((n, i) => (
              <span key={i}>{n}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.05] rounded-[24px] overflow-hidden border border-white/[0.05]">
          {[
            { to: 12000, suffix: "+", label: "Exams conducted" },
            { to: 40, suffix: "+", label: "Schools onboarded" },
            { to: 98, suffix: "%", label: "Grading accuracy" },
            { to: 4, suffix: " min", label: "Avg. time to results" },
          ].map(({ to, suffix, label }) => (
            <FadeUp key={label} className="bg-[#03060d] p-8 sm:p-10 text-center">
              <div className="text-[40px] sm:text-[52px] font-black tracking-tight mb-1"
                style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.4))" }}>
                <StatNumber to={to} suffix={suffix} />
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">{label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Product proof ── */}
      <section className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <FadeUp className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1a7fe8] mb-4">Product</p>
          <h2 className="text-[36px] sm:text-[52px] font-black tracking-tight leading-[1.05] mb-5">
            See it in action
          </h2>
          <p className="text-[16px] text-white/40 max-w-xl mx-auto leading-relaxed">
            If a proprietor can't see it, it doesn't exist. Here's exactly what students and staff see.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Screen 1: Student taking an exam */}
          <FadeUp delay={0.05} className="lg:col-span-2">
            <div className="rounded-[20px] overflow-hidden border border-white/[0.07]" style={{ background: "#0d1117" }}>
              {/* browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]" style={{ background: "#161b22" }}>
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-[11px] text-white/25 font-mono">Mmuta Exam — MTH 301</span>
              </div>
              {/* exam screen */}
              <div className="p-5 space-y-4">
                {/* header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-white/35 font-semibold uppercase tracking-wider">MTH 301 · Calculus</div>
                    <div className="text-[13px] text-white/60 mt-0.5">Question 7 of 30</div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30" style={{ background: "rgba(245,158,11,0.1)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-300 text-[13px] font-bold font-mono">45:23</span>
                  </div>
                </div>
                {/* progress bar */}
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full w-[23%]" style={{ background: "linear-gradient(90deg, #1a7fe8, #7c3aed)" }} />
                </div>
                {/* question */}
                <div className="rounded-[14px] border border-white/[0.07] p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-[14px] text-white/80 leading-relaxed font-medium">
                    Which of the following is the derivative of <span className="font-mono text-[#1a7fe8]">f(x) = x³ + 2x² - 5x + 3</span>?
                  </p>
                </div>
                {/* options */}
                <div className="space-y-2">
                  {[
                    { letter: "A", text: "3x² + 4x - 5", selected: true },
                    { letter: "B", text: "x² + 4x", selected: false },
                    { letter: "C", text: "3x² - 5", selected: false },
                    { letter: "D", text: "3x + 4x - 5", selected: false },
                  ].map(opt => (
                    <div key={opt.letter}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] border transition-all"
                      style={opt.selected
                        ? { background: "rgba(26,127,232,0.12)", borderColor: "rgba(26,127,232,0.4)", color: "#fff" }
                        : { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }
                      }>
                      <span className="text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={opt.selected
                          ? { background: "rgba(26,127,232,0.35)", color: "#60a5fa" }
                          : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }
                        }>
                        {opt.letter}
                      </span>
                      <span className="text-[13px] font-mono">{opt.text}</span>
                      {opt.selected && <CheckCircle className="h-3.5 w-3.5 text-[#1a7fe8] ml-auto flex-shrink-0" />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold border border-white/[0.08] text-white/40 cursor-default">Previous</button>
                  <button className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold text-white cursor-default"
                    style={{ background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>Next Question</button>
                </div>
              </div>
              <div className="px-5 pb-4 text-center text-[11px] text-white/20">Answers auto-saved every 5 seconds</div>
            </div>
          </FadeUp>

          {/* Screen 2: Instant results */}
          <FadeUp delay={0.12}>
            <div className="rounded-[20px] overflow-hidden border border-white/[0.07]" style={{ background: "#0d1117" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]" style={{ background: "#161b22" }}>
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-[11px] text-white/25 font-mono">Results</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="text-center py-3">
                  <div className="text-[11px] text-white/35 font-semibold uppercase tracking-wider mb-2">MTH 301 · Calculus</div>
                  <div className="text-[64px] font-black leading-none mb-1"
                    style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>
                    84
                  </div>
                  <div className="text-white/40 text-[14px] font-medium mb-3">out of 100</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                    style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }}>
                    <CheckCircle className="h-3.5 w-3.5" /> B+ · Distinction
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "Correct", val: "25/30", color: "#22c55e" }, { label: "Time", val: "38 min", color: "#1a7fe8" }].map(s => (
                    <div key={s.label} className="rounded-[12px] p-3 text-center border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="text-[18px] font-black" style={{ color: s.color }}>{s.val}</div>
                      <div className="text-[10px] text-white/35 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2">Class Leaderboard</div>
                  {[
                    { rank: 1, name: "Ada Okonkwo", score: 96 },
                    { rank: 2, name: "Chidi Eze", score: 91 },
                    { rank: 3, name: "You", score: 84, me: true },
                    { rank: 4, name: "Ngozi Nwosu", score: 79 },
                  ].map(r => (
                    <div key={r.rank} className="flex items-center gap-2.5 px-3 py-2 rounded-[10px]"
                      style={r.me ? { background: "rgba(26,127,232,0.08)", border: "1px solid rgba(26,127,232,0.2)" } : {}}>
                      <span className="text-[11px] font-black text-white/30 w-4">{r.rank}</span>
                      <span className={`flex-1 text-[12.5px] font-semibold ${r.me ? "text-[#60a5fa]" : "text-white/55"}`}>{r.name}</span>
                      <span className={`text-[12.5px] font-bold ${r.me ? "text-[#1a7fe8]" : "text-white/40"}`}>{r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Screen 3: Teacher creating an exam */}
          <FadeUp delay={0.18} className="lg:col-span-3">
            <div className="rounded-[20px] overflow-hidden border border-white/[0.07]" style={{ background: "#0d1117" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]" style={{ background: "#161b22" }}>
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-[11px] text-white/25 font-mono">Staff Dashboard — Exam Management</span>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sidebar */}
                <div className="space-y-1">
                  {[
                    { label: "Dashboard", active: false },
                    { label: "Exams", active: true },
                    { label: "Assignments", active: false },
                    { label: "Students", active: false },
                    { label: "Results", active: false },
                  ].map(item => (
                    <div key={item.label} className="px-3 py-2 rounded-[8px] text-[13px] font-medium cursor-default"
                      style={item.active
                        ? { background: "rgba(26,127,232,0.12)", color: "#60a5fa", borderLeft: "2px solid #1a7fe8" }
                        : { color: "rgba(255,255,255,0.35)" }
                      }>
                      {item.label}
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div className="sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[15px] font-bold text-white/80">MTH 301 · Exams</div>
                    <div className="px-3 py-1.5 rounded-full text-[12px] font-bold text-white cursor-default"
                      style={{ background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>
                      + Create Exam
                    </div>
                  </div>
                  {[
                    { name: "Mid-Semester Exam", date: "15 Mar 2026", students: 142, status: "Completed", score: "Avg: 71%" },
                    { name: "Quiz 3 — Integrals", date: "28 Feb 2026", students: 138, status: "Completed", score: "Avg: 68%" },
                    { name: "Final Exam", date: "20 Apr 2026", students: 142, status: "Upcoming", score: "" },
                  ].map(exam => (
                    <div key={exam.name} className="flex items-center gap-3 p-3 rounded-[12px] border border-white/[0.06]"
                      style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-white/75 truncate">{exam.name}</div>
                        <div className="text-[11px] text-white/30 mt-0.5">{exam.date} · {exam.students} students</div>
                      </div>
                      {exam.score && <span className="text-[11px] font-bold text-[#1a7fe8]">{exam.score}</span>}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
                        style={exam.status === "Completed"
                          ? { background: "rgba(34,197,94,0.12)", color: "#4ade80" }
                          : { background: "rgba(234,179,8,0.12)", color: "#facc15" }
                        }>
                        {exam.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

        </div>
      </section>

      {/* ── Platform features ── */}
      <section id="platform" className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <FadeUp className="text-center mb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1a7fe8] mb-4">Platform</p>
          <h2 className="text-[36px] sm:text-[52px] font-black tracking-tight leading-[1.05] mb-5">
            Every tool your school needs
          </h2>
          <p className="text-[16px] text-white/40 max-w-xl mx-auto leading-relaxed">
            From question upload to AI grading and instant student results. No more paper, no more delays.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Shield,
              accent: "#1a7fe8",
              label: "Mmuta Exams",
              title: "Digital CBT that actually works",
              desc: "Upload question papers, set time windows, and watch students take secure exams from any device. Tab-switch detection flags every violation.",
              pills: ["MCQ + written", "Anti-cheat proctoring", "PIN exam entry", "Scheduled windows"],
              big: false,
            },
            {
              icon: Zap,
              accent: "#7c3aed",
              label: "Mmuta Grade",
              title: "AI reads and marks essays in minutes",
              desc: "Upload your answer key and marking scheme. The AI grades every written response, allocates marks, and writes feedback — no human effort required.",
              pills: ["AI essay grading", "Custom mark schemes", "Bulk grading", "Per-question feedback"],
              big: true,
            },
            {
              icon: BarChart2,
              accent: "#06b6d4",
              label: "Mmuta Results",
              title: "Instant results, zero manual work",
              desc: "Results appear the moment an exam is graded. Students see scores, teachers see leaderboards, school admins see school-wide analytics.",
              pills: ["Instant score display", "Leaderboards", "Grade history", "School analytics"],
              big: false,
            },
          ].map(({ icon: Icon, accent, label, title, desc, pills, big }) => (
            <FadeUp key={label}
              className={`group relative rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 flex flex-col gap-6 overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:from-white/[0.05] ${big ? "lg:row-span-2" : ""}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(600px circle at 50% 0%, ${accent}08, transparent 60%)` }} />
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{label}</span>
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center border border-white/[0.07]"
                  style={{ background: `${accent}15` }}>
                  <Icon className="h-4 w-4" style={{ color: accent }} />
                </div>
              </div>
              <div>
                <h3 className="text-[22px] font-black tracking-tight mb-3 leading-tight">{title}</h3>
                <p className="text-[14px] text-white/40 leading-relaxed">{desc}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {pills.map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold border border-white/[0.07] text-white/40">{p}</span>
                ))}
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Fear-killer: exam resilience ── */}
      <section className="py-24 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 mb-4">Reliability</p>
            <h2 className="text-[36px] sm:text-[52px] font-black tracking-tight leading-[1.05] mb-5">
              What happens on exam day<br />when the network drops?
            </h2>
            <p className="text-[16px] text-white/40 max-w-2xl mx-auto leading-relaxed">
              Every answer is saved automatically, every second. If power goes or internet cuts, students
              resume exactly where they stopped. No lost work. No re-sits. No excuses from students.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: WifiOff,
                color: "#f59e0b",
                title: "Network drops",
                desc: "Answers are saved locally and synced automatically when connection returns.",
              },
              {
                icon: Battery,
                color: "#ef4444",
                title: "Power failure",
                desc: "Student resumes the same exam session on any device, at the same question.",
              },
              {
                icon: RotateCcw,
                color: "#22c55e",
                title: "Accidental refresh",
                desc: "Session is restored instantly. Time clock picks up where it left off.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <FadeUp key={title}>
                <div className="rounded-[20px] border border-white/[0.06] bg-white/[0.02] p-7 text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-5 flex items-center justify-center"
                    style={{ background: `${color}15` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h4 className="text-[16px] font-bold mb-2">{title}</h4>
                  <p className="text-[13.5px] text-white/35 leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed] mb-4">Process</p>
            <h2 className="text-[36px] sm:text-[52px] font-black tracking-tight leading-[1.05]">
              Up and running in one day
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Register your school", desc: "Your school gets a unique code. Staff and students use it to join — no spreadsheets needed." },
              { n: "02", title: "Add staff and students", desc: "Import students via CSV or add individually. Teachers register with your school code in seconds." },
              { n: "03", title: "Create and publish exams", desc: "Upload a PDF question paper or type questions directly. Set a time window and publish to any course." },
              { n: "04", title: "Get results instantly", desc: "AI grades essays the moment students submit. MCQ exams are auto-scored. Results are live within minutes." },
            ].map(({ n, title, desc }, i) => (
              <FadeUp key={n} delay={i * 0.08}>
                <div className="relative pl-5 border-l border-white/[0.06]">
                  <div className="text-[11px] font-black tracking-[0.2em] text-white/20 mb-4">{n}</div>
                  <h4 className="text-[17px] font-bold mb-2 leading-snug">{title}</h4>
                  <p className="text-[13.5px] text-white/35 leading-relaxed">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="schools" className="py-24 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#06b6d4] mb-4">Pricing</p>
            <h2 className="text-[36px] sm:text-[52px] font-black tracking-tight leading-[1.05] mb-5">
              Credit-based. Pay as you go.
            </h2>
            <p className="text-[16px] text-white/40 max-w-xl mx-auto leading-relaxed">
              Buy exam credits. Each student exam attempt costs one credit. No monthly fees, no per-seat subscriptions — pay for what you actually use.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-16">
            {[
              {
                name: "Starter",
                credits: "500",
                price: "120,000",
                students: "Up to 200 students",
                features: ["500 exam attempts", "All exam types", "AI grading", "Email support"],
                highlight: false,
              },
              {
                name: "School",
                credits: "2,000",
                price: "350,000",
                students: "Up to 1,000 students",
                features: ["2,000 exam attempts", "All exam types", "AI grading", "Priority support", "School analytics"],
                highlight: true,
              },
              {
                name: "Institution",
                credits: "Unlimited",
                price: "Custom",
                students: "Unlimited students",
                features: ["Unlimited attempts", "All exam types", "AI grading", "Dedicated manager", "SLA guarantee"],
                highlight: false,
              },
            ].map(({ name, credits, price, students, features, highlight }) => (
              <FadeUp key={name}>
                <div className={`h-full rounded-[24px] p-7 flex flex-col gap-5 relative overflow-hidden transition-all ${
                  highlight
                    ? "border border-[#1a7fe8]/40 bg-gradient-to-b from-[#1a7fe8]/10 to-[#7c3aed]/5"
                    : "border border-white/[0.07] bg-white/[0.02]"
                }`}>
                  {highlight && (
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1a7fe8] to-transparent" />
                  )}
                  {highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] text-white"
                      style={{ background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>
                      Most Popular
                    </div>
                  )}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{name}</div>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-[38px] font-black tracking-tight leading-none">{credits}</span>
                      {credits !== "Unlimited" && <span className="text-[13px] text-white/30 font-medium">credits</span>}
                    </div>
                    <div className={`text-[14px] font-semibold mb-1 ${highlight ? "text-[#1a7fe8]" : "text-white/50"}`}>
                      {price === "Custom" ? "Custom quote" : `₦${price} / term`}
                    </div>
                    <div className="text-[12px] text-white/30">{students}</div>
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/50">
                        <CheckCircle className="h-3.5 w-3.5 text-[#1a7fe8] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={name === "Institution" ? bookDemo : login}
                    className={`w-full py-3 rounded-full text-[13.5px] font-bold cursor-pointer transition-all hover:brightness-110 active:scale-[0.97] ${
                      highlight
                        ? "text-white"
                        : "text-white/70 border border-white/10 hover:text-white hover:border-white/20"
                    }`}
                    style={highlight ? { background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" } : {}}>
                    {name === "Institution" ? "Contact us" : "Get started"}
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp>
            <div className="rounded-[24px] border border-white/[0.06] overflow-hidden grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-white/[0.06]">
              {[
                { icon: BookOpen, label: "All exam types", sub: "MCQ, written, assignments" },
                { icon: Award, label: "AI grading", sub: "Essays marked in minutes" },
                { icon: Shield, label: "Secure exams", sub: "Anti-cheat built in" },
                { icon: Users, label: "Multi-school", sub: "One platform, every school" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                  <Icon className="h-5 w-5 text-[#1a7fe8] mb-3" strokeWidth={1.8} />
                  <div className="text-[14px] font-bold mb-0.5">{label}</div>
                  <div className="text-[12px] text-white/35">{sub}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Final CTA + Contact ── */}
      <section id="contact" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060d] via-[#07101e] to-[#03060d]" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #1a7fe820, transparent 70%)" }} />
        <FadeUp className="relative z-10 text-center max-w-2xl mx-auto px-5 sm:px-8">
          <h2 className="text-[40px] sm:text-[58px] font-black tracking-tight leading-[1.05] mb-6">
            Ready to modernise your school?
          </h2>
          <p className="text-[16px] text-white/40 leading-relaxed mb-10">
            Let us walk you through the platform live. 30 minutes, no commitment. We'll show you how to run your first exam the same day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%27d%20like%20to%20book%20a%20demo%20of%20Mmuta%20for%20my%20school.`}
              target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-4 text-[16px] font-bold rounded-full text-white cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{ background: "#25d366", boxShadow: "0 0 60px rgba(37,211,102,0.25)" }}>
              <MessageCircle className="h-5 w-5 fill-white" />
              Chat on WhatsApp
            </a>
            <button onClick={login}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 text-[16px] font-semibold rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer">
              Log In to Mmuta
            </button>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] overflow-hidden bg-[#1a7fe8]/10 border border-[#1a7fe8]/20 flex items-center justify-center">
                <img src="/logo.png" alt="Mmuta" className="w-full h-full object-cover" onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.parentElement as HTMLElement).innerHTML = '<span style="color:#1a7fe8;font-weight:900;font-size:11px">M</span>';
                }} />
              </div>
              <span className="text-[14px] font-black">Mmuta</span>
              <span className="text-white/20 text-sm">Teach. Test. Trust.</span>
            </div>
            <div className="flex items-center gap-6 text-[12.5px] text-white/25">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="hover:text-[#25d366] transition-colors">WhatsApp</a>
              <a href="mailto:support@mmuta.ng" className="hover:text-white/60 transition-colors">support@mmuta.ng</a>
              <span>© {new Date().getFullYear()} Mmuta</span>
            </div>
          </div>
          <div className="text-center text-[11px] text-white/20 leading-relaxed">
            Mmuta complies with Nigeria's Data Protection Regulation (NDPR). Student data is stored securely
            and never shared with third parties. <a href="mailto:privacy@mmuta.ng" className="underline hover:text-white/40">Privacy enquiries</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
