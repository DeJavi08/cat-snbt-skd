import React from "react";
import { Soal } from "../types";
import { Check, X, Bookmark, Eye } from "lucide-react";

interface SidebarNavProps {
  soalList: Soal[];
  currentIdx: number;
  setCurrentIdx: (idx: number) => void;
  jawabanUser: Record<number, string | Record<string, string>>;
  raguRagu: Record<number, boolean>;
  view: "ujian" | "review" | "kuis";
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function SidebarNav({
  soalList,
  currentIdx,
  setCurrentIdx,
  jawabanUser,
  raguRagu,
  view,
  isOpen = true,
  onToggle,
}: SidebarNavProps) {
  // Helper to check if a regular string answer or a multi-statement answer is filled
  const isAnswered = (idx: number) => {
    const answer = jawabanUser[idx + 1];
    if (answer === undefined || answer === null) return false;
    if (typeof answer === "object") {
      // Check if they answered all pernyataan in the statement list
      const soal = soalList[idx];
      if (soal.pernyataan) {
        return soal.pernyataan.every((p) => answer[p.id] !== undefined);
      }
      return Object.keys(answer).length > 0;
    }
    return answer !== "";
  };

  // Helper to evaluation accuracy in review mode
  const isCorrect = (idx: number) => {
    const answer = jawabanUser[idx + 1];
    const soal = soalList[idx];
    if (!answer) return false;

    if (soal.tipe === "benar_salah" && typeof answer === "object" && typeof soal.jawaban === "object") {
      // Check every single statement
      const statementKeys = Object.keys(soal.jawaban);
      return statementKeys.every((k) => answer[k] === (soal.jawaban as Record<string, string>)[k]);
    }
    
    // For standard multiple choice
    return answer === soal.jawaban;
  };

  // Group questions by subtest (TWK, TIU, TKP etc)
  const groupedSubtes = soalList.reduce((acc: Record<string, { start: number; end: number }>, curr, idx) => {
    const sub = curr.subtes || "Umum";
    if (!acc[sub]) {
      acc[sub] = { start: idx + 1, end: idx + 1 };
    } else {
      acc[sub].end = idx + 1;
    }
    return acc;
  }, {});

  // Counters
  const total = soalList.length;
  const answeredCount = soalList.filter((_, idx) => isAnswered(idx)).length;
  const raguCount = soalList.filter((_, idx) => raguRagu[idx + 1]).length;

  const correctCount = soalList.filter((_, idx) => isCorrect(idx)).length;
  const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  // Ref and Effect to scroll the active question into view on mobile without window layout displacement
  const mobileSliderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (mobileSliderRef.current) {
      const activeBtn = mobileSliderRef.current.querySelector(
        `[data-mob-idx="${currentIdx}"]`
      ) as HTMLButtonElement;
      if (activeBtn) {
        const container = mobileSliderRef.current;
        const containerWidth = container.clientWidth;
        const btnLeft = activeBtn.offsetLeft;
        const btnWidth = activeBtn.clientWidth;
        const targetScrollLeft = btnLeft - (containerWidth / 2) + (btnWidth / 2);
        
        container.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth"
        });
      }
    }
  }, [currentIdx]);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 md:h-full md:overflow-y-auto max-w-full overflow-x-hidden ${
        isOpen 
          ? "w-full md:w-80 opacity-100" 
          : "w-full md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0"
      }`}
      id="sidebar-navigation"
    >
      {/* 1. VIEW UNTUK DESKTOP (Min-Width: MD) */}
      <div className="hidden md:flex flex-col flex-1" id="sidebar-desktop-view">
        {/* Stats Summary Panel */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-950/40" id="nav-summary-box">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase">
              Status Lembar Jawaban
            </h3>
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-705 dark:hover:text-slate-200 transition cursor-pointer"
                title="Tutup Navigator"
              >
                <X size={15} />
              </button>
            )}
          </div>
          
          {view === "ujian" ? (
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-2 rounded-xl">
                <p className="font-bold text-blue-700 dark:text-blue-400 text-sm font-mono">{answeredCount}</p>
                <p className="text-[10px] text-blue-500 font-medium">Terjawab</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-2 rounded-xl">
                <p className="font-bold text-amber-600 dark:text-amber-400 text-sm font-mono">{raguCount}</p>
                <p className="text-[10px] text-amber-500 font-medium">Ragu-Ragu</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                <p className="font-bold text-slate-705 dark:text-slate-300 text-sm font-mono">{total - answeredCount}</p>
                <p className="text-[10px] text-slate-500 font-medium">Kosong</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-2 rounded-xl">
                <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm font-mono leading-tight">{correctCount}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">Benar</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/45 p-2 rounded-xl">
                <p className="font-extrabold text-red-700 dark:text-red-400 text-sm font-mono leading-tight">
                  {soalList.filter((_, idx) => isAnswered(idx) && !isCorrect(idx)).length}
                </p>
                <p className="text-[10px] text-red-500 dark:text-red-400 font-medium truncate">Salah</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
                <p className="font-extrabold text-slate-700 dark:text-slate-300 text-sm font-mono leading-tight">
                  {soalList.filter((_, idx) => !isAnswered(idx)).length}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Kosong</p>
              </div>
            </div>
          )}

          {/* Pretty Horizontal progress percent indicator bar */}
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/80" id="desktop-progress-block">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              <span>Progres Pengerjaan</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">{answeredCount} dari {total} soal selesai dijawab</p>
          </div>
        </div>

        {/* Subtest Quick Jump Links */}
        {Object.keys(groupedSubtes).length > 1 && (
          <div className="p-4 bg-slate-55 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 max-h-36 overflow-y-auto" id="subtest-shortcuts">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pintasan Subtes
            </p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(groupedSubtes).map(([name, range]) => {
                const isActiveSub =
                  currentIdx + 1 >= range.start && currentIdx + 1 <= range.end;
                return (
                  <button
                    key={name}
                    onClick={() => setCurrentIdx(range.start - 1)}
                    className={`text-left text-xs px-2.5 py-1.5 rounded-lg flex justify-between items-center transition ${
                      isActiveSub
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    id={`shortcut-subtest-${range.start}`}
                  >
                    <span className="truncate max-w-[145px]">{name}</span>
                    <span className="font-mono text-[10px] text-slate-400 font-medium">
                      No. {range.start}-{range.end}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid numbers */}
        <div className="flex-1 overflow-y-auto p-5" id="nav-grid-box">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3.5">
            Navigator Soal
          </p>

          <div className="grid grid-cols-5 gap-2.5" id="navigator-number-grid">
            {soalList.map((soal, idx) => {
              const num = idx + 1;
              const isSelected = idx === currentIdx;
              const answered = isAnswered(idx);
              const flagged = raguRagu[num];

              let buttonClass = "";
              let iconBadge = null;

              if (view === "ujian") {
                // Standard exam appearance
                if (isSelected) {
                  buttonClass = "bg-indigo-600 dark:bg-indigo-600 text-white shadow-md border-2 border-indigo-750 font-extrabold ring-2 ring-indigo-500/20";
                } else if (flagged) {
                  // Doubtful answers take priority yellow colors
                  buttonClass = "bg-amber-500 text-white border border-amber-505 hover:bg-amber-600 shadow-xs";
                  iconBadge = <Bookmark className="absolute top-0 right-0 w-2.5 h-2.5 text-white bg-amber-600 rounded-bl-xs" />;
                } else if (answered) {
                  // Filled answers
                  buttonClass = "bg-blue-600 dark:bg-blue-500 text-white border border-blue-600 hover:bg-blue-700 shadow-xs";
                } else {
                  // Unanswered generic outlined
                  buttonClass = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80";
                }
              } else {
                // Review Mode (Solid blocks: correct -> green, incorrect -> red, unanswered -> slate)
                const correct = isCorrect(idx);
                if (isSelected) {
                  if (!answered) {
                    buttonClass = "bg-slate-600 dark:bg-slate-500 text-white font-black border-2 border-slate-700 dark:border-slate-400 ring-4 ring-indigo-500/30 scale-110 shadow-lg";
                  } else if (correct) {
                    buttonClass = "bg-emerald-600 dark:bg-emerald-500 text-white font-black border-2 border-emerald-700 dark:border-emerald-400 ring-4 ring-indigo-500/30 scale-110 shadow-lg";
                  } else {
                    buttonClass = "bg-red-600 dark:bg-red-500 text-white font-black border-2 border-red-700 dark:border-red-400 ring-4 ring-indigo-500/30 scale-110 shadow-lg";
                  }
                } else {
                  if (!answered) {
                    buttonClass = "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400/40 hover:bg-slate-400 dark:hover:bg-slate-600 hover:text-white shadow-xs";
                  } else if (correct) {
                    buttonClass = "bg-emerald-500 dark:bg-emerald-600 text-white border border-emerald-600 dark:border-emerald-750 hover:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs";
                  } else {
                    buttonClass = "bg-red-500 dark:bg-red-600 text-white border border-red-600 dark:border-red-700 hover:bg-red-600 dark:hover:bg-red-500 shadow-xs";
                  }
                }
                iconBadge = isSelected ? (
                  <Eye className="absolute -top-1 -right-1 w-3.5 h-3.5 p-0.5 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full" />
                ) : null;
              }

              return (
                <button
                  key={num}
                  onClick={() => setCurrentIdx(idx)}
                  className={`relative h-11 rounded-xl text-xs font-bold font-mono transition duration-150 flex items-center justify-center cursor-pointer ${buttonClass}`}
                  id={`nav-num-btn-${num}`}
                >
                  {iconBadge}
                  <span>{num}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. VIEW UNTUK MOBILE (Max-Width: MD - 1px) */}
      <div className="flex md:hidden flex-col bg-white dark:bg-slate-900 p-3.5 border-b border-slate-200 dark:border-slate-850 w-full max-w-full overflow-hidden" id="sidebar-mobile-view">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {view === "ujian" ? "Navigasi Soal" : view === "kuis" ? "Kuis Kilat" : "Informasi Pembahasan"}
          </span>
          <span className="text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
            {currentIdx + 1} / {total}
          </span>
        </div>

        {/* Subtest Quick Jump Links for Mobile (Symmetry with Desktop) */}
        {Object.keys(groupedSubtes).length > 1 && (
          <div className="mb-2.5 w-full max-w-full overflow-x-auto scrollbar-none touch-pan-x" id="subtest-shortcuts-mobile" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="flex flex-row flex-nowrap whitespace-nowrap gap-1.5 pb-1">
              {Object.entries(groupedSubtes).map(([name, range]) => {
                const isActiveSub =
                  currentIdx + 1 >= range.start && currentIdx + 1 <= range.end;
                return (
                  <button
                    key={`mob-sub-${name}`}
                    onClick={() => setCurrentIdx(range.start - 1)}
                    className="text-[11px] px-2.5 py-1 rounded-lg shrink-0 transition cursor-pointer active:scale-95 duration-100"
                    style={{
                      backgroundColor: isActiveSub ? "rgba(79, 70, 229, 0.1)" : "transparent",
                      color: isActiveSub ? "rgb(79, 70, 229)" : "inherit"
                    }}
                    id={`shortcut-subtest-mob-${range.start}`}
                  >
                    <span>{name}</span>
                    <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 ml-1">
                      No. {range.start}-{range.end}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Small horizontal statistics line on Mobile in Review / Kuis Mode so they can see totals at a glance too */}
        {view === "review" || view === "kuis" ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold mb-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2 rounded-xl">
            <span className="text-emerald-700 dark:text-emerald-450">✓ {correctCount} Benar</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-red-600 dark:text-red-400">✗ {soalList.filter((_, idx) => isAnswered(idx) && !isCorrect(idx)).length} Salah</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">○ {soalList.filter((_, idx) => !isAnswered(idx)).length} Kosong</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold mb-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-2 rounded-xl">
            <span className="text-blue-700 dark:text-blue-400">● {answeredCount} Terjawab</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-amber-600 dark:text-amber-400">★ {raguCount} Ragu-ragu</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">○ {total - answeredCount} Kosong</span>
          </div>
        )}

        {/* Horizontal Slider Parent */}
        <div 
          ref={mobileSliderRef}
          className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x w-full max-w-full touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
          id="mobile-horizontal-slider"
        >
          {soalList.map((soal, idx) => {
            const num = idx + 1;
            const isSelected = idx === currentIdx;
            const answered = isAnswered(idx);
            const flagged = raguRagu[num];

            let buttonClass = "";
            let iconBadge = null;

            if (view === "ujian") {
              if (isSelected) {
                buttonClass = "bg-indigo-600 text-white shadow-md border-2 border-indigo-750 scale-105 min-w-[38px] w-[38px] h-[38px]";
              } else if (flagged) {
                buttonClass = "bg-amber-500 text-white border border-amber-500 hover:bg-amber-600 min-w-[36px] w-[36px] h-[36px]";
                iconBadge = <Bookmark className="absolute top-0 right-0 w-2 h-2 text-white bg-amber-600 rounded-bl-xs" />;
              } else if (answered) {
                buttonClass = "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 min-w-[36px] w-[36px] h-[36px]";
              } else {
                buttonClass = "bg-white dark:bg-slate-800 text-slate-707 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 min-w-[36px] w-[36px] h-[36px]";
              }
            } else {
              // Review Mode (Solid blocks: correct -> green, incorrect -> red, unanswered -> slate)
              const correct = isCorrect(idx);
              if (isSelected) {
                if (!answered) {
                  buttonClass = "bg-slate-600 dark:bg-slate-500 text-white font-black border-2 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-400/40 min-w-[38px] w-[38px] h-[38px] scale-105";
                } else if (correct) {
                  buttonClass = "bg-emerald-600 dark:bg-emerald-500 text-white font-black border-2 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-400/40 min-w-[38px] w-[38px] h-[38px] scale-105";
                } else {
                  buttonClass = "bg-red-600 dark:bg-red-500 text-white font-black border-2 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-400/40 min-w-[38px] w-[38px] h-[38px] scale-105";
                }
              } else {
                if (!answered) {
                  buttonClass = "bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400/35 hover:bg-slate-400 dark:hover:bg-slate-600 min-w-[36px] w-[36px] h-[36px]";
                } else if (correct) {
                  buttonClass = "bg-emerald-500 dark:bg-emerald-600 text-white border border-emerald-600 dark:border-emerald-700 hover:bg-emerald-600 dark:hover:bg-emerald-500 min-w-[36px] w-[36px] h-[36px]";
                } else {
                  buttonClass = "bg-red-500 dark:bg-red-600 text-white border border-red-600 dark:border-red-700 hover:bg-red-600 dark:hover:bg-red-500 min-w-[36px] w-[36px] h-[36px]";
                }
              }
              iconBadge = isSelected ? (
                <Eye className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 p-0.5 bg-slate-850 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full" />
              ) : null;
            }

            return (
              <button
                key={`mob-${num}`}
                data-mob-idx={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`relative shrink-0 rounded-xl text-sm font-bold font-mono flex items-center justify-center transition duration-150 cursor-pointer snap-center select-none ${buttonClass}`}
                id={`mob-nav-btn-${num}`}
              >
                {iconBadge}
                <span>{num}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
