import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import Lenis from "@studio-freight/lenis";
import {
  Shield, Zap, BarChart2, CheckCircle, ArrowRight,
  Menu, X, BookOpen, Users, Award, ChevronDown,
} from "lucide-react";
import * as THREE from "three";

interface LandingPageProps {
  onGetStarted?: () => void;
}

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

  const go = () => {
    if (onGetStarted) { onGetStarted(); return; }
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "#platform", label: "Platform" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#schools", label: "For Schools" },
  ];

  return (
    <div className="bg-[#03060d] text-white min-h-screen overflow-x-hidden font-sans">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50">
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
            <button onClick={go}
              className="px-4 py-2 text-[13px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
            <button onClick={go}
              className="px-5 py-2.5 text-[13px] font-bold rounded-full text-white cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>
              Get Started
            </button>
          </div>

          <button className="md:hidden p-2 text-white/60 cursor-pointer" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Blur bar */}
        <div className="absolute inset-0 -z-10 bg-[#03060d]/80 backdrop-blur-xl border-b border-white/[0.04]" />

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full inset-x-0 bg-[#080d1a]/95 backdrop-blur-xl border-b border-white/[0.06] px-5 py-5 space-y-4">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block text-[15px] font-medium text-white/70 hover:text-white">
                {l.label}
              </a>
            ))}
            <button onClick={go}
              className="w-full py-3 text-[14px] font-bold rounded-full text-white cursor-pointer"
              style={{ background: "linear-gradient(135deg, #1a7fe8, #7c3aed)" }}>
              Get Started Free
            </button>
          </motion.div>
        )}
      </header>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

        {/* Background grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
          style={{ background: "radial-gradient(circle, #1a7fe8 0%, #7c3aed 60%, transparent 100%)" }} />

        {/* 3D Orb */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="absolute right-[5%] top-[12%] w-[340px] h-[340px] sm:w-[520px] sm:h-[520px] opacity-80">
          <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} color="#7c3aed" />
            <pointLight position={[-5, -5, -5]} intensity={0.8} color="#1a7fe8" />
            <FloatingOrb />
          </Canvas>
        </motion.div>

        {/* Hero text */}
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
            className="text-[52px] sm:text-[72px] lg:text-[88px] font-black leading-[0.95] tracking-[-0.03em] mb-8 max-w-3xl">
            <span className="block">Teach.</span>
            <span className="block" style={{ WebkitTextFillColor: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text", backgroundImage: "linear-gradient(135deg, #1a7fe8 0%, #7c3aed 50%, #06b6d4 100%)" }}>Test.</span>
            <span className="block">Trust.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
            className="text-[17px] sm:text-[19px] text-white/45 max-w-xl leading-relaxed mb-12">
            One platform for every school. Run secure CBT exams, get instant AI-graded results, and manage students across all your departments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4">
            <button onClick={go}
              className="group flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-bold rounded-full text-white cursor-pointer transition-all hover:brightness-110 active:scale-[0.97] shadow-2xl"
              style={{ background: "linear-gradient(135deg, #1a7fe8 0%, #7c3aed 100%)", boxShadow: "0 0 60px rgba(26,127,232,0.35)" }}>
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold rounded-full border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer">
              See the platform
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
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

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <FadeUp className="text-center mb-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed] mb-4">Process</p>
            <h2 className="text-[36px] sm:text-[52px] font-black tracking-tight leading-[1.05]">
              Up and running in one day
            </h2>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Register your school", desc: "Super admin creates your school profile. You get a unique school code your staff uses to join." },
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

      {/* ── For Schools section (replaces pricing as primary CTA section) ── */}
      <section id="schools" className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <FadeUp className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#06b6d4] mb-4">For Schools</p>
          <h2 className="text-[36px] sm:text-[52px] font-black tracking-tight leading-[1.05] mb-5">
            Credit-based. Pay as you go.
          </h2>
          <p className="text-[16px] text-white/40 max-w-xl mx-auto leading-relaxed">
            Buy exam credits. Each student exam attempt costs one credit. No monthly fees, no per-seat subscriptions.
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
              features: ["2,000 exam attempts", "All exam types", "AI grading", "Priority support", "Analytics"],
              highlight: true,
            },
            {
              name: "Institution",
              credits: "Unlimited",
              price: "Custom",
              students: "Unlimited students",
              features: ["Unlimited attempts", "All exam types", "AI grading", "Dedicated manager", "SLA"],
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
                <button onClick={go}
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

        {/* Feature grid */}
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
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#03060d] via-[#07101e] to-[#03060d]" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #1a7fe820, transparent 70%)" }} />
        <FadeUp className="relative z-10 text-center max-w-2xl mx-auto px-5 sm:px-8">
          <h2 className="text-[40px] sm:text-[58px] font-black tracking-tight leading-[1.05] mb-6">
            Ready to modernise your school?
          </h2>
          <p className="text-[16px] text-white/40 leading-relaxed mb-10">
            Join schools across Nigeria running secure, AI-graded CBT exams on Mmuta. No hardware, no paper, no waiting.
          </p>
          <button onClick={go}
            className="group inline-flex items-center gap-3 px-10 py-4.5 text-[16px] font-bold rounded-full text-white cursor-pointer transition-all hover:brightness-110 active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #1a7fe8 0%, #7c3aed 100%)", boxShadow: "0 0 80px rgba(26,127,232,0.3), 0 0 160px rgba(124,58,237,0.15)" }}>
            Get started for free
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </FadeUp>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
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
            <a href="mailto:support@mmuta.ng" className="hover:text-white/60 transition-colors">support@mmuta.ng</a>
            <span>© {new Date().getFullYear()} Mmuta</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
