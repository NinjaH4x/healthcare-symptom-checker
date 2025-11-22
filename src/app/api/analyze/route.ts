import { analyzeSymptoms, translateText } from '@/lib/healthcareApi';

// Input validation and sanitization
function sanitizeInput(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
}

interface PatientProfile {
  age?: number;
  sex?: string;
  weightKg?: number;
  heightCm?: number;
}

function validatePatientProfile(profile: unknown): PatientProfile | null {
  if (!profile || typeof profile !== 'object') return null;
  const validated: PatientProfile = {};
  const prof = profile as Record<string, unknown>;
  if (typeof prof.age === 'number' && prof.age >= 0 && prof.age <= 150) validated.age = prof.age;
  if (typeof prof.sex === 'string' && ['male', 'female', 'other'].includes(prof.sex.toLowerCase())) validated.sex = prof.sex.toLowerCase();
  if (typeof prof.weightKg === 'number' && prof.weightKg > 0 && prof.weightKg <= 500) validated.weightKg = prof.weightKg;
  if (typeof prof.heightCm === 'number' && prof.heightCm > 50 && prof.heightCm <= 250) validated.heightCm = prof.heightCm;
  return Object.keys(validated).length > 0 ? validated : null;
}

// Simple in-memory rate limiter (per userId, resets every minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, maxPerMinute: number = 10): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // CORS headers
    const headers = { 'Content-Type': 'application/json' };

    // Auth: require user ID
    const userId = request.headers.get('x-user-id');
    if (!userId || typeof userId !== 'string' || userId.length === 0 || userId.length > 100) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid user id' }), { status: 401, headers });
    }

    // Rate limiting
    if (!checkRateLimit(userId, 10)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), { status: 429, headers });
    }

    // Parse and validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
    }

    if (typeof body !== 'object' || body === null) {
      return new Response(JSON.stringify({ error: 'Request body must be an object' }), { status: 400, headers });
    }

    // Sanitize inputs
    const symptoms = sanitizeInput((body as Record<string, unknown>).symptoms || '', 500);
    const additionalInfo = sanitizeInput((body as Record<string, unknown>).additionalInfo || '', 500);
    const otherRelevantInfo = sanitizeInput((body as Record<string, unknown>).otherRelevantInfo || '', 1000);
    const patientProfile = validatePatientProfile((body as Record<string, unknown>).patientProfile);

    if (!symptoms) {
      return new Response(JSON.stringify({ error: 'Symptoms are required and must be non-empty' }), { status: 400, headers });
    }

    // Call analyzer (no injection risk; it only does text matching and scoring)
    const result = await analyzeSymptoms(symptoms, additionalInfo, otherRelevantInfo, patientProfile);

    // Language support: check `x-lang` header or Accept-Language
    const langHeader = (request.headers.get('x-lang') || request.headers.get('accept-language') || 'en').split(',')[0].trim();
    let analysisText = result.text;
    let translatedConditions = result.conditions;
    if (langHeader && !langHeader.toLowerCase().startsWith('en')) {
      // Try to translate the main analysis text; if translation fails, fallback to English
      try {
        analysisText = await translateText(result.text, langHeader);
        // Translate condition names and emergency warnings where present
        translatedConditions = await Promise.all(result.conditions.map(async (c) => ({
          ...c,
          condition: await translateText(c.condition, langHeader),
          transmission: c.transmission ? await translateText(c.transmission, langHeader) : undefined,
          precautions: c.precautions ? await Promise.all(c.precautions.map(p => translateText(p, langHeader))) : undefined,
          recoveryTime: c.recoveryTime ? await translateText(c.recoveryTime, langHeader) : undefined,
          emergencyWarnings: c.emergencyWarnings ? await Promise.all(c.emergencyWarnings.map(e => translateText(e, langHeader))) : undefined,
        })));
      } catch (e) {
        console.warn('Translation fallback, returning English:', e);
        analysisText = result.text;
        translatedConditions = result.conditions;
      }
    }

    // Return structured response
    return new Response(JSON.stringify({ analysis: analysisText, confidence: result.confidence, conditions: translatedConditions }), { status: 200, headers });
  } catch (error) {
    console.error('API error:', error);
    // Don't expose internal error details to client
    return new Response(JSON.stringify({ error: 'Internal server error. Please try again later.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
