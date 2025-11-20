'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import ChatDisplay from '@/components/ChatDisplay';
import SymptomForm from '@/components/SymptomForm';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number; // 0-1, present for assistant messages when available
  conditions?: { 
    condition: string; 
    percentage: number;
    transmission?: string;
    precautions?: string[];
    recoveryTime?: string;
    emergencyWarnings?: string[];
  }[]; // Full condition list with details
  showAllConditions?: boolean; // Flag to show full list instead of summary
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function ChatPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      const prof = localStorage.getItem(`patient_profile_${user.id}`);
      if (prof) {
        try {
          setPatientProfile(JSON.parse(prof));
          setProfileExists(true);
        } catch (err) {
          console.error('Failed to parse profile', err);
          setProfileExists(false);
        }
      } else {
        setProfileExists(false);
      }
    }

    const saved = localStorage.getItem(`conversations_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(
          parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }))
        );
        if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      }
    }
  }, [user, isLoading, router]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettingsMenu]);

  // Close on Escape & handle mobile detection
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSettingsMenu(false);
    };
    if (showSettingsMenu) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [showSettingsMenu]);

  const saveConversations = (convs: Conversation[]) => {
    if (user) {
      localStorage.setItem(`conversations_${user.id}`, JSON.stringify(convs));
    }
  };

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  const handleSymptomSubmit = async (symptoms: string, additionalInfo: string) => {
    setError(null);
    setLoading(true);

    let convId = currentConversationId;
    if (!convId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: symptoms.slice(0, 30) + (symptoms.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
      };
      setConversations([newConv, ...conversations]);
      setCurrentConversationId(newConv.id);
      convId = newConv.id;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `Symptoms: ${symptoms}\nAdditional Info: ${additionalInfo}`,
      timestamp: new Date(),
    };

    setConversations((prevConvs) =>
      prevConvs.map((conv) => (conv.id === convId ? { ...conv, messages: [...conv.messages, userMessage] } : conv))
    );

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ symptoms, additionalInfo, patientProfile }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await res.json();
      const analysisText = data.analysis;
      const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
      const conditions = Array.isArray(data.conditions) ? data.conditions : [];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: analysisText,
        timestamp: new Date(),
        confidence,
        conditions,
        showAllConditions: false, // Show summary by default
      };

      setConversations((prevConvs) => {
        const updated = prevConvs.map((conv) => (conv.id === convId ? { ...conv, messages: [...conv.messages, assistantMessage] } : conv));
        saveConversations(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze symptoms. Please try again.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to analyze symptoms'}`,
        timestamp: new Date(),
      };
      setConversations((prevConvs) => {
        const updated = prevConvs.map((conv) => (conv.id === convId ? { ...conv, messages: [...conv.messages, errorMessage] } : conv));
        saveConversations(updated);
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setError(null);
  };

  const handleShowMore = (messageId: string) => {
    setConversations((prevConvs) => {
      const updated = prevConvs.map((conv) => ({
        ...conv,
        messages: conv.messages.map((msg) =>
          msg.id === messageId ? { ...msg, showAllConditions: true } : msg
        ),
      }));
      saveConversations(updated);
      return updated;
    });
  };

  const handleDeleteConversation = (convId: string) => {
    const updated = conversations.filter((c) => c.id !== convId);
    setConversations(updated);
    saveConversations(updated);
    if (currentConversationId === convId) {
      setCurrentConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSelectConversation = (convId: string) => {
    setCurrentConversationId(convId);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfileSaved = (profile: any) => {
    setPatientProfile(profile);
    setProfileExists(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: '#F7EFD2' }}>
      {/* Top Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between" style={{ borderBottom: '2px solid #A6CBFF' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="hidden md:inline-flex p-2 rounded-lg"
            title={leftPanelOpen ? 'Collapse form' : 'Open form'}
            style={{ backgroundColor: '#F7EFD2', color: '#23408e' }}
          >
            {leftPanelOpen ? '📥' : '📤'}
          </button>
          <button
            onClick={() => setLeftDrawerOpen(true)}
            className="md:hidden p-2 rounded-lg"
            title="Open form"
            style={{ backgroundColor: '#F7EFD2', color: '#23408e' }}
          >
            📋
          </button>
          <span className="text-2xl">🏥</span>
          <div>
            <h1 className="font-bold" style={{ color: '#23408e' }}>HealthCare AI Assistant</h1>
            <p className="text-xs" style={{ color: '#464444' }}>Medical Symptom Analyzer</p>
          </div>
        </div>

        {/* (Settings moved to fixed bottom-left) */}
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* History Panel - Conditionally Visible */}
        {showHistoryPanel && (
          <div
            className="w-64 flex flex-col overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #A6CBFF 0%, #B7FAAF 100%)' }}
          >
            <div className="p-4" style={{ borderBottom: '2px solid #B7FAAF' }}>
              <button
                onClick={handleNewChat}
                className="w-full px-4 py-2 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: '#B7FAAF', color: '#23408e' }}
              >
                ➕ New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="text-xs font-semibold text-[#23408e] uppercase mb-3">History</h3>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className="p-3 rounded-lg cursor-pointer transition group"
                  style={{
                    backgroundColor: currentConversationId === conv.id ? '#B7FAAF' : 'transparent',
                    color: '#23408e',
                  }}
                >
                  <p className="text-sm truncate">{conv.title}</p>
                  <p className="text-xs opacity-70 mt-1">{new Date(conv.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    className="text-xs opacity-0 group-hover:opacity-100 mt-2 transition"
                    style={{ color: '#E30D34' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
              {conversations.length === 0 && <p className="text-xs text-[#464444] text-center py-4">No conversations yet</p>}
            </div>

            <div className="p-4 space-y-2" style={{ borderTop: '2px solid #B7FAAF' }}>
              <div className="text-xs text-[#23408e]">
                <p className="font-semibold">{user.name}</p>
                <p className="opacity-70">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Two-column layout: left = Symptom form (1/3), right = chat (2/3) */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Left form column (desktop) */}
          <div className={`${leftPanelOpen ? 'md:flex' : 'md:hidden'} hidden md:w-1/3 w-full bg-[#F7EFD2] border-r-2 border-[#A6CBFF] p-6` }>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#23408e' }}>{profileExists ? 'Describe Your Symptoms' : 'Complete Patient Details'}</h2>
                <button onClick={() => setLeftPanelOpen(false)} className="text-sm px-2 py-1" style={{ color: '#464444' }}>Close</button>
              </div>
              {!profileExists ? (
                // Lazy load to avoid hydration issues
                // eslint-disable-next-line @next/next/no-async-client-component
                (() => {
                  const PatientDetailsForm = require('@/components/PatientDetailsForm').default;
                  return <PatientDetailsForm userId={user!.id} onSaved={handleProfileSaved} />;
                })()
              ) : (
                <SymptomForm onSubmit={handleSymptomSubmit} isLoading={loading} isCompact={false} />
              )}
            </div>
          </div>

          {/* Mobile drawer for form */}
          {leftDrawerOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setLeftDrawerOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-11/12 bg-[#F7EFD2] p-6 overflow-auto" style={{ borderRight: '2px solid #A6CBFF' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold" style={{ color: '#23408e' }}>Describe Your Symptoms</h2>
                  <button onClick={() => setLeftDrawerOpen(false)} className="text-sm px-2 py-1" style={{ color: '#464444' }}>Close</button>
                </div>
                <SymptomForm onSubmit={handleSymptomSubmit} isLoading={loading} isCompact={false} />
              </div>
            </div>
          )}

          {/* Chat column */}
          <div className="flex-1 w-full md:w-2/3 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ChatDisplay messages={messages} loading={loading} error={error} onShowMore={handleShowMore} />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Settings Button (bottom-left) */}
      <div ref={settingsRef} className="fixed left-4 bottom-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="p-2 rounded-full shadow-md hover:scale-105 transform transition duration-150 flex items-center justify-center text-lg"
            style={{ backgroundColor: '#A6CBFF', color: '#23408e' }}
            title="Settings"
            aria-label="Settings"
            aria-expanded={showSettingsMenu}
          >
            ⚙️
          </button>

          {showSettingsMenu && (
            // Responsive: show dropdown on desktop, bottom sheet on small screens
            <div>
              {/* Desktop dropdown (opens above the button) */}
              <div className="hidden sm:block absolute left-0 bottom-full mb-3 w-52 rounded-lg shadow-lg" style={{ backgroundColor: 'white', border: '2px solid #A6CBFF' }}>
                <button
                  onClick={() => {
                    setShowHistoryPanel(!showHistoryPanel);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium transition hover:bg-gray-50 flex items-center gap-2 border-b"
                  style={{ color: '#23408e', borderColor: '#A6CBFF' }}
                >
                  📋 {showHistoryPanel ? 'Hide' : 'Show'} History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm font-medium transition hover:bg-gray-50 flex items-center gap-2"
                  style={{ color: '#E30D34' }}
                >
                  🚪 Logout
                </button>
              </div>

              {/* Mobile bottom sheet */}
              <div className="sm:hidden fixed left-0 bottom-0 w-full z-60">
                <div className="w-full rounded-t-xl shadow-lg" style={{ backgroundColor: 'white', borderTop: '3px solid #A6CBFF' }}>
                  <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚙️</span>
                        <div>
                          <p className="font-medium" style={{ color: '#23408e' }}>Settings</p>
                          <p className="text-xs" style={{ color: '#464444' }}>Account & History</p>
                        </div>
                      </div>
                      <button onClick={() => setShowSettingsMenu(false)} className="text-sm px-2 py-1" style={{ color: '#464444' }}>Close</button>
                    </div>
                  </div>

                  <div className="p-4">
                    <button
                      onClick={() => {
                        setShowHistoryPanel(!showHistoryPanel);
                        setShowSettingsMenu(false);
                      }}
                      className="w-full px-4 py-3 mb-3 rounded-lg text-left text-sm font-medium transition hover:bg-gray-50 flex items-center gap-3"
                      style={{ color: '#23408e' }}
                    >
                      📋 {showHistoryPanel ? 'Hide' : 'Show'} History
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition hover:bg-gray-50 flex items-center gap-3"
                      style={{ color: '#E30D34' }}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
