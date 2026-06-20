import React, { useState } from "react";
import { Paket } from "../types";
import { motion } from "motion/react";
import { Search, BookOpen, PlayCircle, Layers, Award, Zap } from "lucide-react";

interface TryoutListProps {
  daftarPaket: Paket[];
  onPilihPaket: (paket: Paket, mode: "ujian" | "review" | "kuis") => void;
}

export default function TryoutList({ daftarPaket, onPilihPaket }: TryoutListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"SEMUA" | "SKD" | "SNBT">("SEMUA");

  // Filtering packages
  const filteredPaket = daftarPaket.filter((paket) => {
    const matchesSearch = paket.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "SEMUA" ||
      (activeTab === "SKD" && paket.tag === "SKD") ||
      (activeTab === "SNBT" && paket.tag === "SNBT");
    return matchesSearch && matchesTab;
  });

  const containers = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6" id="tryout-list-tab-root">
      
      {/* Header and filters toolbar panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        {/* Category switcher */}
        <div className="flex gap-1 bg-slate-150 dark:bg-slate-950 rounded-xl p-1" id="tryout-category-tabs">
          {(["SEMUA", "SKD", "SNBT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 md:px-4 py-1.5 md:py-2 text-[11px] sm:text-xs md:text-sm font-bold rounded-lg transition duration-200 cursor-pointer ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
              id={`tryout-tab-btn-${tab.toLowerCase()}`}
            >
              {tab === "SEMUA" ? "Semua Paket" : tab === "SKD" ? "CAT SKD" : "CAT SNBT"}
            </button>
          ))}
        </div>

        {/* Search input field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-505" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama paket tryout..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition dark:text-slate-100"
            id="tryout-search-bar"
          />
        </div>
      </div>

      {/* Grid of exam packages */}
      {filteredPaket.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-100 dark:border-slate-800 shadow-xs space-y-3" id="tryout-empty-packet">
          <Layers className="mx-auto text-slate-300 dark:text-slate-650" size={48} />
          <h4 className="text-slate-600 dark:text-slate-300 text-lg font-bold">Paket Tidak Ditemukan</h4>
          <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
            Tidak ada tryout yang cocok dengan pencarian Anda. Tulis kata sandi atau filter yang lain.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containers}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          id="tryout-packet-grid"
        >
          {filteredPaket.map((paket, idx) => {
            const isSKD = paket.tag === "SKD";
            
            return (
              <motion.div
                variants={item}
                key={paket.nama}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col group relative"
                id={`tryout-card-${idx}`}
              >
                {/* Visual Accent Header Block */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        isSKD
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      }`}
                    >
                      {paket.tag} - CAT
                    </span>
                    
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded">
                      {isSKD ? "110 m" : "90 m"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm md:text-base text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 dark:hover:text-white dark:hover:bg-indigo-500 px-2.5 py-1 -ml-2.5 rounded-xl transition duration-150 leading-tight inline-block cursor-pointer">
                      {paket.nama}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3">
                      {isSKD
                        ? "Pembagian materi Tes Inteligensia Umum (TIU), Tes Wawasan Kebangsaan (TWK), serta Tes Karakteristik Pribadi (TKP) sesuai rilis kisi-kisi SSCPNS terbaru."
                        : "Paket rujukan SNBT dengan cakupan penalaran umum terintegrasi, literasi nalar verbal Bahasa Indonesia & Bahasa Inggris."}
                    </p>
                  </div>
                </div>

                {/* Sub-features overview bullets */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-455 dark:text-slate-400 font-semibold font-mono">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={10} /> {isSKD ? "110 Butir" : "90 Butir"} Soal
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award size={10} /> Passing Grade Ready
                  </span>
                </div>

                 {/* Card footer control triggers */}
                 <div className="p-4 bg-slate-100/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex flex-col md:flex-row gap-2 mt-auto w-full">
                   <button
                     onClick={() => onPilihPaket(paket, "review")}
                     className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100/75 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-205 dark:border-slate-700 text-[11px] font-bold transition shadow-xs cursor-pointer"
                     title="Membuka seluruh materi jawaban tanpa ikatan waktu ujian"
                     id={`tryout-btn-review-${idx}`}
                   >
                     <BookOpen size={12} />
                     <span>Pembahasan</span>
                   </button>

                   <button
                     onClick={() => onPilihPaket(paket, "kuis")}
                     className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 dark:hover:bg-amber-500/25 border border-amber-200/50 dark:border-amber-800/40 text-[11px] font-bold transition shadow-xs cursor-pointer"
                     title="Jawab soal satu per satu, langsung dapat kunci & pembahasan gratis!"
                     id={`tryout-btn-kuis-${idx}`}
                   >
                     <Zap size={12} className="fill-current" />
                     <span>Kuis Kilat</span>
                   </button>

                   <button
                     onClick={() => onPilihPaket(paket, "ujian")}
                     className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                     id={`tryout-btn-ujian-${idx}`}
                   >
                     <PlayCircle size={12} />
                     <span>Ujian Simulasi</span>
                   </button>
                 </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
