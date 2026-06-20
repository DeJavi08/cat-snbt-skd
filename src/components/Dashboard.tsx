import React, { useState, useEffect } from "react";
import { Paket, HistoryRecord } from "../types";
import { motion } from "motion/react";
import { Search, BookOpen, Layers, PlayCircle, History, Clock, Award, Trash2 } from "lucide-react";

interface DashboardProps {
  daftarPaket: Paket[];
  onPilihPaket: (paket: Paket, mode: "ujian" | "review") => void;
  onClearHistory: () => void;
  history: HistoryRecord[];
}

export default function Dashboard({
  daftarPaket,
  onPilihPaket,
  onClearHistory,
  history,
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"SEMUA" | "SKD" | "SNBT">("SEMUA");

  // Filter packages based on active tab and search query
  const filteredPaket = daftarPaket.filter((paket) => {
    const matchesSearch = paket.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "SEMUA" ||
      (activeTab === "SKD" && paket.tag === "SKD") ||
      (activeTab === "SNBT" && paket.tag === "SNBT");
    return matchesSearch && matchesTab;
  });

  // Calculate some stats from history
  const averageScore =
    history.length > 0
      ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
      : 0;

  const containers = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min} Menit ${sec} Detik`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12" id="dashboard-container">
      {/* Header Banner Section */}
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-10 border border-indigo-500/20"
        id="dashboard-header"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4">
            <Layers size={12} /> Live Interactive Portal
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            CAT Tryout Viewer
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed font-light mb-6">
            Aplikasi pelatih dan peninjau soal-soal CAT (SKD & SNBT) interaktif lengkap dengan mode ujian simulasi waktu nyata, pembahasan detil, serta evaluasi performa mandiri.
          </p>
          
          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span>Local Storage Saved</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Ultra-Fast Web-Assets</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>True/False Statements Supported</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Main Panel of Tryouts vs. History / Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-content-grid">
        {/* Left Side: Tryout Selection */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800">
            {/* Filter Tabs */}
            <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl" id="category-tabs">
              {(["SEMUA", "SKD", "SNBT"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition duration-200 ${
                    activeTab === tab
                      ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                  id={`tab-btn-${tab.toLowerCase()}`}
                >
                  {tab === "SEMUA" ? "Semua Paket" : tab === "SKD" ? "CAT SKD" : "CAT SNBT"}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama paket soal..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition dark:text-slate-100"
                id="package-search-input"
              />
            </div>
          </div>

          {/* List of Packages */}
          {filteredPaket.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs" id="no-packets">
              <BookOpen className="mx-auto text-slate-300 dark:text-slate-650 mb-4" size={48} />
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Tidak ada paket soal yang cocok</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Coba gunakan sandi pencarian lain atau pilih tab filter yang berbeda.</p>
            </div>
          ) : (
            <motion.div
              variants={containers}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              id="package-grid"
            >
              {filteredPaket.map((paket, idx) => {
                const isSKD = paket.tag === "SKD";
                return (
                  <motion.div
                    variants={item}
                    key={paket.nama}
                    className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group"
                    id={`package-card-${idx}`}
                  >
                    {/* Card Top Label */}
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`inline-flex py-1 px-2.5 rounded-md text-xs font-bold leading-none uppercase ${
                            isSKD
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                          }`}
                        >
                          {paket.tag} TEST
                        </span>
                        
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          {isSKD ? "110 Menit" : "90 Menit"}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 dark:hover:text-white dark:hover:bg-indigo-505 px-2 py-1 -ml-2 rounded-xl transition duration-155 leading-snug my-2 inline-block cursor-pointer">
                        {paket.nama}
                      </h3>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {isSKD
                          ? "Berisi subtes TWK, TIU, dan TKP dengan rincian materi profesionalisme, nalar, dan bela negara."
                          : "Menguji aspek penalaran matematika, literasi membaca, serta pengetahuan umum."}
                      </p>
                    </div>

                    {/* Card Buttons Container */}
                    <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex gap-2.5 mt-auto">
                      <button
                        onClick={() => onPilihPaket(paket, "review")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
                        title="Pelajari jawaban dan pembahasan tanpa dibatasi waktu ujian"
                        id={`btn-review-${idx}`}
                      >
                        <BookOpen size={14} /> Pembahasan
                      </button>

                      <button
                        onClick={() => onPilihPaket(paket, "ujian")}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-sm text-xs font-semibold shadow-xs transition cursor-pointer"
                        id={`btn-ujian-${idx}`}
                      >
                        <PlayCircle size={14} /> Ujian Simulasi
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Right Side: stats and history */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stats widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4" id="stats-widget">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
              <Award className="text-indigo-500" size={18} />
              <span>Statistik Belajar</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{history.length}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">Sesi Ujian</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {history.length > 0 ? averageScore : "-"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-0.5">Rataan Nilai</p>
              </div>
            </div>
            
            {history.length > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100/30 dark:border-indigo-950/40">
                <span>Nilai Tertinggi:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                  {Math.max(...history.map((h) => h.score))} Poin
                </span>
              </div>
            )}
          </div>

          {/* History log Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4" id="history-log-widget">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                <History className="text-slate-550 dark:text-slate-400" size={18} />
                <span>Riwayat Latihan</span>
              </h3>
              
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="p-1.5 rounded-lg hover:bg-red-550/10 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                  title="Hapus semua riwayat"
                  id="btn-clear-history"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800" id="empty-history">
                <Clock className="mx-auto text-slate-300 dark:text-slate-650 mb-2" size={24} />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Belum ada riwayat ujian</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Selesaikan satu simulasi ujian untuk melacak performa Anda di sini.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1" id="history-list">
                {history.map((record, index) => {
                  const date = new Date(record.timestamp);
                  const formattedDate = date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-705 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 text-xs"
                      id={`history-item-${index}`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <p className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={record.paketNama}>
                          {record.paketNama}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md font-bold text-[9px]">
                            {record.tag}
                          </span>
                          <span>{formattedDate}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> Durasi: {formatTime(record.duration)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-slate-400 dark:text-slate-500 text-[10px]">Nilai Akhir</p>
                        <p className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono text-sm leading-none mt-0.5">
                          {record.score}
                        </p>
                        <p className="text-slate-400 dark:text-slate-550 text-[9px] font-mono">
                          /{record.maxScore}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
