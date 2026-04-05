import { useState, useEffect, useCallback } from 'react';
import { QUESTIONS, computeResult, type EvaluationResult } from '@/lib/evaluation';
import { playClickSound, playTransitionSound, triggerHaptic } from '@/lib/audio';
import ResultsPage from './ResultsPage';

type Phase = 'landing' | 'questions' | 'analyzing' | 'results' | 'no-weight';

interface ProgressRingProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ current, total, size = 48, strokeWidth = 3 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = current / total;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A35"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: 'none' }}
      >
        <span className="text-white font-semibold" style={{ fontSize: size * 0.24 }}>
          {current}
        </span>
      </div>
    </div>
  );
}

export default function SerenityApp() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [watermarkGlowing, setWatermarkGlowing] = useState(false);

  const handleInteraction = useCallback(() => {
    triggerHaptic('standard');
    playClickSound();
  }, []);

  const pulseWatermark = useCallback(() => {
    setWatermarkGlowing(true);
    setTimeout(() => setWatermarkGlowing(false), 1200);
  }, []);

  const transitionTo = useCallback((next: Phase, delay = 350) => {
    setAnimating(true);
    setTimeout(() => {
      setPhase(next);
      setCardKey((k) => k + 1);
      setAnimating(false);
    }, delay);
  }, []);

  const handleLandingYes = () => {
    handleInteraction();
    playTransitionSound();
    transitionTo('questions');
  };

  const handleLandingNo = () => {
    handleInteraction();
    transitionTo('no-weight');
  };

  const handleOptionSelect = (value: string) => {
    triggerHaptic('select');
    playClickSound();
    setSelectedOption(value);
    pulseWatermark();
  };

  const handleNext = () => {
    if (!selectedOption) return;
    triggerHaptic('transition');
    playTransitionSound();

    const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: selectedOption };
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ((q) => q + 1);
        setSelectedOption(null);
        setCardKey((k) => k + 1);
        setAnimating(false);
      }, 350);
    } else {
      setAnimating(true);
      setTimeout(() => {
        setPhase('analyzing');
        setCardKey((k) => k + 1);
        setAnimating(false);
      }, 350);

      setTimeout(() => {
        const evalResult = computeResult(newAnswers);
        setResult(evalResult);
        setAnimating(true);
        setTimeout(() => {
          setPhase('results');
          setCardKey((k) => k + 1);
          setAnimating(false);
        }, 350);
      }, 2700);
    }
  };

  const handleRestart = () => {
    handleInteraction();
    setCurrentQ(0);
    setAnswers({});
    setSelectedOption(null);
    setResult(null);
    transitionTo('landing');
  };

  const completedQuestions = Object.keys(answers).length + (phase === 'questions' && selectedOption ? 1 : 0);

  return (
    <div className="gradient-bg min-h-screen w-full flex flex-col relative">
      <div
        className="watermark pt-4 pb-2 w-full relative z-10 transition-all duration-500"
        style={watermarkGlowing ? {
          color: 'rgba(196,181,253,0.7)',
          textShadow: '0 0 12px rgba(139,92,246,0.8), 0 0 24px rgba(217,70,239,0.4)',
        } : {}}
      >
        DEVELOPED BY AARUSH
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative z-10">
        <div
          className={`w-full max-w-lg transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
          key={cardKey}
          style={{ animation: animating ? undefined : 'slideEnter 0.45s cubic-bezier(0.25,0.46,0.45,0.94) forwards' }}
        >
          {phase === 'landing' && (
            <LandingCard onYes={handleLandingYes} onNo={handleLandingNo} />
          )}
          {phase === 'no-weight' && (
            <NoWeightCard onRestart={handleRestart} />
          )}
          {phase === 'questions' && (
            <QuestionCard
              question={QUESTIONS[currentQ]}
              questionIndex={currentQ}
              totalQuestions={QUESTIONS.length}
              completedCount={completedQuestions}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
              onNext={handleNext}
            />
          )}
          {phase === 'analyzing' && (
            <AnalyzingCard />
          )}
          {phase === 'results' && result && (
            <ResultsPage result={result} onRestart={handleRestart} />
          )}
        </div>
      </main>

      <footer className="relative z-10 pb-5 px-4">
        <p className="disclaimer">
          This is not a medical tool. Please consult a specialist before conducting or doing anything.
        </p>
      </footer>
    </div>
  );
}

function LandingCard({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="bento-card p-8 md:p-10 slide-enter">
      <div className="mb-6">
        <span className="tag tag-purple mb-4 inline-flex">Neuro-Wellness Evaluation</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
        Are you carrying a psychological or emotional weight today?
      </h1>

      <p className="text-[#94A3B8] text-sm mb-8 leading-relaxed">
        An 8-question deep-profile evaluation using weighted symptom clustering.
        Your responses are processed locally and never stored.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          onClick={onYes}
          className="gradient-btn flex-1 rounded-2xl py-4 px-6 text-base font-semibold"
        >
          Yes, I am
        </button>
        <button
          onClick={onNo}
          className="outline-btn flex-1 rounded-2xl py-4 px-6 text-base"
        >
          No, I'm okay
        </button>
      </div>

      <div className="divider" />
      <div className="mt-5 flex items-center gap-4">
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2A2A35]" />
          ))}
        </div>
        <span className="text-[#94A3B8] text-xs">8 deep-profile questions · 0–24 weighted score</span>
      </div>
    </div>
  );
}

function NoWeightCard({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="bento-card p-8 md:p-10 slide-enter text-center">
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#D946EF]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-2xl">
          ✦
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Neural Equilibrium Detected.</h2>
      <p className="text-[#94A3B8] mb-8 leading-relaxed text-sm">
        Your baseline appears stable. That's worth acknowledging — equilibrium is a state that requires active maintenance. Return anytime.
      </p>
      <button onClick={onRestart} className="gradient-btn rounded-2xl py-4 px-8 text-base font-semibold">
        Return to start
      </button>
    </div>
  );
}

const OPTION_COLORS: Record<string, string> = {
  never: '#10B981',
  rarely: '#F59E0B',
  often: '#F97316',
  constant: '#EF4444',
};

function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  completedCount,
  selectedOption,
  onSelect,
  onNext,
}: {
  question: typeof QUESTIONS[0];
  questionIndex: number;
  totalQuestions: number;
  completedCount: number;
  selectedOption: string | null;
  onSelect: (v: string) => void;
  onNext: () => void;
}) {
  const isLast = questionIndex === totalQuestions - 1;

  return (
    <div className="bento-card p-6 md:p-8 slide-enter">
      <div className="flex items-center justify-between mb-5">
        <span className="tag tag-purple">{question.category}</span>
        <ProgressRing current={completedCount} total={totalQuestions} size={44} strokeWidth={3} />
      </div>

      <div className="mb-1 flex items-center gap-2">
        <span className="text-[#94A3B8] text-xs font-mono tracking-widest uppercase">
          Scanning {questionIndex + 1} of {totalQuestions}
        </span>
        <span className="scanning-dot" />
      </div>

      <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-snug">
        {question.text}
      </h2>

      <div className="flex flex-col gap-2.5 mb-6">
        {question.options.map((option) => {
          const accentColor = OPTION_COLORS[option.value] ?? '#8B5CF6';
          const isSelected = selectedOption === option.value;
          return (
            <button
              key={option.value}
              className={`option-card ${isSelected ? 'selected' : ''}`}
              style={isSelected ? {
                borderColor: `${accentColor}90`,
                boxShadow: `0 0 0 1px ${accentColor}40, 0 0 24px ${accentColor}20`,
                background: `${accentColor}0D`,
              } : {}}
              onClick={() => onSelect(option.value)}
            >
              <span
                className="option-radio"
                style={isSelected ? { borderColor: accentColor, background: accentColor } : {}}
              >
                <span className="option-radio-dot" />
              </span>
              <span className="flex-1">{option.label}</span>
              {isSelected && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: `${accentColor}20`,
                    color: accentColor,
                    border: `1px solid ${accentColor}40`,
                  }}
                >
                  {option.weight}pt
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedOption}
        className="gradient-btn w-full rounded-2xl py-4 px-6 text-base font-semibold disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {isLast ? 'Generate Neuro-Report' : 'Next Signal'}
      </button>
    </div>
  );
}

function AnalyzingCard() {
  const [dots, setDots] = useState('');
  const [stage, setStage] = useState(0);

  const stages = [
    'Scanning symptom clusters',
    'Mapping neural correlates',
    'Synthesizing neuro-report',
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);

    const stageInterval = setInterval(() => {
      setStage((s) => (s < stages.length - 1 ? s + 1 : s));
    }, 900);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className="bento-card p-10 md:p-14 slide-enter text-center">
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full pulse-glow"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(217,70,239,0.5) 0%, rgba(139,92,246,0.4) 40%, transparent 70%)',
              border: '1px solid rgba(139,92,246,0.5)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 60%)',
            }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white mb-2">
        {stages[stage]}{dots}
      </h2>
      <p className="text-[#94A3B8] text-sm mb-8">
        Cross-referencing your profile against clinical indicators
      </p>

      <div className="flex justify-center gap-2">
        {stages.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-700"
            style={{
              width: i <= stage ? 24 : 8,
              background: i <= stage
                ? 'linear-gradient(90deg, #8B5CF6, #D946EF)'
                : '#2A2A35',
            }}
          />
        ))}
      </div>
    </div>
  );
}
