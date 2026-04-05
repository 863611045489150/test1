export type Answer = string;

export interface Question {
  id: string;
  category: string;
  text: string;
  options: { value: string; label: string; weight: number }[];
}

const FREQUENCY_OPTIONS = [
  { value: 'never', label: 'Never', weight: 0 },
  { value: 'rarely', label: 'Rarely', weight: 1 },
  { value: 'often', label: 'Often', weight: 2 },
  { value: 'constant', label: 'Constantly', weight: 3 },
];

export const QUESTIONS: Question[] = [
  {
    id: 'cognitive_load',
    category: 'Cognitive Load',
    text: 'When focusing on a single task, does your mind feel like it\'s "skipping" or clouding over?',
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 'emotional_resonance',
    category: 'Emotional Resonance',
    text: 'Do you feel a sense of "hollowness" or a lack of reaction to things that usually make you happy?',
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 'social_friction',
    category: 'Social Friction',
    text: 'Does the thought of interacting with others feel like a physical exhaustion rather than a social choice?',
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 'somatic_feedback',
    category: 'Somatic Feedback',
    text: 'Are you experiencing a localized pressure in your temples or a "tight band" sensation around your chest?',
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 'sleep_architecture',
    category: 'Sleep Architecture',
    text: 'Do you wake up between 3 AM – 5 AM with a sudden "jolt" of alertness or racing thoughts?',
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 'decision_fatigue',
    category: 'Decision Fatigue',
    text: 'Do simple choices (like what to eat or wear) feel overwhelming or paralyzing today?',
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 'hyper_vigilance',
    category: 'Hyper-Vigilance',
    text: 'Are you constantly "scanning" your environment or your own body for signs of something going wrong?',
    options: FREQUENCY_OPTIONS,
  },
  {
    id: 'future_projection',
    category: 'Future Projection',
    text: 'When looking at the next 48 hours, do you feel a sense of "dread" or "neutrality"?',
    options: FREQUENCY_OPTIONS,
  },
];

export interface EvaluationResult {
  score: number;
  maxScore: number;
  percentage: number;
  severity: 'equilibrium' | 'overload' | 'fatigue' | 'anxiety';
  condition: string;
  conditionLabel: string;
  conditionDetail: string;
  catalysts: { title: string; description: string }[];
  strategies: string[];
  neuroAlignment: string;
}

export function computeResult(answers: Record<string, string>): EvaluationResult {
  let score = 0;
  const maxScore = QUESTIONS.length * 3;

  for (const q of QUESTIONS) {
    const answer = answers[q.id];
    const option = q.options.find((o) => o.value === answer);
    if (option) score += option.weight;
  }

  const percentage = Math.round((score / maxScore) * 100);

  let severity: EvaluationResult['severity'];
  let condition: string;
  let conditionLabel: string;
  let conditionDetail: string;
  let catalysts: EvaluationResult['catalysts'];
  let strategies: string[];
  let neuroAlignment: string;

  if (score <= 6) {
    severity = 'equilibrium';
    condition = 'Neural Equilibrium';
    conditionLabel = 'Balanced';
    conditionDetail = 'Neural Equilibrium represents a state in which the brain\'s major regulatory systems — dopaminergic reward circuits, the HPA stress axis, and the prefrontal cortex\'s executive networks — are operating in relative homeostasis. Research in affective neuroscience shows that this state is associated with optimal cortisol diurnal rhythms, coherent default mode network activity during rest, and efficient task-switching in the anterior cingulate cortex. Maintaining this state requires consistent sleep architecture, nutritional sufficiency, and appropriate social engagement. While this profile reflects current balance, neurological equilibrium can shift rapidly under sustained environmental pressure.';
    catalysts = [
      { title: 'Dopamine / Cortisol Harmony', description: 'Your reward-stress axis is operating within normal parameters. No significant dysregulation detected.' },
      { title: 'Baseline Cognitive Stability', description: 'Executive function and attentional systems appear intact, with minimal interference from lower brain regions.' },
    ];
    strategies = [
      'Sustain your current rhythms — consistency is the foundation of neural health',
      'Cold exposure (cold shower 30–60s) to reinforce norepinephrine regulation',
      'Periodic dopamine fasting — reduce low-effort stimulation to preserve reward sensitivity',
      'Proactive journaling to maintain emotional clarity before pressure accumulates',
    ];
    neuroAlignment = 'Neural Equilibrium — Balanced Autonomic State';
  } else if (score <= 14) {
    severity = 'overload';
    condition = 'Acute Cognitive Overload';
    conditionLabel = 'Stress-based';
    conditionDetail = 'Acute Cognitive Overload occurs when the prefrontal cortex is subjected to sustained attentional demand without adequate recovery cycles, leading to a measurable decline in working memory capacity and executive function. Neurologically, this state involves elevated norepinephrine and moderate cortisol release, which initially sharpens focus but progressively narrows cognitive bandwidth. The brain\'s anterior insula — responsible for interoceptive awareness — becomes hyperactive, amplifying awareness of internal bodily signals. This explains somatic symptoms such as temporal pressure and chest tightness. Research from the Karolinska Institute links this pattern to over-stimulation of the default mode network during intended rest periods.';
    catalysts = [
      { title: 'Dopamine / Cortisol Imbalance', description: 'Your answers suggest a disruption in your Dopamine/Cortisol balance due to over-stimulation and insufficient neural recovery.' },
      { title: 'Prefrontal Bandwidth Depletion', description: 'Decision fatigue signals that your prefrontal cortex is resource-constrained, reducing capacity for nuanced judgment.' },
      { title: 'Sympathetic Nervous System Bias', description: 'Mild somatic indicators suggest your autonomic system is tilting toward sustained low-grade activation.' },
    ];
    strategies = [
      'Implement "4-7-8" breathing — 4s inhale, 7s hold, 8s exhale — activates the vagus nerve directly',
      '12-hour digital fast starting after 6 PM to allow prefrontal cortex recovery during sleep',
      'Single-task blocks: 25 minutes deep work, 10 minutes complete rest (no input)',
      'Magnesium glycinate (120–400mg) before sleep — supports GABA receptor function',
    ];
    neuroAlignment = 'Acute Stress Response or Adjustment Disorder with Cognitive Features';
  } else if (score <= 20) {
    severity = 'fatigue';
    condition = 'Persistent Neural Fatigue';
    conditionLabel = 'Depressive-leaning';
    conditionDetail = 'Persistent Neural Fatigue represents a neurological state in which chronic demands have begun to alter the structural and functional architecture of key brain regions. The hippocampus — central to memory consolidation and emotional regulation — shows reduced neuroplasticity under chronic cortisol exposure, documented in multiple longitudinal studies. Serotonin reuptake efficiency decreases, reducing tonic inhibitory control over the amygdala, which produces emotional blunting and "hollowness." Simultaneously, the mesocortical dopamine pathway loses tonic output, explaining the diminished pleasure response (anhedonia). Early-morning awakening patterns (3–5 AM) are a classical indicator of HPA axis hyperactivity in this state. Professional evaluation is strongly recommended.';
    catalysts = [
      { title: 'Serotonin / Dopamine Pathway Depletion', description: 'Emotional blunting and anhedonia indicate reduced tonic output in the mesolimbic and mesocortical dopamine circuits.' },
      { title: 'HPA Axis Hyperactivation', description: 'Early-morning awakening patterns are a diagnostic marker of cortisol peak dysregulation associated with the HPA axis.' },
      { title: 'Amygdala Disinhibition', description: 'Social friction and hyper-vigilance suggest reduced prefrontal inhibition of the amygdala\'s threat-processing circuits.' },
      { title: 'Default Mode Network Intrusion', description: 'Cognitive "skipping" and rumination indicate uncontrolled DMN engagement during task-directed attention.' },
    ];
    strategies = [
      'Seek a licensed clinical psychologist — this pattern benefits significantly from structured CBT',
      'Behavioral Activation Protocol — schedule one achievable, value-aligned activity per day',
      'Bright light therapy (10,000 lux, 20–30 min post-wake) to re-anchor circadian cortisol rhythms',
      'Avoid decision-making during the first 60 minutes after waking — protect the prefrontal recharge window',
      'Social micro-contact: brief, low-demand connection once per day to counter withdrawal amplification',
    ];
    neuroAlignment = 'Persistent Depressive Disorder (Dysthymia) or Burnout with Depressive Features';
  } else {
    severity = 'anxiety';
    condition = 'Hyper-Reactive Anxiety State';
    conditionLabel = 'High Anxiety';
    conditionDetail = 'The Hyper-Reactive Anxiety State represents a clinically significant pattern of amygdala hyperreactivity combined with dysregulated locus coeruleus output — the brain\'s primary norepinephrine nucleus. This produces the constellation of symptoms your responses indicate: hyper-vigilance (constant environmental scanning), somatic hyperarousal (temporal pressure, chest tightness), catastrophic future projection (dread about the next 48 hours), and early-morning cortisol surges causing abrupt awakening. fMRI studies show that in this state, the prefrontal cortex loses its inhibitory connection to the amygdala, creating a self-reinforcing threat-detection loop. This state corresponds closely to the DSM-5 criteria for Generalized Anxiety Disorder (GAD) or a severe Acute Stress Response. Immediate professional consultation is essential.';
    catalysts = [
      { title: 'Amygdala Hyperreactivity', description: 'Your threat-processing system is in an over-sensitized state, interpreting neutral stimuli as potential dangers.' },
      { title: 'Locus Coeruleus Dysregulation', description: 'The brain\'s norepinephrine hub is over-firing, sustaining a state of physiological alertness that cannot self-terminate.' },
      { title: 'Prefrontal-Amygdala Disconnection', description: 'The rational cortex has lost inhibitory control over emotional reactivity — decisions feel impossible, emotions feel overwhelming.' },
      { title: 'Interoceptive Hypersensitivity', description: 'You are hyper-aware of bodily signals (heartbeat, breathing, pressure), which the brain is misinterpreting as threat cues.' },
      { title: 'Anticipatory Cortisol Priming', description: 'The 3–5 AM awakening indicates your body is pre-releasing cortisol hours before waking — a sign of chronic threat anticipation.' },
    ];
    strategies = [
      'Contact a psychiatrist or clinical psychologist today — this profile warrants professional assessment',
      'Physiological Sigh: double-inhale through nose, long exhale through mouth — fastest known vagal activation',
      'Cold water face immersion (10–30s) triggers the dive reflex, acutely lowering heart rate within seconds',
      'Eliminate caffeine completely until the nervous system restabilizes',
      'Do NOT make major decisions in this state — postpone where possible, your cortisol is distorting risk perception',
      'Grounding Protocol: name 5 objects, 4 textures, 3 sounds, 2 smells, 1 taste — interrupts amygdala feedback loop',
    ];
    neuroAlignment = 'Generalized Anxiety Disorder (GAD) or Acute Stress Response with Somatic Features';
  }

  return {
    score,
    maxScore,
    percentage,
    severity,
    condition,
    conditionLabel,
    conditionDetail,
    catalysts,
    strategies,
    neuroAlignment,
  };
}
