import { analyzeSymptoms } from '@/lib/healthcareApi';

// Input validation and sanitization
function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
}

function validatePatientProfile(profile: any): any {
  if (!profile || typeof profile !== 'object') return null;
  const validated: any = {};
  if (typeof profile.age === 'number' && profile.age >= 0 && profile.age <= 150) validated.age = profile.age;
  if (typeof profile.sex === 'string' && ['male', 'female', 'other'].includes(profile.sex.toLowerCase())) validated.sex = profile.sex.toLowerCase();
  if (typeof profile.weightKg === 'number' && profile.weightKg > 0 && profile.weightKg <= 500) validated.weightKg = profile.weightKg;
  if (typeof profile.heightCm === 'number' && profile.heightCm > 50 && profile.heightCm <= 250) validated.heightCm = profile.heightCm;
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
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
    }

    if (typeof body !== 'object' || body === null) {
      return new Response(JSON.stringify({ error: 'Request body must be an object' }), { status: 400, headers });
    }

    // Sanitize inputs
    const symptoms = sanitizeInput(body.symptoms || '', 500);
    const additionalInfo = sanitizeInput(body.additionalInfo || '', 500);
    const otherRelevantInfo = sanitizeInput(body.otherRelevantInfo || '', 1000);
    const patientProfile = validatePatientProfile(body.patientProfile);

    if (!symptoms) {
      return new Response(JSON.stringify({ error: 'Symptoms are required and must be non-empty' }), { status: 400, headers });
    }

    // Call analyzer (no injection risk; it only does text matching and scoring)
    const result = await analyzeSymptoms(symptoms, additionalInfo, otherRelevantInfo, patientProfile);

    // Return structured response
    return new Response(JSON.stringify({ analysis: result.text, confidence: result.confidence, conditions: result.conditions }), { status: 200, headers });
  } catch (error) {
    console.error('API error:', error);
    // Don't expose internal error details to client
    return new Response(JSON.stringify({ error: 'Internal server error. Please try again later.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
