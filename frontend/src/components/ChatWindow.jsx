import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import {
    FaComments,
    FaTimes,
    FaPaperPlane
} from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const ChatWindow = ({ courseId, educatorName, onClose }) => {
    const { token, userData } = useSelector(state => state.user);
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        initConversation();
    }, [courseId]);

    useEffect(() => {
        if (conversation) {
            const interval = setInterval(() => {
                fetchMessages(true);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initConversation = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${serverUrl}/api/chat/conversation/${courseId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConversation(data.conversation);
            await fetchMessages();
        } catch (error) {
            console.error('Init conversation error:', error);
            toast.error('Failed to start chat');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (silent = false) => {
        if (!conversation) return;
        try {
            const { data } = await axios.get(
                `${serverUrl}/api/chat/messages/${conversation._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(data.messages);
        } catch (error) {
            if (!silent) console.error('Fetch messages error:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/chat/message`,
                {
                    conversationId: conversation._id,
                    message: newMessage.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prev => [...prev, data.message]);
            setNewMessage('');
            inputRef.current?.focus();
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        const today = new Date();
        const msgDate = new Date(date);
        if (today.toDateString() === msgDate.toDateString()) {
            return 'Today';
        }
        return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white border-4 border-black flex items-center justify-center z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <ClipLoader size={40} color="#000" />
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white border-4 border-black flex flex-col z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between border-b-4 border-black">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-white flex items-center justify-center">
                        <FaComments className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black uppercase text-xs tracking-wider">Chat with Educator</h3>
                        <p className="text-xs font-bold text-gray-300">{educatorName}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 border-2 border-white hover:bg-white/20 transition-none"
                >
                    <FaTimes className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 border-b-2 border-black">
                {messages.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mx-auto mb-3">
                            <FaComments className="w-8 h-8 text-black" />
                        </div>
                        <p className="text-gray-500 font-bold text-sm">No messages yet</p>
                        <p className="text-gray-400 font-bold text-xs mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender._id === userData._id;
                        const showDate = index === 0 ||
                            formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

                        return (
                            <React.Fragment key={msg._id}>
                                {showDate && (
                                    <div className="text-center">
                                        <span className="text-xs font-bold text-gray-400 bg-white border-2 border-black px-3 py-1">
                                            {formatDate(msg.createdAt)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] border-2 border-black px-4 py-2.5 ${
                                        isMe
                                            ? 'bg-black text-white'
                                            : 'bg-white text-gray-800'
                                    }`}>
                                        <p className="text-sm font-bold leading-relaxed">{msg.message}</p>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <p className={`text-[10px] font-bold ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {formatTime(msg.createdAt)}
                                            </p>
                                            {msg.senderRole === 'student' && (
                                                <p className={`text-[10px] font-bold ${msg.isRead ? 'text-gray-300' : 'text-gray-400'}`}>
                                                    {msg.isRead ? '✓ Read' : 'Unread'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your doubt..."
                    className="flex-1 px-4 py-3 border-2 border-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-11 h-11 bg-black border-2 border-black text-white flex items-center justify-center font-black hover:bg-gray-800 transition-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? (
                        <ClipLoader size={16} color="white" />
                    ) : (
                        <FaPaperPlane className="w-4 h-4" />
                    )}
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
