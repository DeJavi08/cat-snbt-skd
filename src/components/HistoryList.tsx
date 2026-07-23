import React from "react";
import { HistoryRecord } from "../types";
import { 
  History, Calendar, Clock, Award, Trash2, CheckCircle2, ChevronRight 
} from "lucide-react";

interface HistoryListProps {
  historyList: HistoryRecord[];
  onPilihHistory: (record: HistoryRecord) => void;
  onClearAllHistory: () => void;
  onNavigateToTryouts: () => void;
}

export default function HistoryList({
  historyList,
  onPilihHistory,
  onClearAllHistory,
  onNavigateToTryouts,
}: HistoryListProps) {
  
  // Convert ISO Timestamp to Indonesian format
  const formatFriendlyTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const day = String(date.getDate()).padStart(2, "0");
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hrs = String(date.getHours()).padStart(2, "0");
      const mins = String(date.getMinutes()).padStart(2, "0");
      
      return `${day} ${month} ${year} • ${hrs}:${mins} WIB`;
    } catch {
      return isoString;
    }
  };

  // Convert seconds to human readable form like "10 Menit 4 Detik"
  const formatTakenDuration = (secs: number) => {
    if (secs === 0 || isNaN(secs)) return "Review Instan";
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    if (mins > 0) return `${mins} Menit ${s} Detik`;
    return `${s} Detik`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" id="history-fullpage-root">
      
      {/* Header Panel with Quick Controls */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <h2 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
          <History className="text-indigo-600 dark:text-indigo-400" size={18} />
          <span>Riwayat Koreksi Simulasi</span>
        </h2>
        
        {historyList.length > 0 && (
          <button
            onClick={onClearAllHistory}
            className="inline-flex items-center gap-1.5 py-2 px-3 border border-red-150 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-xl text-xs font-bold transition cursor-pointer"
            id="history-btn-clear-all"
          >
            <Trash2 size={13} />
            <span>Bersihkan Semua</span>
          </button>
        )}
      </div>

      {/* Main card representation of logs */}
      {historyList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-xs space-y-4" id="history-empty-screen">
          <History className="mx-auto text-slate-300 dark:text-slate-700" size={54} />
          <div className="space-y-1">
            <h4 className="text-slate-700 dark:text-slate-200 text-base font-extrabold">Tidak Ada Riwayat Terdeteksi</h4>
            <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              Anda belum menyelesaikan simulasi ujian apa pun. Selesaikan tes dengan mengklik opsi "Selesai Ujian" untuk menyimpan hasil di sini.
            </p>
          </div>
          <button
            onClick={onNavigateToTryouts}
            className="inline-flex py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
          >
            Mulai Cari Tryout
          </button>
        </div>
      ) : (
        <div className="space-y-4" id="history-card-logs-list">
          {historyList.map((item, index) => {
            const accuracy = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
            const isSKD = item.tag === "SKD";

            return (
              <div
                key={item.timestamp || index}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 md:p-6 transition hover:shadow-md border-l-4 border-l-indigo-600 dark:border-l-indigo-500 flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6"
                id={`history-item-block-${index}`}
              >
                {/* Details layout column */}
                <div className="space-y-3 flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black tracking-wide ${
                      isSKD ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" : "bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400"
                    }`}>
                      {item.tag} CAT
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium flex items-center gap-1">
                      <Calendar size={11} className="text-slate-300 dark:text-slate-600" />
                      <span>{formatFriendlyTimestamp(item.timestamp)}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm md:text-base text-slate-805 dark:text-slate-100 leading-tight truncate">
                    {item.paketNama}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-mono">
                      <Clock size={11} /> {formatTakenDuration(item.duration)}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-650 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-md border border-emerald-100/10">
                      <CheckCircle2 size={11} className="text-emerald-500" /> Akurasi: {accuracy}%
                    </span>
                  </div>

                  {/* Overall Quick Counts inside History Card */}
                  {(item.totalBenar !== undefined || item.subtesBreakdownDetail) && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] md:text-xs pt-1">
                      <span className="font-semibold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider mr-1 text-[9px]">Hasil:</span>
                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        🟢 {item.totalBenar ?? 0} Benar
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
                        🔴 {item.totalSalah ?? 0} Salah
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-slate-400/10 text-slate-500 dark:text-slate-400">
                        ⚪ {item.totalKosong ?? 0} Kosong
                      </span>
                    </div>
                  )}

                  {/* Nested Subtests breakdown inside History Card */}
                  {item.subtesBreakdownDetail && Object.keys(item.subtesBreakdownDetail).length > 0 && (
                    <div className="pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                      <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Analisis per Sub-Materi:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Object.entries(item.subtesBreakdownDetail).map(([name, d]) => (
                          <div key={name} className="bg-slate-50/50 dark:bg-slate-950/45 border border-slate-100/80 dark:border-slate-850 p-2.5 rounded-xl space-y-1">
                            <p className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 truncate">{name}</p>
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] md:text-[10px] font-mono">
                              <span className="text-emerald-650 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-950/35 px-1.5 py-0.5 rounded">
                                B: {d.benar}
                              </span>
                              <span className="text-red-650 dark:text-red-400 font-extrabold bg-red-50 dark:bg-red-950/35 px-1.5 py-0.5 rounded">
                                S: {d.salah}
                              </span>
                              <span className="text-slate-550 dark:text-slate-400 font-extrabold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                K: {d.kosong}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Score badge Column */}
                <div className="flex items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 md:shrink-0 self-stretch md:self-auto" id={`history-score-col-${index}`}>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Skor Akhir</p>
                    <p className="text-xl md:text-2xl font-black text-indigo-700 dark:text-indigo-400 font-mono leading-none mt-1">
                      {item.score} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ {item.maxScore}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onPilihHistory(item)}
                    className="inline-flex items-center gap-1 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-350 hover:text-indigo-850 dark:hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    id={`btn-load-review-log-${index}`}
                  >
                    <span>Reviu</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
