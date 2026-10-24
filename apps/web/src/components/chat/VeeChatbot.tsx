import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot, User, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'vee' | 'user';
  text: string;
  products?: any[];
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'What can I buy under ₹500?',
  'Suggest a birthday gift',
  'Which products can arrive today?',
  'Best skincare for glowing skin',
  'How do Vaish Coins work?',
];

export const VeeChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'vee',
      text: "Hello! I'm Vee, your personal shopping assistant at Vaish&Co. ✨ Whether you need gift ideas, budget finds, or quick delivery picks, I'm here to help!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(query.trim());
      const veeMsg: ChatMessage = {
        id: 'vee_' + Date.now(),
        sender: 'vee',
        text: res.reply || "I'm having a little trouble finding that right now, but feel free to explore our collection!",
        products: res.suggestedProducts || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, veeMsg]);
    } catch {
      // Graceful offline assistant fallback
      const fallbackMsg: ChatMessage = {
        id: 'vee_fallback_' + Date.now(),
        sender: 'vee',
        text: "I'd love to help! Check out our curated catalog — you can find lovely gifts, beauty serums, home essentials, and quick-delivery items directly on our shop.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-pink to-brand-deepRose text-white shadow-elevated hover:shadow-pink-glow transition-all duration-300 hover:scale-105"
          aria-label="Open Vee AI Shopping Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-spin text-brand-palePink" style={{ animationDuration: '6s' }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <span className="font-serif font-bold text-sm tracking-wide">Ask Vee</span>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
            AI Assistant
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-brand-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-pink to-brand-deepRose p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Sparkles className="w-5 h-5 text-brand-palePink" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base leading-tight">Vee AI Assistant</h3>
                <p className="text-[11px] text-brand-palePink flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                  Catalogue-grounded shopping stylist
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-brand-blush border-b border-brand-border/60 overflow-x-auto whitespace-nowrap flex gap-1.5 text-xs shrink-0">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-white border border-brand-border text-brand-text hover:border-brand-pink hover:text-brand-deepRose text-[11px] font-medium transition-colors shrink-0 shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-brand-blush/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'vee' && (
                  <div className="w-7 h-7 rounded-full bg-brand-palePink text-brand-deepRose flex items-center justify-center shrink-0 mt-0.5 border border-brand-border">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-pink text-white rounded-tr-none'
                        : 'bg-white text-brand-text border border-brand-border/80 shadow-subtle rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Grounded Products in Chat */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-brand-secondary">
                        Recommended for you:
                      </p>
                      {msg.products.map((prod: any) => (
                        <div
                          key={prod.id}
                          className="p-2.5 bg-white rounded-xl border border-brand-border flex items-center justify-between gap-2 shadow-xs hover:border-brand-pink transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {prod.imageUrl && (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-serif font-medium text-brand-text truncate">
                                {prod.name}
                              </p>
                              <p className="text-[11px] font-bold text-brand-deepRose">
                                ₹{prod.salePrice || prod.basePrice}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Link
                              to={`/products/${prod.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1.5 rounded-lg bg-brand-blush hover:bg-brand-palePink text-brand-text text-[11px]"
                              title="View Product"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => addToCart(prod, 1)}
                              className="p-1.5 rounded-lg bg-brand-pink text-white hover:bg-brand-deepRose text-[11px]"
                              title="Add to Bag"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-brand-text text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-brand-secondary">
                <div className="w-7 h-7 rounded-full bg-brand-palePink text-brand-deepRose flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="italic">Vee is browsing our lovely finds...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-brand-border flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask about gifts, budget, delivery, or ingredients..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow px-3.5 py-2.5 text-xs sm:text-sm rounded-full border border-brand-border bg-brand-blush focus:outline-none focus:border-brand-pink"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-full bg-brand-pink text-white hover:bg-brand-deepRose disabled:opacity-50 transition-colors shadow-subtle shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
