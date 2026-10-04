import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  AlertCircle, 
  RefreshCw,
  BookOpen
} from 'lucide-react';

export const AIAssistant = () => {
  const location = useLocation();
  const state = location.state || {};

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: state.initialQuestion 
        ? `Hello! I see you have a question regarding your recent ${state.predictionType || 'agricultural'} analysis. How can I assist your crop management today?`
        : "Hello! I am AgriVision AI's Senior Agronomist Assistant. Ask me anything about crop diseases, soil telemetry, fertigation schedules, or yield optimization!",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState(state.initialQuestion || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputQuestion.trim()) return;

    const userQ = inputQuestion;
    setInputQuestion('');

    setMessages(prev => [...prev, {
      sender: 'user',
      text: userQ,
      timestamp: new Date().toLocaleTimeString()
    }]);

    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        question: userQ,
        prediction_type: state.predictionType || 'general',
        prediction_context: state.context || null
      });

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: res.data.response,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I am experiencing temporary connection latency to the agronomic server. Please try asking again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-agri-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>Agronomic AI Advisory Layer</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Agricultural Assistant</h1>
        </div>
        <div className="px-3 py-1 rounded-full bg-agri-500/10 border border-agri-500/20 text-agri-400 text-xs font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Domain AI Active
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 h-[500px] flex flex-col justify-between shadow-2xl">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-agri-600/20 border border-agri-500/30 flex items-center justify-center text-agri-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-agri-600 to-emerald-600 text-white font-medium rounded-tr-none'
                    : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[9px] font-mono mt-1 ${msg.sender === 'user' ? 'text-agri-200 text-right' : 'text-gray-500'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-agri-400 font-mono py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing agronomic context...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="pt-4 border-t border-gray-800/80 flex items-center space-x-3">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question regarding crop health, soil nutrients, or yield..."
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-agri-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="px-5 py-3 bg-agri-600 hover:bg-agri-500 text-white font-semibold rounded-xl text-xs shadow-lg flex items-center space-x-2 transition-all disabled:opacity-40"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800/80 text-[11px] text-gray-500 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-agri-400 shrink-0 mt-0.5" />
        <span>
          <strong>Agronomic Disclaimer:</strong> AgriVision AI explanations synthesize trained ML predictions and verified agricultural research. Always confirm critical crop treatments with registered extension officers.
        </span>
      </div>
    </div>
  );
};
