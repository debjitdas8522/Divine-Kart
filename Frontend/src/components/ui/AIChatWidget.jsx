import { useCart } from '@/hooks/useCart';
import { getChatResponse } from '@/services/aiService';
import { formatCurrency } from '@/utils/formatters';
import { Bot, Loader2, MessageCircle, Send, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: '🙏 Namaste! I\'m your Divine-Kart shopping assistant. Ask me anything — \"Show me agarbatti under ₹100\" or \"What\'s popular?\"',
  products: [],
};

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addItem } = useCart();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed, products: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await getChatResponse(trimmed);
      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: result.text,
        products: result.products || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Sorry, something went wrong. Please try again!',
          products: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAddToCart = (product) => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        id="ai-chat-toggle"
        aria-label="Open AI assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
        style={{ zIndex: 9998 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: 520, zIndex: 9997 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm">Divine-Kart AI</p>
              <p className="text-white/70 text-xs font-semibold">Shopping Assistant</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="max-w-[80%] space-y-2">
                  <div
                    className={`px-3 py-2.5 rounded-2xl text-sm font-semibold leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Product Cards from AI */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-1.5">
                      {msg.products.slice(0, 3).map((product) => (
                        <div
                          key={product._id}
                          className="bg-white border border-gray-100 rounded-xl p-2 flex items-center gap-2 shadow-sm"
                        >
                          <img
                            src={product.imageUrl || '/placeholder.png'}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${product._id}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-black text-gray-800 hover:text-primary truncate block"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs font-bold text-primary">{formatCurrency(product.price)}</p>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                            className="w-7 h-7 flex-shrink-0 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Add to cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-white">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ maxHeight: 80 }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                id="ai-chat-send"
                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold text-center mt-1.5">AI responses may not always be accurate</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
