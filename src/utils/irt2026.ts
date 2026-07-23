import { Soal } from "../types";

export const PARAMETER_UTBK_2026: Record<string, { min: number; max: number; mean: number; sd: number }> = {
  "Penalaran Umum": { min: 306.00, max: 894.43, mean: 500, sd: 71.52 },
  "Pengetahuan & Pemahaman Umum": { min: 231.92, max: 935.37, mean: 500, sd: 100.00 },
  "Pemahaman Bacaan dan Menulis": { min: 229.80, max: 940.77, mean: 500, sd: 100.00 },
  "Pengetahuan Kuantitatif": { min: 357.10, max: 1173.55, mean: 500, sd: 100.00 },
  "Literasi dalam Bahasa Inggris": { min: 317.17, max: 890.73, mean: 500, sd: 100.00 },
  "Literasi dalam Bahasa Indonesia": { min: 237.00, max: 935.00, mean: 500, sd: 100.00 },
  "Penalaran Matematika": { min: 266.90, max: 997.70, mean: 500, sd: 100.00 }
};

/**
 * Normalizes minor variation of subtest titles into the exact keys of the UTBK 2026 official statistics
 */
export function normalizeSubtes(name: string): string {
  if (!name) return "Penalaran Umum";
  const normalized = name.toLowerCase().replace(/[^a-z]/g, "");
  
  if (normalized.includes("penalaranumum") || normalized === "pu") {
    return "Penalaran Umum";
  }
  if (
    normalized.includes("pengetahuandanpemahaman") || 
    normalized.includes("pengetahuandanpemahamanumum") || 
    normalized.includes("pengetahuanpemahamanumum") || 
    normalized.includes("ppu")
  ) {
    return "Pengetahuan & Pemahaman Umum";
  }
  if (normalized.includes("pemahamanbacaan") || normalized.includes("bacaandanmenulis") || normalized === "pbm") {
    return "Pemahaman Bacaan dan Menulis";
  }
  if (normalized.includes("pengetahuankuantitatif") || normalized.includes("kuantitatif") || normalized === "pk") {
    return "Pengetahuan Kuantitatif";
  }
  if (normalized.includes("bahasainggris") || normalized.includes("literasibahasainggris") || normalized.includes("inggris") || normalized === "pbi") {
    return "Literasi dalam Bahasa Inggris";
  }
  if (normalized.includes("bahasaindonesia") || normalized.includes("literasibahasaindonesia") || normalized.includes("indonesia")) {
    return "Literasi dalam Bahasa Indonesia";
  }
  if (normalized.includes("penalaranmatematika") || normalized.includes("matematika") || normalized === "pm") {
    return "Penalaran Matematika";
  }
  
  return "Penalaran Umum"; // Fallback for other unmapped subjects
}

/**
 * Simulates item response theory (IRT) score scaling with deterministic question difficulty weights.
 */
export function hitungSkorIRTSubtes(
  subNameNormalized: string,
  soalList: Soal[],
  answers: Record<number, string | Record<string, string>>
): { score: number; min: number; max: number } {
  const param = PARAMETER_UTBK_2026[subNameNormalized] || { min: 250, max: 900, mean: 500, sd: 100 };
  
  const relevantSoal = soalList.filter(s => normalizeSubtes(s.subtes) === subNameNormalized);
  if (relevantSoal.length === 0) {
    return { score: Math.round(param.mean), min: param.min, max: param.max };
  }

  let totalEarnedWeight = 0;
  let totalMaxWeight = 0;

  relevantSoal.forEach((soal) => {
    // Generate a deterministic weight difficulty for each item matching IRT concept:
    // e.g. varying from 1.0 to 1.5 based on question number to lock results reliably
    const weight = 1 + ((soal.nomor % 3) * 0.25);
    totalMaxWeight += weight;

    const ans = answers[soal.nomor];
    if (ans) {
      if (soal.tipe === "benar_salah" && soal.pernyataan) {
        // Partial correctness
        const totalStatements = soal.pernyataan.length;
        const correctAnswersCount = soal.pernyataan.filter((p) => {
          const uAns = (ans as Record<string, string>)?.[p.id];
          const kAns = (soal.jawaban as Record<string, string>)?.[p.id];
          return uAns === kAns;
        }).length;
        const correctRatio = totalStatements > 0 ? correctAnswersCount / totalStatements : 0;
        totalEarnedWeight += correctRatio * weight;
      } else {
        // Exact choice comparison
        if (ans === soal.jawaban) {
          totalEarnedWeight += weight;
        }
      }
    }
  });

  if (totalEarnedWeight === 0) {
    return { score: Math.round(param.min), min: param.min, max: param.max };
  }
  if (Math.abs(totalEarnedWeight - totalMaxWeight) < 0.001) {
    return { score: Math.round(param.max), min: param.min, max: param.max };
  }

  // Calculate proportional raw score matching [0, 1] range
  const prop = totalEarnedWeight / totalMaxWeight;

  // Map to a normal-distribution Z-score curve ranging from -2 to +2
  const zScore = (prop - 0.5) * 4;

  // Convert to 2026 final UTBK IRT scaled score
  let finalScore = param.mean + (zScore * param.sd);

  // Guard output boundaries
  finalScore = Math.max(param.min, Math.min(param.max, finalScore));

  return {
    score: Math.round(finalScore),
    min: param.min,
    max: param.max
  };
}

/**
 * Calculates complete scoring for SKD tryout.
 * TIU & TWK: Benar = +5, Salah/Kosong = 0.
 * TKP: multi-points 1 to 5.
 */
export function hitungSkorSKD(
  soalList: Soal[],
  answers: Record<number, string | Record<string, string>>
): { score: number; maxScore: number; subtesBreakdown: Record<string, { score: number; maxScore: number }> } {
  let totalScore = 0;
  let totalMaxScore = 0;

  const subtesBreakdown: Record<string, { score: number; maxScore: number }> = {
    "Tes Wawasan Kebangsaan (TWK)": { score: 0, maxScore: 0 },
    "Tes Inteligensi Umum (TIU)": { score: 0, maxScore: 0 },
    "Tes Karakteristik Pribadi (TKP)": { score: 0, maxScore: 0 }
  };

  soalList.forEach((soal) => {
    // Determine which category the subtest is. We group into TWK, TIU, TKP
    let category = "Tes Wawasan Kebangsaan (TWK)";
    const subL = soal.subtes.toLowerCase();
    if (subL.includes("inteligensi") || subL.includes("tiu")) {
      category = "Tes Inteligensi Umum (TIU)";
    } else if (subL.includes("karakteristik") || subL.includes("tkp")) {
      category = "Tes Karakteristik Pribadi (TKP)";
    }

    const ans = answers[soal.nomor];
    let earned = 0;
    let max = 5;

    if (soal.poin && typeof ans === "string") {
      const optionPoints = Object.values(soal.poin) as number[];
      max = Math.max(...optionPoints, 5);
      earned = soal.poin[ans] ?? 0;
    } else {
      // Standard / Old JSON without 'poin' object: Benar +5, Salah/Kosong 0
      max = 5;
      if (typeof ans === "string" && ans === soal.jawaban) {
        earned = 5;
      } else {
        earned = 0;
      }
    }

    totalScore += earned;
    totalMaxScore += max;

    if (!subtesBreakdown[category]) {
      subtesBreakdown[category] = { score: 0, maxScore: 0 };
    }
    subtesBreakdown[category].score += earned;
    subtesBreakdown[category].maxScore += max;
  });

  return {
    score: totalScore,
    maxScore: totalMaxScore,
    subtesBreakdown
  };
}
