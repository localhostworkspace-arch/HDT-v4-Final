import type { ToolItem } from '../types';

export const TOOLS_DATA: ToolItem[] = [
  {
    id: 'keyboard-tester',
    name: 'Keyboard Tester',
    slug: 'keyboard-tester',
    path: '/keyboard-tester',
    category: 'input',
    categoryLabel: 'Input Devices',
    shortDesc: 'Test keystrokes, ghosting, key chatter, rollover, and input latency in real time.',
    fullDesc: 'A comprehensive browser-based keyboard diagnostics suite. Inspect all mechanical, optical, and membrane keys with instant visual feedback, N-key rollover verification, response latency measurement, and event listener codes.',
    iconName: 'Keyboard',
    badge: 'Popular',
    tags: ['NKRO', 'Latency', 'Key Ghosting', 'Event Viewer'],
    features: [
      'Visual interactive ANSI & ISO keyboard layout',
      'Real-time key down / key up event logger',
      'Multi-key rollover (NKRO) matrix detector',
      'Key debounce and double-click chatter analyzer'
    ],
    specs: [
      { label: 'Latency Precision', value: '< 0.5 ms' },
      { label: 'Supported Layouts', value: 'ANSI, ISO, 60%, TKL, Full' },
      { label: 'Detection Engine', value: 'Native KeyboardEvent API' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Keyboard Tester - Online Key & Latency Diagnostics | HardwareTest',
    metaDescription: 'Free online keyboard tester to test ghosting, N-key rollover, key chatter, and latency. Works for all mechanical and membrane keyboards.'
  },
  {
    id: 'mouse-tester',
    name: 'Mouse Tester',
    slug: 'mouse-tester',
    path: '/mouse-tester',
    category: 'input',
    categoryLabel: 'Input Devices',
    shortDesc: 'Verify polling rate, scroll wheel precision, double-click issues, and DPI accuracy.',
    fullDesc: 'Test your gaming or productivity mouse with precision. Measures polling rate up to 8000Hz, detects faulty microswitches with double-click chatter detection, tests smooth scrolling, and provides canvas tracking for sensor jitter.',
    iconName: 'Mouse',
    badge: 'Essential',
    tags: ['8000Hz Polling', 'Double Click Check', 'Scroll Test', 'Sensor Jitter'],
    features: [
      'High-frequency polling rate benchmark (up to 8000Hz)',
      'Hardware switch double-click & debounce diagnostic',
      'Smooth scroll delta and continuous step test',
      'Sensor tracking line test for acceleration & jitter'
    ],
    specs: [
      { label: 'Max Sample Rate', value: '8,000 Hz' },
      { label: 'Sensor Test', value: 'Linearity & Drift Canvas' },
      { label: 'Button Support', value: 'LMB, RMB, MMB, Side 1/2' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Mouse Tester - Polling Rate, Double Click & Sensor Test | HardwareTest',
    metaDescription: 'Test mouse polling rate up to 8000Hz, check for double click issues, test scroll wheel and sensor tracking online.'
  },
  {
    id: 'screen-test',
    name: 'Screen Test',
    slug: 'screen-test',
    path: '/screen-test',
    category: 'display',
    categoryLabel: 'Display & Visuals',
    shortDesc: 'Dead pixel detector, refresh rate meter, color banding, HDR test, and backlight bleed.',
    fullDesc: 'Inspect monitor health and panel quality. Fullscreen dead/stuck pixel color cycle, high-FPS UFO motion blur and frame skipping test, grayscale dynamic range gradients, IPS backlight bleed checker, and HDR tone mapping.',
    iconName: 'Monitor',
    badge: 'Multi-Hz',
    tags: ['Dead Pixel', 'UFO Ghosting', 'Backlight Bleed', 'HDR Check'],
    features: [
      'Fullscreen pure color cycle (RGBWYK) for dead pixel hunting',
      'High-speed moving bar frame skipping and refresh rate meter',
      '256-step contrast and black level dynamic range test',
      'Backlight bleed and dark room uniformity inspect'
    ],
    specs: [
      { label: 'Refresh Rates', value: '60Hz / 120Hz / 144Hz / 240Hz / 360Hz' },
      { label: 'Color Gamut', value: 'sRGB / DCI-P3 / Rec.2020' },
      { label: 'Resolution', value: 'Full Native (up to 8K UHD)' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Screen Test - Dead Pixel, Refresh Rate & Monitor Diagnostics | HardwareTest',
    metaDescription: 'Test your monitor for dead pixels, backlight bleed, refresh rate (up to 360Hz), color banding, and contrast online.'
  },
  {
    id: 'gamepad-tester',
    name: 'Gamepad Tester',
    slug: 'gamepad-tester',
    path: '/gamepad-tester',
    category: 'input',
    categoryLabel: 'Input Devices',
    shortDesc: 'Analyze stick drift, circularity error, trigger pressure, and dual-rumble vibration.',
    fullDesc: 'Plug and play gamepad diagnostic tool for Xbox, PlayStation DualSense/DualShock, Nintendo Switch Pro, and standard HID controllers. Check analog stick deadzones, circularity error, trigger linear pressure, and haptic feedback motors.',
    iconName: 'Gamepad2',
    badge: 'Top Rated',
    tags: ['Stick Drift', 'Circularity %', 'DualSense Haptics', 'WebGamepad'],
    features: [
      'Real-time analog stick drift & deadzone mapper',
      'Circularity error percentage visual graph',
      'Analog trigger pressure curve (0% to 100%)',
      'Dual rumble motor vibration test'
    ],
    specs: [
      { label: 'Protocol', value: 'HTML5 Gamepad API / WebHID' },
      { label: 'Controller Support', value: 'Xbox, PS4/PS5, Switch, Generic' },
      { label: 'Update Interval', value: '60 - 240 FPS Poll' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Gamepad Tester - Controller Stick Drift & Circularity Test | HardwareTest',
    metaDescription: 'Free online gamepad tester. Check controller stick drift, circularity error, button responsiveness, and trigger pressure.'
  },
  {
    id: 'steering-wheel-tester',
    name: 'Steering Wheel Tester',
    slug: 'steering-wheel-tester',
    path: '/steering-wheel-tester',
    category: 'input',
    categoryLabel: 'Input Devices',
    shortDesc: 'Inspect live steering angle, accelerator, brake, clutch pedals, paddle shifters, and buttons.',
    fullDesc: 'A dedicated browser-based sim racing wheel diagnostic. Inspect steering rotation angle across 180° to 1080° ranges, test linear pedal pressure for accelerator, brake, and clutch, verify paddle shifters and all exposed gamepad buttons in real time.',
    iconName: 'Disc',
    badge: 'Sim Racing',
    tags: ['Sim Racing', 'Wheel Rotation', 'Pedal Pressure', 'Paddle Shifters'],
    features: [
      'Live steering wheel rotation visualization with center notch and deadzone',
      'Triple pedal linear response bars (Accelerator, Brake, Clutch)',
      'Paddle shifters and full button matrix input detector',
      'Configurable rotation angle reference (180° - 1080°)'
    ],
    specs: [
      { label: 'API Protocol', value: 'HTML5 Gamepad API' },
      { label: 'Compatible Brands', value: 'Logitech, Thrustmaster, Fanatec, Moza, Generic' },
      { label: 'Pedal Support', value: 'Throttle, Brake, Clutch' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Steering Wheel Tester - Sim Racing Wheel & Pedal Diagnostic | HardwareTest',
    metaDescription: 'Test racing wheels and pedals online. Inspect steering angle, throttle/brake response, shifters, and buttons via Gamepad API.'
  },
  {
    id: 'flight-stick-tester',
    name: 'Flight Stick Tester',
    slug: 'flight-stick-tester',
    path: '/flight-stick-tester',
    category: 'input',
    categoryLabel: 'Input Devices',
    shortDesc: 'Test flight stick X/Y gimbal deflection, twist rudder, throttle lever, 8-way POV hat, and buttons.',
    fullDesc: 'Online joystick and flight stick diagnostic tool. Inspect 2D gimbal pitch and roll deflection reticle, Z-axis rudder yaw, throttle and collective axes, 8-way hat switch, and button responsiveness with a non-destructive visual display zeroing action.',
    iconName: 'Crosshair',
    badge: 'HOTAS',
    tags: ['Flight Stick', 'HOTAS', 'Gimbal Crosshair', 'POV Hat', 'Rudder Yaw', 'Throttle'],
    features: [
      'High-precision 2D gimbal radar reticle for pitch and roll',
      'Z-axis twist rudder and progressive throttle lever visualizers',
      '8-way directional POV hat switch monitor',
      'Visual reference reset and display zeroing action'
    ],
    specs: [
      { label: 'API Protocol', value: 'HTML5 Gamepad API' },
      { label: 'Stick Types', value: 'Joysticks, HOTAS, Flight Sticks' },
      { label: 'Update Interval', value: 'Synced to requestAnimationFrame' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Flight Stick Tester - Online Joystick & HOTAS Diagnostics | HardwareTest',
    metaDescription: 'Test your flight stick, joystick, or HOTAS online. Check X/Y axis crosshair, twist rudder, throttle lever, POV hat switch, and buttons.'
  },
  {
    id: 'vr-controller-tester',
    name: 'VR Controller Compatibility Test',
    slug: 'vr-controller-tester',
    path: '/vr-controller-tester',
    category: 'input',
    categoryLabel: 'Input Devices',
    shortDesc: 'Check WebXR immersive VR support, controller connection status, buttons, and analog thumbsticks.',
    fullDesc: 'Browser-based VR hardware and controller compatibility tester powered by WebXR. Check whether your browser and headset support immersive VR, verify left and right controller connectivity, and test triggers, grip squeeze, thumbsticks, and face buttons.',
    iconName: 'Headset',
    badge: 'WebXR',
    tags: ['WebXR', 'VR Controllers', 'Immersive VR', 'Meta Quest', 'SteamVR', 'OpenXR'],
    features: [
      'Browser WebXR Device API and immersive VR availability check',
      'User-initiated secure WebXR session launcher',
      'Left & Right controller connection and hand profile detector',
      'Real-time trigger pressure, grip squeeze, and thumbstick tracking'
    ],
    specs: [
      { label: 'API Protocol', value: 'W3C WebXR Device API' },
      { label: 'Session Type', value: 'immersive-vr' },
      { label: 'Supported Platforms', value: 'Meta Quest, SteamVR, OpenXR' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'VR Controller Compatibility Test - Online WebXR Device Checker | HardwareTest',
    metaDescription: 'Test VR headset and controller compatibility online using WebXR. Check browser support, controller connectivity, triggers, grip, and thumbsticks.'
  },
  {
    id: 'sound-test',
    name: 'Sound Test',
    slug: 'sound-test',
    path: '/sound-test',
    category: 'audio-video',
    categoryLabel: 'Audio & Video',
    shortDesc: 'Stereo balance, 3D spatial surround, frequency sweep (20Hz-20kHz), and bass test.',
    fullDesc: 'High-fidelity audio diagnostic suite powered by the Web Audio API. Test left/right stereo channel separation, pure sine wave frequency sweep from 20Hz sub-bass up to 20,000Hz treble, phase inversion, and spatial binaural positioning.',
    iconName: 'Volume2',
    badge: 'Hi-Res',
    tags: ['20Hz-20kHz Sweep', 'Stereo Imaging', 'Binaural 3D', 'Bass Boost'],
    features: [
      'Isolated Left / Right channel audio ping test',
      'Continuously variable frequency generator (20Hz - 20,000Hz)',
      'Subwoofer low-frequency rumble & resonance test',
      'Binaural 3D positional spatial audio demo'
    ],
    specs: [
      { label: 'Audio Engine', value: 'Web Audio API 32-bit Float' },
      { label: 'Sample Rates', value: '44.1 kHz / 48 kHz / 96 kHz' },
      { label: 'Channel Mode', value: 'Stereo / 5.1 / 7.1 Emulation' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Sound Test - Online Speaker & Headphone Audio Diagnostics | HardwareTest',
    metaDescription: 'Test speakers and headphones online. Stereo channel separation, 20Hz-20kHz frequency sweep, bass response and 3D spatial audio.'
  },
  {
    id: 'microphone-test',
    name: 'Microphone Test',
    slug: 'microphone-test',
    path: '/microphone-test',
    category: 'audio-video',
    categoryLabel: 'Audio & Video',
    shortDesc: 'Real-time VU meter, audio visualizer, background noise level, and instant playback.',
    fullDesc: 'Comprehensive mic testing lab. Check input volume, audio clarity, real-time frequency spectrum (FFT), background noise floor (dB), echo cancellation, and immediate loopback voice playback with zero latency.',
    iconName: 'Mic',
    badge: 'Live FFT',
    tags: ['VU Meter', 'Noise Floor dB', 'Audio Loopback', 'Spectrum FFT'],
    features: [
      'Dynamic real-time Fast Fourier Transform (FFT) spectrogram',
      'Peak volume VU meter with clipping indicator',
      'One-click instant playback recording test',
      'Ambient noise floor (dBFS) level measurement'
    ],
    specs: [
      { label: 'Processing', value: 'Realtime WebRTC & MediaStream' },
      { label: 'FFT Size', value: '2048 frequency bins' },
      { label: 'Gain Control', value: 'Auto Gain & Noise Suppression' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Microphone Test - Online Mic Check & Audio Visualizer | HardwareTest',
    metaDescription: 'Free online microphone tester. Test mic volume, audio quality, background noise levels, live frequency spectrum, and instant playback.'
  },
  {
    id: 'internet-speed-test',
    name: 'Internet Speed Test',
    slug: 'internet-speed-test',
    path: '/internet-speed-test',
    category: 'network',
    categoryLabel: 'Network & Connectivity',
    shortDesc: 'Measure download speed, upload bandwidth, ping latency, and jitter with multi-stream CDN.',
    fullDesc: 'Ultra-fast, low-latency speed test. Measures ping (RTT), loaded vs unloaded latency, packet jitter, and multi-stream download/upload throughput without clunky Flash or ads.',
    iconName: 'Wifi',
    badge: 'Gigabit Ready',
    tags: ['Ping & Jitter', 'Download Mbps', 'Upload Mbps', 'Bufferbloat'],
    features: [
      'Multi-threaded concurrent download stream throughput',
      'Fast upload payload performance benchmark',
      'Ultra-precise low-latency ping and jitter calculation',
      'Bufferbloat loaded latency grade'
    ],
    specs: [
      { label: 'Max Bandwidth', value: 'Up to 10 Gbps' },
      { label: 'Latency Accuracy', value: 'Sub-millisecond Web Timing API' },
      { label: 'Protocol', value: 'HTTP/2 & HTTP/3 WebTransport' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Internet Speed Test - Fast Ping, Download & Upload Test | HardwareTest',
    metaDescription: 'Test your internet speed with low latency ping, jitter, download and upload bandwidth meters. Fast, accurate, and ad-free.'
  },
  {
    id: 'camera-test',
    name: 'Camera Test',
    slug: 'camera-test',
    path: '/camera-test',
    category: 'audio-video',
    categoryLabel: 'Audio & Video',
    shortDesc: 'Verify webcam resolution (4K/1080p), FPS rate, color fidelity, and auto-exposure.',
    fullDesc: 'Test any USB, integrated, or virtual webcam. Inspect supported native resolutions up to 4K 60FPS, measure actual capture framerate, test aspect ratios, check brightness/contrast, and capture high-res sample snapshots.',
    iconName: 'Camera',
    badge: '4K Ready',
    tags: ['4K / 60 FPS', 'Resolution Matrix', 'Snapshot', 'Exposure Check'],
    features: [
      'Live camera feed with instant resolution switcher (4K, 1080p, 720p)',
      'Real-time framerate (FPS) capture counter',
      'Brightness, contrast, and color balance controls',
      'High-resolution snapshot photo capture & download'
    ],
    specs: [
      { label: 'Max Resolution', value: '3840 x 2160 (4K UHD)' },
      { label: 'Video Protocol', value: 'HTML5 MediaStream / WebRTC' },
      { label: 'Privacy', value: '100% Client-side, zero video upload' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Camera Test - Online Webcam Check, Resolution & FPS Test | HardwareTest',
    metaDescription: 'Test your webcam online. Check camera resolution up to 4K, capture framerate (FPS), video quality, and capture test photos.'
  },
  {
    id: 'can-i-run-it',
    name: 'Can I Run It?',
    slug: 'can-i-run-it',
    path: '/can-i-run-it',
    category: 'performance',
    categoryLabel: 'Compatibility Check',
    shortDesc: 'Check whether your PC can run a game or software before you install or buy it.',
    fullDesc: 'Instant PC compatibility checker. Detects your hardware automatically, compares against official game and software requirements, and shows you exactly whether your CPU, GPU, RAM, and storage meet the minimum and recommended specs — with a detailed component breakdown.',
    iconName: 'Gamepad2',
    badge: 'New',
    tags: ['Can I Run It', 'PC Specs', 'Game Requirements', 'Compatibility'],
    features: [
      'Auto-detects GPU, CPU, RAM, and OS from your browser',
      'Compares against official minimum and recommended requirements',
      'Component-level compatibility scores with bottleneck detection',
      'Supports games and professional software (Premiere, Blender, AutoCAD…)'
    ],
    specs: [
      { label: 'Detection', value: 'Browser-native WebGL + Navigator APIs' },
      { label: 'Database', value: 'Official publisher requirements' },
      { label: 'Privacy', value: '100% local — no data sent to servers' }
    ],
    isPopular: true,
    isAvailable: true,
    status: 'Ready',
    metaTitle: 'Can I Run It? — PC Game & Software Compatibility Checker | HardwareTest',
    metaDescription: 'Check if your PC can run any game or software. Automatic hardware detection, minimum and recommended requirement comparison, and detailed compatibility report.'
  }
];


export const TOOL_CATEGORIES = [
  { id: 'all', label: 'All Tools', count: TOOLS_DATA.length },
  { id: 'input', label: 'Input & Peripherals', count: TOOLS_DATA.filter(t => t.category === 'input').length },
  { id: 'audio-video', label: 'Audio & Video', count: TOOLS_DATA.filter(t => t.category === 'audio-video').length },
  { id: 'performance', label: 'Performance & Specs', count: TOOLS_DATA.filter(t => t.category === 'performance').length },
  { id: 'display', label: 'Display & Screen', count: TOOLS_DATA.filter(t => t.category === 'display').length },
  { id: 'network', label: 'Network & Speed', count: TOOLS_DATA.filter(t => t.category === 'network').length },
];

export const WHY_CHOOSE_US_DATA = [
  {
    id: 'lightning-fast',
    title: 'Lightning Fast',
    description: 'Instant launch with zero wait times. Powered by WebAssembly, WebGL 2.0, and Web Workers for zero-latency execution.',
    icon: 'Zap',
    highlight: '< 1ms Execution Delay',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
  },
  {
    id: 'free-to-use',
    title: '100% Free Forever',
    description: 'No hidden paywalls, no trial limits, no forced registrations. Access all professional hardware diagnostic suites unconditionally.',
    icon: 'Sparkles',
    highlight: '0 Subscriptions',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent'
  },
  {
    id: 'secure-private',
    title: 'Secure & Private',
    description: 'All tests execute directly inside your local browser sandbox. Your audio, camera feeds, keystrokes, and specs never leave your device.',
    icon: 'ShieldCheck',
    highlight: 'Zero Server Telemetry',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
  },
  {
    id: 'modern-easy',
    title: 'Modern & Easy to Use',
    description: 'Sleek, intuitive interfaces engineered for both casual users and hardware enthusiasts. One-click reports and instant sharing.',
    icon: 'LayoutGrid',
    highlight: 'Plug & Play Diagnostics',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent'
  }
];

export const FAQS_DATA = [
  {
    question: 'How do browser-based hardware tests work without downloading software?',
    answer: 'Modern web browsers support powerful low-level APIs such as WebHID, WebRTC, WebGL, Web Audio, and the HTML5 Gamepad API. These APIs allow direct, secure communication with your connected hardware in a sandboxed client environment without needing third-party executables.'
  },
  {
    question: 'Is my hardware data or camera feed stored on your servers?',
    answer: 'Never. All test logic runs 100% client-side in your browser JavaScript runtime. We do not transmit, record, or store any camera footage, microphone audio, keystrokes, or private hardware serial numbers.'
  },
  {
    question: 'How accurate is the online polling rate and latency measurement?',
    answer: 'Our testing engines utilize high-resolution timestamps via window.performance.now() and requestAnimationFrame synchronization, achieving sub-millisecond precision accurate up to 8000Hz polling rate for modern gaming peripherals.'
  },
  {
    question: 'Which browsers are supported?',
    answer: 'We support all modern Chromium browsers (Google Chrome, Microsoft Edge, Brave, Opera) with full WebHID and Gamepad support, as well as Mozilla Firefox and Apple Safari for all standard audio, video, screen, and benchmark suites.'
  }
];
