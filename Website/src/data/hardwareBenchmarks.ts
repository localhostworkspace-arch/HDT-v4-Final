import type { GPUBenchmark, CPUBenchmark } from '../types';

/**
 * GPU Performance Score Database
 * Scores (0–100) are normalized relative tiers based on publicly available
 * benchmark rankings (PassMark, UserBenchmark tier categories).
 * These are NOT laboratory measurements — they are used for compatibility tier comparisons only.
 *
 * Sources: GPU hierarchy from Tom's Hardware & TechPowerUp GPU Database (public reference only)
 */
export const GPU_BENCHMARKS: GPUBenchmark[] = [
  // ── Ultra Tier (80–100) ───────────────────────────────────────────────
  { name: 'NVIDIA GeForce RTX 4090', aliases: ['RTX 4090', 'GeForce RTX 4090'], vendor: 'nvidia', performanceScore: 100, vramGB: 24, tier: 'ultra' },
  { name: 'NVIDIA GeForce RTX 4080 Super', aliases: ['RTX 4080 Super', '4080 SUPER'], vendor: 'nvidia', performanceScore: 96, vramGB: 16, tier: 'ultra' },
  { name: 'NVIDIA GeForce RTX 4080', aliases: ['RTX 4080', 'GeForce RTX 4080'], vendor: 'nvidia', performanceScore: 94, vramGB: 16, tier: 'ultra' },
  { name: 'AMD Radeon RX 7900 XTX', aliases: ['RX 7900 XTX', 'Radeon RX 7900 XTX'], vendor: 'amd', performanceScore: 93, vramGB: 24, tier: 'ultra' },
  { name: 'NVIDIA GeForce RTX 4070 Ti Super', aliases: ['RTX 4070 Ti Super', '4070 Ti SUPER'], vendor: 'nvidia', performanceScore: 90, vramGB: 16, tier: 'ultra' },
  { name: 'AMD Radeon RX 7900 XT', aliases: ['RX 7900 XT', 'Radeon RX 7900 XT'], vendor: 'amd', performanceScore: 89, vramGB: 20, tier: 'ultra' },
  { name: 'NVIDIA GeForce RTX 4070 Ti', aliases: ['RTX 4070 Ti', 'GeForce RTX 4070 Ti'], vendor: 'nvidia', performanceScore: 87, vramGB: 12, tier: 'ultra' },
  { name: 'NVIDIA GeForce RTX 3090 Ti', aliases: ['RTX 3090 Ti', 'GeForce RTX 3090 Ti'], vendor: 'nvidia', performanceScore: 86, vramGB: 24, tier: 'ultra' },
  { name: 'NVIDIA GeForce RTX 3090', aliases: ['RTX 3090', 'GeForce RTX 3090'], vendor: 'nvidia', performanceScore: 84, vramGB: 24, tier: 'ultra' },

  // ── High Tier (60–79) ─────────────────────────────────────────────────
  { name: 'NVIDIA GeForce RTX 4070 Super', aliases: ['RTX 4070 Super', '4070 SUPER'], vendor: 'nvidia', performanceScore: 82, vramGB: 12, tier: 'high' },
  { name: 'AMD Radeon RX 7800 XT', aliases: ['RX 7800 XT', 'Radeon RX 7800 XT'], vendor: 'amd', performanceScore: 80, vramGB: 16, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 4070', aliases: ['RTX 4070', 'GeForce RTX 4070'], vendor: 'nvidia', performanceScore: 79, vramGB: 12, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 3080 Ti', aliases: ['RTX 3080 Ti', 'GeForce RTX 3080 Ti'], vendor: 'nvidia', performanceScore: 78, vramGB: 12, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 3080', aliases: ['RTX 3080', 'GeForce RTX 3080', 'RTX 3080 10GB'], vendor: 'nvidia', performanceScore: 76, vramGB: 10, tier: 'high' },
  { name: 'AMD Radeon RX 6800 XT', aliases: ['RX 6800 XT', 'Radeon RX 6800 XT'], vendor: 'amd', performanceScore: 74, vramGB: 16, tier: 'high' },
  { name: 'AMD Radeon RX 7700 XT', aliases: ['RX 7700 XT', 'Radeon RX 7700 XT'], vendor: 'amd', performanceScore: 73, vramGB: 12, tier: 'high' },
  { name: 'AMD Radeon RX 6800', aliases: ['RX 6800', 'Radeon RX 6800'], vendor: 'amd', performanceScore: 72, vramGB: 16, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 4060 Ti', aliases: ['RTX 4060 Ti', 'GeForce RTX 4060 Ti', 'RTX 4060Ti 16GB', 'RTX 4060Ti 8GB'], vendor: 'nvidia', performanceScore: 70, vramGB: 16, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 3070 Ti', aliases: ['RTX 3070 Ti', 'GeForce RTX 3070 Ti'], vendor: 'nvidia', performanceScore: 69, vramGB: 8, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 3070', aliases: ['RTX 3070', 'GeForce RTX 3070'], vendor: 'nvidia', performanceScore: 68, vramGB: 8, tier: 'high' },
  { name: 'AMD Radeon RX 6700 XT', aliases: ['RX 6700 XT', 'Radeon RX 6700 XT'], vendor: 'amd', performanceScore: 66, vramGB: 12, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 2080 Ti', aliases: ['RTX 2080 Ti', 'GeForce RTX 2080 Ti'], vendor: 'nvidia', performanceScore: 65, vramGB: 11, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 2080 Super', aliases: ['RTX 2080 Super', 'RTX 2080S', 'GeForce RTX 2080 Super'], vendor: 'nvidia', performanceScore: 63, vramGB: 8, tier: 'high' },
  { name: 'AMD Radeon RX 6700', aliases: ['RX 6700', 'Radeon RX 6700'], vendor: 'amd', performanceScore: 62, vramGB: 10, tier: 'high' },

  // ── Mid Tier (35–59) ──────────────────────────────────────────────────
  { name: 'NVIDIA GeForce RTX 4060', aliases: ['RTX 4060', 'GeForce RTX 4060'], vendor: 'nvidia', performanceScore: 60, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 3060 Ti', aliases: ['RTX 3060 Ti', 'GeForce RTX 3060 Ti'], vendor: 'nvidia', performanceScore: 59, vramGB: 8, tier: 'mid' },
  { name: 'AMD Radeon RX 6650 XT', aliases: ['RX 6650 XT', 'Radeon RX 6650 XT'], vendor: 'amd', performanceScore: 57, vramGB: 8, tier: 'mid' },
  { name: 'AMD Radeon RX 6600 XT', aliases: ['RX 6600 XT', 'Radeon RX 6600 XT'], vendor: 'amd', performanceScore: 55, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 2070 Super', aliases: ['RTX 2070 Super', 'RTX 2070S'], vendor: 'nvidia', performanceScore: 54, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 2070', aliases: ['RTX 2070', 'GeForce RTX 2070'], vendor: 'nvidia', performanceScore: 52, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 3060', aliases: ['RTX 3060', 'GeForce RTX 3060', 'RTX 3060 12GB'], vendor: 'nvidia', performanceScore: 51, vramGB: 12, tier: 'mid' },
  { name: 'AMD Radeon RX 6600', aliases: ['RX 6600', 'Radeon RX 6600'], vendor: 'amd', performanceScore: 50, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 2060 Super', aliases: ['RTX 2060 Super', 'RTX 2060S'], vendor: 'nvidia', performanceScore: 49, vramGB: 8, tier: 'mid' },
  { name: 'AMD Radeon RX 5700 XT', aliases: ['RX 5700 XT', 'Radeon RX 5700 XT'], vendor: 'amd', performanceScore: 48, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 2060', aliases: ['RTX 2060', 'GeForce RTX 2060'], vendor: 'nvidia', performanceScore: 46, vramGB: 6, tier: 'mid' },
  { name: 'AMD Radeon RX 5700', aliases: ['RX 5700', 'Radeon RX 5700'], vendor: 'amd', performanceScore: 45, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce GTX 1080 Ti', aliases: ['GTX 1080 Ti', 'GeForce GTX 1080 Ti'], vendor: 'nvidia', performanceScore: 44, vramGB: 11, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 3050', aliases: ['RTX 3050', 'GeForce RTX 3050'], vendor: 'nvidia', performanceScore: 43, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce GTX 1080', aliases: ['GTX 1080', 'GeForce GTX 1080'], vendor: 'nvidia', performanceScore: 42, vramGB: 8, tier: 'mid' },
  { name: 'AMD Radeon RX 5600 XT', aliases: ['RX 5600 XT', 'Radeon RX 5600 XT'], vendor: 'amd', performanceScore: 41, vramGB: 6, tier: 'mid' },
  { name: 'NVIDIA GeForce GTX 1070 Ti', aliases: ['GTX 1070 Ti', 'GeForce GTX 1070 Ti'], vendor: 'nvidia', performanceScore: 40, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce GTX 1070', aliases: ['GTX 1070', 'GeForce GTX 1070'], vendor: 'nvidia', performanceScore: 38, vramGB: 8, tier: 'mid' },
  { name: 'AMD Radeon RX Vega 64', aliases: ['RX Vega 64', 'Radeon RX Vega 64'], vendor: 'amd', performanceScore: 37, vramGB: 8, tier: 'mid' },
  { name: 'AMD Radeon RX 580', aliases: ['RX 580', 'Radeon RX 580'], vendor: 'amd', performanceScore: 36, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce GTX 1660 Super', aliases: ['GTX 1660 Super', 'GTX 1660S', 'GeForce GTX 1660 Super'], vendor: 'nvidia', performanceScore: 36, vramGB: 6, tier: 'mid' },
  { name: 'NVIDIA GeForce GTX 1660 Ti', aliases: ['GTX 1660 Ti', 'GeForce GTX 1660 Ti'], vendor: 'nvidia', performanceScore: 35, vramGB: 6, tier: 'mid' },

  // ── Entry Tier (0–34) ─────────────────────────────────────────────────
  { name: 'NVIDIA GeForce GTX 1660', aliases: ['GTX 1660', 'GeForce GTX 1660'], vendor: 'nvidia', performanceScore: 34, vramGB: 6, tier: 'entry' },
  { name: 'AMD Radeon RX 570', aliases: ['RX 570', 'Radeon RX 570'], vendor: 'amd', performanceScore: 32, vramGB: 8, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 1060', aliases: ['GTX 1060', 'GeForce GTX 1060', 'GTX 1060 6GB', 'GTX 1060 3GB'], vendor: 'nvidia', performanceScore: 30, vramGB: 6, tier: 'entry' },
  { name: 'AMD Radeon RX 560', aliases: ['RX 560', 'Radeon RX 560'], vendor: 'amd', performanceScore: 22, vramGB: 4, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 1050 Ti', aliases: ['GTX 1050 Ti', 'GeForce GTX 1050 Ti'], vendor: 'nvidia', performanceScore: 22, vramGB: 4, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 1050', aliases: ['GTX 1050', 'GeForce GTX 1050'], vendor: 'nvidia', performanceScore: 19, vramGB: 2, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 970', aliases: ['GTX 970', 'GeForce GTX 970'], vendor: 'nvidia', performanceScore: 24, vramGB: 4, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 980', aliases: ['GTX 980', 'GeForce GTX 980'], vendor: 'nvidia', performanceScore: 26, vramGB: 4, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 980 Ti', aliases: ['GTX 980 Ti', 'GeForce GTX 980 Ti'], vendor: 'nvidia', performanceScore: 30, vramGB: 6, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 960', aliases: ['GTX 960', 'GeForce GTX 960'], vendor: 'nvidia', performanceScore: 17, vramGB: 4, tier: 'entry' },
  { name: 'AMD Radeon RX 480', aliases: ['RX 480', 'Radeon RX 480'], vendor: 'amd', performanceScore: 27, vramGB: 8, tier: 'entry' },
  { name: 'AMD Radeon RX 470', aliases: ['RX 470', 'Radeon RX 470'], vendor: 'amd', performanceScore: 24, vramGB: 4, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 760', aliases: ['GTX 760', 'GeForce GTX 760'], vendor: 'nvidia', performanceScore: 12, vramGB: 2, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 660', aliases: ['GTX 660', 'GeForce GTX 660'], vendor: 'nvidia', performanceScore: 8, vramGB: 2, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 750 Ti', aliases: ['GTX 750 Ti', 'GeForce GTX 750 Ti'], vendor: 'nvidia', performanceScore: 9, vramGB: 2, tier: 'entry' },
  // Integrated / Laptop GPUs
  { name: 'Intel UHD Graphics 770', aliases: ['UHD Graphics 770', 'Intel UHD 770', 'Intel(R) UHD Graphics 770'], vendor: 'intel', performanceScore: 10, vramGB: 2, tier: 'entry' },
  { name: 'Intel UHD Graphics 730', aliases: ['UHD Graphics 730', 'Intel UHD 730', 'Intel(R) UHD Graphics 730'], vendor: 'intel', performanceScore: 8, vramGB: 2, tier: 'entry' },
  { name: 'Intel Iris Xe Graphics', aliases: ['Iris Xe Graphics', 'Intel Iris Xe', 'Intel(R) Iris(R) Xe Graphics'], vendor: 'intel', performanceScore: 14, vramGB: 2, tier: 'entry' },
  { name: 'AMD Radeon 780M', aliases: ['Radeon 780M', 'AMD Radeon 780M', 'Radeon(TM) 780M Graphics'], vendor: 'amd', performanceScore: 20, vramGB: 4, tier: 'entry' },
  { name: 'Apple M3 Pro GPU', aliases: ['Apple M3 Pro', 'M3 Pro'], vendor: 'apple', performanceScore: 55, vramGB: 18, tier: 'mid' },
  { name: 'Apple M3 GPU', aliases: ['Apple M3', 'M3 GPU', 'Apple M3 GPU'], vendor: 'apple', performanceScore: 42, vramGB: 8, tier: 'mid' },
  { name: 'Apple M2 GPU', aliases: ['Apple M2', 'M2 GPU', 'Apple M2 GPU'], vendor: 'apple', performanceScore: 35, vramGB: 8, tier: 'entry' },
  // Laptop variants
  { name: 'NVIDIA GeForce RTX 4070 Laptop', aliases: ['RTX 4070 Laptop GPU', 'GeForce RTX 4070 Laptop'], vendor: 'nvidia', performanceScore: 62, vramGB: 8, tier: 'high' },
  { name: 'NVIDIA GeForce RTX 4060 Laptop', aliases: ['RTX 4060 Laptop GPU', 'GeForce RTX 4060 Laptop'], vendor: 'nvidia', performanceScore: 52, vramGB: 8, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 3060 Laptop', aliases: ['RTX 3060 Laptop GPU', 'GeForce RTX 3060 Laptop'], vendor: 'nvidia', performanceScore: 44, vramGB: 6, tier: 'mid' },
  { name: 'NVIDIA GeForce RTX 3050 Laptop', aliases: ['RTX 3050 Laptop GPU', 'GeForce RTX 3050 Laptop'], vendor: 'nvidia', performanceScore: 35, vramGB: 4, tier: 'entry' },
  { name: 'NVIDIA GeForce GTX 1650', aliases: ['GTX 1650', 'GeForce GTX 1650'], vendor: 'nvidia', performanceScore: 20, vramGB: 4, tier: 'entry' },
];

/**
 * CPU Performance Score Database
 * Scores (0–100) are normalized tier rankings.
 * Source basis: PassMark single/multi-thread combined tier (public reference)
 */
export const CPU_BENCHMARKS: CPUBenchmark[] = [
  // ── Ultra Tier (80–100) ───────────────────────────────────────────────
  { name: 'AMD Ryzen 9 7950X', aliases: ['Ryzen 9 7950X', 'AMD Ryzen 9 7950X'], vendor: 'amd', performanceScore: 100, cores: 16, tier: 'ultra' },
  { name: 'AMD Ryzen 9 7900X', aliases: ['Ryzen 9 7900X'], vendor: 'amd', performanceScore: 95, cores: 12, tier: 'ultra' },
  { name: 'Intel Core i9-13900K', aliases: ['i9-13900K', 'Core i9-13900K'], vendor: 'intel', performanceScore: 98, cores: 24, tier: 'ultra' },
  { name: 'Intel Core i9-12900K', aliases: ['i9-12900K', 'Core i9-12900K'], vendor: 'intel', performanceScore: 90, cores: 16, tier: 'ultra' },
  { name: 'AMD Ryzen 9 5950X', aliases: ['Ryzen 9 5950X'], vendor: 'amd', performanceScore: 88, cores: 16, tier: 'ultra' },
  { name: 'AMD Ryzen 9 5900X', aliases: ['Ryzen 9 5900X'], vendor: 'amd', performanceScore: 85, cores: 12, tier: 'ultra' },
  { name: 'Intel Core i9-11900K', aliases: ['i9-11900K', 'Core i9-11900K'], vendor: 'intel', performanceScore: 80, cores: 8, tier: 'ultra' },

  // ── High Tier (60–79) ─────────────────────────────────────────────────
  { name: 'AMD Ryzen 7 7700X', aliases: ['Ryzen 7 7700X'], vendor: 'amd', performanceScore: 78, cores: 8, tier: 'high' },
  { name: 'Intel Core i7-13700K', aliases: ['i7-13700K', 'Core i7-13700K'], vendor: 'intel', performanceScore: 77, cores: 16, tier: 'high' },
  { name: 'AMD Ryzen 7 5800X3D', aliases: ['Ryzen 7 5800X3D', 'R7 5800X3D'], vendor: 'amd', performanceScore: 76, cores: 8, tier: 'high' },
  { name: 'AMD Ryzen 7 5800X', aliases: ['Ryzen 7 5800X', 'R7 5800X'], vendor: 'amd', performanceScore: 74, cores: 8, tier: 'high' },
  { name: 'Intel Core i7-12700K', aliases: ['i7-12700K', 'Core i7-12700K'], vendor: 'intel', performanceScore: 73, cores: 12, tier: 'high' },
  { name: 'AMD Ryzen 5 7600X', aliases: ['Ryzen 5 7600X'], vendor: 'amd', performanceScore: 72, cores: 6, tier: 'high' },
  { name: 'Intel Core i7-11700K', aliases: ['i7-11700K', 'Core i7-11700K'], vendor: 'intel', performanceScore: 70, cores: 8, tier: 'high' },
  { name: 'AMD Ryzen 7 3800X', aliases: ['Ryzen 7 3800X', 'R7 3800X'], vendor: 'amd', performanceScore: 67, cores: 8, tier: 'high' },
  { name: 'Intel Core i9-10900K', aliases: ['i9-10900K', 'Core i9-10900K'], vendor: 'intel', performanceScore: 65, cores: 10, tier: 'high' },
  { name: 'AMD Ryzen 7 3700X', aliases: ['Ryzen 7 3700X', 'R7 3700X'], vendor: 'amd', performanceScore: 63, cores: 8, tier: 'high' },

  // ── Mid Tier (35–59) ──────────────────────────────────────────────────
  { name: 'AMD Ryzen 5 5600X', aliases: ['Ryzen 5 5600X', 'R5 5600X'], vendor: 'amd', performanceScore: 60, cores: 6, tier: 'mid' },
  { name: 'AMD Ryzen 5 5600', aliases: ['Ryzen 5 5600', 'R5 5600'], vendor: 'amd', performanceScore: 58, cores: 6, tier: 'mid' },
  { name: 'Intel Core i5-13600K', aliases: ['i5-13600K', 'Core i5-13600K'], vendor: 'intel', performanceScore: 62, cores: 14, tier: 'mid' },
  { name: 'Intel Core i7-10700K', aliases: ['i7-10700K', 'Core i7-10700K'], vendor: 'intel', performanceScore: 58, cores: 8, tier: 'mid' },
  { name: 'Intel Core i5-12600K', aliases: ['i5-12600K', 'Core i5-12600K'], vendor: 'intel', performanceScore: 57, cores: 10, tier: 'mid' },
  { name: 'AMD Ryzen 5 3600X', aliases: ['Ryzen 5 3600X', 'R5 3600X'], vendor: 'amd', performanceScore: 52, cores: 6, tier: 'mid' },
  { name: 'AMD Ryzen 5 3600', aliases: ['Ryzen 5 3600', 'R5 3600'], vendor: 'amd', performanceScore: 50, cores: 6, tier: 'mid' },
  { name: 'Intel Core i5-11600K', aliases: ['i5-11600K', 'Core i5-11600K'], vendor: 'intel', performanceScore: 50, cores: 6, tier: 'mid' },
  { name: 'Intel Core i7-9700K', aliases: ['i7-9700K', 'Core i7-9700K'], vendor: 'intel', performanceScore: 48, cores: 8, tier: 'mid' },
  { name: 'Intel Core i5-10600K', aliases: ['i5-10600K', 'Core i5-10600K'], vendor: 'intel', performanceScore: 47, cores: 6, tier: 'mid' },
  { name: 'AMD Ryzen 5 2600X', aliases: ['Ryzen 5 2600X', 'R5 2600X'], vendor: 'amd', performanceScore: 43, cores: 6, tier: 'mid' },
  { name: 'AMD Ryzen 5 2600', aliases: ['Ryzen 5 2600', 'R5 2600'], vendor: 'amd', performanceScore: 41, cores: 6, tier: 'mid' },
  { name: 'Intel Core i7-8700K', aliases: ['i7-8700K', 'Core i7-8700K'], vendor: 'intel', performanceScore: 42, cores: 6, tier: 'mid' },
  { name: 'Intel Core i5-9600K', aliases: ['i5-9600K', 'Core i5-9600K'], vendor: 'intel', performanceScore: 40, cores: 6, tier: 'mid' },
  { name: 'Intel Core i5-8600K', aliases: ['i5-8600K', 'Core i5-8600K'], vendor: 'intel', performanceScore: 38, cores: 6, tier: 'mid' },
  { name: 'Intel Core i7-7700K', aliases: ['i7-7700K', 'Core i7-7700K'], vendor: 'intel', performanceScore: 36, cores: 4, tier: 'mid' },

  // ── Entry Tier (0–34) ─────────────────────────────────────────────────
  { name: 'Intel Core i5-7600K', aliases: ['i5-7600K', 'Core i5-7600K'], vendor: 'intel', performanceScore: 32, cores: 4, tier: 'entry' },
  { name: 'Intel Core i5-3470', aliases: ['i5-3470', 'Core i5-3470'], vendor: 'intel', performanceScore: 18, cores: 4, tier: 'entry' },
  { name: 'Intel Core i7-4770', aliases: ['i7-4770', 'Core i7-4770'], vendor: 'intel', performanceScore: 22, cores: 4, tier: 'entry' },
  { name: 'Intel Core i5-6600K', aliases: ['i5-6600K', 'Core i5-6600K'], vendor: 'intel', performanceScore: 28, cores: 4, tier: 'entry' },
  { name: 'Intel Core i7-6700K', aliases: ['i7-6700K', 'Core i7-6700K'], vendor: 'intel', performanceScore: 30, cores: 4, tier: 'entry' },
  { name: 'Intel Core i5-4690K', aliases: ['i5-4690K', 'Core i5-4690K'], vendor: 'intel', performanceScore: 22, cores: 4, tier: 'entry' },
  { name: 'AMD FX-8350', aliases: ['FX-8350', 'AMD FX 8350'], vendor: 'amd', performanceScore: 12, cores: 8, tier: 'entry' },
  { name: 'AMD FX-6300', aliases: ['FX-6300', 'AMD FX 6300'], vendor: 'amd', performanceScore: 9, cores: 6, tier: 'entry' },
  // Laptop / Mobile CPUs
  { name: 'Intel Core i7-12700H', aliases: ['i7-12700H', 'Core i7-12700H'], vendor: 'intel', performanceScore: 68, cores: 14, tier: 'high' },
  { name: 'Intel Core i5-12500H', aliases: ['i5-12500H', 'Core i5-12500H'], vendor: 'intel', performanceScore: 58, cores: 12, tier: 'mid' },
  { name: 'AMD Ryzen 7 6800H', aliases: ['Ryzen 7 6800H'], vendor: 'amd', performanceScore: 65, cores: 8, tier: 'high' },
  { name: 'Apple M3', aliases: ['Apple M3', 'Apple M3 CPU'], vendor: 'apple', performanceScore: 72, cores: 8, tier: 'high' },
  { name: 'Apple M2', aliases: ['Apple M2', 'Apple M2 CPU'], vendor: 'apple', performanceScore: 60, cores: 8, tier: 'mid' },
];

/**
 * Fuzzy match a GPU renderer string against the benchmark database.
 * Returns the best matching benchmark or null.
 */
export function matchGPU(rendererString: string): GPUBenchmark | null {
  if (!rendererString) return null;
  const normalized = rendererString.toLowerCase().replace(/[®™()/]/g, '').trim();

  let best: GPUBenchmark | null = null;
  let bestScore = 0;

  for (const gpu of GPU_BENCHMARKS) {
    const candidates = [gpu.name, ...gpu.aliases];
    for (const candidate of candidates) {
      const cn = candidate.toLowerCase().replace(/[®™()/]/g, '').trim();
      // Exact match
      if (normalized === cn) return gpu;
      // Substring match — prefer longer matches (more specific)
      if (normalized.includes(cn) || cn.includes(normalized)) {
        const score = Math.min(cn.length, normalized.length);
        if (score > bestScore) {
          bestScore = score;
          best = gpu;
        }
      }
    }
  }
  return best;
}

/**
 * Fuzzy match a GPU name string from requirements to the benchmark database.
 * Used to get the required GPU's performance score.
 */
export function matchGPURequirement(reqGpuString: string): GPUBenchmark | null {
  return matchGPU(reqGpuString);
}

/**
 * Fuzzy match a CPU name string against the benchmark database.
 */
export function matchCPU(cpuString: string): CPUBenchmark | null {
  if (!cpuString) return null;
  const normalized = cpuString.toLowerCase().replace(/[®™()/]/g, '').trim();

  let best: CPUBenchmark | null = null;
  let bestScore = 0;

  for (const cpu of CPU_BENCHMARKS) {
    const candidates = [cpu.name, ...cpu.aliases];
    for (const candidate of candidates) {
      const cn = candidate.toLowerCase().replace(/[®™()/]/g, '').trim();
      if (normalized === cn) return cpu;
      if (normalized.includes(cn) || cn.includes(normalized)) {
        const score = Math.min(cn.length, normalized.length);
        if (score > bestScore) {
          bestScore = score;
          best = cpu;
        }
      }
    }
  }
  return best;
}
