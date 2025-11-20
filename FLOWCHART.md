# HealthCare AI Chatbot - Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER OPENS APP                              │
│                  (http://localhost:3000)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Check Auth Context  │
              │  (localStorage user) │
              └──────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
      YES│            NO │            Loading
         │               │               │
         ▼               ▼               ▼
    ┌────────┐      ┌─────────┐    ┌──────────┐
    │ /chat  │      │ /login  │    │ Loading  │
    │ page   │      │  page   │    │ Spinner  │
    └────────┘      └────┬────┘    └──────────┘
         │                │
         │         ┌──────▼──────┐
         │         │  Login Form │
         │         │  (email +   │
         │         │  password)  │
         │         └──────┬──────┘
         │                │
         │         ┌──────▼──────────┐
         │         │ Demo Account    │
         │         │ demo@healthcare │
         │         │ .com / demo1234 │
         │         └────────┬────────┘
         │                  │
         │          ┌───────▼────────┐
         │          │  Validation    │
         │          │  (email/phone  │
         │          │   + password)  │
         │          └───────┬────────┘
         │                  │
         │         ┌────────▼────────┐
         │         │   Save to      │
         │         │  localStorage  │
         │         │  (chatbot_user)│
         │         └────────┬────────┘
         │                  │
         └──────────────────┼───────────────┐
                            │               │
                            ▼               ▼
                    ┌────────────────────────────┐
                    │   CHAT PAGE               │
                    │   (Main Interface)        │
                    └────┬───────────────────────┘
                         │
         ┌───────────────┬┴────────────┬──────────────────┐
         │               │             │                  │
         ▼               ▼             ▼                  ▼
    ┌─────────┐   ┌──────────┐  ┌──────────┐     ┌──────────────┐
    │ SIDEBAR │   │   TOP    │  │   CHAT   │     │    INPUT     │
    │ (Left)  │   │   BAR    │  │  DISPLAY │     │    AREA      │
    └────┬────┘   └──────────┘  └──────────┘     └──────┬───────┘
         │                                               │
         │                                               │
    ┌────▼──────────────┐                    ┌──────────▼──────────┐
    │  Conversations    │                    │  SymptomForm       │
    │  • New Chat       │                    │  • Symptom Input   │
    │  • History List   │                    │  • Common Chips    │
    │  • Delete Conv    │                    │  • Duration        │
    │  • User Info      │                    │  • Severity        │
    │  • Logout Button  │                    │  • Extra Info      │
    └───────────────────┘                    │  • Submit Button   │
                                             └────────┬───────────┘
                                                      │
                                        ┌─────────────▼─────────────┐
                                        │  User Clicks Quick Chip   │
                                        │  (Fever, Cold, Cough...)  │
                                        │  ↓ Adds to textarea       │
                                        │  (can select multiple)    │
                                        └─────────────┬─────────────┘
                                                      │
                                        ┌─────────────▼──────────┐
                                        │   User Submits Form    │
                                        │   (Clicks Submit)      │
                                        └──────────┬─────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  Create/Load Conversation   │
                                    │  (generate ID & title)      │
                                    └──────────────┬──────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  Add User Message to Chat   │
                                    │  (timestamp + symptoms)     │
                                    └──────────────┬──────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  POST /api/analyze          │
                                    │  (send symptoms)            │
                                    └──────────────┬──────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  API Route Handler          │
                                    │  (/api/analyze/route.ts)    │
                                    └──────────────┬──────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │  Choose Analysis Method:    │
                                    │  1. HF Token? → Call HF API │
                                    │  2. Else → Local DB         │
                                    └──────────────┬──────────────┘
                                                   │
                        ┌──────────────────────────┼──────────────────────────┐
                        │                          │                          │
                    ┌───▼─────┐          ┌────────▼────────┐         ┌───────▼────┐
                    │ Hugging │          │  Local DB:      │         │  Fallback: │
                    │  Face   │          │  • Fever        │         │  Generic   │
                    │   API   │          │  • Cough        │         │ Response   │
                    │(if token)          │  • Cold         │         │            │
                    └────┬────┘          │  • Headache     │         └───────┬────┘
                         │              │  • Body Ache    │                 │
                         └──────┬────────┴────────┬────────┴─────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Generate Analysis    │
                    │  (health advice +     │
                    │   recommendations)    │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Return JSON:         │
                    │  { analysis: "..." }  │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Add Assistant        │
                    │  Message to Chat      │
                    │  (timestamp)          │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Save Conversation    │
                    │  to localStorage      │
                    │  (conversations_*)    │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Display Messages     │
                    │  • User bubble (blue) │
                    │  • AI bubble (mint)   │
                    │  • Timestamp          │
                    │  • Auto-scroll        │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  User Can:            │
                    │  • View History       │
                    │  • Start New Chat     │
                    │  • Delete Conversation│
                    │  • Submit New Symptoms│
                    │  • Logout             │
                    └───────────────────────┘
```

## Data Flow Summary

### 1. **Authentication Flow**
- User → Login Page → Validate Email/Phone + Password → localStorage (`chatbot_user`) → Chat Page

### 2. **Chat Session Flow**
- Chat Page → Load conversations from localStorage (`conversations_<user.id>`)
- Display conversation history in sidebar

### 3. **Symptom Analysis Flow**
- User selects symptoms (chips) or types custom symptoms
- Submits form → Creates/loads conversation
- POST to `/api/analyze` endpoint
- API chooses: Hugging Face API (if token) OR Local Database
- Returns structured health analysis
- AI response added to conversation
- Conversation saved to localStorage
- Both messages displayed in chat

### 4. **Data Storage**
```
localStorage {
  chatbot_user: {
    id: "unique_id",
    name: "user_name",
    email: "email@example.com"
  },
  conversations_<user_id>: [
    {
      id: "conv_id",
      title: "Fever, Cough...",
      createdAt: "2025-11-16",
      messages: [
        { id, type: "user", content, timestamp },
        { id, type: "assistant", content, timestamp }
      ]
    }
  ]
}
```

### 5. **Color Scheme**
- **Background:** Warm Off-White (#F7EFD2)
- **Sidebar:** Soft Blue → Mint Green gradient
- **Text:** Deep Blue (#23408e), Charcoal (#464444)
- **User Messages:** Soft Sky Blue (#A6CBFF)
- **AI Messages:** Gentle Mint Green (#B7FAAF)
- **Errors:** Muted Red (#E30D34)

### 6. **Key Features**
✅ Free AI analysis (local DB + optional Hugging Face)
✅ Multi-select symptoms (chips)
✅ Conversation persistence (localStorage)
✅ Responsive design
✅ Professional medical theme
✅ Demo account for testing
