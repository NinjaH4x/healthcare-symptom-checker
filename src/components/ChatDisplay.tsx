"use client";

import { useEffect, useRef } from "react";


interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: number;
  conditions?: { 
    condition: string; 
    percentage: number;
    transmission?: string;
    precautions?: string[];
    recoveryTime?: string;
    emergencyWarnings?: string[];
  }[];
  showAllConditions?: boolean;
}

interface ChatDisplayProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onShowMore?: (messageId: string) => void;
}

export default function ChatDisplay({ messages, loading, error, onShowMore }: ChatDisplayProps) {
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const formatTime = (d: Date) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderConfidenceBadge = (confidence?: number) => {
    if (typeof confidence !== 'number') return null;
    const pct = Math.round(confidence * 100);
    let label = 'Medium';
    let bg = '#FFF7ED'; // amber
    let text = '#744210';
    let border = '#F7C57C';

    if (confidence > 0.75) {
      label = 'High';
      bg = '#ECFDF5';
      text = '#065F46';
      border = '#86EFAC';
    } else if (confidence < 0.5) {
      label = 'Low';
      bg = '#FFF1F2';
      text = '#9F1239';
      border = '#FCA5A5';
    }

    return (
      <div className="absolute right-0 top-0 -translate-y-1/2" title={`Confidence ${pct}% — ${label}`}>
        <span
          className="text-[10px] px-2 py-1 rounded-full font-medium"
          style={{ backgroundColor: bg, color: text, border: `1px solid ${border}` }}
        >
          {label} · {pct}%
        </span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant avatar on left */}
              {m.type === 'assistant' && (
                <div className="mr-3 flex-shrink-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: '#23408e' }}
                    aria-hidden
                  >
                    🤖
                  </div>
                </div>
              )}

                <div className={`max-w-[75%]`}>
                <div
                  className={`px-4 py-2 rounded-2xl break-words shadow-sm ${
                    m.type === 'user'
                      ? 'bg-[#A6CBFF] text-[#072A6F] rounded-br-none'
                      : 'bg-white text-[#23408e] rounded-bl-none'
                  }`}
                >
                  <div className="relative">
                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                    {m.type === 'assistant' && renderConfidenceBadge(m.confidence)}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="text-[10px] opacity-70">{formatTime(m.timestamp)}</span>
                  </div>
                </div>
                {m.type === 'assistant' && m.conditions && m.conditions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {!m.showAllConditions && (
                      <button
                        onClick={() => onShowMore?.(m.id)}
                        className="text-xs px-3 py-1 bg-[#E6F0FF] text-[#23408e] rounded-lg border border-[#A6CBFF] hover:bg-[#D0E0FF] transition"
                      >
                        Show more conditions
                      </button>
                    )}
                    {m.showAllConditions && (
                      <div className="bg-[#F7EFD2] p-4 rounded-lg text-xs space-y-3 max-w-2xl">
                        <p className="font-semibold text-[#23408e] mb-3">📋 All Possible Conditions:</p>
                        {m.conditions.map((cond, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border-l-4 border-[#A6CBFF] space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[#23408e]">{cond.condition}</span>
                              <span className="font-bold text-[#A6CBFF]">{cond.percentage}%</span>
                            </div>
                            
                            {cond.transmission && (
                              <div>
                                <p className="font-medium text-[#23408e]">📦 How It Enters Your Body:</p>
                                <p className="text-[#464444] ml-2">{cond.transmission}</p>
                              </div>
                            )}
                            
                            {cond.recoveryTime && (
                              <div>
                                <p className="font-medium text-[#23408e]">⏱️ Recovery Time:</p>
                                <p className="text-[#464444] ml-2">{cond.recoveryTime}</p>
                              </div>
                            )}
                            
                            {cond.precautions && cond.precautions.length > 0 && (
                              <div>
                                <p className="font-medium text-[#23408e]">🛡️ Precautions to Prevent Further Infection:</p>
                                <ul className="text-[#464444] ml-2 space-y-1">
                                  {cond.precautions.map((prec, pidx) => (
                                    <li key={pidx} className="list-disc list-inside">✓ {prec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {cond.emergencyWarnings && cond.emergencyWarnings.length > 0 && (
                              <div className="bg-[#FFE5EA] p-2 rounded border-l-4 border-[#E30D34]">
                                <p className="font-bold text-[#E30D34]">⚠️ Emergency Warning Signs:</p>
                                <ul className="text-[#9F1239] ml-2 space-y-1 mt-1">
                                  {cond.emergencyWarnings.map((warn, widx) => (
                                    <li key={widx} className="list-disc list-inside text-xs">• {warn}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="bg-[#A6CBFF] p-3 rounded-lg text-[#072A6F] font-semibold text-center mt-4">
                          ⚕️ If symptoms worsen or emergency warnings appear, consult a healthcare professional immediately.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#23408e' }}>
                  🤖
                </div>
              </div>
              <div className="max-w-[75%]">
                <div className="px-4 py-2 rounded-2xl break-words bg-white text-[#23408e] shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#23408e] animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-[#23408e] animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 rounded-full bg-[#23408e] animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#E30D34' }}>
                  ⚠️
                </div>
              </div>
              <div className="max-w-[75%]">
                <div className="px-4 py-2 rounded-2xl break-words bg-[#FFE5EA] text-[#E30D34] shadow-sm">
                  <div className="text-sm font-semibold">Error</div>
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div ref={endOfMessagesRef} className="h-24" />
        </div>
      </div>
    </div>
  );
}

