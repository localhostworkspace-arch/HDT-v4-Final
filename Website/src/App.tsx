import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { HashRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TOOLS_DATA } from './data/toolsData';
import { recordTestActivity } from './services/historyService';

const ToolDetailPage = lazy(() => import('./pages/ToolDetailPage').then(m => ({ default: m.ToolDetailPage })));
const CanIRunItPage = lazy(() => import('./pages/CanIRunItPage').then(m => ({ default: m.CanIRunItPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));

const KeyboardTester = lazy(() => import('./components/tools/KeyboardTester/KeyboardTester').then(m => ({ default: m.KeyboardTester })));
const MouseTester = lazy(() => import('./components/tools/MouseTester/MouseTester').then(m => ({ default: m.MouseTester })));
const GamepadTester = lazy(() => import('./components/tools/GamepadTester/GamepadTester').then(m => ({ default: m.GamepadTester })));
const ScreenTester = lazy(() => import('./components/tools/ScreenTester/ScreenTester').then(m => ({ default: m.ScreenTester })));
const InternetSpeedTester = lazy(() => import('./components/tools/InternetSpeedTester/InternetSpeedTester').then(m => ({ default: m.InternetSpeedTester })));
const SteeringWheelTester = lazy(() => import('./components/tools/SteeringWheelTester/SteeringWheelTester').then(m => ({ default: m.SteeringWheelTester })));
const FlightStickTester = lazy(() => import('./components/tools/FlightStickTester/FlightStickTester').then(m => ({ default: m.FlightStickTester })));
const VrControllerTester = lazy(() => import('./components/tools/VrTester/VrControllerTester').then(m => ({ default: m.VrControllerTester })));

const toolRoutes = [
  { paths: ['/keyboard-tester'], View: KeyboardTester, toolId: 'keyboard-tester', name: 'Keyboard Test', icon: 'Keyboard' },
  { paths: ['/mouse-tester'], View: MouseTester, toolId: 'mouse-tester', name: 'Mouse Test', icon: 'Mouse' },
  { paths: ['/gamepad-tester', '/gamepad-test', '/controller-tester'], View: GamepadTester, toolId: 'gamepad-tester', name: 'Game Test', icon: 'Gamepad2' },
  { paths: ['/screen-test', '/screen-tester', '/dead-pixel-test'], View: ScreenTester, toolId: 'screen-test', name: 'On-Screen Test', icon: 'Monitor' },
  { paths: ['/internet-speed-test', '/speed-test'], View: InternetSpeedTester, toolId: 'internet-speed-test', name: 'Speed Test', icon: 'Gauge' },
  { paths: ['/steering-wheel-tester', '/wheel-tester', '/wheel-test'], View: SteeringWheelTester, toolId: 'steering-wheel-tester', name: 'Steering Wheel Test', icon: 'Disc' },
  { paths: ['/flight-stick-tester', '/joystick-tester', '/flight-stick-test'], View: FlightStickTester, toolId: 'flight-stick-tester', name: 'Flight Stick Test', icon: 'Crosshair' },
  { paths: ['/vr-controller-tester', '/vr-compatibility-test', '/vr-tester'], View: VrControllerTester, toolId: 'vr-controller-tester', name: 'VR Controller Test', icon: 'Headset' },
];

const dedicatedPaths = new Set(toolRoutes.flatMap(route => route.paths).concat('/can-i-run-it'));

class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { 
    return this.state.failed ? (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 m-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">This tool could not load.</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
          Reload the page to try again. Your browser may have blocked a required resource.
        </p>
        <button 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer" 
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    ) : this.props.children; 
  }
}

function PageTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Automatically record activity when visiting a test tool
    const matchingToolRoute = toolRoutes.find(r => r.paths.includes(pathname));
    if (matchingToolRoute) {
      recordTestActivity({
        toolId: matchingToolRoute.toolId,
        toolName: matchingToolRoute.name,
        path: pathname,
        iconName: matchingToolRoute.icon,
        status: 'Completed'
      });
    } else if (pathname === '/can-i-run-it' || pathname.startsWith('/can-i-run-it/')) {
      recordTestActivity({
        toolId: 'can-i-run-it',
        toolName: 'Rate My PC',
        path: '/can-i-run-it',
        iconName: 'Star',
        status: 'Completed'
      });
    } else if (pathname === '/sound-test') {
      recordTestActivity({
        toolId: 'sound-test',
        toolName: 'Online Sound Test',
        path: '/sound-test',
        iconName: 'Volume2',
        status: 'Completed'
      });
    }
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const { pathname } = useLocation();

  return (
    <RouteErrorBoundary key={pathname}>
      <PageTracker />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px] text-slate-400" role="status">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-medium">Loading instrument…</span>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/all-tools" element={<Navigate to="/" replace />} />
          {toolRoutes.flatMap(({ paths, View }) => paths.map(path => (
            <Route key={path} path={path} element={<View />} />
          )))}
          {TOOLS_DATA.filter(tool => !dedicatedPaths.has(tool.path)).map(tool => (
            <Route key={tool.path} path={tool.path} element={<ToolDetailPage key={tool.path} />} />
          ))}
          <Route path="/can-i-run-it/:slug?" element={<CanIRunItPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/privacy-policy" element={<LegalPage />} />
          <Route path="/terms-of-service" element={<LegalPage />} />
          <Route path="*" element={
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                404 / Page Not Found
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Instrument not found.
              </h1>
              <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          } />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HashRouter>
          <DashboardLayout>
            <AppRoutes />
          </DashboardLayout>
        </HashRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
