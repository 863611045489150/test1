import { useState, useEffect, useCallback } from 'react';
import { QUESTIONS, computeResult, type EvaluationResult } from '@/lib/evaluation';
import { playClickSound, playTransitionSound, triggerHaptic } from '@/lib/audio';
import ResultsPage from './ResultsPage';
import GuidedChat from './GuidedChat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

type Phase = 'landing' | 'questions' | 'analyzing' | 'results' | 'no-weight' | 'guided-chat';

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

    setTimeout(() => {
      triggerHaptic('transition');
      playTransitionSound();

      const newAnswers = { ...answers, [QUESTIONS[currentQ].id]: value };
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
    }, 390);
  };

  const handleRestart = () => {
    handleInteraction();
    setCurrentQ(0);
    setAnswers({});
    setSelectedOption(null);
    setResult(null);
    transitionTo('landing');
  };


  return (
    <QueryClientProvider client={queryClient}>
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
            <LandingCard
              onYes={handleLandingYes}
              onNo={handleLandingNo}
              onGuide={() => { handleInteraction(); transitionTo('guided-chat'); }}
            />
          )}
          {phase === 'no-weight' && (
            <NoWeightCard onRestart={handleRestart} />
          )}
          {phase === 'guided-chat' && (
            <GuidedChat onBack={handleRestart} />
          )}
          {phase === 'questions' && (
            <QuestionCard
              question={QUESTIONS[currentQ]}
              questionIndex={currentQ}
              totalQuestions={QUESTIONS.length}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
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
    </QueryClientProvider>
  );
}

function LandingCard({ onYes, onNo, onGuide }: { onYes: () => void; onNo: () => void; onGuide: () => void }) {
  return (
    <div className="bento-card p-8 md:p-10 slide-enter">
      <div className="mb-6">
        <span className="tag tag-purple mb-4 inline-flex">Neuro-Wellness Evaluation</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
        Are you carrying a psychological or emotional weight today?
      </h1>

      <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
        An 8-question deep-profile evaluation using weighted symptom clustering.
        Your responses are processed locally and never stored.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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

      <button
        onClick={onGuide}
        className="w-full rounded-2xl py-3.5 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
        style={{
          background: 'rgba(139,92,246,0.07)',
          border: '1px solid rgba(139,92,246,0.2)',
          color: '#C4B5FD',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(139,92,246,0.13)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
          e.currentTarget.style.boxShadow = '0 0 16px rgba(139,92,246,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(139,92,246,0.07)';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span style={{ fontSize: 14 }}>✦</span>
        Talk to a guide instead
      </button>

      <div className="mt-5 divider" />
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
  selectedOption,
  onSelect,
}: {
  question: typeof QUESTIONS[0];
  questionIndex: number;
  totalQuestions: number;
  selectedOption: string | null;
  onSelect: (v: string) => void;
}) {
  const progress = ((questionIndex) / totalQuestions) * 100;

  return (
    <div className="bento-card p-6 md:p-8 slide-enter">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#94A3B8] text-xs font-medium tracking-wide">
            Question {questionIndex + 1} <span className="text-[#3A3A4A]">/ {totalQuestions}</span>
          </span>
          <span className="text-[#94A3B8] text-xs font-medium">
            {Math.round(progress)}% done
          </span>
        </div>
        <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: '#1E1E28' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8B5CF6, #D946EF)',
              boxShadow: progress > 0 ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
            }}
          />
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-snug">
        {question.text}
      </h2>

      <div className="flex flex-col gap-2.5">
        {question.options.map((option, i) => {
          const accentColor = OPTION_COLORS[option.value] ?? '#8B5CF6';
          const isSelected = selectedOption === option.value;
          return (
            <OptionButton
              key={option.value}
              option={option}
              accentColor={accentColor}
              isSelected={isSelected}
              index={i}
              onSelect={() => onSelect(option.value)}
            />
          );
        })}
      </div>

      {!selectedOption && (
        <p className="text-center text-[#3A3A4A] text-xs mt-4 tracking-wide">
          Tap an option to continue
        </p>
      )}
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

function OptionButton({
  option,
  accentColor,
  isSelected,
  index,
  onSelect,
}: {
  option: { value: string; label: string; weight: number };
  accentColor: string;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 72);
    return () => clearTimeout(t);
  }, [index]);

  const transform = isSelected
    ? 'scale(1)'
    : pressed
    ? 'scale(0.968) translateY(1px)'
    : hovered
    ? 'translateY(-2px)'
    : 'translateY(0)';

  const boxShadow = isSelected
    ? `0 0 0 1.5px ${accentColor}80, 0 0 22px ${accentColor}28, 0 4px 16px rgba(0,0,0,0.3)`
    : hovered
    ? `0 0 0 1px rgba(139,92,246,0.22), 0 8px 22px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.12)`
    : `0 2px 8px rgba(0,0,0,0.15)`;

  const bg = isSelected
    ? `${accentColor}10`
    : hovered
    ? 'rgba(139,92,246,0.04)'
    : 'rgba(22,22,29,0.7)';

  const borderColor = isSelected
    ? `${accentColor}80`
    : hovered
    ? 'rgba(139,92,246,0.35)'
    : '#2A2A35';

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => { setPressed(true); }}
      onTouchEnd={() => { setPressed(false); }}
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: '14px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        textAlign: 'left',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: isSelected ? '#fff' : hovered ? '#E2E8F0' : '#94A3B8',
        fontSize: 15,
        fontWeight: isSelected ? 600 : 500,
        transform: mounted ? transform : 'translateY(10px)',
        opacity: mounted ? 1 : 0,
        boxShadow,
        transition: `transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.28s ease`,
        outline: 'none',
        willChange: 'transform',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `2px solid ${isSelected ? accentColor : hovered ? 'rgba(139,92,246,0.45)' : '#2A2A35'}`,
          background: isSelected ? `linear-gradient(135deg, ${accentColor}, #D946EF)` : 'transparent',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.22s ease',
          boxShadow: isSelected ? `0 0 8px ${accentColor}55` : 'none',
        }}
      >
        {isSelected && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'block',
            animation: 'selectedPop 0.26s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        )}
      </span>
      <span style={{ flex: 1 }}>{option.label}</span>
      {isSelected && (
        <span style={{
          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'selectedPop 0.26s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </button>
  );
}
