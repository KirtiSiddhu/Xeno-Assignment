'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChat, getAiSuggestions } from '@/lib/api';
import { Send, Bot, Sparkles, User, RotateCcw, Crown, MapPin } from 'lucide-react';
import clsx from 'clsx';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([{
    role: 'assistant',
    content: "Hi! I'm Xena, your AI marketing co-pilot for Lumière. I can help you segment customers, craft campaigns, and track performance. What would you like to accomplish today?"
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAiSuggestions().then(setSuggestions).catch(console.error);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChat(newMessages, sessionId);
      if (response.session_id) setSessionId(response.session_id);

      const assistantMsg = {
        role: 'assistant',
        content: response.reply || "I've completed that task for you.",
        tool_calls: response.tool_calls || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Is the backend running?' }]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (name: string) => {
    switch(name) {
      case 'RotateCcw': return <RotateCcw size={16} />;
      case 'Crown': return <Crown size={16} />;
      case 'MapPin': return <MapPin size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 animate-fade-in">
      {/* Left Sidebar */}
      <div className="w-1/3 flex flex-col gap-6">
        <div className="glass rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 relative">
            <Bot className="text-primary" size={24} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111118]"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Xena AI</h2>
            <p className="text-sm text-primary font-medium flex items-center gap-1">
              <Sparkles size={14} /> Marketing Co-pilot
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex-1 overflow-y-auto">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Suggested Actions</h3>
          <div className="space-y-3">
            {suggestions.map((s) => (
              <button 
                key={s.id}
                onClick={() => handleSend(s.prompt)}
                className="w-full text-left p-4 rounded-xl bg-[#1e1e2e]/40 border border-[#1e1e2e] hover:border-primary/50 hover:bg-[#1e1e2e] transition-all group"
              >
                <div className="flex items-center gap-2 mb-1 text-foreground font-medium group-hover:text-primary transition-colors">
                  {getIcon(s.icon)} {s.title}
                </div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 glass rounded-2xl flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={clsx("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                msg.role === 'user' ? "bg-secondary text-[#0a0a0f]" : "bg-primary/20 text-primary border border-primary/30"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className={clsx(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-sm" 
                  : "bg-[#1e1e2e]/50 border border-[#1e1e2e] rounded-tl-sm"
              )}>
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Render Tool Calls if any */}
                {msg.tool_calls && msg.tool_calls.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-[#2a2a3c] pt-4">
                    {msg.tool_calls.map((tool: any, i: number) => (
                      <div key={i} className="bg-[#0a0a0f] p-3 rounded-lg border border-[#2a2a3c] flex flex-col gap-1">
                        <div className="text-xs font-mono text-primary flex items-center gap-2">
                          <Sparkles size={12} /> {tool.name}()
                        </div>
                        {tool.name === 'create_campaign' && tool.result.id && (
                          <div className="text-xs text-emerald-400 font-medium">✓ Campaign "{tool.args.name}" created successfully.</div>
                        )}
                        {tool.name === 'create_segment' && tool.result.id && (
                          <div className="text-xs text-emerald-400 font-medium">✓ Segment "{tool.args.name}" saved.</div>
                        )}
                        {tool.name === 'launch_campaign' && tool.result.sent !== undefined && (
                          <div className="text-xs text-emerald-400 font-medium">🚀 Launched! {tool.result.sent} messages sent to channel service.</div>
                        )}
                        {tool.name === 'preview_segment' && tool.result.count !== undefined && (
                          <div className="text-xs text-secondary font-medium">🔍 Preview: {tool.result.count} customers match these rules.</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-[#1e1e2e]/50 border border-[#1e1e2e] rounded-tl-sm flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-[#111118] border-t border-[#1e1e2e]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Xena to create a segment or run a campaign..."
              className="w-full bg-[#1e1e2e] border border-[#2a2a3c] rounded-xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
