# 🏥 HealthCare AI Assistant Chatbot

A free, open-source AI-powered healthcare chatbot built with Next.js. This web application analyzes user symptoms and provides general health information and recommendations. Perfect for educational purposes and college projects.

**⚠️ Disclaimer:** This tool provides general health information for educational purposes only. It is NOT a substitute for professional medical advice. Always consult a healthcare professional for proper diagnosis and treatment.

---

## ✨ Features

- **Symptom Input Form**: Easy-to-use form to describe symptoms with duration and severity
- **AI-Powered Analysis**: Provides possible conditions and health recommendations
- **Conversation History**: View chat history with timestamps
- **Quick Templates**: Pre-filled symptom templates for quick testing
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Educational Focus**: Includes comprehensive disclaimers and safety information
- **100% Free**: Uses free APIs and no paid services required

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
chatbot/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main chatbot interface
│   │   ├── layout.tsx        # Root layout with metadata
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── SymptomForm.tsx   # Form for symptom input
│   │   └── ChatDisplay.tsx   # Chat message display
│   └── lib/
│       └── healthcareApi.ts  # Healthcare analysis logic
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🛠️ Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI Integration**: Hugging Face Inference API (optional) or Local Analysis
- **Package Manager**: npm

---

## 📝 How to Use

### 1. Input Symptoms
- Enter the symptoms you're experiencing in the main text area
- Optionally specify duration, severity, and additional medical information
- Use quick templates for common symptoms

### 2. Get Analysis
- Click "Get Health Insight" button
- Wait for AI to analyze and provide information
- Results include possible conditions and recommendations

### 3. View History
- Chat history is displayed on the right side
- Click "Clear Chat History" to start fresh

---

## 🔧 Configuration

### Optional: Using Hugging Face API for Better AI

For improved AI responses, you can use Hugging Face's free API:

1. Sign up at [https://huggingface.co](https://huggingface.co)
2. Get your API token from account settings
3. Create `.env.local` file:

```env
NEXT_PUBLIC_HF_TOKEN=your_hugging_face_token_here
```

4. Restart the development server

---

## 🏗️ Deployment

### Deploy to Vercel (Recommended for free tier)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build the project
npm run build

# The `.next` folder is ready to deploy
```

### Deploy to Any Node.js Hosting

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📚 Symptom Database

The application includes pre-configured analysis for:
- **Fever**: Information about temperature-related conditions
- **Cough**: Respiratory-related information
- **Headache**: Headache types and management
- **Body Pain**: Muscle and body pain information

For other symptoms, the AI provides general health guidance.

---

## ⚖️ Important Disclaimers

This application:
- ✅ Provides **educational health information**
- ✅ Helps users **understand their symptoms**
- ❌ Does **NOT** diagnose medical conditions
- ❌ Is **NOT** a replacement for doctors
- ❌ Should **NOT** be used in emergencies

**For emergencies, call 911 or your local emergency number immediately.**

---

## 🎓 College Project Features

This project is ideal for:
- **Web Development Courses**: Learn modern web technologies
- **AI/ML Integration**: Understand API integration basics
- **UI/UX Design**: Beautiful, responsive interface
- **Full-Stack Development**: Complete working application
- **Open Source**: All code is free and modifiable

---

## 📦 Building for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm start
```

The `.next` folder contains the production-ready application.

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Building Fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📄 License

This project is open source and free to use for educational purposes.

---

## 🤝 Contributing

Feel free to fork and modify this project for your college assignment or personal use!

---

## ❓ FAQ

**Q: Can I use this in production?**
A: No, this is for educational purposes only. Deploy only in educational/college environments.

**Q: How do I customize symptoms?**
A: Edit `src/lib/healthcareApi.ts` to add more symptoms to the database.

**Q: Can I add real AI?**
A: Yes! Set up a Hugging Face API token in `.env.local` for better responses.

**Q: Is this mobile-friendly?**
A: Yes! The design is fully responsive and works on all devices.

---

**Last Updated:** November 16, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready for Educational Use
