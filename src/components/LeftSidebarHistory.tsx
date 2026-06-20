import React from "react";
import { HistoryRecord } from "../types";
import { X, History, Trash2, Award, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LeftSidebarHistoryProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  historyList: HistoryRecord[];
  onPilihHistory: (record: HistoryRecord) => void;
  onClearHistory: () => void;
}

export default function LeftSidebarHistory({
  isOpen,
  setIsOpen,
  historyList,
  onPilihHistory,
  onClearHistory,
}: LeftSidebarHistoryProps) {
  
  // Format the ISO timestamp into a readable Date-Time in Indonesian
  const formatFriendlyTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const day = String(date.getDate()).padStart(2, "0");
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const hrs = String(date.getHours()).padStart(2, "0");
      const mins = String(date.getMinutes()).padStart(2, "0");
      
      return `${day} ${month} ${year} • ${hrs}:${mins}`;
    } catch {
      return isoString;
    }
  };

  // Convert duration in seconds to a brief form like "12m 4s"
  const formatSmallDuration = (secs: number) => {
    if (secs === 0 || isNaN(secs)) return "Instan Review";
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    if (mins > 0) return `${mins}m ${s}s`;
    return `${s}s`;
  };

  return (
    <>
      {/* Backdrop for Mobile Devices */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
            id="history-backdrop"
          />
        )}
      </AnimatePresence>      {/* Main Drawer Container */}
      <div
        className={`
          fixed md:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
          shadow-xl md:shadow-none transition-transform duration-300 z-50 flex flex-col justify-between
          ${isOpen ? "translate-x-0" : "-translate-x-full md:hidden"}
        `}
        id="history-sidebar-container"
      >
        <div className="p-4 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm md:text-base">
              <History size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Riwayat Reviu Tryout</span>
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
              id="close-history-sidebar-btn"
            >
              <X size={16} />
            </button>
          </div>

          {/* List content wrapper with elegant scrollbar properties */}
          <div className="space-y-3 overflow-y-auto flex-1 pr-1" id="history-scrollable-list">
            {historyList.length === 0 ? (
              <div className="text-center py-10 px-2 space-y-2">
                <History className="mx-auto text-slate-350 dark:text-slate-600" size={32} />
                <p className="text-xs text-slate-400 dark:text-slate-505 font-medium italic">
                  Belum ada sesi ujian yang tersimpan. Nilai simulasi Anda akan terekam di sini secara otomatis.
                </p>
              </div>
            ) : (
              historyList.map((item, index) => (
                <div
                  key={item.timestamp || index}
                  onClick={() => onPilihHistory(item)}
                  className="p-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50/50 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer transition text-left group border-l-3 border-l-indigo-600"
                >
                  <p className="text-[10px] text-slate-400 dark:text-slate-505 font-mono font-bold flex items-center gap-1.5 mb-1.5">
                    <Calendar size={10} />
                    <span>{formatFriendlyTimestamp(item.timestamp)}</span>
                  </p>
                  <h4 className="font-extrabold text-xs md:text-sm text-slate-850 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition leading-tight mb-2">
                    {item.paketNama}
                  </h4>

                  {/* Badges block: Correct/Poin information and Duration spent */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <div className="inline-flex gap-1.5 items-center text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                      <Award size={10} />
                      <span>Skor: {item.score}</span>
                    </div>
                    {item.duration > 0 && (
                      <div className="inline-flex gap-1 items-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-md">
                        <Clock size={10} />
                        <span>{formatSmallDuration(item.duration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Clear All Trigger Footer Panel */}
        {historyList.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <button
              onClick={onClearHistory}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-red-200 dark:border-red-900/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-650 font-bold rounded-xl text-xs md:text-sm shadow-2xs transition duration-200 cursor-pointer"
              id="clear-all-history-trigger-btn"
            >
              <Trash2 size={13} />
              <span>Bersihkan Riwayat Anda</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
