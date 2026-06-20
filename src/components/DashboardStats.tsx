import React, { useState, useEffect } from "react";
import { HistoryRecord } from "../types";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar 
} from "recharts";
import { 
  Award, BarChart3, Star, Zap, Library, ChevronRight, PlayCircle, ClipboardCheck,
  CheckSquare, Square, Trash2, Plus, FolderDown, FileText, Sparkles, BookOpen
} from "lucide-react";
import { normalizeSubtes } from "../utils/irt2026";

interface DashboardStatsProps {
  historyList: HistoryRecord[];
  onNavigateToTryouts: () => void;
}

export default function DashboardStats({
  historyList,
  onNavigateToTryouts
}: DashboardStatsProps) {
  
  // Filter history records into SKD and SNBT
  const listSKD = historyList.filter(h => h.tag === "SKD");
  const listSNBT = historyList.filter(h => h.tag === "SNBT");

  // Calculate General Stats
  const totalSessions = historyList.length;
  
  const averageAll = totalSessions > 0
    ? Math.round(historyList.reduce((acc, curr) => acc + curr.score, 0) / totalSessions)
    : 0;

  const maxScore = totalSessions > 0
    ? Math.max(...historyList.map(h => h.score))
    : 0;

  const activeAccuracy = totalSessions > 0
    ? Math.round(
        historyList.reduce((acc, curr) => {
          const ratio = curr.maxScore > 0 ? (curr.score / curr.maxScore) : 0;
          return acc + ratio;
        }, 0) / totalSessions * 100
      )
    : 0;

  // Study Todos state
  const [todos, setTodos] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem("to_do_list_study");
      return saved ? JSON.parse(saved) : [
        { id: "1", text: "Pelajari materi TWK Bela Negara & Integritas", completed: false },
        { id: "2", text: "Coba Simulasi CAT SKD Paket 01", completed: true },
        { id: "3", text: "Analisis kesalahan IRT Penalaran Matematika", completed: false },
        { id: "4", text: "Bahas tuntas Logika Verbal SNBT", completed: false }
      ];
    } catch {
      return [
        { id: "1", text: "Pelajari materi TWK Bela Negara & Integritas", completed: false },
        { id: "2", text: "Coba Simulasi CAT SKD Paket 01", completed: true }
      ];
    }
  });

  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    localStorage.setItem("to_do_list_study", JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([
      ...todos, 
      { id: Date.now().toString(), text: newTodo.trim(), completed: false }
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  // Study Materials state & action
  const materials = [
    { id: "m1", title: "Ringkasan Materi Pilar Negara & Pancasila", size: "1.4 MB", subject: "TWK", reads: "1.2k" },
    { id: "m2", title: "Kiat Master Silogisme & Pemecahan Logis", size: "950 KB", subject: "TIU", reads: "850" },
    { id: "m3", title: "Kunci Jawaban Model Pelayanan Publik Terbaik", size: "2.1 MB", subject: "TKP", reads: "1.5k" },
    { id: "m4", title: "Analisis Skor Pembobotan IRT Kuantitatif UTBK", size: "3.2 MB", subject: "SNBT", reads: "2.4k" }
  ];

  const [notifMaterial, setNotifMaterial] = useState<string | null>(null);
  const handleDownloadMaterial = (title: string) => {
    setNotifMaterial(`Mengunduh berkas: ${title}`);
    setTimeout(() => {
      setNotifMaterial(null);
    }, 2500);
  };

  // BAR CHARTS: Score progress of last 5 tryout runs
  const buildBarData = (items: HistoryRecord[], tag: "SKD" | "SNBT") => {
    const lastFive = [...items].slice(0, 5).reverse();
    if (lastFive.length === 0) {
      return [
        { name: "TO 1 (Target)", Skor: tag === "SKD" ? 300 : 400, "Ambisi Lulus": tag === "SKD" ? 400 : 550, "Max Skor": tag === "SKD" ? 550 : 1000 },
        { name: "TO 2 (Target)", Skor: tag === "SKD" ? 340 : 460, "Ambisi Lulus": tag === "SKD" ? 420 : 580, "Max Skor": tag === "SKD" ? 550 : 1000 },
        { name: "TO 3 (Target)", Skor: tag === "SKD" ? 380 : 510, "Ambisi Lulus": tag === "SKD" ? 450 : 610, "Max Skor": tag === "SKD" ? 550 : 1000 },
        { name: "TO 4 (Target)", Skor: tag === "SKD" ? 410 : 550, "Ambisi Lulus": tag === "SKD" ? 480 : 640, "Max Skor": tag === "SKD" ? 550 : 1000 },
        { name: "TO 5 (Target)", Skor: tag === "SKD" ? 450 : 600, "Ambisi Lulus": tag === "SKD" ? 500 : 670, "Max Skor": tag === "SKD" ? 550 : 1000 }
      ];
    }
    return lastFive.map((run, i) => ({
      name: `Sesi ${i + 1}`,
      Skor: run.score,
      "Ambisi Lulus": run.maxScore,
      "Max Skor": run.maxScore
    }));
  };

  const barDataSKD = buildBarData(listSKD, "SKD");
  const barDataSNBT = buildBarData(listSNBT, "SNBT");

  // RADAR CHARTS: Average Subtest Performance
  const getAverageCategoryMastery = (tag: "SKD" | "SNBT") => {
    const list = tag === "SKD" ? listSKD : listSNBT;
    
    if (tag === "SKD") {
      let twkAvg = 75;
      let tiuAvg = 95;
      let tkpAvg = 165;

      if (list.length > 0) {
        let twkTotal = 0, twkCount = 0;
        let tiuTotal = 0, tiuCount = 0;
        let tkpTotal = 0, tkpCount = 0;

        list.forEach(run => {
          if (run.nilaiPerSubtes) {
            Object.entries(run.nilaiPerSubtes).forEach(([subName, score]) => {
              const subL = subName.toLowerCase();
              if (subL.includes("wawasan") || subL.includes("twk")) {
                twkTotal += score;
                twkCount++;
              } else if (subL.includes("inteligensi") || subL.includes("tiu")) {
                tiuTotal += score;
                tiuCount++;
              } else if (subL.includes("karakteristik") || subL.includes("tkp")) {
                tkpTotal += score;
                tkpCount++;
              }
            });
          }
        });

        if (twkCount > 0) twkAvg = Math.round(twkTotal / twkCount);
        if (tiuCount > 0) tiuAvg = Math.round(tiuTotal / tiuCount);
        if (tkpCount > 0) tkpAvg = Math.round(tkpTotal / tkpCount);
      }

      return [
        {
          subject: "TWK",
          Penguasaan: Math.round((twkAvg / 150) * 225),
          Target: Math.round((65 / 150) * 225),
          RealPenguasaan: twkAvg,
          RealTarget: 65,
          MaxScore: 150
        },
        {
          subject: "TIU",
          Penguasaan: Math.round((tiuAvg / 175) * 225),
          Target: Math.round((80 / 175) * 225),
          RealPenguasaan: tiuAvg,
          RealTarget: 80,
          MaxScore: 175
        },
        {
          subject: "TKP",
          Penguasaan: tkpAvg,
          Target: 156,
          RealPenguasaan: tkpAvg,
          RealTarget: 156,
          MaxScore: 225
        }
      ];
    } else {
      if (list.length === 0) {
        return [
          { subject: "Penalaran Umum", Penguasaan: 500, Target: 750 },
          { subject: "Pengetahuan/PPU", Penguasaan: 480, Target: 720 },
          { subject: "Pemahaman/PBM", Penguasaan: 520, Target: 740 },
          { subject: "Kuantitatif", Penguasaan: 450, Target: 780 },
          { subject: "Lit Inggris", Penguasaan: 490, Target: 700 },
          { subject: "Lit Indo", Penguasaan: 540, Target: 750 },
          { subject: "Penalaran Mat", Penguasaan: 460, Target: 730 }
        ];
      }

      // SNBT mode
      const sumOfScores: Record<string, number> = {};
      const countOfScores: Record<string, number> = {};

      list.forEach(run => {
        if (run.nilaiPerSubtes) {
          Object.entries(run.nilaiPerSubtes).forEach(([subName, score]) => {
            const normed = normalizeSubtes(subName);
            sumOfScores[normed] = (sumOfScores[normed] || 0) + score;
            countOfScores[normed] = (countOfScores[normed] || 0) + 1;
          });
        }
      });

      const subtests = [
        "Penalaran Umum",
        "Pengetahuan & Pemahaman Umum",
        "Pemahaman Bacaan dan Menulis",
        "Pengetahuan Kuantitatif",
        "Literasi dalam Bahasa Inggris",
        "Literasi dalam Bahasa Indonesia",
        "Penalaran Matematika"
      ];

      return subtests.map(subName => {
        const avg = countOfScores[subName] > 0 
          ? Math.round(sumOfScores[subName] / countOfScores[subName]) 
          : 500;
        
        const targetMap: Record<string, number> = {
          "Penalaran Umum": 750,
          "Pengetahuan & Pemahaman Umum": 720,
          "Pemahaman Bacaan dan Menulis": 740,
          "Pengetahuan Kuantitatif": 780,
          "Literasi dalam Bahasa Inggris": 700,
          "Literasi dalam Bahasa Indonesia": 750,
          "Penalaran Matematika": 730
        };

        const shortNameMap: Record<string, string> = {
          "Penalaran Umum": "Penalaran Umum",
          "Pengetahuan & Pemahaman Umum": "Pengetahuan/PPU",
          "Pemahaman Bacaan dan Menulis": "Pemahaman/PBM",
          "Pengetahuan Kuantitatif": "Kuantitatif",
          "Literasi dalam Bahasa Inggris": "Lit Inggris",
          "Literasi dalam Bahasa Indonesia": "Lit Indo",
          "Penalaran Matematika": "Penalaran Mat"
        };

        return {
          subject: shortNameMap[subName] || subName,
          Penguasaan: avg,
          Target: targetMap[subName] || 700
        };
      });
    }
  };

  const radarDataSKD = getAverageCategoryMastery("SKD");
  const radarDataSNBT = getAverageCategoryMastery("SNBT");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 relative" id="dashboard-statistics-root">
      
      {/* Upper Grid of KPI Stat Cards & Glassmorphic Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-metrics-grid">
        
        <div className="glass-card glass-card-hover p-5 rounded-3xl space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Latihan</span>
            <Library size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
              {totalSessions} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Sesi</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Dicatat di Local Storage</p>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-3xl space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Rata-rata Skor</span>
            <Award size={18} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {averageAll > 0 ? averageAll : "-"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Nilai rataan pengerjaan</p>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-3xl space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Skor Tertinggi</span>
            <Star size={18} className="text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-amber-500 font-mono tracking-tight">
              {maxScore > 0 ? maxScore : "-"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">Rekor terbaik Anda</p>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-3xl space-y-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-colors"></div>
          <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Akurasi Jawaban</span>
            <Zap size={18} className="text-violet-500" />
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-indigo-700 dark:text-indigo-400 font-mono tracking-tight">
              {activeAccuracy}%
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Ketuntasan bobot poin</p>
          </div>
        </div>
      </div>

      {/* Action Notification Toast inside Dashboard for materials */}
      {notifMaterial && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 dark:border-slate-200">
          <Sparkles size={16} className="text-indigo-500 animate-spin" />
          <span>{notifMaterial}</span>
        </div>
      )}

      {/* Primary Banner Call to Action for new users if history is empty */}
      {totalSessions === 0 && (
        <div className="bg-gradient-to-br from-indigo-900/90 via-slate-900/80 to-slate-950/90 backdrop-blur-md p-6 md:p-8 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-6 border border-indigo-500/25 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-lg md:text-xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="text-indigo-400" size={18} />
              <span>Belum Memiliki Sesi Koreksi?</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light max-w-xl">
              Mulai uji kemampuan Anda dengan menyelesaikan latihan Tryout CAT sekarang. Grafik akan memetakan tren penguasaan materi secara otomatis setelah Anda mengklik <b>Selesai Ujian</b>.
            </p>
          </div>
          <button
            onClick={onNavigateToTryouts}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs md:text-sm tracking-tight shadow-lg transition duration-250 shrink-0 cursor-pointer hover:scale-101 relative z-10"
          >
            <PlayCircle size={15} />
            <span>Mulai Berlatih Tryout</span>
          </button>
        </div>
      )}

      {/* BENTO GRID: Comprehensive Modules Placement & Visual Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="bento-statistics-grid">
        
        {/* Bento Cell 1: CAT SKD Radar Analysis (Glass Card) */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col items-center justify-between">
          <div className="text-center space-y-1 mb-4 w-full">
            <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-500">DIAGNOSTIK UTAMA</p>
            <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100">
              Analisis Subtes CAT SKD
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {listSKD.length > 0 ? "Berdasarkan rincian riwayat Anda" : "Profil Target Nilai Ambang Batas SKD 2026"}
            </p>
          </div>
          
          <div className="w-full h-64 text-xs font-bold" id="radar-skd-chart-bento">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarDataSKD}>
                <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 13, fontWeight: "bold" }} />
                <PolarRadiusAxis 
                  angle={210} 
                  domain={[0, 225]} 
                  tick={{ fill: "#475569", fontSize: 9, fontWeight: "bold" }}
                  ticks={[0, 100, 150, 225]}
                />
                <Radar
                   name="Rataan Anda"
                   dataKey="Penguasaan"
                   stroke="#4f46e5"
                   fill="#4f46e5"
                   fillOpacity={0.25}
                   strokeWidth={2}
                />
                <Radar
                   name="Ambang Batas"
                   dataKey="Target"
                   stroke="#ef4444"
                   fill="#ef4444"
                   fillOpacity={0.03}
                   strokeWidth={1.5}
                   strokeDasharray="5 5"
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento Cell 2: UTBK SNBT Radar Analysis (Glass Card) */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col items-center justify-between">
          <div className="text-center space-y-1 mb-4 w-full">
            <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-500">MODEL IRT ESTIMATOR</p>
            <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100">
              Analisis Akhir UTBK SNBT
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {listSNBT.length > 0 ? "Berdasarkan pembobotan IRT Anda" : "Profil Target Standar PTN Unggulan"}
            </p>
          </div>
          
          <div className="w-full h-64 text-xs font-bold" id="radar-snbt-chart-bento">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarDataSNBT}>
                <PolarGrid stroke="#cbd5e1" strokeWidth={1} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} />
                <PolarRadiusAxis angle={30} domain={[200, 1100]} tick={{ fill: "#94a3b8" }} />
                <Radar
                  name="Penguasaan"
                  dataKey="Penguasaan"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="Target"
                  stroke="#64748b"
                  fill="#64748b"
                  fillOpacity={0.03}
                  strokeDasharray="4 4"
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento Cell 3: Interactive To-Do List (Glass Card) - EXPLICIT USER REQUEST */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between" id="bento-todo-planner">
          <div className="w-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-500">STUDY PLANNER</p>
                <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100">
                  Target & To-Do List Belajar
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-350 px-2 py-0.5 rounded-lg font-mono">
                {todos.filter(t => t.completed).length}/{todos.length} Done
              </span>
            </div>

            {/* Todo input form */}
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <input
                type="text"
                placeholder="Rencana baru..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500/50 focus:outline-none dark:text-slate-100"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition shrink-0 cursor-pointer flex items-center justify-center"
              >
                <Plus size={14} />
              </button>
            </form>

            {/* Scrollable List area */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <div className="text-center p-6 text-slate-400 text-[11px] font-medium font-mono">
                  Belum ada rencana belajar hari ini!
                </div>
              ) : (
                todos.map(todo => (
                  <div 
                    key={todo.id} 
                    className="flex justify-between items-center bg-slate-50/70 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl transition hover:border-slate-200 dark:hover:border-slate-800 group"
                  >
                    <button 
                      type="button"
                      onClick={() => toggleTodo(todo.id)}
                      className="flex items-start gap-2.5 text-left flex-1 cursor-pointer"
                    >
                      {todo.completed ? (
                        <CheckSquare size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square size={15} className="text-slate-400 group-hover:text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-[11px] font-medium leading-normal ${todo.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>
                        {todo.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer shrink-0 ml-1.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-mono text-center">
            Pilih kotak untuk mengubah kondisi status target
          </div>
        </div>

        {/* Bento Cell 4: SKD Score Progress Line (Glass Card) */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-500">INTELLIGENCE TRENDS</p>
              <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <BarChart3 size={15} />
                <span>Tren Progres CAT SKD</span>
              </h3>
            </div>
          </div>

          <div className="w-full h-52 text-xs font-mono" id="bar-skd-chart-bento">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDataSKD} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} />
                <YAxis domain={[0, 550]} tick={{ fill: "#64748b", fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="Skor" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento Cell 5: UTBK Score Progress Line (Glass Card) */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-500">SCHOLASTIC CURVES</p>
              <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <BarChart3 size={15} />
                <span>Tren Progres UTBK SNBT</span>
              </h3>
            </div>
          </div>

          <div className="w-full h-52 text-xs font-mono" id="bar-snbt-chart-bento">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDataSNBT} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} />
                <YAxis domain={[200, 1100]} tick={{ fill: "#64748b", fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="Skor" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bento Cell 6: Material Catalog / Folder materi - EXPLICIT USER REQUEST */}
        <div className="glass-card glass-card-hover p-6 rounded-3xl flex flex-col justify-between" id="bento-material-catalog">
          <div className="space-y-3 w-full">
            <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-violet-500">KURSUS & MATERI</p>
            <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <BookOpen size={15} className="text-violet-500" />
              <span>Katalog Folder Materi Utama</span>
            </h3>
            
            <div className="space-y-2">
              {materials.map(mat => (
                <div 
                  key={mat.id}
                  className="bg-slate-50/70 dark:bg-slate-950/20 hover:bg-slate-100/50 dark:hover:bg-slate-950/50 border border-slate-100 dark:border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs transition"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-bold text-slate-800 dark:text-slate-205 truncate" title={mat.title}>
                      {mat.title}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-medium">
                      <span className="font-extrabold text-indigo-500">{mat.subject}</span>
                      <span>•</span>
                      <span>{mat.size}</span>
                      <span>•</span>
                      <span>{mat.reads} dibaca</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadMaterial(mat.title)}
                    className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-indigo-400 transition cursor-pointer"
                    title="Unduh Modul Belajar"
                  >
                    <FolderDown size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] font-mono font-bold text-indigo-500 text-center uppercase tracking-wider mt-4">
            Akses langsung Ringkasan Kurikulum 2026
          </div>
        </div>

      </div>

      {/* Bottom info banner, print-friendly and glassmorphic styled */}
      <div className="glass-card p-5 rounded-3xl flex items-start gap-4">
        <ClipboardCheck className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" size={20} />
        <div className="space-y-1 leading-normal text-xs text-slate-500 dark:text-slate-400">
          <p className="font-bold text-slate-755 dark:text-slate-250">Petunjuk Peningkatan Penguasaan Sub-materi:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Review pembahasan secara mendalam untuk subtes yang berada di bawah target visual (garis putus-putus abu-abu pada grafik jaring laba-laba).</li>
            <li>Pertahankan konsistensi latihan minimal 1 tryout per minggu untuk membentuk kurva progres grafik batang yang stabil ke arah atas.</li>
            <li>Simulasi penilaian CAT menghitung skor sesuai bobot poin aslinya, termasuk opsi poin majemuk khusus Tes Karakteristik Pribadi (TKP).</li>
          </ul>
        </div>
      </div>
      
    </div>
  );
}
