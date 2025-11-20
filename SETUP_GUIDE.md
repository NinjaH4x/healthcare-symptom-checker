# 🚀 Setup & Deployment Guide - HealthCare AI Chatbot

## Installation Steps

### 1. Prerequisites
Make sure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A code editor like VS Code

Check if installed:
```bash
node --version
npm --version
```

### 2. Project Setup

```bash
# Navigate to project directory
cd /Users/apple/Desktop/chatbot

# Install all dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🎯 Features Overview

### Symptom Input Form
- Text area for describing symptoms
- Duration field (how long symptoms persist)
- Severity selector (mild, moderate, severe)
- Additional information field
- Quick template buttons for common symptoms

### AI Analysis Response
- Displays possible conditions
- Shows recommended actions
- Specifies when to seek emergency care
- Provides self-care suggestions
- Includes medical disclaimers

### Chat Interface
- Real-time message display
- User vs AI message differentiation
- Timestamps for each message
- Auto-scroll to latest messages
- Clear chat history button

---

## 🔧 Customization Guide

### Adding More Symptoms to Database

Edit `src/lib/healthcareApi.ts`:

```typescript
const symptomDatabase: { [key: string]: string } = {
  fever: `...`,
  cough: `...`,
  headache: `...`,
  'body pain': `...`,
  // ADD YOUR SYMPTOM HERE:
  'nausea': `Possible Conditions:
- Food poisoning
- Gastroenteritis
- ...
  `
};
```

### Changing UI Colors

Edit Tailwind classes in:
- `src/app/page.tsx` - Main gradient and colors
- `src/components/SymptomForm.tsx` - Form styling
- `src/components/ChatDisplay.tsx` - Chat message colors

Example: Change blue to green
```tsx
// Before:
className="bg-blue-600 text-white"

// After:
className="bg-green-600 text-white"
```

### Modifying Form Fields

Edit `src/components/SymptomForm.tsx` to add/remove fields.

---

## 📦 Build & Deployment

### Local Testing (Production Build)

```bash
# Create production build
npm run build

# Test production version
npm start
```

Access at `http://localhost:3000`

### Deploy to Vercel (Free & Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

Follow the prompts - your app will be live in seconds!

### Deploy to Netlify

```bash
# Build project
npm run build

# Netlify requires a specific format
# The .next folder needs to be deployed
```

Steps:
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build command: `npm run build`
4. Publish directory: `.next`

### Deploy to Any Server

```bash
# 1. Build the project
npm run build

# 2. Copy to server (via FTP/SSH)
# Upload entire project folder

# 3. On server, install and run:
npm install
npm start
```

---

## 🔐 Environment Variables

### Optional: Hugging Face API

Create `.env.local` file:

```env
NEXT_PUBLIC_HF_TOKEN=hf_xxxxxxxxxxx
```

Get your token:
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token with "Read" access
4. Copy and paste in `.env.local`

---

## 🐛 Troubleshooting

### Issue: "Port 3000 already in use"
```bash
# Use different port
npm run dev -- -p 3001
```

### Issue: Module errors after adding files
```bash
# Clear cache and reinstall
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

### Issue: Tailwind styles not working
```bash
# Rebuild Tailwind
npm run build

# Check globals.css is imported in layout.tsx
```

### Issue: API calls failing
1. Check network tab in browser DevTools
2. Verify API route exists at `src/app/api/analyze/route.ts`
3. Check console for errors

### Issue: App not responding
```bash
# Kill existing process
# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Then restart:
npm run dev
```

---

## 📊 Project Statistics

- **Total Files**: 8-10 core files
- **Lines of Code**: ~600 lines
- **Dependencies**: 4 main (Next.js, React, React-DOM, Axios)
- **Dev Dependencies**: 7
- **Build Time**: ~4-5 seconds
- **Bundle Size**: ~200KB

---

## 🎓 Learning Resources

### For College Project Submission

1. **Code Explanation Document**:
   - Explain component architecture
   - Document API integration
   - Describe state management

2. **Screenshots/Demo**:
   - Symptom input demo
   - Response examples
   - Mobile view screenshot

3. **Deployment Link**:
   - Deploy to Vercel for live demo
   - Share URL with instructor

### File Structure Explanation

```
src/app/page.tsx         → Main component (state management)
src/components/          → Reusable components
src/lib/healthcareApi.ts → Business logic & data
src/app/api/             → Backend endpoints
src/app/layout.tsx       → Root layout & metadata
src/app/globals.css      → Global Tailwind styles
```

---

## 🚀 Performance Tips

1. **Optimize Images**: Use `next/image` component
2. **Code Splitting**: Next.js does it automatically
3. **Caching**: Responses are computed client-side
4. **Mobile First**: Already optimized
5. **SEO**: Metadata in `layout.tsx`

---

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

## 🔒 Security Notes

- No sensitive data stored
- No authentication required
- No database connections
- Safe for college submission
- Can be deployed publicly

---

## ❓ FAQ

**Q: Can I add a database?**
A: Yes! Consider Supabase (free) or MongoDB Atlas (free tier)

**Q: How do I add user authentication?**
A: Use NextAuth.js for free authentication

**Q: Can I monetize this?**
A: For educational use only. Follow your institution's policies.

**Q: How to add real medical data?**
A: Integrate medical APIs (requires institutional access)

---

## 📞 Support

- Check README.md for full documentation
- Review Next.js docs: https://nextjs.org/docs
- GitHub issues for bugs
- Stack Overflow for community help

---

**Happy Coding! 🎉**
