import React, { useState, useRef, useEffect } from "react";
import PageHeaderComponent from "../components/PageHeaderComponent";
import useAuth from "../utils/useAuth";
import { getChatResponse } from "../gemini/gemini";
import { SYSTEM_PROMPT } from "../gemini/geminiPrompt";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function AIChatPage() {
  const uid = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "ai-1",
      role: "assistant",
      content:
        "Hi! I'm your Schedulr AI assistant. I can help you manage appointments, services, and answer questions about your clinic. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage() {
    if (!input.trim()) return;

    setError(null);

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call Gemini API with system prompt context
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${input}`;
      const aiResponse = await getChatResponse(fullPrompt);

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Failed to get AI response:", err);
      setError("Failed to get response from AI. Please try again.");

      // Add error message to chat
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeaderComponent title="AI Assistant" />

      <div className="flex-1 overflow-hidden p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full p-6 flex flex-col">
          {/* Header */}
          <div className="mb-4 border-b border-slate-200 pb-4">
            <div className="text-lg font-semibold text-slate-900">
              Schedulr AI Assistant
            </div>
            <div className="text-xs text-slate-500">
              Ask me anything about your clinic and appointments
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.role === "user" ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me about appointments, services, clients..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />

            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
            >
              Send
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 mb-2">Quick questions:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInput("How do I manage appointments?")}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition disabled:opacity-50"
                disabled={loading}
              >
                Appointments
              </button>
              <button
                onClick={() => setInput("How do I add a new service?")}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition disabled:opacity-50"
                disabled={loading}
              >
                Services
              </button>
              <button
                onClick={() => setInput("Where can I see my analytics?")}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition disabled:opacity-50"
                disabled={loading}
              >
                Analytics
              </button>
              <button
                onClick={() => setInput("Help me!")}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-slate-100 transition disabled:opacity-50"
                disabled={loading}
              >
                Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
