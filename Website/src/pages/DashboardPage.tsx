import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Keyboard, 
  Mouse, 
  Monitor, 
  Gauge, 
  Star, 
  Volume2, 
  Gamepad2,
  Disc,
  Crosshair,
  Headset,
  Mic,
  Camera,
  ChevronRight, 
  ArrowRight, 
  Zap, 
  Clock, 
  Info, 
  CheckCircle2, 
  Globe, 
  Layers, 
  Laptop, 
  Sparkles,
  ClipboardCheck,
  Search
} from 'lucide-react';
import { detectSystemInfo, type SystemInfo } from '../services/systemDetection';
import { getTestActivities, formatTimeAgo, type TestActivity } from '../services/historyService';
import { HistoryModal } from '../components/dashboard/HistoryModal';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';
import { ADSENSE_CONFIG } from '../config/adsense';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [systemInfo, setSystemInfo] = useState<SystemInfo>(() => detectSystemInfo());
  const [recentActivities, setRecentActivities] = useState<TestActivity[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setSystemInfo(detectSystemInfo());
    setRecentActivities(getTestActivities().slice(0, 4));

    const handleHistoryUpdate = () => {
      setRecentActivities(getTestActivities().slice(0, 4));
    };

    window.addEventListener('hdt_history_updated', handleHistoryUpdate);
    return () => window.removeEventListener('hdt_history_updated', handleHistoryUpdate);
  }, []);

  const allTools = [
    {
      id: 'keyboard',
      title: 'Keyboard Test',
      category: 'input',
      badge: 'Popular',
      path: '/keyboard-tester',
      desc: 'Check all keys, ghosting, key chatter, rollover, and input latency in real time.',
      icon: Keyboard,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'mouse',
      title: 'Mouse Test',
      category: 'input',
      badge: 'Essential',
      path: '/mouse-tester',
      desc: 'Verify buttons, scroll wheel precision, double-click issues, and polling rate.',
      icon: Mouse,
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'gamepad',
      title: 'Gamepad Test',
      category: 'input',
      badge: 'Top Rated',
      path: '/gamepad-tester',
      desc: 'Diagnose stick drift, circularity error %, trigger pressure, and dual-rumble vibration.',
      icon: Gamepad2,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'wheel',
      title: 'Steering Wheel Test',
      category: 'input',
      badge: 'Sim Racing',
      path: '/steering-wheel-tester',
      desc: 'Inspect wheel rotation angle (180°–1080°), throttle, brake, clutch pedals, and shifters.',
      icon: Disc,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'flightstick',
      title: 'Flight Stick Test',
      category: 'input',
      badge: 'HOTAS',
      path: '/flight-stick-tester',
      desc: 'Inspect 2D gimbal radar crosshair, twist rudder yaw, throttle lever, and 8-way POV hat.',
      icon: Crosshair,
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'vr',
      title: 'VR Controller Test',
      category: 'input',
      badge: 'WebXR',
      path: '/vr-controller-tester',
      desc: 'Check WebXR immersive VR session support, left & right triggers, grip squeeze, and sticks.',
      icon: Headset,
      iconBg: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400',
    },
    {
      id: 'screen',
      title: 'On-Screen Test',
      category: 'display',
      badge: 'Multi-Hz',
      path: '/screen-test',
      desc: 'Check display for dead pixels, backlight bleed, refresh rate up to 360Hz, and contrast.',
      icon: Monitor,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'sound',
      title: 'Online Sound Test',
      category: 'audio-video',
      badge: 'Hi-Res',
      path: '/sound-test',
      desc: 'Stereo balance, 3D spatial audio, 20Hz–20kHz frequency sweep, and bass response.',
      icon: Volume2,
      iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'mic',
      title: 'Microphone Test',
      category: 'audio-video',
      badge: 'Live Audio',
      path: '/microphone-test',
      desc: 'Real-time volume VU meter, background noise floor (dB), and instant playback recording.',
      icon: Mic,
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'camera',
      title: 'Camera Test',
      category: 'audio-video',
      badge: '4K Ready',
      path: '/camera-test',
      desc: 'Verify webcam resolution (4K/1080p), capture FPS rate, video quality, and sample snapshots.',
      icon: Camera,
      iconBg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400',
    },
    {
      id: 'speed',
      title: 'Speed Test',
      category: 'network',
      badge: 'Gigabit',
      path: '/internet-speed-test',
      desc: 'Measure download speed, upload bandwidth, ping latency, and packet jitter in real time.',
      icon: Gauge,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'ratemypc',
      title: 'Rate My PC',
      category: 'performance',
      badge: 'Compatibility',
      path: '/can-i-run-it',
      desc: 'Check if your PC meets minimum and recommended specs for popular games and software.',
      icon: Star,
      iconBg: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400',
    }
  ];

  const categories = [
    { id: 'all', label: 'All Instruments', count: allTools.length },
    { id: 'input', label: 'Input & Gaming', count: allTools.filter(t => t.category === 'input').length },
    { id: 'audio-video', label: 'Audio & Video', count: allTools.filter(t => t.category === 'audio-video').length },
    { id: 'display', label: 'Display', count: allTools.filter(t => t.category === 'display').length },
    { id: 'network', label: 'Network & PC', count: allTools.filter(t => t.category === 'network' || t.category === 'performance').length },
  ];

  const filteredTools = allTools.filter((tool) => {
    const matchesCategory = 
      activeCategory === 'all' || 
      tool.category === activeCategory || 
      (activeCategory === 'network' && (tool.category === 'network' || tool.category === 'performance'));
    const matchesSearch = 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const quickActions = [
    {
      title: 'Keyboard Test',
      subtitle: 'Check all keys & ghosting',
      path: '/keyboard-tester',
      icon: Keyboard,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Mouse Test',
      subtitle: 'Check buttons & polling rate',
      path: '/mouse-tester',
      icon: Mouse,
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Gamepad Test',
      subtitle: 'Stick drift & buttons',
      path: '/gamepad-tester',
      icon: Gamepad2,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Steering Wheel',
      subtitle: 'Rotation & pedal pressure',
      path: '/steering-wheel-tester',
      icon: Disc,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400'
    },
    {
      title: 'Flight Stick',
      subtitle: 'Gimbal radar & throttle',
      path: '/flight-stick-tester',
      icon: Crosshair,
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400'
    },
    {
      title: 'VR Controller',
      subtitle: 'WebXR compatibility',
      path: '/vr-controller-tester',
      icon: Headset,
      iconBg: 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400'
    },
    {
      title: 'On-Screen Test',
      subtitle: 'Check display & pixels',
      path: '/screen-test',
      icon: Monitor,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Online Sound Test',
      subtitle: 'Speakers & headphones',
      path: '/sound-test',
      icon: Volume2,
      iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400'
    },
    {
      title: 'Speed Test',
      subtitle: 'Test download & upload',
      path: '/internet-speed-test',
      icon: Gauge,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Rate My PC',
      subtitle: 'Game compatibility',
      path: '/can-i-run-it',
      icon: Star,
      iconBg: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400'
    }
  ];

  const getActivityIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'keyboard':
        return <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'mouse':
        return <Mouse className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'monitor':
        return <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'gauge':
        return <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'star':
        return <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      case 'volume2':
        return <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'gamepad2':
        return <Gamepad2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'disc':
        return <Disc className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'crosshair':
        return <Crosshair className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'headset':
        return <Headset className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
      case 'mic':
        return <Mic className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'camera':
        return <Camera className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Grid: Left Area (72%) and Right Panels (28%) on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= LEFT MAIN COLUMN (lg:col-span-8 or 9) ================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {/* 1. Welcome Section Card */}
          <section className="hdt-card p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Laptop className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Welcome to HDT!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    Test your system components and check their performance. All tests are browser-based and easy to use.
                  </p>
                </div>
              </div>

              {/* Informational Badges on Right */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex-1 sm:flex-initial">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                      Browser Based
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      No installation required
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex-1 sm:flex-initial">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                      Fast & Simple
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      Get results in seconds
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Hardware Diagnostic Instruments Suite */}
          <section className="space-y-4" id="instruments">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Hardware Diagnostic Instruments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select an instrument below to start real-time browser hardware diagnostics.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search instruments…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hdt-card text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat.id ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Instruments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredTools.map((test) => {
                const Icon = test.icon;
                return (
                  <div
                    key={test.id}
                    onClick={() => navigate(test.path)}
                    className="group hdt-card hdt-card-interactive p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Icon + Title + Badge + Chevron */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${test.iconBg}`}>
                            <Icon className="w-5 h-5 stroke-[2]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {test.title}
                              </h3>
                            </div>
                            {test.badge && (
                              <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                                {test.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-1" />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {test.desc}
                      </p>
                    </div>

                    {/* Start Test Blue Button */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                      <Link
                        to={test.path}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-colors"
                      >
                        <span>Start Test</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="p-8 text-center hdt-card">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No instruments match your search.</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {/* Google AdSense Placement - Mid Dashboard In-Feed Banner */}
          <AdSenseSlot 
            slotId={ADSENSE_CONFIG.slots.dashboardHorizontal} 
            format="horizontal" 
            className="my-3"
          />

          {/* 3. Bottom Row (3 Cards: 100% Browser Based, Recent Activity, Tips & Info) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card A: 100% Browser Based */}
            <div className="hdt-card p-5 flex flex-col items-center text-center justify-center">
              {/* Illustration / Graphic */}
              <div className="relative mb-3 mt-1">
                <div className="w-16 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col p-1.5 shadow-2xs">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                100% Browser Based
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                All tests work directly in your browser. No downloads, no installation, no extra software required.
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
                Standard client sandboxing protects your system.
              </span>
            </div>

            {/* Card B: Recent Activity */}
            <div className="hdt-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Recent Activity
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHistoryModalOpen(true)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Activity List */}
                <div className="space-y-2.5">
                  {recentActivities.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No tests yet. Start your first test to see your activity here.
                    </div>
                  ) : (
                    recentActivities.map((act) => (
                      <Link
                        key={act.id}
                        to={act.path}
                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center shrink-0">
                            {getActivityIcon(act.iconName || act.toolName)}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
                              {act.toolName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatTimeAgo(act.timestamp)}
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                          {act.status}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Card C: Tips & Info */}
            <div className="hdt-card p-5">
              <div className="flex items-center gap-2 mb-3.5">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tips & Info
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    For the best results, use a modern browser (Chrome, Edge, Firefox).
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    Some advanced hardware info requires a local agent.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-3 h-3" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    Keep your system drivers up to date for better performance.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ================= RIGHT COLUMN (lg:col-span-4 or 3) ================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          {/* Panel 1: Your System */}
          <div className="hdt-card p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Your System
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Browser */}
              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>Browser</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {systemInfo.browserName} {systemInfo.browserVersion || 'Latest'}
                </span>
              </div>

              {/* Operating System */}
              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Operating System</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {systemInfo.osName}
                </span>
              </div>

              {/* Device Type */}
              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Monitor className="w-4 h-4 text-emerald-500" />
                  <span>Device Type</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {systemInfo.deviceType}
                </span>
              </div>

              {/* Resolution */}
              <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Laptop className="w-4 h-4 text-purple-500" />
                  <span>Resolution</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {systemInfo.screenResolution}
                </span>
              </div>
            </div>

            {/* Privacy note */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Browser privacy sandbox prevents reading CPU/GPU temperatures or fan metrics.
            </div>
          </div>

          {/* Google AdSense Placement - Rectangle Ad Unit (300x250) */}
          <AdSenseSlot 
            slotId={ADSENSE_CONFIG.slots.sidebarRectangle} 
            format="rectangle" 
            className="my-2"
          />

          {/* Panel 2: Quick Actions */}
          <div className="hdt-card p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Quick Actions
              </h3>
            </div>

            <div className="space-y-1.5">
              {quickActions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-100 dark:hover:border-slate-700/60 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.iconBg}`}>
                        <ActionIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          {action.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />
    </div>
  );
};
