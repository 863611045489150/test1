import { useState } from 'react';
import { type EvaluationResult } from '@/lib/evaluation';
import { triggerHaptic, playClickSound } from '@/lib/audio';
import ConditionModal from './ConditionModal';

interface Props {
  result: EvaluationResult;
  onRestart: () => void;
}

export default function ResultsPage({ result, onRestart }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    triggerHaptic();
    playClickSound();
    setModalOpen(true);
  };

  const closeModal = () => {
    triggerHaptic();
    setModalOpen(false);
  };

  const severityColor = {
    minimal: '#10B981',
    mild: '#F59E0B',
    moderate: '#F97316',
    severe: '#EF4444',
  }[result.severity];

  const severityLabel = {
    minimal: 'Minimal Impact',
    mild: 'Mild Impact',
    moderate: 'Moderate Impact',
    severe: 'Significant Impact',
  }[result.severity];

  return (
    <div className="w-full space-y-4 fade-in">
      <div className="bento-card p-6 md:p-8" style={{ animationDelay: '0ms' }}>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
          <div>
            <span className="tag tag-purple mb-2 inline-flex">Evaluation Complete</span>
            <h2 className="text-xl md:text-2xl font-bold text-white">Your Wellness Profile</h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                background: `${severityColor}20`,
                border: `1px solid ${severityColor}40`,
                color: severityColor,
              }}
            >
              {severityLabel}
            </span>
            <span className="text-[#94A3B8] text-xs">{result.percentage}% stress load</span>
          </div>
        </div>

        <div className="progress-bar mb-2">
          <div
            className="progress-fill"
            style={{
              width: `${result.percentage}%`,
              background: result.percentage > 70
                ? 'linear-gradient(90deg, #F97316, #EF4444)'
                : result.percentage > 45
                ? 'linear-gradient(90deg, #F59E0B, #F97316)'
                : 'linear-gradient(90deg, #8B5CF6, #D946EF)',
            }}
          />
        </div>
        <p className="text-[#94A3B8] text-xs text-right">{result.score} / {result.maxScore} weighted score</p>
      </div>

      <div
        className="bento-card p-6 md:p-8 result-section-enter"
        style={{ animationDelay: '80ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="dot-indicator" />
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Potential Catalysts</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mb-4 leading-relaxed">
          Based on your responses, your current state may be driven by one or more of the following:
        </p>
        <div className="flex flex-col gap-2">
          {result.catalysts.map((catalyst, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #D946EF)' }} />
              <span className="text-white text-sm leading-relaxed">{catalyst}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="bento-card p-6 md:p-8 result-section-enter"
        style={{ animationDelay: '160ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="dot-indicator" style={{ background: 'linear-gradient(135deg, #D946EF, #8B5CF6)' }} />
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Immediate Wellness Strategies</h3>
        </div>
        <div className="flex flex-col gap-3">
          {result.strategies.map((strategy, i) => (
            <div key={i} className="glassmorphic p-4 flex items-start gap-3">
              <span className="text-xs font-bold text-[#8B5CF6] mt-0.5 flex-shrink-0 font-mono">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[#94A3B8] text-sm leading-relaxed">{strategy}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="bento-card p-6 md:p-8 result-section-enter"
        style={{ animationDelay: '240ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="dot-indicator" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }} />
          <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Symptom Alignment</h3>
        </div>
        <p className="text-[#94A3B8] text-sm mb-3 leading-relaxed">
          Your profile aligns with symptoms often seen in:
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="tag tag-purple text-sm">{result.symptomAlignment}</span>
        </div>
        <div className="mt-4 pt-4 divider" />
        <div className="mt-4">
          <button
            onClick={openModal}
            className="link-purple text-sm font-medium"
          >
            Know more about {result.condition} →
          </button>
        </div>
      </div>

      <div className="result-section-enter" style={{ animationDelay: '320ms' }}>
        <button
          onClick={onRestart}
          className="outline-btn w-full rounded-2xl py-4 px-6 text-base"
        >
          Start a new evaluation
        </button>
      </div>

      {modalOpen && (
        <ConditionModal result={result} onClose={closeModal} />
      )}
    </div>
  );
}
