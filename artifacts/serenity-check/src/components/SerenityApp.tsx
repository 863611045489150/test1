import { useState, useEffect, useCallback } from 'react';
import { QUESTIONS, computeResult, type EvaluationResult } from '@/lib/evaluation';
import { playClickSound, playTransitionSound, triggerHaptic } from '@/lib/audio';
import ResultsPage from './ResultsPage';

type Phase =
  | 'landing'
  | 'questions'
  | 'analyzing'
  | 'results'
  | 'no-weight';

export default function SerenityApp() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleInteraction = useCallback(() => {
    triggerHaptic();
    playClickSound();
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
    handleInteraction();
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    handleInteraction();
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

  const progress = ((currentQ) / QUESTIONS.length) * 100;

  return (
    <div className="gradient-bg min-h-screen w-full flex flex-col relative">
      <div className="watermark pt-4 pb-2 w-full relative z-10">
        DEVELOPED BY AARUSH
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
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
              progress={progress}
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
        <span className="tag tag-purple mb-4 inline-flex">Mental Wellness Evaluation</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
        Are you carrying a psychological or emotional weight today?
      </h1>

      <p className="text-[#94A3B8] text-sm mb-8 leading-relaxed">
        This evaluation takes 2 minutes. Your responses are processed locally and never stored.
        Answer honestly for the most accurate insight.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
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

      <div className="mt-8 pt-6 divider" />
      <div className="mt-6 flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#2A2A35]" />
          ))}
        </div>
        <span className="text-[#94A3B8] text-xs">4 targeted questions</span>
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
      <h2 className="text-2xl font-bold text-white mb-3">
        That's a good sign.
      </h2>
      <p className="text-[#94A3B8] mb-8 leading-relaxed text-sm">
        It sounds like you're in a stable place right now. That's worth acknowledging.
        If things change, Serenity Check is always here.
      </p>
      <button onClick={onRestart} className="gradient-btn rounded-2xl py-4 px-8 text-base font-semibold">
        Return to start
      </button>
    </div>
  );
}

function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  progress,
  selectedOption,
  onSelect,
  onNext,
}: {
  question: typeof QUESTIONS[0];
  questionIndex: number;
  totalQuestions: number;
  progress: number;
  selectedOption: string | null;
  onSelect: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="bento-card p-6 md:p-8 slide-enter">
      <div className="flex items-center justify-between mb-5">
        <span className="tag tag-purple">{question.category}</span>
        <span className="text-[#94A3B8] text-xs font-medium">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      <div className="progress-bar mb-6">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-snug">
        {question.text}
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        {question.options.map((option) => (
          <button
            key={option.value}
            className={`option-card ${selectedOption === option.value ? 'selected' : ''}`}
            onClick={() => onSelect(option.value)}
          >
            <span className="option-radio">
              <span className="option-radio-dot" />
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedOption}
        className="gradient-btn w-full rounded-2xl py-4 px-6 text-base font-semibold disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {questionIndex < totalQuestions - 1 ? 'Continue' : 'See my results'}
      </button>
    </div>
  );
}

function AnalyzingCard() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bento-card p-10 md:p-14 slide-enter text-center">
      <div className="flex justify-center mb-8">
        <div
          className="w-20 h-20 rounded-full pulse-glow"
          style={{
            background: 'radial-gradient(circle at center, rgba(139,92,246,0.6) 0%, rgba(217,70,239,0.3) 50%, transparent 70%)',
            border: '1px solid rgba(139,92,246,0.4)',
          }}
        />
      </div>

      <h2 className="text-xl font-semibold text-white mb-2">
        Analyzing your profile{dots}
      </h2>
      <p className="text-[#94A3B8] text-sm">
        Cross-referencing your responses with clinical indicators
      </p>

      <div className="mt-8 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
              animation: `analyzingPulse 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
