import React, { useState, useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { FaRobot, FaPaperPlane, FaTimes, FaSpinner } from 'react-icons/fa';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${serverUrl}/api/ai/chat`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMessage = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-black border-4 border-black text-white w-16 h-16 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
      >
        <FaRobot className="text-2xl" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b-4 border-black">
        <div className="flex items-center gap-2">
          <FaRobot className="text-white text-lg" />
          <span className="text-white font-black uppercase text-sm tracking-wider">AI Assistant</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 transition-colors">
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm font-bold text-center">Ask me anything about your courses!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] border-2 border-black p-3 ${
              msg.role === 'user' ? 'bg-black text-white' : 'bg-white text-black'
            }`}>
              <p className="text-xs font-bold leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-black p-3">
              <FaSpinner className="animate-spin text-black" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t-4 border-black p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-black border-2 border-black text-white px-4 font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
