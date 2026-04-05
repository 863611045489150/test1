import { useState } from 'react';
import { type EvaluationResult } from '@/lib/evaluation';
import { triggerHaptic, playClickSound } from '@/lib/audio';
import ConditionModal from './ConditionModal';

interface Props {
  result: EvaluationResult;
  onRestart: () => void;
}

const SEVERITY_CONFIG = {
  equilibrium: {
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    label: 'Neural Equilibrium',
    tagClass: 'tag-green',
  },
  overload: {
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    label: 'Acute Cognitive Overload',
    tagClass: 'tag-amber',
  },
  fatigue: {
    color: '#F97316',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.25)',
    label: 'Persistent Neural Fatigue',
    tagClass: 'tag-orange',
  },
  anxiety: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    label: 'Hyper-Reactive Anxiety State',
    tagClass: 'tag-red',
  },
};

export default function ResultsPage({ result, onRestart }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[result.severity];

  const openModal = () => {
    triggerHaptic('standard');
    playClickSound();
    setModalOpen(true);
  };

  const closeModal = () => {
    triggerHaptic('standard');
    setModalOpen(false);
  };

  const ringCircumference = 2 * Math.PI * 36;
  const ringOffset = ringCircumference * (1 - result.percentage / 100);

  return (
    <div className="w-full space-y-4 fade-in">
      {/* Score header card */}
      <div className="bento-card p-6 md:p-8" style={{ animationDelay: '0ms' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <span className="tag tag-purple mb-2 inline-flex">Neuro-Report Complete</span>
            <h2 className="text-xl md:text-2xl font-bold text-white">Symptom Cluster Analysis</h2>
            <p className="text-[#94A3B8] text-sm mt-1">{result.conditionLabel} profile · {result.score}/{result.maxScore} weighted score</p>
          </div>
          <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
            <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={40} cy={40} r={36} fill="none" stroke="#2A2A35" strokeWidth={4} />
              <circle
                cx={40} cy={40} r={36} fill="none"
                stroke={cfg.color}
                strokeWidth={4}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${cfg.color}80)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">{result.percentage}%</span>
              <span className="text-[#94A3B8] text-xs leading-none mt-0.5">load</span>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />
          <div>
            <p className="text-white text-sm font-semibold">{cfg.label}</p>
            <p className="text-xs mt-0.5" style={{ color: cfg.color }}>Score {result.score} / {result.maxScore}</p>
          </div>
        </div>
      </div>

      {/* Root Catalysts */}
      <div className="bento-card p-6 md:p-8 result-section-enter" style={{ animationDelay: '80ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="dot-indicator" />
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Root Catalysts</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mb-4 leading-relaxed">
          Your profile suggests the following neurological and psychological disruption patterns:
        </p>
        <div className="flex flex-col gap-3">
          {result.catalysts.map((catalyst, i) => (
            <div key={i} className="glassmorphic p-4">
              <p className="text-white text-sm font-semibold mb-1">{catalyst.title}</p>
              <p className="text-[#94A3B8] text-xs leading-relaxed">{catalyst.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Calibration */}
      <div className="bento-card p-6 md:p-8 result-section-enter" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="dot-indicator" style={{ background: 'linear-gradient(135deg, #D946EF, #8B5CF6)' }} />
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Immediate Calibration</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mb-4 leading-relaxed">
          Evidence-based interventions matched to your cluster profile:
        </p>
        <div className="flex flex-col gap-2.5">
          {result.strategies.map((strategy, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xs font-bold text-[#8B5CF6] flex-shrink-0 font-mono mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[#94A3B8] text-sm leading-relaxed">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Neuro-Alignment */}
      <div className="bento-card p-6 md:p-8 result-section-enter" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="dot-indicator" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Neuro-Alignment</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mb-3 leading-relaxed">
          Your profile matches symptoms of:
        </p>
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <p className="text-white font-semibold text-sm mb-1">{result.condition}</p>
          <p className="text-xs leading-relaxed" style={{ color: cfg.color }}>{result.neuroAlignment}</p>
        </div>
        <div className="divider" />
        <div className="mt-4">
          <button onClick={openModal} className="link-purple text-sm font-medium">
            Understand the science of this state →
          </button>
        </div>
      </div>

      <div className="result-section-enter" style={{ animationDelay: '320ms' }}>
        <button onClick={onRestart} className="outline-btn w-full rounded-2xl py-4 px-6 text-base">
          Run a new evaluation
        </button>
      </div>

      {modalOpen && (
        <ConditionModal result={result} onClose={closeModal} />
      )}
    </div>
  );
}
