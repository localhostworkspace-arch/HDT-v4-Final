import React from 'react';
import { SeoHead } from '../components/seo/SeoHead';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    slug: 'testing-8000hz-gaming-mice-in-browser',
    title: 'How to Accurately Test 8000Hz Gaming Mouse Polling Rate in Modern Browsers',
    excerpt: 'Modern gaming mice offer hyper-polling up to 8000Hz. Here is how WebHID and high-precision event timing calculate true polling consistency and jitter.',
    date: 'Sep 2026',
    readTime: '4 min read',
    tag: 'Input Hardware'
  },
  {
    slug: 'fixing-controller-stick-drift-online',
    title: 'Diagnosing Controller Stick Drift: Deadzones, Potentiometers & Hall Effect Sensors',
    excerpt: 'Understand circularity error graphs and deadzone calibration for Xbox, DualSense, and custom hall-effect gamepads.',
    date: 'Aug 2026',
    readTime: '6 min read',
    tag: 'Gamepads'
  },
  {
    slug: 'webgl-2-vs-webgpu-stress-benchmarks',
    title: 'The Evolution of WebGL 2.0 and WebGPU for Browser 3D Stress Benchmarks',
    excerpt: 'How client-side shaders and 100,000+ particle simulations evaluate GPU compute capability and frame pacing.',
    date: 'Jul 2026',
    readTime: '5 min read',
    tag: 'GPU & Graphics'
  }
];

export const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-12 pb-24 text-slate-100">
      <SeoHead
        title="Hardware & Diagnostic Engineering Blog | HardwareTest"
        description="Technical deep dives on peripheral latency, WebHID APIs, 3D graphics benchmarking, and browser hardware diagnostics."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hardware Engineering Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Technical Articles &amp; Benchmarks
          </h1>
          <p className="text-base text-slate-400 max-w-xl mx-auto">
            Insights on low-latency browser APIs, hardware telemetry, display calibration, and peripheral engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => (
            <div
              key={post.slug}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-semibold text-indigo-400">{post.tag}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400">
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
