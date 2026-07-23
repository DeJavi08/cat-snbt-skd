import React from "react";
import { Soal } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Bookmark, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { renderFormattedContent } from "../utils/formatter";

interface SoalCardProps {
  soal: Soal | undefined;
  currentIdx: number;
  totalSoal: number;
  setCurrentIdx: (idx: number) => void;
  jawabanUser: Record<number, string | Record<string, string>>;
  setJawabanUser: React.Dispatch<React.SetStateAction<Record<number, string | Record<string, string>>>>;
  raguRagu: Record<number, boolean>;
  setRaguRagu: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  view: "ujian" | "review" | "kuis";
}

export default function SoalCard({
  soal,
  currentIdx,
  totalSoal,
  setCurrentIdx,
  jawabanUser,
  setJawabanUser,
  raguRagu,
  setRaguRagu,
  view,
}: SoalCardProps) {
  if (!soal) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs text-center text-slate-500">
        Membaca data soal...
      </div>
    );
  }

  const num = currentIdx + 1;
  const isUjian = view === "ujian";
  const isKuis = view === "kuis";
  const currentAnswer = jawabanUser[num];

  const hasAnswered =
    currentAnswer !== undefined &&
    currentAnswer !== "" &&
    (typeof currentAnswer !== "object" || Object.keys(currentAnswer || {}).length > 0);

  const showPembahasan = !isUjian && (!isKuis || hasAnswered);

  let kuisResultBadge = null;
  if (isKuis && hasAnswered) {
    let isCorrect = false;
    if (soal.tipe === "benar_salah") {
      const correctMap = (soal.jawaban as Record<string, string>) || {};
      const userMap = (currentAnswer as Record<string, string>) || {};
      isCorrect = soal.pernyataan?.every(st => userMap[st.id] === correctMap[st.id]) ?? false;
    } else {
      isCorrect = currentAnswer === soal.jawaban;
    }
    
    if (isCorrect) {
      kuisResultBadge = (
        <span className="text-xs font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-950/20 flex items-center gap-1 font-mono">
          🟢 BENAR
        </span>
      );
    } else {
      kuisResultBadge = (
        <span className="text-xs font-black bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-3 py-1 rounded-full border border-red-200 dark:border-red-950/20 flex items-center gap-1 font-mono">
          🔴 SALAH
        </span>
      );
    }
  } else if (isKuis) {
    kuisResultBadge = (
      <span className="text-xs font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-150 dark:border-indigo-900/30 tracking-wider uppercase font-mono">
        ⚡ KUIS KILAT
      </span>
    );
  }

  // Function to render text and scan for images: [IMAGE: relative_path]
  const renderTextWithImages = (teks: string) => {
    if (!teks) return "";
    
    const imgRegex = /\[IMAGE:\s*([^\]]+)\]/g;
    const parts = teks.split(imgRegex);
    
    if (parts.length === 1) {
      return (
        <span className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
          {teks}
        </span>
      );
    }

    return (
      <span className="space-y-4 inline-block w-full">
        {parts.map((part, index) => {
          // Odd indices are image paths
          if (index % 2 !== 0) {
            const imgPath = part.trim();
            return (
              <span key={index} className="block my-4 flex flex-col items-center">
                <img
                  src={`/${imgPath}`}
                  alt="Ilustrasi Soal"
                  referrerPolicy="no-referrer"
                  className="max-h-72 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 object-contain bg-white dark:bg-slate-950 p-3 hover:scale-101 transition duration-200"
                  onError={(e) => {
                    // Failover to a beautiful SVG visual placeholder if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const container = target.parentElement;
                    if (container) {
                      // Check if already has a placeholder to avoid duplicating
                      if (!container.querySelector(".img-fallback")) {
                        const fallback = document.createElement("div");
                        fallback.className = "img-fallback w-full max-w-md p-6 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 gap-2";
                        fallback.innerHTML = `
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          <span class="text-xs font-semibold text-slate-550 dark:text-slate-400">Berkas Gambar Statis</span>
                          <span class="text-[10px] text-slate-400 dark:text-slate-500 font-mono">${imgPath}</span>
                          <span class="text-[9px] text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full font-medium mt-1">Ganti via copy berkas ke folder public/</span>
                        `;
                        container.appendChild(fallback);
                      }
                    }
                  }}
                />
              </span>
            );
          }
          return (
            <span key={index} className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300">
              {part}
            </span>
          );
        })}
      </span>
    );
  };

  // Selection handlers
  const handleSelectOpsi = (key: string) => {
    if (!isUjian && !isKuis) return;
    if (isKuis && hasAnswered) return;
    setJawabanUser((prev) => ({
      ...prev,
      [num]: key,
    }));
  };

  const handleSelectStatement = (statementId: string, value: string) => {
    if (!isUjian && !isKuis) return;
    const currentTFMap = (currentAnswer as Record<string, string>) || {};
    if (isKuis && currentTFMap[statementId]) return;
    setJawabanUser((prev) => {
      const currentAnsObj = (prev[num] as Record<string, string>) || {};
      return {
        ...prev,
        [num]: {
          ...currentAnsObj,
          [statementId]: value,
        },
      };
    });
  };

  const toggleRaguRagu = () => {
    setRaguRagu((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden" id="soal-card-panel">
      
      {/* Card Header Info */}
      <div 
        className={`px-6 py-4 border-b transition-colors duration-200 flex items-center justify-between gap-4 ${
          raguRagu[num]
            ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30"
            : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800/80"
        }`} 
        id="soal-header-bar"
      >
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 rounded-xl items-center justify-center font-extrabold font-mono text-sm leading-none transition-colors duration-200 ${
            raguRagu[num]
              ? "bg-amber-550 dark:bg-amber-600 text-white"
              : "bg-indigo-600 text-white"
          }`}>
            {num}
          </span>
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Subtes Materi</p>
            <p className={`text-sm font-bold mt-1 leading-none transition-colors duration-200 ${
              raguRagu[num]
                ? "text-amber-700 dark:text-amber-400"
                : "text-indigo-700 dark:text-indigo-400"
            }`}>{soal.subtes}</p>
          </div>
        </div>

        {/* Action Marks like Ragu-Ragu in Exam Mode */}
        {isUjian && (
          <button
            onClick={toggleRaguRagu}
            className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
              raguRagu[num]
                ? "bg-amber-500 dark:bg-amber-600 text-white shadow-xs hover:bg-amber-600 dark:hover:bg-amber-500"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
            id="ragu-ragu-btn"
          >
            <Bookmark size={13} fill={raguRagu[num] ? "#FFF" : "none"} />
            <span>Ragu-Ragu</span>
          </button>
        )}

        {isKuis && kuisResultBadge}

        {view === "review" && (
          <span className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-mono tracking-wider">
            PEMBAHASAN
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6" id="soal-content-body">
        {/* Question Text */}
        <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold md:text-lg" id="soal-teks-wrapper">
          {renderFormattedContent(soal.soal)}
        </div>

        {/* Options / Statement Blocks */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80" id="options-interaction-wrapper">
          {soal.tipe === "benar_salah" ? (
            /* True / False Table UI */
            <div className="space-y-4" id="tf-statement-block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pernyataan Evaluasi</p>
              
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-950 text-slate-550 dark:text-slate-405 font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="col-span-8 md:col-span-9">Pernyataan</div>
                  <div className="col-span-4 md:col-span-3 text-center grid grid-cols-2">
                    <div>Benar</div>
                    <div>Salah</div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                  {soal.pernyataan?.map((st) => {
                    const ansMap = (currentAnswer as Record<string, string>) || {};
                    const selectedVal = ansMap[st.id];

                    const correctMap = (soal.jawaban as Record<string, string>) || {};
                    const correctVal = correctMap[st.id];

                    return (
                      <div key={st.id} className="grid grid-cols-12 items-center py-3.5 px-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition">
                        <div className="col-span-8 md:col-span-9 text-slate-700 dark:text-slate-300 text-sm leading-relaxed pr-3">
                          {renderFormattedContent(st.teks)}
                        </div>
                                         <div className="col-span-4 md:col-span-3 text-center grid grid-cols-2 gap-1 relative">
                          {/* Benar option button */}
                          <div>
                            <button
                              disabled={!isUjian && !(isKuis && !selectedVal)}
                              onClick={() => handleSelectStatement(st.id, "Benar")}
                              className={`w-full py-1.5 px-1 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                                selectedVal === "Benar"
                                  ? isUjian || (isKuis && !selectedVal)
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                    : correctVal === "Benar"
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-red-600 text-white border-red-600"
                                  : !isUjian && (!isKuis || selectedVal) && correctVal === "Benar"
                                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 border-dashed"
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                              id={`tf-benar-btn-${st.id}`}
                            >
                              B
                            </button>
                          </div>

                          {/* Salah option button */}
                          <div>
                            <button
                              disabled={!isUjian && !(isKuis && !selectedVal)}
                              onClick={() => handleSelectStatement(st.id, "Salah")}
                              className={`w-full py-1.5 px-1 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                                selectedVal === "Salah"
                                  ? isUjian || (isKuis && !selectedVal)
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                    : correctVal === "Salah"
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-red-600 text-white border-red-600"
                                  : !isUjian && (!isKuis || selectedVal) && correctVal === "Salah"
                                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 border-dashed"
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}
                              id={`tf-salah-btn-${st.id}`}
                            >
                              S
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Standard Multiple Choice choices */
            <div className="space-y-3.5" id="multiple-choice-block">
              {soal.pilihan &&
                Object.entries(soal.pilihan).map(([key, value]) => {
                  const isSelected = currentAnswer === key;
                  
                  // In review/kuis mode:
                  const isSecorrectOption = soal.jawaban === key;
                  const isUserSelectionIncorrect = isSelected && !isSecorrectOption;

                  // Highlighting styles
                  let optionClass = "border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300";
                  let keyBadgeClass = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-250 dark:group-hover:bg-slate-700";

                  if (isUjian || (isKuis && !hasAnswered)) {
                    if (isSelected) {
                      optionClass = "bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-550/20";
                      keyBadgeClass = "bg-indigo-600 text-white";
                    }
                  } else {
                    // Review Mode OR Kuis Mode and already answered
                    if (isSecorrectOption) {
                      optionClass = "bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-600 dark:border-emerald-550 text-emerald-950 dark:text-emerald-200";
                      keyBadgeClass = "bg-emerald-600 text-white";
                    } else if (isUserSelectionIncorrect) {
                      optionClass = "bg-red-50 dark:bg-red-950/20 border-2 border-red-500 dark:border-red-550 text-red-950 dark:text-red-200";
                      keyBadgeClass = "bg-red-500 text-white";
                    }
                  }

                  // Check if this question is SKD or has point weights
                  const subLower = soal.subtes.toLowerCase();
                  const isSKDQuestion = subLower.includes("twk") || 
                                        subLower.includes("tiu") || 
                                        subLower.includes("tkp") ||
                                        subLower.includes("wawasan") ||
                                        subLower.includes("inteligensi") ||
                                        subLower.includes("karakteristik");

                  // Retrieve point values if applicable (to expose in review/kuis)
                  const poinVal = soal.poin 
                    ? (soal.poin as Record<string, number>)[key] ?? (key === soal.jawaban ? 5 : 0)
                    : (isSKDQuestion ? (key === soal.jawaban ? 5 : 0) : null);

                  return (
                    <button
                      key={key}
                      disabled={!isUjian && !(isKuis && !hasAnswered)}
                      onClick={() => handleSelectOpsi(key)}
                      className={`w-full group text-left px-4 py-3 rounded-2xl flex items-start gap-3.5 transition duration-150 cursor-pointer ${optionClass}`}
                      id={`choice-btn-${key}`}
                    >
                      {/* Key Alphabet Badge */}
                      <span
                        className={`h-7 w-7 rounded-lg font-bold font-mono text-sm leading-none flex items-center justify-center shrink-0 transition ${keyBadgeClass}`}
                      >
                        {key}
                      </span>

                      {/* Choice Text */}
                      <span className="flex-1 text-sm md:text-base font-medium pt-0.5 leading-relaxed">
                        {renderFormattedContent(value)}
                      </span>

                      {/* TKP/SKD point weight or answer correctness check indicators in Review/Kuis Mode */}
                      {(!isUjian && !isKuis || (isKuis && hasAnswered)) && (
                        <div className="shrink-0 flex items-center gap-2 self-center">
                          {poinVal !== null && (
                            <span className="inline-flex text-[10px] md:text-xs font-bold px-2 py-1 bg-amber-50 dark:bg-amber-950/45 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 rounded-lg">
                              Poin: {poinVal}
                            </span>
                          )}
                          {isSecorrectOption && (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          )}
                          {isUserSelectionIncorrect && (
                            <XCircle size={18} className="text-red-500" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Detailed Discussion / Explanation Box (EXCLUSIVELY in 'review' mode or answered in 'kuis' mode) */}
        {showPembahasan && (
          <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs animate-in fade-in slide-in-from-bottom-3 duration-250" id="review-discussion-box">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 uppercase tracking-wide mb-3">
              <AlertCircle className="text-indigo-600 dark:text-indigo-400" size={16} />
              <span>Kunci Jawaban & Pembahasan</span>
            </h4>
            
            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-3 font-medium">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold mb-3">
                <span className="text-slate-500 dark:text-slate-400">Kunci Jawaban:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-extrabold font-mono text-sm bg-emerald-50 dark:bg-emerald-950/40 py-1 px-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  {typeof soal.jawaban === "object"
                    ? Object.entries(soal.jawaban)
                        .map(([k, v]) => `No.${k}: ${v}`)
                        .join(" | ")
                    : `PILIHAN ${soal.jawaban}`}
                </span>
              </div>

              {/* Point breakdown box for SKD / Questions with point options */}
              {soal.pilihan && (
                <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-semibold mb-3">
                  <span className="text-slate-500 dark:text-slate-400 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Bobot Poin Pilihan Jawaban:
                  </span>
                  <div className="flex flex-wrap gap-2 font-mono">
                    {Object.keys(soal.pilihan).map((optKey) => {
                      const pt = soal.poin
                        ? (soal.poin as Record<string, number>)[optKey] ?? (optKey === soal.jawaban ? 5 : 0)
                        : (optKey === soal.jawaban ? 5 : 0);
                      return (
                        <span
                          key={optKey}
                          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 text-xs ${
                            pt > 0
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 font-bold"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span>{optKey}</span> : <span className="font-extrabold">{pt.toFixed(2)}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="text-slate-650 dark:text-slate-400 pl-0.5 whitespace-pre-line text-xs md:text-sm">
                {renderFormattedContent(soal.pembahasan)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav Actions Bottom Bar */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between" id="soal-action-bar">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(currentIdx - 1)}
          className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/40 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300 transition cursor-pointer"
          id="prev-soal-btn"
        >
          <ChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
          {num} / {totalSoal}
        </span>

        <button
          disabled={currentIdx === totalSoal - 1}
          onClick={() => setCurrentIdx(currentIdx + 1)}
          className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/40 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300 transition cursor-pointer"
          id="next-soal-btn"
        >
          <span>Berikutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
