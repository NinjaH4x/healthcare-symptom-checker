# Build & Data Summary

Short overview of technologies, APIs and data used in this project.

- **Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS for styles.
- **Backend / Runtime:** Node.js (Next.js API routes) — project runs on Vercel or any Node/Next-capable host.
- **Languages:** TypeScript (primary), JavaScript.
- **Translation API:** LibreTranslate (configurable via `NEXT_PUBLIC_LIBRETRANSLATE_URL`) for client/server text translation.
- **AI / Analysis:**
  - Primary: optional Hugging Face Inference API (if `NEXT_PUBLIC_HF_TOKEN` provided) to generate analysis text.
  - Fallback: built-in local analyzer — a deterministic rule/keyword-based condition matcher defined in `src/lib/healthcareApi.ts`.
- **Data / Datasets:** No proprietary medical dataset is bundled. The app uses a handcrafted condition database (keywords, precaution lists, recovery times, warnings) inside `src/lib/healthcareApi.ts`. When Hugging Face models are used, they run public models via Hugging Face's inference API (no local training data included).
- **Output generation:** Responses are produced either by the Hugging Face model (text generation) or by the local analyzer which scores conditions and returns structured info. Translations (input or output) are performed by LibreTranslate when enabled.
- **Privacy & Safety:** All output is for educational/informational purposes only. The app is NOT a medical diagnostic tool. See code comments and the site disclaimer.

If you want this page expanded (source attributions, exact model names, or deployment notes), tell me which details to include.
