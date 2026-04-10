import { useState, useRef, useEffect } from 'react';
import { useGenerateGuidedQuestions } from '@workspace/api-client-react';
import { playClickSound, playTransitionSound, triggerHaptic } from '@/lib/audio';

interface Props {
  onBack: () => void;
}

type ChatMessage =
  | { role: 'guide'; text: string; id: number }
  | { role: 'user'; text: string; id: number };

const REPLY_OPTIONS = ['Not at all', 'A little', 'Quite a bit', 'Very much'];

const OPTION_ICONS = ['○', '◔', '◕', '●'];

export default function GuidedChat({ onBack }: Props) {
  const [step, setStep] = useState<'input' | 'chat' | 'done'>('input');
  const [userInput, setUserInput] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [typingVisible, setTypingVisible] = useState(false);
  const [msgIdCounter, setMsgIdCounter] = useState(0);
  const [selectedReply, setSelectedReply] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: generateQuestions, isPending } = useGenerateGuidedQuestions({
    mutation: {
      onSuccess(data) {
        const qs = data.questions;
        setQuestions(qs);
        setStep('chat');
        setMessages([]);
        setCurrentQIndex(0);
        // Show first question after a brief delay
        setTimeout(() => showNextQuestion(qs, 0, 0), 400);
      },
      onError() {
        // fallback graceful error
      },
    },
  });

  let idRef = useRef(0);
  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  const showNextQuestion = (qs: string[], qIdx: number, currentMsgCount: number) => {
    if (qIdx >= qs.length) {
      setTimeout(() => setStep('done'), 600);
      return;
    }
    setTypingVisible(true);
    setTimeout(() => {
      setTypingVisible(false);
      const id = nextId();
      setMessages((prev) => [...prev, { role: 'guide', text: qs[qIdx], id }]);
    }, 1200);
  };

  const handleReply = (reply: string) => {
    if (selectedReply) return;
    triggerHaptic('select');
    playClickSound();
    setSelectedReply(reply);

    setTimeout(() => {
      const id = nextId();
      setMessages((prev) => [...prev, { role: 'user', text: reply, id }]);
      setSelectedReply(null);

      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);

      if (nextIdx < questions.length) {
        playTransitionSound();
        setTimeout(() => showNextQuestion(questions, nextIdx, messages.length + 1), 600);
      } else {
        setTimeout(() => setStep('done'), 800);
      }
    }, 320);
  };

  const handleSubmit = () => {
    if (!userInput.trim() || isPending) return;
    triggerHaptic('transition');
    playTransitionSound();
    generateQuestions({ data: { userInput: userInput.trim() } });
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingVisible]);

  const isWaitingForReply =
    step === 'chat' &&
    !typingVisible &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'guide';

  if (step === 'input') {
    return (
      <div className="bento-card p-6 md:p-8 slide-enter">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#94A3B8] text-sm mb-6 hover:text-white transition-colors"
        >
          ← Back
        </button>

        <span className="tag tag-purple mb-4 inline-flex">Guided Wellness Chat</span>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          What's on your mind today?
        </h2>
        <p className="text-[#94A3B8] text-sm mb-5 leading-relaxed">
          Describe how you're feeling in a sentence or two. I'll gently guide you through a few questions to help you understand it better.
        </p>

        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="e.g. I've been feeling really tired and disconnected lately..."
          rows={4}
          className="w-full rounded-2xl p-4 text-sm text-white placeholder-[#94A3B8] resize-none outline-none transition-all duration-300"
          style={{
            background: 'rgba(22,22,29,0.8)',
            border: '1px solid #2A2A35',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: '1.6',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)';
            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.2), 0 0 20px rgba(139,92,246,0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#2A2A35';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!userInput.trim() || isPending}
          className="gradient-btn w-full rounded-2xl py-4 px-6 text-base font-semibold mt-4 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="scanning-dot" />
              Reading your signal...
            </span>
          ) : (
            'Begin guided session'
          )}
        </button>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="bento-card p-8 md:p-10 slide-enter text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(217,70,239,0.15) 70%)',
              border: '1px solid rgba(139,92,246,0.4)',
            }}
          >
            ✦
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Session complete.</h2>
        <p className="text-[#94A3B8] text-sm mb-2 leading-relaxed">
          You've just taken a moment to genuinely look inward. That takes courage.
        </p>
        <p className="text-[#94A3B8] text-sm mb-8 leading-relaxed">
          For a deeper clinical analysis, try the full evaluation — it maps your responses to specific neural patterns.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onBack} className="gradient-btn rounded-2xl py-4 px-8 text-base font-semibold">
            Run full evaluation
          </button>
          <button
            onClick={() => {
              setStep('input');
              setUserInput('');
              setMessages([]);
              setQuestions([]);
              setCurrentQIndex(0);
            }}
            className="outline-btn rounded-2xl py-4 px-8 text-base"
          >
            Start a new session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bento-card flex flex-col slide-enter" style={{ minHeight: 520 }}>
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[#2A2A35]">
        <button
          onClick={onBack}
          className="text-[#94A3B8] hover:text-white transition-colors text-sm"
        >
          ←
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg,#8B5CF6,#D946EF)', boxShadow: '0 0 8px rgba(139,92,246,0.8)' }} />
          <span className="text-white text-sm font-semibold">Wellness Guide</span>
          <span className="text-[#94A3B8] text-xs ml-auto">{Math.min(currentQIndex + 1, questions.length)} / {questions.length}</span>
        </div>
        <div className="w-20 h-1 rounded-full overflow-hidden bg-[#2A2A35]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${questions.length > 0 ? (currentQIndex / questions.length) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #8B5CF6, #D946EF)',
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ maxHeight: 380 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
          >
            {msg.role === 'guide' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(217,70,239,0.1) 100%)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  fontSize: 12,
                }}
              >
                ✦
              </div>
            )}
            <div
              className="max-w-[78%] px-4 py-3 text-sm leading-relaxed"
              style={msg.role === 'guide' ? {
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '4px 18px 18px 18px',
                color: '#fff',
              } : {
                background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(217,70,239,0.15))',
                border: '1px solid rgba(217,70,239,0.25)',
                borderRadius: '18px 4px 18px 18px',
                color: '#fff',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {typingVisible && (
          <div className="flex justify-start fade-in">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(217,70,239,0.1) 100%)',
                border: '1px solid rgba(139,92,246,0.3)',
                fontSize: 12,
              }}
            >
              ✦
            </div>
            <div
              className="px-4 py-3 flex items-center gap-1.5"
              style={{
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '4px 18px 18px 18px',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#8B5CF6',
                    animation: 'analyzingPulse 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {isWaitingForReply && (
        <div className="px-5 pb-5 pt-3 border-t border-[#2A2A35]">
          <p className="text-[#4A4A5A] text-[10px] uppercase tracking-widest mb-2.5 text-center font-medium">Select your response</p>
          <div className="grid grid-cols-2 gap-2">
            {REPLY_OPTIONS.map((option, i) => {
              const isSelected = selectedReply === option;
              const isOther = selectedReply !== null && !isSelected;
              return (
                <ReplyButton
                  key={option}
                  label={option}
                  icon={OPTION_ICONS[i]}
                  intensity={i}
                  isSelected={isSelected}
                  isOther={isOther}
                  onClick={() => handleReply(option)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ReplyButtonProps {
  label: string;
  icon: string;
  intensity: number;
  isSelected: boolean;
  isOther: boolean;
  onClick: () => void;
}

function ReplyButton({ label, icon, intensity, isSelected, isOther, onClick }: ReplyButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const glowColors = [
    'rgba(100,116,139,0.5)',
    'rgba(99,102,241,0.55)',
    'rgba(139,92,246,0.6)',
    'rgba(217,70,239,0.65)',
  ];
  const selectedBg = [
    'linear-gradient(135deg, rgba(100,116,139,0.22), rgba(100,116,139,0.1))',
    'linear-gradient(135deg, rgba(99,102,241,0.28), rgba(99,102,241,0.12))',
    'linear-gradient(135deg, rgba(139,92,246,0.32), rgba(139,92,246,0.14))',
    'linear-gradient(135deg, rgba(217,70,239,0.35), rgba(139,92,246,0.2))',
  ];
  const selectedBorder = [
    'rgba(100,116,139,0.55)',
    'rgba(99,102,241,0.6)',
    'rgba(139,92,246,0.65)',
    'rgba(217,70,239,0.7)',
  ];

  const transform = isSelected
    ? 'scale(0.975)'
    : pressed
    ? 'scale(0.964) translateY(1px)'
    : hovered
    ? 'translateY(-2px)'
    : 'translateY(0)';

  const boxShadow = isSelected
    ? `0 0 0 1.5px ${selectedBorder[intensity]}, 0 0 18px ${glowColors[intensity]}, 0 4px 24px rgba(0,0,0,0.35)`
    : hovered && !isOther
    ? `0 0 0 1px rgba(139,92,246,0.25), 0 8px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(139,92,246,0.08)`
    : `0 0 0 1px rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.2)`;

  const background = isSelected
    ? selectedBg[intensity]
    : hovered && !isOther
    ? 'rgba(255,255,255,0.055)'
    : 'rgba(255,255,255,0.028)';

  return (
    <button
      onClick={onClick}
      disabled={!!isOther}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background,
        border: `1px solid ${isSelected ? selectedBorder[intensity] : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 14,
        padding: '11px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: isOther ? 'default' : 'pointer',
        transform,
        boxShadow,
        opacity: isOther ? 0.32 : 1,
        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, opacity 0.2s ease, background 0.2s ease, border-color 0.2s ease',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        width: '100%',
        outline: 'none',
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: isSelected ? selectedBorder[intensity] : 'rgba(148,163,184,0.7)',
          transition: 'color 0.2s ease',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: isSelected ? 600 : 500,
          color: isSelected ? '#fff' : 'rgba(226,232,240,0.85)',
          transition: 'color 0.2s ease, font-weight 0.2s ease',
          textAlign: 'left',
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
      {isSelected && (
        <span
          style={{
            marginLeft: 'auto',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: selectedBorder[intensity],
            boxShadow: `0 0 6px ${glowColors[intensity]}`,
            flexShrink: 0,
            animation: 'selectedPop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      )}
    </button>
  );
}
