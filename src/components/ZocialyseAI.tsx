import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { Send, Bot, Sparkles, Loader2, Menu } from "lucide-react";
import { MOCK_USER, MOCK_FRIENDS } from "../data";

type Message = { role: "user" | "model"; text: string };

export function ZocialyseAI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hey! I'm ZocialAI. Want to chat, or should I generate an advanced personal insight report for your profile?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: messages, message: userMessage })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "model", text: data.text }]);
    } catch (err) {
      setMessages([...newMessages, { role: "model", text: "**Error:** Could not reach ZocialAI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData: {
            user: MOCK_USER,
            friends: MOCK_FRIENDS
          }
        })
      });
      const data = await res.json();
      setInsights(data.insightsText);
    } catch (err) {
      console.error(err);
      setInsights("Failed to fetch insights.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col pt-12 sm:pt-0">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 uppercase leading-tight">ZocialAI</h1>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Neural Insights</span>
          </div>
        </div>
        <button 
          onClick={handleGenerateInsights}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:opacity-90 text-white rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-colors shadow-lg shadow-blue-500/20 shadow-emerald-500/20"
        >
          {isGeneratingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Export
        </button>
      </div>

      {/* Insights Panel */}
      {insights && (
        <div className="mx-4 mt-4 p-4 bg-slate-900/50 border border-blue-500/30 rounded-2xl relative">
          <button 
            onClick={() => setInsights(null)}
            className="absolute top-2 right-4 text-slate-500 hover:text-slate-300 font-bold text-xl"
          >&times;</button>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white">Your Personal Insights</h3>
          </div>
          <div className="text-sm text-slate-300 markdown-body [&>p]:leading-snug [&>p:last-child]:mb-0 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>h3]:text-white [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:mb-1">
            <Markdown>{insights}</Markdown>
          </div>
        </div>
      )}

      {/* Chat Thread */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm" 
                  : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"
              }`}
            >
              <div className="markdown-body [&>p]:leading-snug [&>p:last-child]:mb-0 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 p-4 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 w-full max-w-4xl mx-auto">
          <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ZocialAI anything..."
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm min-w-0"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white disabled:opacity-50 hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20"
        >
          <Send className="w-5 h-5 ml-1" />
        </button>
      </form>
    </div>
    </div>
  );
}
