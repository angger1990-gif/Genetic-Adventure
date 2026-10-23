export interface TraitMap {
  dominantSymbol: string;
  recessiveSymbol: string;
  dominantName: string;
  recessiveName: string;
}

export interface CrossResult {
  isDihybrid: boolean;
  parent1: string;
  parent2: string;
  gametes1: string[];
  gametes2: string[];
  grid: string[][];
  genotypes: Record<string, number>;
  genotypePercentages: Record<string, number>;
  genotypeRatio: string;
  phenotypes: Record<string, number>;
  phenotypePercentages: Record<string, number>;
  phenotypeRatio: string;
  totalOffspring: number;
  scientificExplanation: string;
}

export class PunnettEngine {
  static combineLocus(a: string, b: string): string {
    if (a.toUpperCase() !== b.toUpperCase()) return a + b;
    const aUpper = a === a.toUpperCase();
    const bUpper = b === b.toUpperCase();
    if (aUpper && !bUpper) return a + b;
    if (!aUpper && bUpper) return b + a;
    return a + b;
  }

  static getGametes(genotype: string, keepDuplicates = true): string[] {
    const clean = genotype.trim();
    if (clean.length === 2) {
      const g1 = clean[0];
      const g2 = clean[1];
      if (keepDuplicates) return [g1, g2];
      return g1 === g2 ? [g1] : [g1, g2];
    } else if (clean.length === 4) {
      const a1 = clean[0];
      const a2 = clean[1];
      const b1 = clean[2];
      const b2 = clean[3];
      const list = [a1 + b1, a1 + b2, a2 + b1, a2 + b2];
      if (keepDuplicates) return list;
      return Array.from(new Set(list));
    }
    return [];
  }

  static combineGametes(g1: string, g2: string): string {
    if (g1.length === 1 && g2.length === 1) {
      return this.combineLocus(g1, g2);
    }
    if (g1.length === 2 && g2.length === 2) {
      const locus1 = this.combineLocus(g1[0], g2[0]);
      const locus2 = this.combineLocus(g1[1], g2[1]);
      return locus1 + locus2;
    }
    return g1 + g2;
  }

  static getPhenotype(genotype: string, traitMap?: Record<string, TraitMap>): string {
    if (genotype.length === 2) {
      const locus = genotype[0].toUpperCase();
      const map = traitMap?.[locus] || {
        dominantSymbol: locus,
        recessiveSymbol: locus.toLowerCase(),
        dominantName: `${locus} Dominan (Merah / Bulat)`,
        recessiveName: `${locus.toLowerCase()} Resesif (Putih / Keriput)`,
      };
      return genotype.includes(map.dominantSymbol) ? map.dominantName : map.recessiveName;
    } else if (genotype.length === 4) {
      const p1 = genotype.slice(0, 2);
      const p2 = genotype.slice(2, 4);
      const l1 = p1[0].toUpperCase();
      const l2 = p2[0].toUpperCase();
      const map1 = traitMap?.[l1] || {
        dominantSymbol: l1,
        recessiveSymbol: l1.toLowerCase(),
        dominantName: `Sifat 1 [${l1}]`,
        recessiveName: `Sifat 1 Resesif [${l1.toLowerCase()}]`,
      };
      const map2 = traitMap?.[l2] || {
        dominantSymbol: l2,
        recessiveSymbol: l2.toLowerCase(),
        dominantName: `Sifat 2 [${l2}]`,
        recessiveName: `Sifat 2 Resesif [${l2.toLowerCase()}]`,
      };
      const pheno1 = p1.includes(map1.dominantSymbol) ? map1.dominantName : map1.recessiveName;
      const pheno2 = p2.includes(map2.dominantSymbol) ? map2.dominantName : map2.recessiveName;
      return `${pheno1} & ${pheno2}`;
    }
    return genotype;
  }

  static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  static findGCDArray(nums: number[]): number {
    if (nums.length === 0) return 1;
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      result = this.gcd(result, nums[i]);
    }
    return result || 1;
  }

  static calculateCross(p1: string, p2: string, traitMap?: Record<string, TraitMap>): CrossResult {
    const parent1 = p1.trim();
    const parent2 = p2.trim();

    if (parent1.length !== parent2.length || (parent1.length !== 2 && parent1.length !== 4)) {
      throw new Error('Format genotip tidak valid. Gunakan 2 huruf (monohibrid) atau 4 huruf (dihibrid).');
    }

    const isDihybrid = parent1.length === 4;
    const gametes1 = this.getGametes(parent1, true);
    const gametes2 = this.getGametes(parent2, true);

    const grid: string[][] = [];
    const genotypes: Record<string, number> = {};
    const phenotypes: Record<string, number> = {};
    let total = 0;

    for (let r = 0; r < gametes1.length; r++) {
      grid[r] = [];
      for (let c = 0; c < gametes2.length; c++) {
        const zygote = this.combineGametes(gametes1[r], gametes2[c]);
        grid[r][c] = zygote;
        genotypes[zygote] = (genotypes[zygote] || 0) + 1;
        const pheno = this.getPhenotype(zygote, traitMap);
        phenotypes[pheno] = (phenotypes[pheno] || 0) + 1;
        total++;
      }
    }

    const genotypePercentages: Record<string, number> = {};
    for (const [g, count] of Object.entries(genotypes)) {
      genotypePercentages[g] = Math.round((count / total) * 1000) / 10;
    }

    const phenotypePercentages: Record<string, number> = {};
    for (const [p, count] of Object.entries(phenotypes)) {
      phenotypePercentages[p] = Math.round((count / total) * 1000) / 10;
    }

    const gVals = Object.values(genotypes);
    const gGcd = this.findGCDArray(gVals);
    const genotypeRatio = Object.entries(genotypes)
      .map(([g, count]) => `${g} (${count / gGcd})`)
      .join(' : ');

    const pVals = Object.values(phenotypes);
    const pGcd = this.findGCDArray(pVals);
    const phenotypeRatio = Object.entries(phenotypes)
      .map(([p, count]) => `${count / pGcd} ${p}`)
      .join(' : ');

    let scientificExplanation = '';
    if (isDihybrid) {
      scientificExplanation = `Pada persilangan dihibrid ${parent1} × ${parent2}: Setiap pasang alel memisah dan berasortasi secara bebas menurut Hukum Mendel II (Asortasi Bebas). Induk menghasilkan 4 macam kombinasi gamet, membentuk papan catur 4×4 (16 kotak kombinasi). Rasio fenotip yang dihasilkan adalah ${phenotypeRatio} (pada persilangan heterozigot penuh BbLl × BbLl menghasilkan rasio klasik 9 : 3 : 3 : 1).`;
    } else {
      scientificExplanation = `Pada persilangan monohibrid ${parent1} × ${parent2}: Menurut Hukum Mendel I (Segregasi), pasangan alel berpisah secara bebas pada pembentukan gamet meiosis. Kombinasi keturunan menghasilkan perbandingan genotip ${genotypeRatio} dan perbandingan fenotip ${phenotypeRatio}.`;
    }

    return {
      isDihybrid,
      parent1,
      parent2,
      gametes1,
      gametes2,
      grid,
      genotypes,
      genotypePercentages,
      genotypeRatio,
      phenotypes,
      phenotypePercentages,
      phenotypeRatio,
      totalOffspring: total,
      scientificExplanation,
    };
  }

  static validateStudentGrid(
    studentGrid: string[][],
    expectedGrid: string[][]
  ): { isValid: boolean; errorCells: { row: number; col: number; expected: string }[] } {
    const errorCells: { row: number; col: number; expected: string }[] = [];

    const norm = (s: string) => s.trim().split('').sort().join('').toLowerCase();

    for (let r = 0; r < expectedGrid.length; r++) {
      for (let c = 0; c < expectedGrid[r].length; c++) {
        const studentVal = (studentGrid[r]?.[c] || '').trim();
        const expectedVal = expectedGrid[r][c];

        if (norm(studentVal) !== norm(expectedVal)) {
          errorCells.push({ row: r, col: c, expected: expectedVal });
        }
      }
    }

    return {
      isValid: errorCells.length === 0,
      errorCells,
    };
  }
}
