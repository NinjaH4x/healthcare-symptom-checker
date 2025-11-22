// Using free Hugging Face Inference API
// Sign up at https://huggingface.co/join to get a free API token

const HEALTH_ANALYSIS_PROMPT = (symptoms: string, additionalInfo: string, otherRelevantInfo: string) => `
You are a knowledgeable healthcare information assistant. Based on the symptoms and information provided, 
provide general health information and possible conditions that might be associated with these symptoms.

IMPORTANT DISCLAIMERS:
- This is ONLY for educational purposes and general information
- This is NOT a replacement for professional medical advice
- Always consult a healthcare professional for diagnosis and treatment
- For emergency symptoms, seek immediate medical attention

Symptoms: ${symptoms}
Additional Information: ${additionalInfo}
Other Relevant Information: ${otherRelevantInfo}

Please provide:
1. Possible conditions that might be associated with these symptoms (general information)
2. Recommended actions the person should take
3. When to seek emergency care
4. General self-care suggestions
5. Important disclaimer about seeking professional medical advice

Keep the response clear, organized, and safe.`;

export async function analyzeSymptoms(
  symptoms: string,
  additionalInfo: string,
  otherRelevantInfo?: string,
  patientProfile?: { age?: number; sex?: string; weightKg?: number; heightCm?: number } | null
): Promise<{
  text: string; 
  confidence: number; 
  conditions: { 
    condition: string; 
    percentage: number;
    transmission?: string;
    precautions?: string[];
    recoveryTime?: string;
    emergencyWarnings?: string[];
  }[] 
}> {
  // Using Free API: Using a simple text generation approach
  // You can upgrade to Hugging Face API for better results by setting HF_TOKEN env var

  try {
    // First, try with Hugging Face API if token is available
    const hfToken = process.env.NEXT_PUBLIC_HF_TOKEN;

    if (hfToken) {
      try {
        return await analyzeWithHuggingFace(symptoms, additionalInfo, otherRelevantInfo || '', hfToken, patientProfile);
      } catch (hfErr) {
        console.warn('HuggingFace fallback failed, using local analyzer:', hfErr);
        // Continue to local analysis as a safe fallback
      }
    }

    // Fallback: Use local analysis (mock implementation for free tier)
    return analyzeLocally(symptoms, additionalInfo, otherRelevantInfo || '', patientProfile || undefined);
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw new Error('Failed to analyze symptoms. Please try again.');
  }
}

// Translate text using LibreTranslate or return original text on failure.
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !targetLang || targetLang.toLowerCase().startsWith('en')) return text;

  // Provider URL can be overridden with NEXT_PUBLIC_LIBRETRANSLATE_URL
  const translateUrl = process.env.NEXT_PUBLIC_LIBRETRANSLATE_URL || 'https://libretranslate.de/translate';

  try {
    const res = await fetch(translateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'en', target: targetLang.slice(0,2), format: 'text' }),
    });
    if (!res.ok) {
      console.warn('Translate request failed', res.statusText);
      return text;
    }
    const j = await res.json();
    // LibreTranslate returns { translatedText: '...' }
    return j.translatedText || (j.result || text);
  } catch (e) {
    console.warn('Translation error:', e);
    return text;
  }
}

async function analyzeWithHuggingFace(
  symptoms: string,
  additionalInfo: string,
  otherRelevantInfo: string,
  token: string,
  _patientProfile?: { age?: number; sex?: string; weightKg?: number; heightCm?: number } | null
): Promise<{
  text: string; 
  confidence: number; 
  conditions: { 
    condition: string; 
    percentage: number;
    transmission?: string;
    precautions?: string[];
    recoveryTime?: string;
    emergencyWarnings?: string[];
  }[] 
}> {
  // Mark `_patientProfile` as intentionally unused to satisfy linters.
  void _patientProfile;

  const prompt = HEALTH_ANALYSIS_PROMPT(symptoms, additionalInfo, otherRelevantInfo || '');

  const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
    headers: { Authorization: `Bearer ${token}` },
    method: 'POST',
    body: JSON.stringify({ inputs: prompt, parameters: { max_length: 500 } }),
  });

  if (!response.ok) {
    throw new Error('Failed to get response from AI service');
  }

  const result = await response.json();
  const text = result[0]?.generated_text || 'Unable to generate analysis';

  // The HF model doesn't return an explicit confidence. Provide a conservative default.
  const confidence = 0.6;
  // No structured conditions available from the model fallback; return empty list
  // Wrap the text with the same 6-section format if needed by caller; for now return text and let frontend display conditions from local analyzer when used.
  return { text, confidence, conditions: [] };
}

function analyzeLocally(
  symptoms: string,
  additionalInfo: string,
  otherRelevantInfo?: string,
  patient?: { age?: number; sex?: string; weightKg?: number; heightCm?: number }
): { text: string; confidence: number; conditions: { condition: string; percentage: number; transmission?: string; precautions?: string[]; recoveryTime?: string; emergencyWarnings?: string[] }[] } {
  // Enhanced condition database with medical information
  const conditionScores: { [condition: string]: { 
    keywords: string[]; 
    baseScore: number;
    transmission?: string;
    precautions?: string[];
    recoveryTime?: string;
    emergencyWarnings?: string[];
  } } = {
    'Common Cold': { 
      keywords: ['cold', 'runny nose', 'sneezing', 'sore throat'], 
      baseScore: 0.25,
      transmission: 'Airborne droplets from coughing/sneezing, direct contact with infected nasal secretions, or contaminated surfaces',
      precautions: ['Wash hands frequently', 'Avoid touching face', 'Cover cough/sneeze with tissue', 'Stay home when sick', 'Clean frequently touched surfaces'],
      recoveryTime: '7-14 days with self-care',
      emergencyWarnings: ['Severe difficulty breathing', 'Persistent high fever (>39°C)', 'Severe chest pain', 'Confusion or severe letharness']
    },
    'Flu (Influenza)': { 
      keywords: ['fever', 'cough', 'body ache', 'fatigue', 'chills'], 
      baseScore: 0.30,
      transmission: 'Respiratory droplets from coughing/sneezing, highly contagious 1 day before to 5 days after symptom onset',
      precautions: ['Get vaccinated annually', 'Wash hands regularly', 'Avoid close contact with infected people', 'Wear mask when sick', 'Stay home for 5+ days after fever onset'],
      recoveryTime: '1-2 weeks with rest and fluids, up to 3 weeks for full recovery',
      emergencyWarnings: ['Difficulty breathing or shortness of breath', 'Chest pain or pressure', 'Severe confusion or altered mental state', 'Blue lips or face', 'Persistent high fever >39.5°C']
    },
    'COVID-19': { 
      keywords: ['fever', 'cough', 'breathlessness', 'loss of appetite', 'fatigue'], 
      baseScore: 0.20,
      transmission: 'Airborne transmission, respiratory droplets up to 2 meters, surfaces (less common), most contagious first 5-7 days',
      precautions: ['Get vaccinated/boosted', 'Improve ventilation', 'Wear N95 mask in crowded settings', 'Test if symptomatic', 'Isolate 5+ days if positive', 'Hand hygiene essential'],
      recoveryTime: '2-4 weeks mild, 4-6 weeks moderate, 6-12 weeks severe cases',
      emergencyWarnings: ['Severe difficulty breathing', 'Persistent chest pain', 'New confusion', 'Inability to rouse', 'Blue lips/face', 'Severe persistent dizziness']
    },
    'Bronchitis': { 
      keywords: ['cough', 'breathlessness', 'chest pain', 'phlegm'], 
      baseScore: 0.18,
      transmission: 'Viral: airborne droplets; Bacterial: similar respiratory routes',
      precautions: ['Avoid air pollutants and smoke', 'Use humidifier', 'Stay hydrated', 'Get flu/pneumonia vaccines', 'Avoid respiratory irritants'],
      recoveryTime: '2-3 weeks acute, chronic cases may last 6-8 weeks',
      emergencyWarnings: ['Severe difficulty breathing or shortness of breath', 'Coughing up blood', 'Chest pain with breathing', 'High fever >39°C persistent', 'Signs of pneumonia']
    },
    'Asthma': { 
      keywords: ['breathlessness', 'cough', 'chest pain', 'wheezing'], 
      baseScore: 0.15,
      transmission: 'Not contagious; triggered by allergens, exercise, cold air, stress',
      precautions: ['Use rescue inhaler as prescribed', 'Avoid known triggers', 'Keep inhalers accessible', 'Exercise in appropriate conditions', 'Monitor air quality', 'Keep doctor updated'],
      recoveryTime: 'Chronic condition, acute attacks resolve in hours to days with treatment',
      emergencyWarnings: ['Severe difficulty breathing/gasping', 'Inability to speak full sentences', 'Extreme anxiety about breathing', 'Peak flow <50% normal', 'No improvement with inhaler after 15-20 min']
    },
    'Allergies': { 
      keywords: ['runny nose', 'sneezing', 'itchy eyes', 'sore throat'], 
      baseScore: 0.22,
      transmission: 'Not contagious; triggered by allergens (pollen, dust, pets, food)',
      precautions: ['Identify and avoid allergen triggers', 'Use antihistamines as needed', 'Keep windows closed during high pollen', 'Shower after outdoor activities', 'Clean bedding weekly'],
      recoveryTime: 'Seasonal (2-3 months), perennial management ongoing',
      emergencyWarnings: ['Anaphylaxis signs (swelling face/throat, difficulty breathing)', 'Severe throat swelling affecting breathing', 'Loss of consciousness', 'Severe reaction to new allergen']
    },
    'Migraine': { 
      keywords: ['headache', 'nausea', 'vomiting', 'sensitivity to light'], 
      baseScore: 0.20,
      transmission: 'Not contagious; triggered by stress, hormones, foods, light, sleep changes',
      precautions: ['Identify personal triggers', 'Manage stress', 'Regular sleep schedule', 'Stay hydrated', 'Reduce caffeine gradually', 'Avoid bright screens before bed'],
      recoveryTime: '4-72 hours acute episode, recovery time depends on treatment',
      emergencyWarnings: ['Sudden worst headache of life', 'Headache with fever and stiff neck', 'Headache with confusion or vision loss', 'New pattern of headache', 'Weakness/numbness with headache']
    },
    'Tension Headache': { 
      keywords: ['headache', 'stress', 'neck pain'], 
      baseScore: 0.25,
      transmission: 'Not contagious; triggered by stress, poor posture, muscle tension',
      precautions: ['Manage stress (yoga, meditation)', 'Correct posture regularly', 'Take frequent breaks from screens', 'Neck stretches and exercises', 'Adequate sleep', 'Regular exercise'],
      recoveryTime: '30 minutes to several hours with rest/medication',
      emergencyWarnings: ['Sudden severe headache', 'Headache with fever', 'Headache with stiff neck', 'Persistent headache with vision changes', 'Headache following head injury']
    },
    'Gastroenteritis': { 
      keywords: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'fever'], 
      baseScore: 0.28,
      transmission: 'Viral/Bacterial: fecal-oral route, contaminated food/water, person-to-person contact',
      precautions: ['Wash hands thoroughly after toilet', 'Food safety practices', 'Clean kitchen/bathroom surfaces', 'Separate personal items', 'Stay home 48 hours after last symptom', 'Boil water if contaminated'],
      recoveryTime: '1-7 days viral, 5-7 days bacterial, 1-3 weeks parasitic',
      emergencyWarnings: ['Severe dehydration signs (extreme thirst, dark urine, dizziness)', 'Blood in stool/vomit', 'Severe abdominal pain', 'High fever >39°C', 'Symptoms lasting >7 days']
    },
    'Food Poisoning': { 
      keywords: ['nausea', 'vomiting', 'diarrhea', 'abdominal pain'], 
      baseScore: 0.22,
      transmission: 'Contaminated food/water, bacteria (Salmonella, E.coli), toxins',
      precautions: ['Proper food storage (refrigerate <4°C)', 'Cook meat thoroughly', 'Wash produce', 'Avoid unpasteurized dairy', 'Check expiration dates', 'Avoid cross-contamination'],
      recoveryTime: '1-3 days mild, up to 1 week severe cases',
      emergencyWarnings: ['Severe dehydration', 'Blood in vomit/stool', 'Signs of organ failure', 'Symptoms >3 days', 'Severe abdominal pain']
    },
    'Dehydration': { 
      keywords: ['headache', 'fatigue', 'dizziness', 'dry mouth'], 
      baseScore: 0.18,
      transmission: 'Not contagious; caused by inadequate fluid intake or excessive loss',
      precautions: ['Drink water regularly (8-10 cups daily)', 'Monitor urine color', 'Increase fluids during exercise/illness', 'Electrolyte drinks for severe loss', 'Limit caffeine/alcohol'],
      recoveryTime: '30 minutes to 2 hours with fluid replacement',
      emergencyWarnings: ['Severe dizziness/fainting', 'Extreme thirst with confusion', 'No urination for 8+ hours', 'Dark urine', 'Rapid/weak pulse', 'Low blood pressure']
    },
    'Anxiety': { 
      keywords: ['headache', 'nausea', 'fatigue', 'chest pain', 'dizziness'], 
      baseScore: 0.15,
      transmission: 'Not contagious; mental health condition triggered by stress',
      precautions: ['Practice relaxation techniques (deep breathing, meditation)', 'Regular exercise', 'Adequate sleep', 'Limit caffeine', 'Social support', 'Professional counseling if severe'],
      recoveryTime: 'Variable, acute episodes 15-30 minutes with coping, chronic requires therapy',
      emergencyWarnings: ['Severe panic attack feeling', 'Suicidal thoughts', 'Severe chest pain (rule out cardiac)', 'Loss of consciousness', 'Inability to function']
    },
    'Strep Throat': { 
      keywords: ['sore throat', 'fever', 'headache', 'body ache'], 
      baseScore: 0.22,
      transmission: 'Respiratory droplets, highly contagious 24 hours before to 3 days after antibiotic treatment',
      precautions: ['Take full antibiotic course', 'Gargle with salt water', 'Use throat lozenges', 'Wash hands frequently', 'Don\'t share personal items', 'Stay home during contagious period', 'Avoid smoking/secondhand smoke'],
      recoveryTime: '5-7 days with antibiotics, 1-2 weeks without',
      emergencyWarnings: ['Severe difficulty swallowing', 'Drooling/unable to swallow saliva', 'Difficulty breathing', 'High fever >39°C with confusion', 'Severe rash with fever']
    },
  };

  const lowerSymptoms = symptoms.toLowerCase();
  const lowerInfo = ((additionalInfo || '') + ' ' + (otherRelevantInfo || '')).toLowerCase();

  // Detect matched symptom keywords from the input for tailored output
  const matchedSymptoms = new Set<string>();
  for (const data of Object.values(conditionScores)) {
    for (const kw of data.keywords) {
      if (lowerSymptoms.includes(kw)) matchedSymptoms.add(kw);
    }
  }

  // Score each condition based on symptom matches
  const scores: { [condition: string]: number } = {};
  
  for (const [condition, data] of Object.entries(conditionScores)) {
    let score = data.baseScore;
    let matchCount = 0;

    // Count keyword matches
    for (const keyword of data.keywords) {
      if (lowerSymptoms.includes(keyword)) {
        score += 0.12;
        matchCount++;
      }
    }

    // Bonus for multiple symptom matches
    if (matchCount >= 2) {
      score += 0.08;
    }
    if (matchCount >= 3) {
      score += 0.05;
    }

    // Boost if temperature mentioned with fever keywords
    if ((lowerSymptoms.includes('fever') || data.keywords.includes('fever')) && 
        (lowerInfo.includes('temperature') || lowerInfo.includes('°c'))) {
      score += 0.10;
    }

    // Boost if duration mentioned (chronic vs acute)
    if (lowerInfo.includes('week') || lowerInfo.includes('month')) {
      // Chronic symptoms may indicate different conditions
      if (condition === 'Asthma' || condition === 'Allergies') {
        score += 0.10;
      }
    }

    scores[condition] = Math.min(score, 0.95); // Cap at 95%
  }

  // Sort by score and get ALL conditions (for "show more")
  const allSortedConditions = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  // Normalize scores to percentages
  const totalScore = allSortedConditions.reduce((sum, [, score]) => sum + score, 0) || 1;
  const allConditions = allSortedConditions.map(([condition, score]) => ({
    condition,
    percentage: Math.round((score / totalScore) * 100),
    transmission: conditionScores[condition]?.transmission,
    precautions: conditionScores[condition]?.precautions,
    recoveryTime: conditionScores[condition]?.recoveryTime,
    emergencyWarnings: conditionScores[condition]?.emergencyWarnings,
  }));

  // Calculate overall confidence
  const topScore = allSortedConditions[0]?.[1] || 0;
  let overallConfidence = Math.max(0.35, Math.min(topScore, 0.95));

  // Boost confidence if detailed info provided
  if (lowerInfo.length > 30) {
    overallConfidence = Math.min(overallConfidence + 0.05, 0.97);
  }

  // Build structured 6-section response following user format
  // 1. Problem Summary
  let summary = `Based on your message, you reported: ${symptoms.trim() || 'no symptoms provided'}${additionalInfo ? `; additional info: ${additionalInfo.trim()}` : ''}${otherRelevantInfo ? `; other relevant info: ${otherRelevantInfo.trim()}` : ''}.`;
  // Add BMI to summary if available
  if (patient && typeof patient.weightKg === 'number' && typeof patient.heightCm === 'number' && patient.weightKg > 0 && patient.heightCm > 0) {
    const heightM = patient.heightCm / 100;
    const bmi = +(patient.weightKg / (heightM * heightM)).toFixed(1);
    let bmiCategory = 'normal weight';
    if (bmi < 18.5) bmiCategory = 'underweight';
    else if (bmi >= 25 && bmi < 30) bmiCategory = 'overweight';
    else if (bmi >= 30) bmiCategory = 'obese';
    summary += ` BMI: ${bmi} (${bmiCategory}).`;
  }

  // 2. Possible Causes (non-diagnostic): tailor from matched symptoms
  const possibleCausesSet = new Set<string>();
  if (matchedSymptoms.size > 0) {
    const ms = Array.from(matchedSymptoms).join(' | ');
    if (/fever/.test(ms)) possibleCausesSet.add('Could be due to a viral or bacterial infection causing fever');
    if (/cough|breathlessness|wheezing/.test(ms)) possibleCausesSet.add('Could be due to a respiratory infection (cold, flu, COVID-19) or reactive airway disease');
    if (/nausea|vomiting|diarrhea|abdominal pain/.test(ms)) possibleCausesSet.add('Could be due to gastroenteritis or foodborne illness');
    if (/headache/.test(ms)) possibleCausesSet.add('Could be related to dehydration, migraine, tension-type headache, or infection');
    if (/sore throat/.test(ms)) possibleCausesSet.add('Could be due to throat infection such as viral pharyngitis or strep throat');
    if (/dizziness|fatigue/.test(ms)) possibleCausesSet.add('Could be related to dehydration, low blood pressure, low energy, or systemic causes');
    if (/chest pain/.test(ms)) possibleCausesSet.add('Could be cardiac or respiratory; treat as potentially serious and seek urgent care');
    if (/itchy eyes|sneezing|runny nose/.test(ms)) possibleCausesSet.add('Could be due to allergies or environmental triggers');
  }
  if (possibleCausesSet.size === 0) {
    const topThree = allConditions.slice(0, 3).map((c) => c.condition);
    for (const cond of topThree) {
      const lower = cond.toLowerCase();
      if (/(flu|influenza|covid|common cold|bronchitis|gastroenteritis|food poisoning)/.test(lower)) possibleCausesSet.add('Could be due to a viral or bacterial infection');
      if (/dehydration/.test(lower)) possibleCausesSet.add('Could be due to dehydration or electrolyte imbalance');
      if (/allerg/i.test(lower)) possibleCausesSet.add('Could be due to an allergic reaction');
      if (/asthma|bronchitis|covid|flu|pneumonia/.test(lower)) possibleCausesSet.add('Could be related to a respiratory infection or irritant exposure');
      if (/migraine|tension/.test(lower)) possibleCausesSet.add('Could be related to primary headache disorders (stress, tension, migraine triggers)');
      if (/food poisoning|gastroenteritis/.test(lower)) possibleCausesSet.add('Could be due to contaminated food or a gastrointestinal infection');
      if (/anxiety/.test(lower)) possibleCausesSet.add('Could be related to anxiety or stress');
    }
  }
  if (possibleCausesSet.size === 0) possibleCausesSet.add('Could be due to a common viral infection or non-specific causes');

  // 3. Immediate Self-Care Advice (general, non-prescriptive, tailored per symptoms)
  const selfCareBase = [
    'Drink plenty of fluids (water, oral rehydration solutions if nausea/vomiting/diarrhea)',
    'Rest and avoid strenuous activity',
    'Monitor your temperature and symptoms regularly',
  ];

  const selfCareSpecific: string[] = [];
  const msjoined = Array.from(matchedSymptoms).join(' ');
  if (/fever/.test(msjoined)) selfCareSpecific.push('For fever: stay hydrated, use cooling measures, and consider paracetamol/acetaminophen if appropriate for your profile.');
  if (/cough|sore throat/.test(msjoined)) selfCareSpecific.push('For cough/sore throat: rest voice, use humidified air, throat lozenges, and saline gargles; avoid smoke.');
  if (/nausea|vomiting|diarrhea/.test(msjoined)) selfCareSpecific.push('For nausea/vomiting/diarrhea: take small sips of oral rehydration solution, avoid solid food briefly, and seek care if unable to keep fluids down.');
  if (/headache/.test(msjoined)) selfCareSpecific.push('For headache: rest in a quiet, dark room, stay hydrated, and consider simple analgesics only if safe for you.');
  if (/breathlessness|wheezing/.test(msjoined)) selfCareSpecific.push('For breathlessness: stop exertion, sit upright, use prescribed inhaler if available, and seek urgent care if severe.');
  if (/runny nose|sneezing|itchy eyes/.test(msjoined)) selfCareSpecific.push('For allergies: identify and avoid triggers, use saline rinses, and consider antihistamines if suitable.');

  const selfCare = [...selfCareBase, ...selfCareSpecific, 'Consider over-the-counter symptomatic relief only if suitable for you and not contraindicated; check with a pharmacist/doctor if unsure'];

  // Safety adjustments based on patient profile
  const safetyNotes: string[] = [];
  try {
    if (patient) {
      const { age, sex, weightKg, heightCm } = patient;
      if (typeof age === 'number') {
        if (age < 2) {
          safetyNotes.push('Age under 2 years: many OTC medicines are NOT recommended for infants; seek pediatric advice before giving medication.');
        } else if (age < 12) {
          safetyNotes.push('Age under 12 years: avoid aspirin; check pediatric dosing for any medication.');
        } else if (age >= 65) {
          safetyNotes.push('Age 65 or older: higher risk for complications; avoid dehydration and check with provider before new medications.');
        }
      }

      if (typeof weightKg === 'number' && typeof heightCm === 'number' && weightKg > 0 && heightCm > 0) {
        const heightM = heightCm / 100;
        const bmi = +(weightKg / (heightM * heightM)).toFixed(1);
        if (bmi < 18.5) safetyNotes.push(`BMI ${bmi} (underweight): be cautious with dehydration and reduced reserves.`);
        if (bmi >= 30) safetyNotes.push(`BMI ${bmi} (obese): higher risk of respiratory complications; seek provider advice if breathing issues arise.`);
      }

      if (sex && typeof age === 'number' && sex.toLowerCase() === 'female' && age >= 15 && age <= 50) {
        safetyNotes.push('If there is any chance of pregnancy, avoid certain medications and seek pregnancy-safe advice.');
      }
    }
  } catch (err) {
    console.warn('Error evaluating patient safety notes', err);
  }

  // 4. Warning Signs (aggregate emergency warnings from top conditions)
  // Collect and deduplicate then pick the top 4-5 most critical, user requested
  const collectedWarnings: string[] = [];
  allConditions.slice(0, 5).forEach((c) => {
    (c.emergencyWarnings || []).forEach((w) => {
      const norm = w.replace(/\s+/g, ' ').trim();
      if (!collectedWarnings.includes(norm)) collectedWarnings.push(norm);
    });
  });

  // Define prioritized patterns and canonical messages
  const priorityPatterns: { pattern: RegExp; message: string }[] = [
    { pattern: /difficulty breathing|shortness of breath|severe difficulty breathing/i, message: 'Difficulty breathing or severe shortness of breath' },
    { pattern: /chest pain|chest pressure/i, message: 'Chest pain or pressure' },
    { pattern: /confusion|unable to rouse|altered mental state|new confusion/i, message: 'New confusion, severe drowsiness, or difficulty waking' },
    { pattern: /blue lips|blue face|cyanosis/i, message: 'Blue lips or face (signs of poor oxygenation)' },
    { pattern: /severe dehydration|no urination|extreme thirst/i, message: 'Signs of severe dehydration (very little/no urination, extreme dizziness)' },
    { pattern: /blood in stool|vomit blood|coughing up blood/i, message: 'Vomiting blood or blood in stool' },
    { pattern: /high fever|persistent high fever|>39/i, message: 'Very high or persistent fever (>39°C)' },
    { pattern: /loss of consciousness|unconscious|unable to rouse/i, message: 'Loss of consciousness or unresponsiveness' },
    { pattern: /severe abdominal pain/i, message: 'Severe or worsening abdominal pain' },
    { pattern: /difficulty swallowing|drooling/i, message: 'Unable to swallow or drooling (possible airway risk)' },
  ];

  const selectedWarnings: string[] = [];
  const joined = collectedWarnings.join(' | ');
  for (const p of priorityPatterns) {
    if (p.pattern.test(joined)) {
      selectedWarnings.push(p.message);
    }
    if (selectedWarnings.length >= 5) break;
  }

  // If none of the priority patterns matched, fall back to a small curated set or the first few collected
  if (selectedWarnings.length === 0) {
    if (collectedWarnings.length > 0) {
      // pick up to 4 unique collected warnings
      selectedWarnings.push(...collectedWarnings.slice(0, 4));
    } else {
      selectedWarnings.push('Difficulty breathing or shortness of breath');
      selectedWarnings.push('Chest pain or pressure');
      selectedWarnings.push('Very high or persistent fever (>39°C)');
      selectedWarnings.push('Severe weakness or fainting');
    }
  }

  // Ensure no duplicates and limit to 5
  const warningList = Array.from(new Set(selectedWarnings)).slice(0, 5);

  // 5. Lifestyle / Prevention Tips
  const prevention = [
    'Maintain good hand hygiene (wash with soap and water regularly)',
    'Avoid close contact with sick people and stay home when unwell',
    'Keep up to date with recommended vaccinations (e.g., influenza, COVID-19 where applicable)',
    'Maintain a balanced diet, regular exercise, and adequate sleep',
    'Practice safe food handling and clean surfaces regularly',
  ];

  // 6. Follow-Up Questions
  const followUps = [
    'Since when did the symptoms start?',
    'Have you noticed fever, difficulty breathing, or vomiting/diarrhea?',
    'Do you have any known chronic conditions (e.g., asthma, diabetes, heart disease)?',
    'Are you taking any medications or have any allergies?',
  ];

  // Compose final text in requested numbered format
  let responseText = '';
  // Determine a short safety tag summarizing whether general self-care is likely safe
  let safetyTag = 'Likely safe to follow general self-care advice.';
  try {
    if (patient) {
      const { age } = (patient as { age?: number } ) || {};
      const lowerNotes = safetyNotes.join(' ').toLowerCase();
      if ((typeof age === 'number' && age < 2) || lowerNotes.includes('age under 2')) {
        safetyTag = 'Not safe to self-manage — seek pediatric/urgent medical advice.';
      } else if ((typeof age === 'number' && age >= 65) || lowerNotes.includes('65 or older')) {
        safetyTag = 'Use caution — consider contacting a healthcare professional before self-managing.';
      } else if (lowerNotes.includes('pregnancy') || lowerNotes.includes('chance of pregnancy')) {
        safetyTag = 'Check with a healthcare professional before taking medications or specific treatments (possible pregnancy).';
      } else if (lowerNotes.includes('bmi') || lowerNotes.includes('underweight') || lowerNotes.includes('obese') || lowerNotes.includes('underweight')) {
        safetyTag = 'Use caution — certain conditions (BMI extremes) may increase risk; contact your provider if concerned.';
      } else if (safetyNotes.length > 0) {
        safetyTag = 'Use caution — follow self-care and contact a provider if symptoms worsen.';
      }
    } else if (safetyNotes.length > 0) {
      safetyTag = 'Use caution — follow self-care and contact a provider if symptoms worsen.';
    }
  } catch (err) {
    console.warn('Error computing safety tag', err);
  }

  responseText += `1. Problem Summary\n\n${summary}\n\n`;
  responseText += `Safe to follow: ${safetyTag}\n\n`;

  responseText += `2. Possible Causes (General Information Only)\n\n`;
  Array.from(possibleCausesSet).forEach((cause) => {
    responseText += `- ${cause}\n\n`;
  });

  responseText += `3. Immediate Self-Care Advice\n\n`;
  selfCare.forEach((advice) => {
    responseText += `- ${advice}\n`;
  });
  if (safetyNotes.length > 0) {
    responseText += `\nImportant Safety Notes based on provided profile:\n`;
    safetyNotes.forEach((n) => { responseText += `- ${n}\n`; });
  }
  responseText += `\n`;

  responseText += `4. Warning Signs (When to seek medical help)\n\nSeek medical help if you notice any of the following:\n`;
  warningList.forEach((w) => {
    responseText += `- ${w}\n`;
  });
  responseText += `\n`;

  responseText += `5. Lifestyle / Prevention Tips\n\n`;
  prevention.forEach((p) => {
    responseText += `- ${p}\n`;
  });
  responseText += `\n`;

  responseText += `6. Follow-Up Questions (to improve accuracy)\n\n`;
  followUps.forEach((q) => {
    responseText += `- ${q}\n`;
  });

  responseText += `\n⚕️ IMPORTANT: This information is for educational purposes only and is not a medical diagnosis. If you are concerned or if emergency warning signs appear, seek immediate medical attention.`;

  return { text: responseText, confidence: overallConfidence, conditions: allConditions };
}
