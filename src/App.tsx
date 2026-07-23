import React, { useState, useEffect, useRef } from "react";
import { Paket, Soal, ViewMode, HistoryRecord } from "./types";
import SidebarNav from "./components/SidebarNav";
import SoalCard from "./components/SoalCard";
import SidebarMenu from "./components/SidebarMenu";
import DashboardStats from "./components/DashboardStats";
import TryoutList from "./components/TryoutList";
import HistoryList from "./components/HistoryList";
import LandingPage from "./components/LandingPage";
import { FALLBACK_SKD_SOAL, FALLBACK_SNBT_SOAL } from "./fallbackData";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, CheckCircle2, Clock, RotateCcw, Home, LogOut, 
  ChevronRight, Award, AlertTriangle, ListChecks, HelpCircle, Menu, Printer,
  GraduationCap, Sun, Moon
} from "lucide-react";
import { hitungSkorIRTSubtes, hitungSkorSKD, normalizeSubtes, PARAMETER_UTBK_2026 } from "./utils/irt2026";

export default function App() {
  // Check if there is an active session in localStorage
  const activeSession = (() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("tryout_active_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.currentPaket && parsed.soalList && parsed.soalList.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Gagal meload activeSession:", e);
    }
    return null;
  })();

  // Main Navigation Views dynamically loaded from URL path
  const [view, setView] = useState<ViewMode>(() => {
    if (activeSession) {
      return "ujian";
    }
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "/ujian") return "ujian";
      if (p === "/review") return "review";
    }
    return "dashboard";
  });
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    if (activeSession) return false;
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "/dashboard" || p === "/paket-tryout" || p === "/history") {
        return false;
      }
      if (p === "/") return true;
    }
    try {
      const hasVisited = localStorage.getItem("tryout_viewer_has_visited");
      return !hasVisited;
    } catch {
      return true;
    }
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme_mode") === "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme_mode", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme_mode", "light");
    }
  }, [isDarkMode]);
  const [daftarPaket, setDaftarPaket] = useState<Paket[]>([]);
  const [currentPaket, setCurrentPaket] = useState<Paket | null>(() => {
    return activeSession ? activeSession.currentPaket : null;
  });
  const [soalList, setSoalList] = useState<Soal[]>(() => {
    return activeSession ? activeSession.soalList : [];
  });
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    return activeSession ? activeSession.currentIdx : 0;
  });
  
  // User Answers States
  const [jawabanUser, setJawabanUser] = useState<Record<number, string | Record<string, string>>>(() => {
    return activeSession ? activeSession.jawabanUser : {};
  });
  const [raguRagu, setRaguRagu] = useState<Record<number, boolean>>(() => {
    return activeSession ? activeSession.raguRagu : {};
  });
  const [isAnswerSheetOpen, setIsAnswerSheetOpen] = useState<boolean>(true);

  // Exam-Sim Timers (seconds left)
  const [timerLeft, setTimerLeft] = useState<number>(() => {
    return activeSession ? activeSession.timerLeft : 0;
  });
  const [timerInitial, setTimerInitial] = useState<number>(() => {
    return activeSession ? activeSession.timerInitial : 0;
  });
  const [isTimerActive, setIsTimerActive] = useState<boolean>(() => {
    return activeSession ? activeSession.isTimerActive : false;
  });
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // History & Statistics stored locally
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768;
    }
    return true;
  });
  // Dialog & Modal Confirmations (to avoid iframe window.confirm blocks)
  const [activeConfirmModal, setActiveConfirmModal] = useState<"selesai_ujian" | "hapus_riwayat" | "kembali_dashboard" | null>(null);

  // Intermediate Exam Result view toggler
  const [showResultSummary, setShowResultSummary] = useState<boolean>(false);
  const [sessionScore, setSessionScore] = useState<{ 
    score: number; 
    maxScore: number; 
    durationTaken: number; 
    nilaiPerSubtes?: Record<string, number>;
    totalBenar?: number;
    totalSalah?: number;
    totalKosong?: number;
    subtesBreakdownDetail?: Record<string, { score: number; maxScore: number; benar: number; salah: number; kosong: number }>;
  } | null>(null);

  const [activeMenu, setActiveMenu] = useState<"dashboard" | "tryout" | "history">(() => {
    if (activeSession) {
      if (activeSession.currentPaket?.tag === "SKD") return "tryout";
    }
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p === "/paket-tryout") return "tryout";
      if (p === "/history") return "history";
    }
    return "dashboard";
  });

  // State-to-URL synchronizer hook
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let targetPath = "/";
    if (showLanding) {
      targetPath = "/";
    } else {
      if (view === "ujian") {
        targetPath = "/ujian";
      } else if (view === "kuis") {
        targetPath = "/kuis-kilat";
      } else if (view === "review") {
        targetPath = "/review";
      } else if (view === "dashboard") {
        if (activeMenu === "dashboard") targetPath = "/dashboard";
        else if (activeMenu === "tryout") targetPath = "/paket-tryout";
        else if (activeMenu === "history") targetPath = "/history";
      }
    }
    
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  }, [showLanding, view, activeMenu]);

  // URL-to-State synchronizer hook (popstate back/forward listener)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUrlChange = () => {
      const p = window.location.pathname;
      if (p === "/" || p === "") {
        setShowLanding(true);
      } else {
        setShowLanding(false);
        if (p === "/dashboard") {
          setView("dashboard");
          setActiveMenu("dashboard");
        } else if (p === "/paket-tryout") {
          setView("dashboard");
          setActiveMenu("tryout");
        } else if (p === "/history") {
          setView("dashboard");
          setActiveMenu("history");
        } else if (p === "/ujian") {
          setView("ujian");
        } else if (p === "/kuis-kilat") {
          setView("kuis");
        } else if (p === "/review") {
          setView("review");
        }
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  // Redirect safety guard for refreshes (keeps user state sane if there's no data loaded on page reload)
  useEffect(() => {
    if (!showLanding) {
      if ((view === "ujian" || view === "kuis") && !currentPaket) {
        window.history.replaceState(null, "", "/paket-tryout");
        setView("dashboard");
        setActiveMenu("tryout");
      } else if (view === "review" && !currentPaket && !sessionScore) {
        window.history.replaceState(null, "", "/history");
        setView("dashboard");
        setActiveMenu("history");
      }
    }
  }, [view, currentPaket, showLanding, sessionScore]);

  // Auto-save active exam session to localStorage whenever answers, timer, or indicators update
  useEffect(() => {
    if (view === "ujian" && currentPaket) {
      const sessionData = {
        currentPaket,
        soalList,
        currentIdx,
        jawabanUser,
        raguRagu,
        timerLeft,
        timerInitial,
        isTimerActive,
        view
      };
      try {
        localStorage.setItem("tryout_active_session", JSON.stringify(sessionData));
      } catch (e) {
        console.error("Gagal menyimpan sesi aktif ke localStorage:", e);
      }
    }
  }, [view, currentPaket, soalList, currentIdx, jawabanUser, raguRagu, timerLeft, timerInitial, isTimerActive]);

  // Load history & list of tryouts on start
  useEffect(() => {
    // 1. Fetch available packages from public
    fetch("/daftar_paket.json")
      .then((res) => {
        if (!res.ok) throw new Error("File index JSON tidak ditemukan di public/");
        return res.json();
      })
      .then((data: string[]) => {
        const mapped = data.map((folderName) => ({
          nama: folderName,
          tag: (folderName.includes("SKD") ? "SKD" : "SNBT") as "SKD" | "SNBT",
          jsonUrl: `/hasil_sscpns/${folderName}/${folderName}.json`,
        }));
        setDaftarPaket(mapped);
      })
      .catch((err) => {
        console.warn("Menggunakan data fallback lokal karena:", err.message);
        // Fallback options
        setDaftarPaket([
          {
            nama: "CAT SKD Contoh - 2526",
            tag: "SKD",
            jsonUrl: "/hasil_sscpns/CAT SKD Contoh - 2526/CAT SKD Contoh - 2526.json",
          },
          {
            nama: "CAT SKD 01 - 2526",
            tag: "SKD",
            jsonUrl: "/hasil_sscpns/CAT SKD 01 - 2526/CAT SKD 01 - 2526.json",
          },
          {
            nama: "CAT SNBT 01 - 2526",
            tag: "SNBT",
            jsonUrl: "/hasil_sscpns/CAT SNBT 01 - 2526/CAT SNBT 01 - 2526.json",
          },
        ]);
      });

    // 2. Load learning histories
    try {
      const stored = localStorage.getItem("tryout_viewer_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Gagal meload riwayat dari localStorage:", e);
    }
  }, []);

  // Timer Countdown Controller
  useEffect(() => {
    if (view === "ujian" && isTimerActive && timerLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            // Auto submit when time runs out
            handleSelesaiUjian(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [view, isTimerActive, timerLeft]);

  // Package Selector
  const handlePilihPaket = (paket: Paket, mode: "ujian" | "review" | "kuis") => {
    fetch(paket.jsonUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal load berkas JSON.");
        return res.json();
      })
      .then((data: Soal[]) => {
        initializeSesi(data, paket, mode);
      })
      .catch((err) => {
        console.warn("Menggunakan data fallback internal dari fallbackData.ts untuk " + paket.nama);
        // Fallback database selection based on tag
        const fbData = paket.tag === "SKD" ? FALLBACK_SKD_SOAL : FALLBACK_SNBT_SOAL;
        initializeSesi(fbData, paket, mode);
      });
  };

  const initializeSesi = (data: Soal[], paket: Paket, mode: "ujian" | "review" | "kuis") => {
    setSoalList(data);
    setCurrentPaket(paket);
    setCurrentIdx(0);
    setJawabanUser({});
    setRaguRagu({});
    setShowResultSummary(false);
    setSessionScore(null);
    setIsAnswerSheetOpen(true);

    if (mode === "ujian") {
      // Set timer: SKD gets 110 minutes (6600s), SNBT gets 90 minutes (5400s)
      const testMinutes = paket.tag === "SKD" ? 110 : 90;
      const seconds = testMinutes * 60;
      setTimerLeft(seconds);
      setTimerInitial(seconds);
      setIsTimerActive(true);
    } else {
      setTimerLeft(0);
      setTimerInitial(0);
      setIsTimerActive(false);
    }

    setView(mode);
  };

  // Unified Score & Subtest Evaluator (Combines SKD direct weighting and 2026 IRT curve scaling)
  const hitungHasilEvaluasi = (
    specificSoalList: Soal[],
    specificAnswers: Record<number, string | Record<string, string>>,
    tag: "SKD" | "SNBT"
  ) => {
    // 1. Calculate the subtest detail statistics (benar, salah, kosong)
    const breakdownDetail: Record<string, { score: number; maxScore: number; benar: number; salah: number; kosong: number }> = {};
    let totalBenar = 0;
    let totalSalah = 0;
    let totalKosong = 0;

    specificSoalList.forEach((soal) => {
      // Group category names consistently
      let category = soal.subtes;
      const subL = category.toLowerCase();
      if (subL.includes("inteligensi") || subL.includes("tiu")) {
        category = "Tes Inteligensi Umum (TIU)";
      } else if (subL.includes("karakteristik") || subL.includes("tkp")) {
        category = "Tes Karakteristik Pribadi (TKP)";
      } else if (subL.includes("wawasan") || subL.includes("twk")) {
        category = "Tes Wawasan Kebangsaan (TWK)";
      }

      if (!breakdownDetail[category]) {
        breakdownDetail[category] = { score: 0, maxScore: 0, benar: 0, salah: 0, kosong: 0 };
      }

      const ans = specificAnswers[soal.nomor];

      if (!ans || ans === "") {
        breakdownDetail[category].kosong++;
        totalKosong++;
      } else if (soal.tipe === "benar_salah" && soal.pernyataan) {
        const totalStatements = soal.pernyataan.length;
        const correctAnswersCount = soal.pernyataan.filter((p) => {
          const uAns = (ans as Record<string, string>)?.[p.id];
          const kAns = (soal.jawaban as Record<string, string>)?.[p.id];
          return uAns === kAns;
        }).length;
        
        if (correctAnswersCount === totalStatements) {
          breakdownDetail[category].benar++;
          totalBenar++;
        } else {
          breakdownDetail[category].salah++;
          totalSalah++;
        }
      } else if (subL.includes("karakteristik") || subL.includes("tkp")) {
        // TKP has custom points (any selected is 1-5)
        let earned = 0;
        if (soal.poin) {
          if (typeof ans === "string") {
            earned = soal.poin[ans] || 0;
          }
        } else {
          if (typeof ans === "string" && ans === soal.jawaban) {
            earned = 5;
          } else {
            earned = 0;
          }
        }
        if (earned === 5) {
          breakdownDetail[category].benar++;
          totalBenar++;
        } else {
          breakdownDetail[category].salah++;
          totalSalah++;
        }
      } else {
        // Multi choice standard (TIU/TWK/SNBT)
        if (typeof ans === "string" && ans === soal.jawaban) {
          breakdownDetail[category].benar++;
          totalBenar++;
        } else {
          breakdownDetail[category].salah++;
          totalSalah++;
        }
      }
    });

    let finalScore = 0;
    let finalMaxScore = 0;
    let nilaiPerSubtes: Record<string, number> = {};

    if (tag === "SKD") {
      const { score, maxScore, subtesBreakdown } = hitungSkorSKD(specificSoalList, specificAnswers);
      finalScore = score;
      finalMaxScore = maxScore;
      Object.entries(subtesBreakdown).forEach(([name, data]) => {
        nilaiPerSubtes[name] = data.score;
        if (breakdownDetail[name]) {
          breakdownDetail[name].score = data.score;
          breakdownDetail[name].maxScore = data.maxScore;
        }
      });
    } else {
      // SNBT mode - IRT curves on 2026 official parameters
      const uniqueSubtests = Array.from(new Set(specificSoalList.map(s => s.subtes)));
      let sumOfScores = 0;
      let sumOfMax = 0;
      let count = 0;

      uniqueSubtests.forEach((subName) => {
        const normed = normalizeSubtes(subName);
        const { score, max } = hitungSkorIRTSubtes(normed, specificSoalList, specificAnswers);
        nilaiPerSubtes[subName] = score;
        sumOfScores += score;
        sumOfMax += max;
        count++;

        if (breakdownDetail[subName]) {
          breakdownDetail[subName].score = score;
          breakdownDetail[subName].maxScore = max;
        }
      });

      finalScore = count > 0 ? Math.round(sumOfScores / count) : 500;
      finalMaxScore = count > 0 ? Math.round(sumOfMax / count) : 1000;
    }

    return {
      score: finalScore,
      maxScore: finalMaxScore,
      nilaiPerSubtes,
      totalBenar,
      totalSalah,
      totalKosong,
      subtesBreakdownDetail: breakdownDetail
    };
  };

  const hitungHasilHasil = () => {
    return hitungHasilEvaluasi(soalList, jawabanUser, currentPaket?.tag || "SKD");
  };

  const hitungHasilHasilManual = (specificSoalList: Soal[], specificAnswers: Record<number, string | Record<string, string>>) => {
    return hitungHasilEvaluasi(specificSoalList, specificAnswers, currentPaket?.tag || "SKD");
  };

  // Function to load and review a past corrected run from History Sidebar
  const handleMuatUlangHistory = (record: HistoryRecord) => {
    const matchingPaket = daftarPaket.find(p => p.nama === record.paketNama) || {
      nama: record.paketNama,
      tag: record.tag,
      jsonUrl: record.jsonUrl || `/hasil_sscpns/${record.paketNama}/${record.paketNama}.json`
    };

    fetch(matchingPaket.jsonUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat berkas JSON.");
        return res.json();
      })
      .then((data: Soal[]) => {
        setSoalList(data);
        setCurrentPaket(matchingPaket);
        setCurrentIdx(0);
        setJawabanUser(record.answers);
        setRaguRagu({});
        
        setIsTimerActive(false);
        setTimerLeft(0);
        setTimerInitial(0);

        const { score, maxScore, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail } = hitungHasilHasilManual(data, record.answers);
        setSessionScore({ 
          score: record.score, 
          maxScore: record.maxScore, 
          durationTaken: record.duration, 
          nilaiPerSubtes: record.nilaiPerSubtes || nilaiPerSubtes,
          totalBenar: record.totalBenar !== undefined ? record.totalBenar : totalBenar,
          totalSalah: record.totalSalah !== undefined ? record.totalSalah : totalSalah,
          totalKosong: record.totalKosong !== undefined ? record.totalKosong : totalKosong,
          subtesBreakdownDetail: record.subtesBreakdownDetail || subtesBreakdownDetail
        });
        
        setShowResultSummary(true);
        setView("review");
        setIsLeftSidebarOpen(false);
      })
      .catch((err) => {
        console.warn("Menggunakan data fallback internal untuk me-review hasil lama:", err.message);
        const fbData = record.tag === "SKD" ? FALLBACK_SKD_SOAL : FALLBACK_SNBT_SOAL;
        
        setSoalList(fbData);
        setCurrentPaket(matchingPaket);
        setCurrentIdx(0);
        setJawabanUser(record.answers);
        setRaguRagu({});
        
        setIsTimerActive(false);
        setTimerLeft(0);
        setTimerInitial(0);

        const { score, maxScore, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail } = hitungHasilHasilManual(fbData, record.answers);
        setSessionScore({ 
          score: record.score, 
          maxScore: record.maxScore, 
          durationTaken: record.duration, 
          nilaiPerSubtes: record.nilaiPerSubtes || nilaiPerSubtes,
          totalBenar: record.totalBenar !== undefined ? record.totalBenar : totalBenar,
          totalSalah: record.totalSalah !== undefined ? record.totalSalah : totalSalah,
          totalKosong: record.totalKosong !== undefined ? record.totalKosong : totalKosong,
          subtesBreakdownDetail: record.subtesBreakdownDetail || subtesBreakdownDetail
        });
        
        setShowResultSummary(true);
        setView("review");
        setIsLeftSidebarOpen(false);
      });
  };

  // Submit Simulated Exam Handles
  const handleSelesaiUjian = (isTimeExpiration = false, forceConfirm = false) => {
    if (!isTimeExpiration && !forceConfirm) {
      setActiveConfirmModal("selesai_ujian");
      return;
    }

    setActiveConfirmModal(null);
    setIsTimerActive(false);

    // Calculate score
    const durationTaken = timerInitial - timerLeft;
    const { score, maxScore, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail } = hitungHasilHasil();

    // Store in history
    const newRecord: HistoryRecord = {
      paketNama: currentPaket?.nama || "Paket Ujian",
      tag: currentPaket?.tag || "SKD",
      timestamp: new Date().toISOString(),
      score,
      maxScore,
      answers: jawabanUser,
      duration: durationTaken,
      jsonUrl: currentPaket?.jsonUrl,
      nilaiPerSubtes,
      totalBenar,
      totalSalah,
      totalKosong,
      subtesBreakdownDetail,
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    try {
      localStorage.setItem("tryout_viewer_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Gagal menyimpan riwayat ke localStorage:", e);
    }

    setSessionScore({ score, maxScore, durationTaken, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail });
    setShowResultSummary(true);
    setView("review");
    
    try {
      localStorage.removeItem("tryout_active_session");
    } catch (e) {
      console.error("Gagal menghapus active session:", e);
    }
  };

  // Clear History
  const handleClearHistory = (forceConfirm = false) => {
    if (!forceConfirm) {
      setActiveConfirmModal("hapus_riwayat");
      return;
    }
    setActiveConfirmModal(null);
    setHistory([]);
    try {
      localStorage.removeItem("tryout_viewer_history");
    } catch (e) {
      console.error("Gagal menghapus riwayat dari localStorage:", e);
    }
  };

  // Timer format renderer: HH:MM:SS or MM:SS
  const renderTimeLeft = () => {
    const hrs = Math.floor(timerLeft / 3600);
    const mins = Math.floor((timerLeft % 3600) / 60);
    const secs = timerLeft % 60;

    const pad = (n: number) => String(n).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Formats seconds into simple readable string
  const formatTakenDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    if (mins > 0) return `${mins} Menit ${s} Detik`;
    return `${s} Detik`;
  };

  // Color variables for subtest categorizations
  const getSubtesPercentage = (subName: string) => {
    let earned = 0;
    let max = 0;

    soalList.forEach((soal) => {
      if (soal.subtes !== subName) return;
      const idx = soal.nomor;
      const ans = jawabanUser[idx];

      if (soal.poin) {
        const optionPoints = Object.values(soal.poin) as number[];
        const maxPointsInThisQuestion = Math.max(...optionPoints);
        max += maxPointsInThisQuestion;
        if (ans && typeof ans === "string") earned += soal.poin[ans] || 0;
      } else if (soal.tipe === "benar_salah" && soal.pernyataan) {
        const totalStatements = soal.pernyataan.length;
        const correctAnswersCount = soal.pernyataan.filter((p) => {
          const uAns = (ans as Record<string, string>)?.[p.id];
          const kAns = (soal.jawaban as Record<string, string>)?.[p.id];
          return uAns === kAns;
        }).length;
        const proportionalScore = totalStatements > 0 ? (correctAnswersCount / totalStatements) * 5 : 0;
        earned += proportionalScore;
        max += 5;
      } else {
        max += 5;
        if (ans && ans === soal.jawaban) earned += 5;
      }
    });

    if (max === 0) return 0;
    return Math.round((earned / max) * 100);
  };

  const subtesNames = Array.from(new Set(soalList.map((s) => s.subtes))) as string[];

  if (showLanding) {
    return (
      <LandingPage 
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onStart={() => {
          try {
            localStorage.setItem("tryout_viewer_has_visited", "true");
          } catch (e) {
            console.error(e);
          }
          setShowLanding(false);
          setActiveMenu("tryout");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col md:flex-row selection:bg-indigo-150 transition-colors duration-200 relative">
      
      {/* Ambient Glow Abstract Aurora Dots */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500/8 dark:bg-indigo-550/4 blur-3xl pointer-events-none animate-float-slow no-print"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-violet-500/8 dark:bg-violet-550/3 blur-3xl pointer-events-none animate-float-slow no-print" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-pink-500/6 dark:bg-pink-550/3 blur-3xl pointer-events-none animate-float-slow no-print" style={{ animationDelay: "4s" }}></div>

      {/* 1. SIDEBAR MENU KIRI - Shown only when not inside exam room */}
      {view === "dashboard" && (
        <SidebarMenu
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isOpen={isLeftSidebarOpen}
          setIsOpen={setIsLeftSidebarOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}

      {/* 2. CORE VIEW WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-hidden" id="main-lms-body-frame">
        
        {/* Top Header navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs no-print" id="main-navigation-header">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 overflow-hidden">
            
            {/* Left side: branding/back action */}
            <div className="flex items-center gap-2">
              <div 
                onClick={() => {
                  if (view !== "dashboard" && view !== "review") {
                    setActiveConfirmModal("kembali_dashboard");
                  } else {
                    setView("dashboard");
                    setActiveMenu("dashboard");
                  }
                }}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 select-none group"
                id="brand-logo-trigger"
              >
                <div className="p-1.5 rounded-xl text-white bg-indigo-600 transition duration-200 group-hover:scale-105">
                  <GraduationCap size={16} />
                </div>
              </div>

              {view === "review" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-450 px-2 py-0.5 rounded-md">
                  Reviu
                </span>
              )}
              {view === "ujian" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-450 px-2.5 py-0.5 rounded-md">
                  Ujian
                </span>
              )}
              {view === "kuis" && (
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-md flex items-center gap-0.5 font-mono">
                  ⚡ Kuis
                </span>
              )}
            </div>

            {/* Middle: active timer for exam mode on mobile */}
            {view === "ujian" && (
              <div className="flex items-center gap-1" id="exam-timer-indicator">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all ${
                    timerLeft < 300
                      ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Clock size={11} className={timerLeft < 300 ? "text-red-500 animate-pulse" : "text-slate-400"} />
                  <span>{renderTimeLeft()}</span>
                </div>
              </div>
            )}

            {/* Right side: custom elements, dark mode toggle, then hamburger */}
            <div className="flex items-center gap-2">
              
              {/* Optional exam actions inside header if relevant */}
              {view === "ujian" && (
                <button
                  onClick={() => handleSelesaiUjian(false)}
                  className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
                  id="top-finish-exam-btn"
                >
                  Selesai
                </button>
              )}

              {/* Optional kuis actions inside header if relevant */}
              {view === "kuis" && (
                <button
                  onClick={() => {
                    const { score, maxScore, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail } = hitungHasilHasil();
                    setSessionScore({ score, maxScore, durationTaken: 0, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail });
                    setShowResultSummary(true);
                    setView("review");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
                  id="top-finish-kuis-btn-mobile"
                >
                  Selesai
                </button>
              )}

              {/* Optional review exit button */}
              {view === "review" && (
                <button
                  onClick={() => {
                    setView("dashboard");
                    setActiveMenu("dashboard");
                  }}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold py-1.5 px-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                  id="top-back-dashboard-btn"
                >
                  <Home size={11} />
                  <span>Keluar</span>
                </button>
              )}

              {/* Theme Switcher - situated to the left of the hamburger */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
              >
                {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
              </button>

              {/* Hamburger Button on the far right (Only in dashboard view) */}
              {view === "dashboard" && (
                <button
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  title="Menu Utama"
                  id="sidebar-ham-menu-toggle"
                >
                  <Menu size={18} />
                </button>
              )}

            </div>
          </div>
        </header>

      {/* Main layout container with Left sidebar and main page body */}
      <div className="flex-1 flex relative min-w-0 md:h-full md:overflow-hidden" id="layout-sidebar-main-wrapper">

        {/* Main Content Area */}
        <main 
          className={`flex-1 flex flex-col min-w-0 relative md:h-full ${
            (view === "ujian" || view === "review" || view === "kuis") && !showResultSummary ? "md:overflow-hidden" : "md:overflow-y-auto"
          }`} 
          id="main-content-body"
        >

          <AnimatePresence mode="wait">
          
          {/* VIEW: DASHBOARD TABLE LOBBY WITH COHESIVE SYSTEM MODULES */}
          {view === "dashboard" && (
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="w-full flex-1"
            >
              {activeMenu === "dashboard" && (
                <DashboardStats
                  historyList={history}
                  onNavigateToTryouts={() => setActiveMenu("tryout")}
                />
              )}
              {activeMenu === "tryout" && (
                <TryoutList
                  daftarPaket={daftarPaket}
                  onPilihPaket={handlePilihPaket}
                />
              )}
              {activeMenu === "history" && (
                <HistoryList
                  historyList={history}
                  onPilihHistory={handleMuatUlangHistory}
                  onClearAllHistory={() => handleClearHistory(false)}
                  onNavigateToTryouts={() => setActiveMenu("tryout")}
                />
              )}
            </motion.div>
          )}

          {/* VIEW: EXAM ROOM / REVIEW MODE */}
          {(view === "ujian" || view === "review" || view === "kuis") && !showResultSummary && (
            <motion.div
              key="workspace-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col md:flex-row h-full md:h-screen md:overflow-hidden"
            >
              {/* Sidebar Navigator Grid */}
              <SidebarNav
                soalList={soalList}
                currentIdx={currentIdx}
                setCurrentIdx={setCurrentIdx}
                jawabanUser={jawabanUser}
                raguRagu={raguRagu}
                view={view}
                isOpen={isAnswerSheetOpen}
                onToggle={() => setIsAnswerSheetOpen(!isAnswerSheetOpen)}
              />

              {/* Main Active Question Frame */}
              <div className="flex-1 p-4 md:p-8 lg:p-10 bg-slate-50 dark:bg-slate-950 flex flex-col md:h-full md:overflow-y-auto" id="workspace-main-panel">
                <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                  
                  {/* Premium Desktop Controller Bar for Exam Mode (MD screen & up only) */}
                  {view === "ujian" && (
                    <div className="hidden md:flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800" id="desktop-exam-bar">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsAnswerSheetOpen(!isAnswerSheetOpen)}
                          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-550 rounded-lg text-indigo-650 dark:text-indigo-400 shadow-xs cursor-pointer transition flex items-center justify-center mr-1"
                          title="Buka / Tutup Status Lembar Jawaban"
                          id="btn-toggle-answeroff-exam"
                        >
                          <Menu size={15} />
                        </button>
                        <span className="font-sans font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">
                          Sesi Ujian CAT
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-base font-bold transition-all ${
                            timerLeft < 300
                              ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40 text-red-600"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 animate-none"
                          }`}
                        >
                          <Clock size={16} className={timerLeft < 300 ? "text-red-500 animate-pulse" : "text-slate-400"} />
                          <span>{renderTimeLeft()}</span>
                        </div>
                        
                        <button
                          onClick={() => handleSelesaiUjian(false)}
                          className="bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition hover:scale-101 cursor-pointer whitespace-nowrap"
                          id="desktop-top-finish-exam-btn"
                        >
                          Selesai Ujian
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Premium Desktop Controller Bar for Kuis Mode (MD screen & up only) */}
                  {view === "kuis" && (
                    <div className="hidden md:flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800" id="desktop-kuis-bar">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsAnswerSheetOpen(!isAnswerSheetOpen)}
                          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-550 rounded-lg text-indigo-650 dark:text-indigo-400 shadow-xs cursor-pointer transition flex items-center justify-center mr-1"
                          title="Buka / Tutup Status Lembar Jawaban"
                          id="btn-toggle-answeroff-kuis"
                        >
                          <Menu size={15} />
                        </button>
                        <span className="font-sans font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold">⚡</span> Kuis Kilat Interaktif
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const { score, maxScore, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail } = hitungHasilHasil();
                            setSessionScore({ score, maxScore, durationTaken: 0, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail });
                            setShowResultSummary(true);
                            setView("review");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold py-2.5 px-4 rounded-xl shadow-xs transition hover:scale-[1.01] cursor-pointer whitespace-nowrap"
                          id="desktop-top-finish-kuis-btn"
                        >
                          Selesai & Lihat Hasil
                        </button>
                        <button
                          onClick={() => {
                            setView("dashboard");
                            setActiveMenu("dashboard");
                          }}
                          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold py-2.5 px-4 rounded-xl text-slate-755 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                          id="desktop-top-exit-kuis-btn"
                        >
                          <Home size={14} />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Premium Desktop Controller Bar for Review Mode (MD screen & up only) */}
                  {view === "review" && (
                    <div className="hidden md:flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800" id="desktop-review-bar">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsAnswerSheetOpen(!isAnswerSheetOpen)}
                          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-550 rounded-lg text-indigo-655 dark:text-indigo-400 shadow-xs cursor-pointer transition flex items-center justify-center mr-1"
                          title="Buka / Tutup Status Lembar Jawaban"
                          id="btn-toggle-answeroff-review"
                        >
                          <Menu size={15} />
                        </button>
                        <span className="font-sans font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">
                          Pembahasan Soal
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setView("dashboard");
                          setActiveMenu("dashboard");
                        }}
                        className="inline-flex items-center gap-2 text-xs md:text-sm font-bold py-2.5 px-4 rounded-xl text-slate-755 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                        id="desktop-top-back-dashboard-btn"
                      >
                        <Home size={14} />
                        <span>Keluar Pembahasan</span>
                      </button>
                    </div>
                  )}

                  {/* Top quick navigation helpers */}
                  <div className="mb-4 flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {currentPaket?.nama}
                    </span>
                    {view === "review" && (
                      <button
                        onClick={() => {
                          // Quick check of scores
                          const { score, maxScore, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail } = hitungHasilHasil();
                          setSessionScore({ score, maxScore, durationTaken: 0, nilaiPerSubtes, totalBenar, totalSalah, totalKosong, subtesBreakdownDetail });
                          setShowResultSummary(true);
                        }}
                        className="text-xs font-bold text-indigo-650 hover:text-indigo-850 flex items-center gap-1 hover:underline text-indigo-600 font-medium cursor-pointer"
                        id="review-show-summary-btn"
                      >
                        <Award size={13} /> Lihat Ringkasan Skor
                      </button>
                    )}
                  </div>

                  <SoalCard
                    soal={soalList[currentIdx]}
                    currentIdx={currentIdx}
                    totalSoal={soalList.length}
                    setCurrentIdx={setCurrentIdx}
                    jawabanUser={jawabanUser}
                    setJawabanUser={setJawabanUser}
                    raguRagu={raguRagu}
                    setRaguRagu={setRaguRagu}
                    view={view}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: RICH SCORE RESULTS & SUMMARY OUTCOME SCREEN */}
          {(view === "review" && showResultSummary && sessionScore) && (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-3xl mx-auto px-4 py-10 w-full"
              id="exam-result-board"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden p-6 md:p-10 space-y-8">
                {/* Result header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex h-16 w-16 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl items-center justify-center mx-auto shadow-xs">
                    <Award size={36} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Ujian Simulasi Selesai!</h2>
                    <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-medium mt-1 uppercase tracking-wider font-mono">
                      {currentPaket?.nama}
                    </p>
                  </div>
                </div>

                {/* Score badge summary row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Skor Diperoleh</p>
                    <p className="text-3xl font-black text-indigo-700 dark:text-indigo-400 font-mono leading-none">
                      {sessionScore.score}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 font-mono mt-1">dari maksimal {sessionScore.maxScore}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Akurasi Jawaban</p>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">
                      {sessionScore.maxScore > 0 ? Math.round((sessionScore.score / sessionScore.maxScore) * 100) : 0}%
                    </p>
                    <p className="text-[11px] text-emerald-650 dark:text-emerald-500/80 font-semibold mt-1 font-mono">Simulasi Penilaian CAT</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">Waktu Dihabiskan</p>
                    <p className="text-lg md:text-xl font-extrabold text-slate-700 dark:text-slate-205 leading-none h-7 flex items-center justify-center">
                      {sessionScore.durationTaken > 0 ? formatTakenDuration(sessionScore.durationTaken) : "Direct Review"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 font-mono">Sisa waktu ujian dinonaktifkan</p>
                  </div>
                </div>

                {/* Rekapitulasi Jawaban (Keseluruhan) */}
                {(() => {
                  let calculatedB = 0;
                  let calculatedS = 0;
                  let calculatedK = 0;

                  subtesNames.forEach((name) => {
                    const detail = sessionScore.subtesBreakdownDetail?.[name] || (() => {
                      let b = 0, s = 0, k = 0;
                      soalList.forEach(soal => {
                        if (soal.subtes !== name) return;
                        const ans = jawabanUser[soal.nomor];
                        if (!ans) k++;
                        else if (soal.tipe === "benar_salah" && soal.pernyataan) {
                          const correctStatements = soal.pernyataan.filter(p => (ans as Record<string, string>)?.[p.id] === (soal.jawaban as Record<string, string>)?.[p.id]).length;
                          if (correctStatements === soal.pernyataan.length) b++;
                          else s++;
                        } else if (name.toLowerCase().includes("karakteristik") || name.toLowerCase().includes("tkp")) {
                          let earned = 0;
                          if (soal.poin && typeof ans === "string") earned = soal.poin[ans] || 0;
                          if (earned === 5) b++;
                          else s++;
                        } else {
                          if (ans === soal.jawaban) b++;
                          else s++;
                        }
                      });
                      return { score: 0, maxScore: 0, benar: b, salah: s, kosong: k };
                    })();
                    calculatedB += detail.benar;
                    calculatedS += detail.salah;
                    calculatedK += detail.kosong;
                  });

                  const totalB = sessionScore.totalBenar !== undefined ? sessionScore.totalBenar : calculatedB;
                  const totalS = sessionScore.totalSalah !== undefined ? sessionScore.totalSalah : calculatedS;
                  const totalK = sessionScore.totalKosong !== undefined ? sessionScore.totalKosong : calculatedK;

                  return (
                    <div className="bg-slate-50 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl space-y-3.5" id="overall-recap-board">
                      <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <span>⚙️ Rekapitulasi Pengerjaan Soal (Keseluruhan)</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-500/5 dark:bg-emerald-555/5 p-4 rounded-2xl border border-emerald-500/10 dark:border-emerald-450/10 text-center">
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Benar</p>
                          <p className="text-2xl md:text-3xl font-black text-emerald-700 dark:text-emerald-450 font-mono mt-1">
                            {totalB} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 font-sans">soal</span>
                          </p>
                        </div>
                        <div className="bg-red-500/5 dark:bg-red-555/5 p-4 rounded-2xl border border-red-500/10 dark:border-red-450/10 text-center">
                          <p className="text-[10px] text-red-650 dark:text-red-400 font-extrabold uppercase tracking-widest font-mono">Salah</p>
                          <p className="text-2xl md:text-3xl font-black text-red-700 dark:text-red-450 font-mono mt-1">
                            {totalS} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 font-sans">soal</span>
                          </p>
                        </div>
                        <div className="bg-slate-400/5 dark:bg-slate-500/5 p-4 rounded-2xl border border-slate-350/10 dark:border-slate-700/15 text-center">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest font-mono">Kosong</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-700 dark:text-slate-300 font-mono mt-1">
                            {totalK} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 font-sans">soal</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Performance breakdowns list per sub-test */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-805 dark:text-slate-255 text-sm flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">
                    <ListChecks className="text-indigo-600 dark:text-indigo-400" size={16} />
                    <span>Performa Analisis Sub-Materi</span>
                  </h3>

                  <div className="space-y-3.5">
                    {subtesNames.map((name) => {
                      const perc = getSubtesPercentage(name);
                      let barColor = "bg-indigo-600 dark:bg-indigo-555";
                      let textColor = "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40";

                      if (perc < 50) {
                        barColor = "bg-red-500";
                        textColor = "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40";
                      } else if (perc >= 80) {
                        barColor = "bg-emerald-600";
                        textColor = "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-indigo-950/40";
                      }

                      // Fetch subtest breakdown stats
                      const subDetail = sessionScore.subtesBreakdownDetail?.[name] || (() => {
                        let b = 0, s = 0, k = 0;
                        soalList.forEach(soal => {
                          if (soal.subtes !== name) return;
                          const ans = jawabanUser[soal.nomor];
                          if (!ans) k++;
                          else if (soal.tipe === "benar_salah" && soal.pernyataan) {
                            const correctStatements = soal.pernyataan.filter(p => (ans as Record<string, string>)?.[p.id] === (soal.jawaban as Record<string, string>)?.[p.id]).length;
                            if (correctStatements === soal.pernyataan.length) b++;
                            else s++;
                          } else if (name.toLowerCase().includes("karakteristik") || name.toLowerCase().includes("tkp")) {
                            let earned = 0;
                            if (soal.poin && typeof ans === "string") earned = soal.poin[ans] || 0;
                            if (earned === 5) b++;
                            else s++;
                          } else {
                            if (ans === soal.jawaban) b++;
                            else s++;
                          }
                        });
                        return { score: 0, maxScore: 0, benar: b, salah: s, kosong: k };
                      })();

                      return (
                        <div key={name} className="space-y-2.5 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-950/40 transition">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                            <span className="font-extrabold text-xs md:text-sm text-slate-755 dark:text-slate-200">{name}</span>
                            <span className={`font-mono text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-md self-start sm:self-auto ${textColor}`}>
                              {currentPaket?.tag === "SNBT" 
                                ? `Skor IRT: ${sessionScore.nilaiPerSubtes?.[name] || 500} [${perc}% Benar]` 
                                : `Skor: ${sessionScore.nilaiPerSubtes?.[name] || 0} [${perc}% Benar]`}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${perc}%` }}
                            ></div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-0.5" id={`subtest-detail-indicators-${name}`}>
                            <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold text-emerald-650 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-100/10">
                              🟢 Benar: {subDetail.benar}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold text-red-650 bg-red-50 dark:text-red-400 dark:bg-red-950/30 px-2 py-0.5 rounded-lg border border-red-100/10">
                              🔴 Salah/Kurang: {subDetail.salah}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50 px-2 py-0.5 rounded-lg border border-slate-200/10">
                              ⚪ Kosong: {subDetail.kosong}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick actions triggers */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 no-print">
                  <button
                    onClick={() => setView("dashboard")}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-705 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition cursor-pointer"
                    id="finish-back-dashboard-btn"
                  >
                    <Home size={15} />
                    <span>Lobi</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition cursor-pointer"
                    id="finish-print-pdf-btn"
                  >
                    <Printer size={15} />
                    <span>Cetak PDF</span>
                  </button>

                  <button
                    onClick={() => setShowResultSummary(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                    id="finish-review-qa-btn"
                  >
                    <FileText size={15} />
                    <span>Bahas Soal</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  </div>

      {/* Premium Custom Animated Confirmation Modals Container */}
      <AnimatePresence>
        {activeConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            id="confirmation-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl text-center space-y-5"
              id="confirmation-modal-card"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400" />
              </div>

              {activeConfirmModal === "selesai_ujian" && (
                <>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Selesaikan Ujian Sekarang?
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Apakah Anda yakin ingin menyelesaikan simulasi ujian ini? Seluruh jawaban Anda akan langsung divalidasi dan dikunci.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setActiveConfirmModal(null)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-xs md:text-sm font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleSelesaiUjian(false, true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer text-xs md:text-sm font-bold"
                    >
                      Ya, Selesaikan
                    </button>
                  </div>
                </>
              )}

              {activeConfirmModal === "hapus_riwayat" && (
                <>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Hapus Semua Riwayat?
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Tindakan ini akan menghapus seluruh catatan nilai latihan Anda dari penyimpanan sistem lokal. Langkah ini tidak dapat dibatalkan.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setActiveConfirmModal(null)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-xs md:text-sm font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleClearHistory(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-red-650 hover:bg-red-700 text-white shadow-xs transition cursor-pointer text-xs md:text-sm font-bold bg-red-600"
                    >
                      Hapus Permanen
                    </button>
                  </div>
                </>
              )}

              {activeConfirmModal === "kembali_dashboard" && (
                <>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      Tinggalkan Simulasi Ujian?
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Kembali ke dashboard lobi akan membatalkan sesi ujian Anda saat ini secara langsung, dan progres pengisian tidak akan disimpan.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setActiveConfirmModal(null)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-xs md:text-sm font-semibold"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        setActiveConfirmModal(null);
                        setView("dashboard");
                        try {
                          localStorage.removeItem("tryout_active_session");
                        } catch (e) {
                          console.error("Gagal menghapus active session:", e);
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition cursor-pointer text-xs md:text-sm font-bold"
                    >
                      Tinggalkan
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
