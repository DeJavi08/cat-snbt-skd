import React from "react";
import { 
  GraduationCap, ArrowRight, ShieldCheck, Clock, Award, 
  Sparkles, CheckCircle2, Cpu, BarChart2, Sun, Moon 
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onStart: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function LandingPage({ onStart, isDarkMode, setIsDarkMode }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const features = [
    {
      icon: <Clock className="text-indigo-600 dark:text-indigo-400" size={22} />,
      title: "Simulasi CAT Realistis",
      desc: "Latihan dengan Timer khusus (SKD 110 menit, SNBT 90 menit), navigasi soal interaktif, feedback instan, serta penanda status Ragu-Ragu."
    },
    {
      icon: <Cpu className="text-indigo-600 dark:text-indigo-400" size={22} />,
      title: "Penilaian IRT Modern",
      desc: "Sistem scoring berbasis Item Response Theory (IRT) untuk simulasi UTBK SNBT, serta kalkulasi poin nilai modular untuk simulasi CPNS SKD."
    },
    {
      icon: <BarChart2 className="text-indigo-600 dark:text-indigo-400" size={22} />,
      title: "Analisis Detail Sub-Materi",
      desc: "Grafik representasi perkembangan kemampuan per materi subtes (TWK, TIU, TKP, dsb.) langsung diformat secara otomatis."
    },
    {
      icon: <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={22} />,
      title: "Penyimpanan Riwayat Aman",
      desc: "Seluruh catatan hasil tryout, estimasi skor kelulusan, dan isian jawaban Anda dipilah rapi dalam media penyimpanan lokal browser."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-between overflow-x-hidden relative transition-colors duration-250 font-sans" id="landing-page">
      
      {/* Background Decorative Aurora Lights */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-indigo-550/6 dark:bg-indigo-500/4 blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-violet-550/4 dark:bg-violet-500/3 blur-3xl pointer-events-none animate-float-slow" style={{ animationDelay: "2s" }}></div>

      {/* HEADER NAVBAR */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl text-white bg-indigo-600 shadow-md shadow-indigo-500/20">
            <GraduationCap size={18} />
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            Tryout CAT Viewer
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggler Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-amber-450 hover:border-indigo-200 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
            title={isDarkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            id="landing-theme-toggle"
          >
            {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>

          <span className="text-[10px] sm:text-[11px] font-mono bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
            v2.1 Stable
          </span>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="w-full max-w-6xl mx-auto px-6 py-8 md:py-16 flex-1 flex flex-col lg:flex-row items-center gap-12 md:gap-16 z-10 justify-center">
        
        {/* Left column text content */}
        <motion.div 
          className="flex-1 text-center lg:text-left space-y-6 md:space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-150/60 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={11} className="animate-pulse" />
            <span>Computer Assisted Test (CAT) Simulator</span>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Tingkatkan Skor Kelulusan Anda secara <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300">Mandiri & Presisi</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Platform simulasi interaktif untuk tryout seleksi CPNS (SKD) dan SNBT (UTBK). Dirancang presisi menyerupai sistem seleksi CAT orisinal dengan evaluasi sub-materi terpadu dan persentase kelulusan yang diperbarui.
            </p>
          </motion.div>

          {/* Core Highlights Panel */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="bg-white dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-205 dark:border-slate-800/80 text-center lg:text-left shadow-2xs">
              <p className="text-lg md:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono leading-none">100%</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Ujian Offline Lokal</p>
            </div>
            <div className="bg-white dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-205 dark:border-slate-800/80 text-center lg:text-left shadow-2xs">
              <p className="text-lg md:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono leading-none">CAT</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Sistem Ujian CPNS</p>
            </div>
            <div className="bg-white dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-205 dark:border-slate-800/80 text-center lg:text-left col-span-2 md:col-span-1 shadow-2xs">
              <p className="text-lg md:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono leading-none">IRT</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 font-sans">Sistem Bobot SNBT</p>
            </div>
          </motion.div>

          {/* ACTION TRIGGER */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onStart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-4 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/30 transition duration-200 cursor-pointer"
              id="landing-cta-btn"
            >
              <span>Mulai Latihan Sekarang</span>
              <ArrowRight size={15} />
            </button>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase font-mono">
              ⚡ Tidak Perlu Login / Akun
            </span>
          </motion.div>
        </motion.div>

        {/* Right column showcase layout */}
        <motion.div 
          className="flex-1 w-full max-w-md lg:max-w-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8, delay: 0.3 }}
        >
          {/* Glass dashboard preview card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden" id="landing-showcase-panel">
            
            {/* Minimal window-like control bar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950/25 px-2 py-0.5 rounded">
                SIMULATOR PREVIEW
              </span>
            </div>

            {/* Simulated Live Statistics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Award size={18} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tryout CAT SKD 01</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-none mt-0.5">110 Soal • Terjawab Lengkap</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Skor Akhir</p>
                  <p className="text-sm font-black text-indigo-650 dark:text-indigo-400 font-mono leading-none mt-0.5">482</p>
                </div>
              </div>

              {/* Progress Bar mockup */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  <span>Akurasi Capaian</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">94.3%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-555 rounded-full" style={{ width: "94.3%" }}></div>
                </div>
              </div>

              {/* Simulated Soal List Circle indicators */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-left">Lembar Jawaban Siswa</p>
                <div className="grid grid-cols-6 gap-1.5 text-center">
                  {[
                    { id: 1, c: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40", label: "01" },
                    { id: 2, c: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40", label: "02" },
                    { id: 3, c: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/40", label: "03" },
                    { id: 4, c: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40", label: "04" },
                    { id: 5, c: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40", label: "05" },
                    { id: 6, c: "bg-slate-50 text-slate-400 dark:bg-slate-950/30 dark:text-slate-600 border-slate-100 dark:border-slate-850", label: "06" }
                  ].map((item) => (
                    <div 
                      key={item.id} 
                      className={`py-1.5 font-mono text-xs rounded-lg font-bold border shadow-2xs ${item.c}`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Callout Info note */}
            <div className="pt-3 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-805">
              <CheckCircle2 className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={13} />
              <p className="leading-relaxed text-left">
                Seluruh data pengerjaan bekerja secara instan di peramban tanpa memerlukan koneksi backend database eksternal.
              </p>
            </div>

          </div>
        </motion.div>

      </main>

      {/* CORE FEATURES LIST */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 z-10 border-t border-slate-200/50 dark:border-slate-800/40">
        <h2 className="text-center font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl uppercase tracking-wider mb-8">
          Fitur Unggulan Sistem Simulasi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400/30 dark:hover:border-indigo-500/20 shadow-2xs transition-all duration-300 text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 tracking-tight mb-2">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center z-10 text-[11px] text-slate-400 dark:text-slate-600 font-mono tracking-wider border-t border-slate-200/40 dark:border-slate-800/20 max-w-7xl mx-auto px-6">
        © 2026 TRYOUT CAT SIMULATOR. Didesain secara Presisi & Responsif.
      </footer>

    </div>
  );
}
