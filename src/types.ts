export interface Paket {
  nama: string;
  tag: "SKD" | "SNBT";
  jsonUrl: string;
}

export interface Pernyataan {
  id: string;
  teks: string;
}

export interface Soal {
  nomor: number;
  subtes: string;
  soal: string;
  pilihan?: Record<string, string>;               // For multiple choices (A, B, C, D, E)
  jawaban: string | Record<string, string>;         // Simple choice "A" or True/False object {"1": "Benar", "2": "Salah"}
  poin?: Record<string, number>;                    // Score weights (e.g. for TKP, key of choices A-E mapped to points)
  pembahasan: string;
  tipe?: string;                                    // "benar_salah", "pilihan_ganda", etc.
  pernyataan?: Pernyataan[];                        // Statements for "benar_salah"
}

export type ViewMode = "dashboard" | "ujian" | "review" | "kuis";

export interface HistoryRecord {
  paketNama: string;
  tag: "SKD" | "SNBT";
  timestamp: string;
  score: number;
  maxScore: number;
  answers: Record<number, string | Record<string, string>>;
  duration: number; // in seconds taken
  jsonUrl?: string;
  nilaiPerSubtes?: Record<string, number>;
  totalBenar?: number;
  totalSalah?: number;
  totalKosong?: number;
  subtesBreakdownDetail?: Record<string, { score: number; maxScore: number; benar: number; salah: number; kosong: number }>;
}
