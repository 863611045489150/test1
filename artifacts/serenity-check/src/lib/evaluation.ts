export type Answer = string;

export interface Question {
  id: string;
  category: string;
  text: string;
  options: { value: string; label: string; weight: number }[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'cognitive',
    category: 'Cognitive Fog',
    text: 'How often do you find it difficult to focus, or catch yourself making unusual mistakes?',
    options: [
      { value: 'rarely', label: 'Rarely — my focus feels clear most of the time', weight: 0 },
      { value: 'sometimes', label: 'Sometimes — I notice occasional lapses in concentration', weight: 1 },
      { value: 'often', label: 'Often — I struggle to stay on task throughout the day', weight: 2 },
      { value: 'constantly', label: 'Constantly — my mind feels clouded and scattered', weight: 3 },
    ],
  },
  {
    id: 'social',
    category: 'Social State',
    text: 'How is your desire to engage with others or fulfil your responsibilities?',
    options: [
      { value: 'engaged', label: 'I feel connected and present in my relationships', weight: 0 },
      { value: 'slightly_withdrawn', label: 'Slightly withdrawn — I prefer quieter moments lately', weight: 1 },
      { value: 'avoiding', label: 'I\'m actively avoiding people and putting off responsibilities', weight: 2 },
      { value: 'disconnected', label: 'Completely disconnected — people feel exhausting to be around', weight: 3 },
    ],
  },
  {
    id: 'physical',
    category: 'Physical Echoes',
    text: 'Are you experiencing physical symptoms like headaches, muscle tension, or crying spells?',
    options: [
      { value: 'none', label: 'None — my body feels calm and at ease', weight: 0 },
      { value: 'mild', label: 'Mild — occasional tension or tiredness', weight: 1 },
      { value: 'moderate', label: 'Moderate — headaches and tension are frequent', weight: 2 },
      { value: 'severe', label: 'Severe — frequent crying, persistent pain or tightness', weight: 3 },
    ],
  },
  {
    id: 'sleep',
    category: 'Sleep & Energy',
    text: 'How restorative has your sleep been? How do you feel when you wake up?',
    options: [
      { value: 'restorative', label: 'I wake up feeling rested and ready for the day', weight: 0 },
      { value: 'mixed', label: 'Mixed — some nights are good, others leave me tired', weight: 1 },
      { value: 'poor', label: 'Poor — I wake up exhausted despite sleeping enough', weight: 2 },
      { value: 'severe', label: 'Severely disrupted — I can\'t sleep or sleep too much', weight: 3 },
    ],
  },
];

export interface EvaluationResult {
  score: number;
  maxScore: number;
  percentage: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  condition: string;
  conditionDetail: string;
  catalysts: string[];
  strategies: string[];
  symptomAlignment: string;
}

function computeResult(answers: Record<string, string>): EvaluationResult {
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
  let conditionDetail: string;
  let catalysts: string[];
  let strategies: string[];
  let symptomAlignment: string;

  if (percentage <= 20) {
    severity = 'minimal';
    condition = 'Situational Stress';
    conditionDetail = 'Situational stress refers to temporary psychological strain arising from specific life events or transitions — such as deadlines, relationship dynamics, or life changes. Unlike clinical conditions, it typically resolves as circumstances improve. The brain\'s stress response (HPA axis) releases cortisol, which heightens alertness but can feel overwhelming. Research shows that targeted cognitive and somatic strategies significantly accelerate recovery.';
    catalysts = ['Environmental pressures', 'Short-term workload spikes', 'Minor interpersonal friction'];
    strategies = [
      'Box Breathing (4-4-4-4) to activate the parasympathetic system',
      'Nature walks for 20+ minutes to lower cortisol',
      'Digital detox windows — no screens 1 hour before bed',
    ];
    symptomAlignment = 'Situational Stress or Mild Anxiety';
  } else if (percentage <= 45) {
    severity = 'mild';
    condition = 'Burnout';
    conditionDetail = 'Burnout is a state of chronic stress that leads to physical and emotional exhaustion, cynicism, and feelings of ineffectiveness. Identified by psychologist Herbert Freudenberger and later systematized by Christina Maslach, it\'s recognized by the WHO as an occupational phenomenon. Neurologically, prolonged burnout depletes dopamine and norepinephrine systems, impairing motivation and executive function. Unlike depression, burnout typically traces back to identifiable environmental demands.';
    catalysts = ['Sustained high-demand environments', 'Lack of recovery time', 'Emotional labour without support', 'Poor work-life boundaries'];
    strategies = [
      'Sleep Hygiene Protocol — consistent bedtime, cool dark room, no caffeine after 2pm',
      'Structured rest blocks — treat rest as a non-negotiable appointment',
      'Single-tasking — one focused task at a time to reduce cognitive load',
      'Brief journaling — 5 minutes externalizing thoughts before sleep',
    ];
    symptomAlignment = 'Burnout Syndrome or Adjustment Disorder';
  } else if (percentage <= 70) {
    severity = 'moderate';
    condition = 'Acute Anxiety';
    conditionDetail = 'Acute anxiety involves persistent, disproportionate worry and physiological arousal that interferes with daily functioning. It activates the amygdala\'s threat-detection system, flooding the body with adrenaline and keeping the nervous system in a near-constant state of alert. Generalized Anxiety Disorder (GAD) affects approximately 3.1% of adults globally. Evidence-based treatments including CBT and mindfulness-based stress reduction show strong efficacy. Seeking a licensed therapist is strongly recommended at this level.';
    catalysts = ['Chronic uncertainty or instability', 'Unprocessed past stressors', 'Hyperactivated nervous system', 'Insufficient support systems'];
    strategies = [
      'Grounding Technique — 5-4-3-2-1 sensory anchoring to interrupt anxiety spirals',
      'Progressive Muscle Relaxation — systematic tension-release from feet to face',
      'Limit stimulant intake — caffeine and alcohol amplify anxiety symptoms',
      'Consider speaking with a therapist trained in CBT or EMDR',
    ];
    symptomAlignment = 'Generalized Anxiety Disorder (GAD) or Acute Stress Response';
  } else {
    severity = 'severe';
    condition = 'Clinical Depression';
    conditionDetail = 'Clinical depression (Major Depressive Disorder) is a neurobiological condition characterized by persistent low mood, anhedonia, cognitive impairment, and somatic symptoms lasting two or more weeks. It involves disruptions in serotonin, dopamine, and norepinephrine signalling, as well as structural changes in the prefrontal cortex and hippocampus. It affects approximately 280 million people worldwide. Effective treatments include antidepressant pharmacotherapy, psychotherapy (particularly CBT and IPT), and lifestyle interventions. Professional evaluation is essential.';
    catalysts = ['Neurochemical dysregulation', 'Chronic high-stress exposure', 'Genetic predisposition', 'Isolation and unmet relational needs', 'Traumatic or grief-related triggers'];
    strategies = [
      'Seek professional support immediately — a psychiatrist or clinical psychologist',
      'Behavioural Activation — schedule one small, achievable activity daily',
      'Sunlight exposure — 20+ minutes of morning light to regulate circadian rhythms',
      'Reach out to a trusted person today — isolation amplifies depressive symptoms',
    ];
    symptomAlignment = 'Clinical Depression or Burnout with Depressive Features';
  }

  return {
    score,
    maxScore,
    percentage,
    severity,
    condition,
    conditionDetail,
    catalysts,
    strategies,
    symptomAlignment,
  };
}

export { computeResult };
