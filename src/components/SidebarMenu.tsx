import React, { useState, useEffect } from "react";
import { LayoutDashboard, BookOpen, Clock, X, GraduationCap, Sun, Moon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarMenuProps {
  activeMenu: "dashboard" | "tryout" | "history";
  setActiveMenu: (menu: "dashboard" | "tryout" | "history") => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export default function SidebarMenu({
  activeMenu,
  setActiveMenu,
  isOpen,
  setIsOpen,
  isDarkMode,
  setIsDarkMode,
}: SidebarMenuProps) {
  const menus = [
    { id: "dashboard" as const, label: "Statistik Dashboard", icon: LayoutDashboard, color: "text-indigo-500" },
    { id: "tryout" as const, label: "Daftar Paket Tryout", icon: BookOpen, color: "text-emerald-500" },
    { id: "history" as const, label: "Riwayat Reviu", icon: Clock, color: "text-amber-500" },
  ];

  const [countdownTarget, setCountdownTarget] = useState<"kedinasan" | "utbk">("utbk");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targets = {
      kedinasan: new Date("2026-07-20T08:00:00").getTime(),
      utbk: new Date("2027-05-17T08:00:00").getTime(),
    };

    const updateTimer = () => {
      const now = new Date().getTime();
      const targetDate = targets[countdownTarget];
      const difference = targetDate - now;

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
            id="mobile-menu-overlay"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Panel container */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-slate-900 text-slate-305 z-50 flex flex-col justify-between
          transition-all duration-300 ease-in-out cursor-default shrink-0 overflow-y-auto scrollbar-none
          ${isOpen 
            ? "w-64 p-5 border-r border-slate-800 opacity-100 translate-x-0" 
            : "w-0 p-0 border-r-0 opacity-0 -translate-x-full md:translate-x-0 md:opacity-0 md:w-0 overflow-hidden"
          }
        `}
        id="app-sidebar-menu-panel"
      >
        <div className="space-y-6 flex flex-col flex-1">
          {/* Logo Brand / Identification header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/65">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <GraduationCap size={20} />
              </div>
              <div className="leading-none">
                <h2 className="text-base font-extrabold text-white tracking-wide">CAT Viewer</h2>
                <span className="text-[10px] text-slate-400 font-mono">v1.2 • Premium</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 hover:bg-slate-850 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
                title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
              >
                {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                id="sidebar-desktop-close-btn"
                title="Tutup Sidebar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Countdown & Mode Selector Widget FIRST - PLACED ABOVE MAIN MENU */}
          <div className="bg-slate-800/30 border border-slate-800/70 p-4 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
                  Countdown Target
                </span>
              </div>

              {/* Selector Switch Pill */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg text-[8px] font-bold border border-slate-850">
                <button
                  onClick={() => setCountdownTarget("kedinasan")}
                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    countdownTarget === "kedinasan"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Kedinasan 2026
                </button>
                <button
                  onClick={() => setCountdownTarget("utbk")}
                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                    countdownTarget === "utbk"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  UTBK 2027
                </button>
              </div>
            </div>

            {/* Timers Grid */}
            <div className="grid grid-cols-4 gap-1 text-center">
              <div className="bg-slate-950/70 rounded-lg py-1.5 px-0.5 border border-slate-800/50">
                <span className="block text-sm font-black text-indigo-400 font-mono leading-none">{timeLeft.days}</span>
                <span className="text-[7.5px] font-bold text-slate-500">Hari</span>
              </div>
              <div className="bg-slate-950/70 rounded-lg py-1.5 px-0.5 border border-slate-800/50">
                <span className="block text-sm font-black text-indigo-400 font-mono leading-none">{timeLeft.hours}</span>
                <span className="text-[7.5px] font-bold text-slate-500">Jam</span>
              </div>
              <div className="bg-slate-950/70 rounded-lg py-1.5 px-0.5 border border-slate-800/50">
                <span className="block text-sm font-black text-indigo-400 font-mono leading-none">{timeLeft.minutes}</span>
                <span className="text-[7.5px] font-bold text-slate-500">Min</span>
              </div>
              <div className="bg-slate-950/70 rounded-lg py-1.5 px-0.5 border border-slate-800/50 animate-pulse">
                <span className="block text-sm font-black text-rose-400 font-mono leading-none">{timeLeft.seconds}</span>
                <span className="text-[7.5px] font-bold text-slate-500">Det</span>
              </div>
            </div>

            <p className="text-[8px] text-center text-slate-500 font-semibold leading-tight">
              Target: {countdownTarget === "kedinasan" ? "Senin, 20 Juli 2026" : "Senin, 17 Mei 2027"}
            </p>
          </div>

          {/* Navigation Links and Tabs */}
          <nav className="flex-1 space-y-2">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2 font-mono">
              Main Menu
            </span>
            {menus.map((m) => {
              const Icon = m.icon;
              const isActive = activeMenu === m.id;
              
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMenu(m.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold text-left transition duration-200 cursor-pointer group
                    ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                        : "hover:bg-slate-800/60 hover:text-white text-slate-400"
                    }
                  `}
                  id={`nav-menu-btn-${m.id}`}
                >
                  <Icon
                    size={16}
                    className={`transition duration-200 ${
                      isActive ? "text-white" : `${m.color} group-hover:scale-110`
                    }`}
                  />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Outer credit identifier watermark */}
        <div className="pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            Sistem Latihan Mandiri CAT
          </p>
          <p className="text-[9px] text-slate-650 font-mono mt-0.5">
            Preserved in LocalStorage
          </p>
        </div>
      </aside>
    </>
  );
}
