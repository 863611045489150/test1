import { type EvaluationResult } from '@/lib/evaluation';
import { useEffect, useCallback } from 'react';

interface Props {
  result: EvaluationResult;
  onClose: () => void;
}

export default function ConditionModal({ result, onClose }: Props) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(11,11,14,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-content w-full max-w-lg bento-card p-6 md:p-8 max-h-[88vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 0 1px rgba(139,92,246,0.3), 0 40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(139,92,246,0.12)',
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="tag tag-purple mb-2 inline-flex">Clinical Science Overview</span>
            <h3 className="text-xl font-bold text-white">{result.condition}</h3>
            <p className="text-[#94A3B8] text-xs mt-1">{result.conditionLabel} profile</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#2A2A35] transition-colors flex-shrink-0 ml-4 mt-1"
          >
            ✕
          </button>
        </div>

        <div className="divider mb-5" />

        <p className="text-[#94A3B8] text-sm leading-relaxed mb-5">
          {result.conditionDetail}
        </p>

        <div className="glassmorphic p-4 mb-5">
          <p className="text-xs text-[#94A3B8] font-semibold uppercase tracking-widest mb-2">Clinical Disclaimer</p>
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            This overview is for educational purposes only. A formal diagnosis requires assessment by a licensed mental health professional. If you are in acute distress, please contact a crisis line or clinical service in your region immediately.
          </p>
        </div>

        <button
          onClick={onClose}
          className="gradient-btn w-full rounded-2xl py-3 px-5 text-sm font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
