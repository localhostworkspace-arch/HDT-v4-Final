import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { CompatibilityResult, ComponentScore } from '../../../types';

interface RequirementTableProps {
  result: CompatibilityResult;
}

const StatusIcon: React.FC<{ status: ComponentScore['status'] }> = ({ status }) => {
  if (status === 'pass') return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-label="Pass" />;
  if (status === 'warn') return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-label="Warning" />;
  if (status === 'fail') return <XCircle className="w-4 h-4 text-red-400 shrink-0" aria-label="Fail" />;
  return <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" aria-label="Unknown" />;
};

const statusLabel = (s: ComponentScore['status']) =>
  s === 'pass' ? '✓ Pass' : s === 'warn' ? '⚠ Warn' : s === 'fail' ? '✕ Fail' : '? Unknown';

const statusText = (s: ComponentScore['status']) =>
  s === 'pass' ? 'text-emerald-400' : s === 'warn' ? 'text-amber-400' : s === 'fail' ? 'text-red-400' : 'text-slate-500';

interface RowData {
  label: string;
  score: ComponentScore;
}

const rows: (result: CompatibilityResult) => RowData[] = (result) => [
  { label: 'GPU', score: result.gpu },
  { label: 'CPU', score: result.cpu },
  { label: 'VRAM', score: result.vram },
  { label: 'RAM', score: result.ram },
  { label: 'Storage', score: result.storage },
  { label: 'OS', score: result.os },
];

// ─── Desktop Table ────────────────────────────────────────────────────────────
const DesktopTable: React.FC<{ result: CompatibilityResult }> = ({ result }) => (
  <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-700/60">
    <table className="w-full text-sm" aria-label="Hardware compatibility table">
      <thead>
        <tr className="border-b border-slate-700/60 bg-slate-800/40">
          <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider w-24">Component</th>
          <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Your PC</th>
          <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Minimum</th>
          <th className="text-left px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Recommended</th>
          <th className="text-center px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider w-28">Result</th>
        </tr>
      </thead>
      <tbody>
        {rows(result).map(({ label, score }, i) => (
          <tr key={label} className={`border-b border-slate-800/60 last:border-0 ${i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10'}`}>
            <td className="px-4 py-3.5 font-semibold text-slate-300 text-sm">{label}</td>
            <td className="px-4 py-3.5 text-white font-medium text-sm">{score.userValue}</td>
            <td className="px-4 py-3.5 text-slate-400 text-sm">{score.requiredMinValue}</td>
            <td className="px-4 py-3.5 text-slate-400 text-sm">{score.requiredRecValue}</td>
            <td className="px-4 py-3.5">
              <div className="flex items-center justify-center gap-1.5">
                <StatusIcon status={score.status} />
                <span className={`text-xs font-bold ${statusText(score.status)}`}>{statusLabel(score.status)}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Mobile Cards ─────────────────────────────────────────────────────────────
const MobileCards: React.FC<{ result: CompatibilityResult }> = ({ result }) => (
  <div className="md:hidden space-y-3">
    {rows(result).map(({ label, score }) => (
      <div key={label} className="rounded-xl bg-slate-900/50 border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-white text-sm">{label}</span>
          <div className="flex items-center gap-1.5">
            <StatusIcon status={score.status} />
            <span className={`text-xs font-bold ${statusText(score.status)}`}>{statusLabel(score.status)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Your PC</span>
            <span className="text-white font-medium">{score.userValue}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Minimum</span>
            <span className="text-slate-400">{score.requiredMinValue}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Recommended</span>
            <span className="text-slate-400">{score.requiredRecValue}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const RequirementTable: React.FC<RequirementTableProps> = ({ result }) => (
  <div>
    <h3 className="text-base font-bold text-white mb-4">Hardware Compatibility</h3>
    <DesktopTable result={result} />
    <MobileCards result={result} />
  </div>
);
