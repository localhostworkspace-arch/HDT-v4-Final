# ⚡ HardwareTest (HDT v2) — Browser-Native Hardware Diagnostics Lab

A high-performance, browser-native hardware testing and diagnostics platform built with **React 19**, **TypeScript**, and **Vite 8**. Provides precise input latency, display panel health, peripheral switch chatter, real multi-core compute benchmarking, and game compatibility analysis directly inside the browser with zero client installations.

---

## 🚀 Key Features & Diagnostic Engines

### 1. ⌨️ Input Device Diagnostics
- **Keyboard Tester (`/keyboard-tester`)**:
  - Full ANSI & ISO layout interactive matrix with 60%, 65%, 75%, TKL, and 100% options.
  - Multi-Key Rollover (NKRO) & key ghosting detection.
  - Switch chatter & debounce analyzer (alerts on switch bounce < 30ms).
  - Sub-millisecond response latency counter & mechanical sound feedback.
- **Mouse Tester (`/mouse-tester`)**:
  - High-frequency polling rate benchmark (up to 8,000 Hz).
  - Hardware microswitch double-click & debounce diagnostic.
  - Sensor jitter and linearity tracking canvas.
  - Scroll wheel step and delta speed counter.
- **Gamepad / Controller Tester (`/gamepad-tester`)**:
  - Real-time Gamepad API integration with interactive vector skins for PS5 DualSense, Xbox Series X/S, and Nintendo Switch Pro.
  - Analog stick deadzone & circularity error percentage calculation.
  - Linear trigger pressure gauges (0.00 – 1.00) and dual-frequency rumble motor triggers.

### 2. 🖥️ Display & Audio Diagnostics
- **Screen Tester (`/screen-test`)**:
  - Fullscreen pure-color cycle (RGBWYK) for dead and stuck pixel detection.
  - High-speed UFO frame skipping and monitor refresh rate measurement (60Hz to 360Hz+).
  - 256-step grayscale contrast and IPS backlight bleed checker.
- **Media & Audio Diagnostics (`ToolDetailPage`)**:
  - Stereo channel isolation (L/R speaker phase test).
  - Sweep tone frequency generator (20 Hz – 20,000 Hz).
  - Microphone decibel meter with live waveform oscilloscope and noise floor detection.
  - Webcam resolution, aspect ratio, and frame rate diagnostic.

### 3. ⚙️ Performance Benchmarks & Compatibility
- **CPU Benchmark (`/cpu-test`)**:
  - Multi-threaded Web Worker pool (Mandelbrot set and integer/floating-point mathematical computations).
  - Measures true observable iteration throughput and worker concurrency.
- **GPU Benchmark (`/gpu-test`)**:
  - WebGL 3D load simulation with real-time frame time monitoring and WebGL renderer detection.
- **RAM Tester (`/ram-test`)**:
  - TypedArray sequential and random memory allocation read/write throughput test.
- **Internet Speed Tester (`/internet-speed-test`)**:
  - Web Streams API download/upload throughput measurement with live graphing, ping latency, and jitter.
- **Can I Run It? (`/can-i-run-it`)**:
  - Automated local WebGL GPU detection & hardware profiling.
  - 80KB+ database of games and software requirements.
  - Instant bottleneck percentage analysis and multi-resolution FPS estimates (1080p, 1440p, 4K).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Core** | React 19, TypeScript (Strict Mode) |
| **Build & Bundler** | Vite 8, Rollup |
| **Styling** | Tailwind CSS v4, Custom CSS Variables |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v7 (HashRouter with lazy-loaded routes & ErrorBoundary) |
| **Concurrency** | Web Workers API, WebGL2, Web Audio API, Gamepad API |

---

## 📁 Project Structure

```text
Website/
├── dist/                  # Production build output
├── public/                # Static assets (favicons, robots.txt, sitemap.xml)
├── src/
│   ├── assets/            # Project SVGs & images
│   ├── components/
│   │   ├── common/        # Reusable shared components (DynamicIcon)
│   │   ├── home/          # Landing page sections (Hero, LiveSystemBar, Grid)
│   │   ├── layout/        # Navbar, Footer, CommandPalette
│   │   ├── seo/           # SeoHead dynamic meta management
│   │   └── tools/         # Dedicated diagnostic test suites
│   │       ├── CanIRunIt/
│   │       ├── CpuTester/
│   │       ├── GamepadTester/
│   │       ├── GpuTester/
│   │       ├── InternetSpeedTester/
│   │       ├── KeyboardTester/
│   │       ├── MediaTester/
│   │       ├── MouseTester/
│   │       ├── RamTester/
│   │       └── ScreenTester/
│   ├── context/           # ThemeContext (Dark/Light), ToastContext
│   ├── data/              # compatibilityData.ts, hardwareBenchmarks.ts, toolsData.ts
│   ├── hooks/             # useWorkerBenchmark.ts
│   ├── pages/             # HomePage, CanIRunItPage, AllToolsPage, ToolDetailPage, About, Contact, Blog, Legal
│   ├── services/          # compatibilityService.ts, hardwareService.ts, networkMeasurement.ts, searchService.ts
│   ├── types/             # TypeScript index.ts
│   ├── workers/           # benchmark.worker.ts, benchmarkProtocol.ts
│   ├── App.tsx            # Root application router with lazy loading
│   ├── main.tsx           # Entry point
│   └── index.css          # CSS theme variables & base styles
├── index.html             # HTML entry template
├── package.json           # Dependencies and build scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment Guidelines

The project builds static SPA files into the `dist/` folder:
- **Vercel**: Deploy with root directory set to `Website` (Build command: `npm run build`, Output directory: `dist`).
- **Netlify / Cloudflare Pages / GitHub Pages**: Upload the `dist/` directory directly.
- **HashRouter** is enabled out of the box to guarantee flawless routing across all static hosts without server-side rewrite issues.
