import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Send,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  MessageCircle,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";
import { Message } from "./types";
import HelplineHub from "./components/HelplineHub";
import BreathingGuide from "./components/BreathingGuide";
import MoodCheckIn from "./components/MoodCheckIn";

const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "harm myself", "self-harm",
  "hurt myself", "cut myself", "hang myself", "hanging myself", "drink poison",
  "take my life", "want to die", "better off dead", "jump off", "slit my wrist", "overdose",
  "severe depression", "severely depressed", "very depressed", "clinical depression",
  "deeply depressed", "extremely depressed", "abuse", "abused", "abusing", "assaulted",
  "domestic violence", "beaten", "domestic abuse", "sexual assault", "rape", "raped"
].map(k => k.toLowerCase());

function checkCrisisClient(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase();
  for (const keyword of CRISIS_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return true;
    }
  }
  return false;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Sanibonani, Dumela, Hello. I am your South African Mental Health Assistant. 🇿🇦💚\n\nI am here to companion you, listen with absolute empathy, and offer gentle coping mechanisms for general anxiety and stress. Please feel free to share what is on your mind today.\n\n*Note: I am an AI companion designed for awareness and support, not a medical doctor. If you are experiencing suicidal thoughts, self-harm, or severe distress, please access the professional helpline services instantly using the 'Emergency Support' option above.*",
      timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPills = [
    "I am feeling very anxious right now.",
    "Help me settle down from panic.",
    "What are some coping mechanisms for stress?",
    "How can I practice general mindfulness?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userTime = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      role: "user",
      content: textToSend,
      timestamp: userTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // 1. Client-Side Crisis Check
    if (checkCrisisClient(textToSend)) {
      setCrisisTriggered(true);
      setIsTyping(true);
      setTimeout(() => {
        const supportMessage: Message = {
          role: "model",
          content:
            "It sounds like you are carrying an extraordinarily heavy burden. Please know that you do not have to carry this alone, and there is dedicated, compassionate support available in South Africa right now. We want you to be completely safe.\n\nWe have halted standard conversation to prioritize your immediate well-being. Please reach out to these emergency professional networks immediately:",
          timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, supportMessage]);
        setIsTyping(false);
      }, 800);
      return;
    }

    // 2. Call server-side Express API
    setIsTyping(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to communicate with the network.");
      }

      const data = await response.json();
      if (data.crisisTriggered) {
        setCrisisTriggered(true);
      }

      const modelTime = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: data.text,
          timestamp: modelTime,
        },
      ]);
    } catch (error: any) {
      console.error(error);
      const errorTime = new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "I sincerely apologize, but I am experiencing some trouble connecting right now. Please verify that your server is running and your GEMINI_API_KEY is configured correctly under the Settings tab.",
          timestamp: errorTime,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setCrisisTriggered(false);
    setMessages([
      {
        role: "model",
        content:
          "Sanibonani, Dumela, Hello. Your chat history has been reset. I am here to companion you, listen, and offer coping mechanisms for stress and anxiety. Let me know what you would like to explore today.",
        timestamp: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#3D3D33] font-sans flex flex-col antialiased selection:bg-[#D3DED4]">
      {/* Top Beautiful Navbar decoration */}
      <header className="sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b border-[#E6E2D3] px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8DA08E] flex items-center justify-center text-white shadow-xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-serif font-medium text-lg sm:text-2xl text-[#5A5A40] tracking-tight flex items-center gap-1.5">
                <span>SafeSpace South Africa</span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#D3DED4] text-[#5A5A40] border border-[#E6E2D3]">
                  Awareness Hub
                </span>
              </h1>
              <p className="text-xs text-[#A8A892]">Listening, supporting, and guiding with care</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrisisTriggered((prev) => !prev)}
              id="emergency-manual-toggle"
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold tracking-wide transition-all border cursor-pointer ${
                crisisTriggered
                  ? "bg-[#5A5A40] text-white border-[#5A5A40]"
                  : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{crisisTriggered ? "Standard Space" : "Get Support Now"}</span>
            </button>

            <button
              onClick={resetChat}
              id="reset-chat-btn"
              className="p-2 rounded-xl border border-[#E6E2D3] text-[#A8A892] hover:text-[#3D3D33] bg-white hover:bg-[#F7F5F0] transition-all cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left COLUMN: Active Chat Frame / Crisis Shield */}
        <section className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-[#E6E2D3] shadow-xs h-[680px] overflow-hidden">
          {crisisTriggered ? (
            /* Crisis Shield Mode overrides Chat Screen */
            <div id="crisis-shield-container" className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto">
              <div className="text-center max-w-md mx-auto mb-6">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center mx-auto mb-4 border border-rose-200 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="font-serif font-medium text-xl text-[#3D3D33] tracking-tight">
                  You Are Not Alone
                </h2>
                <p className="text-sm text-[#5A5A40] mt-2 leading-relaxed">
                  We've activated the South African Emergency Shield. Please read the guidance below and connect with professional counselors who can safely support you through this painful moment.
                </p>
              </div>

              {/* Directly render HelplineHub in high-visibility mode */}
              <div className="mb-6">
                <HelplineHub highlightUrgent={true} />
              </div>

              {/* Provide interactive deep breathing while they wait or to settle self */}
              <div className="mb-6">
                <BreathingGuide />
              </div>

              <div className="mt-auto p-4 rounded-xl bg-[#5A5A40]/5 border border-[#5A5A40]/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#8DA08E] shrink-0 mt-0.5" />
                <div className="text-xs text-[#5A5A40] leading-relaxed">
                  <strong className="text-[#3D3D33]">Your privacy is protected.</strong> This mental health assistant operates entirely offline inside your browser environment to keep your conversations confidential. Please exit this mode above at any time once you feel safe and ready to continue conversation.
                </div>
              </div>
            </div>
          ) : (
            /* Standard Emotional Chat Mode */
            <div className="flex-1 flex flex-col h-full bg-[#F7F5F0]/20">
              {/* Chat Sub-header */}
              <div className="bg-white/60 border-b border-[#E6E2D3] px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Empathy Dialogue Room</span>
                </span>
                <span className="text-[10px] font-mono text-[#5A5A40] bg-[#D3DED4]/60 px-2.5 py-0.5 rounded-full border border-[#E6E2D3] flex items-center gap-1 font-semibold select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8DA08E] animate-ping"></span>
                  <span>AI Assistant Active</span>
                </span>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={index}
                      id={`message-${index}`}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm shadow-xs leading-relaxed transition-all whitespace-pre-wrap ${
                          isUser
                            ? "bg-[#8DA08E] text-white rounded-tr-none"
                            : "bg-white text-[#3D3D33] border border-[#E6E2D3] rounded-tl-none"
                        }`}
                      >
                        <div>{msg.content}</div>
                        <div
                          className={`flex items-center gap-1 text-[10px] mt-2 font-mono ${
                            isUser ? "text-slate-100 justify-end" : "text-[#A8A892] justify-start"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div id="typing-bubble" className="flex justify-start">
                    <div className="bg-white border border-[#E6E2D3] rounded-2xl rounded-tl-none px-5 py-3.5 shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#8DA08E] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#8DA08E] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#8DA08E] animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Pills when feed is clear */}
              {messages.length < 3 && (
                <div className="px-4 py-25 flex flex-wrap gap-2 border-t border-[#E6E2D3] bg-white">
                  {quickPills.map((pill, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(pill)}
                      id={`pill-btn-${i}`}
                      className="px-3 py-1.5 rounded-xl border border-[#E6E2D3] text-xs font-semibold text-[#5A5A40] hover:bg-white bg-[#F7F5F0]/65 transition-all text-left cursor-pointer"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input form container */}
              <div className="bg-white border-t border-[#E6E2D3] p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message to chat, share feelings, or seek comfort..."
                    className="flex-1 p-3 px-5 rounded-full border border-[#E6E2D3] bg-[#F7F5F0]/10 focus:bg-white outline-none hover:border-[#8DA08E] focus:border-[#5A5A40] text-sm transition-all text-[#3D3D33]"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    id="submit-chat-btn"
                    className="p-3 bg-[#5A5A40] hover:bg-[#3D3D33] text-white rounded-full shadow-xs cursor-pointer transition-colors active:scale-95 flex items-center justify-center shrink-0 w-11 h-11"
                    disabled={isTyping || !inputValue.trim()}
                    title="Send message"
                  >
                    <Send className="w-4 h-4 fill-current" />
                  </button>
                </form>

                <div className="flex items-center gap-1.5 text-[10px] text-[#A8A892] mt-2.5 ml-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8DA08E]" />
                  <span>Secure & Private. Your dialogue remains fully confidential.</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right COLUMN: Coping Kit Directory & Reflection Cards */}
        <section className="lg:col-span-5 space-y-6 flex flex-col h-[680px] overflow-y-auto pr-1 pb-4 custom-scrollbar">
          {/* Support Helplines Hub */}
          <HelplineHub highlightUrgent={false} />

          {/* Calming Breathing Space */}
          <BreathingGuide />

          {/* Mood Check-In & Reflection Log */}
          <MoodCheckIn />
        </section>
      </main>

      {/* Footer Support Notice */}
      <footer className="bg-[#EFECE5] border-t border-[#E6E2D3] py-8 text-[#A8A892] text-center text-xs px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            © 2026 SafeSpace South Africa. Designed for stress awareness support. Powered by the Google Gemini API.
          </p>
          <div className="flex gap-4 font-semibold text-[#5A5A40]">
            <span>Supported by SADAG, Lifeline SA, and DSD networks.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
