import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloseIcon from '@mui/icons-material/Close';
import { ClipLoader } from 'react-spinners';
import ChatWindow from './ChatWindow';

const ChatList = () => {
    const { token, userData } = useSelector(state => state.user);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    console.log('ChatList mounted, token:', token ? 'exists' : 'missing');

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
            const interval = setInterval(fetchConversations, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const fetchConversations = async () => {
        try {
            const { data } = await axios.get(
                `${serverUrl}/api/chat/conversations`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConversations(data.conversations);
        } catch (error) {
            console.error('Fetch conversations error:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

    const formatTime = (date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const diffMs = now - msgDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (selectedConversation) {
        return (
            <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white border-4 border-black flex flex-col z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {/* Header */}
                <div className="bg-black text-white px-4 py-3 flex items-center justify-between border-b-4 border-black">
                    <div className="flex items-center gap-3">
                        {selectedConversation.otherUser?.photoUrl ? (
                            <img
                                src={selectedConversation.otherUser.photoUrl}
                                alt=""
                                className="w-10 h-10 border-2 border-white object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-white/20 border-2 border-white flex items-center justify-center text-white font-black text-lg">
                                {selectedConversation.otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-tight">{selectedConversation.otherUser?.name}</h3>
                            <p className="text-xs font-bold text-gray-300">{selectedConversation.course?.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedConversation(null)}
                        className="p-1 border-2 border-white hover:bg-white/20 transition-none"
                    >
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages - Inline version */}
                <EducatorChatMessages
                    conversation={selectedConversation}
                    token={token}
                    userData={userData}
                />
            </div>
        );
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-black border-4 border-black text-white flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                style={{ zIndex: 9999 }}
            >
                <ChatBubbleOutlineIcon className="w-7 h-7" />
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-black text-xs font-black border-2 border-black flex items-center justify-center">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>

            {/* Chat List Panel */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 w-80 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-40 overflow-hidden"
                >
                    <div className="bg-black text-white px-4 py-3 flex items-center justify-between border-b-4 border-black">
                        <h3 className="font-black uppercase text-sm tracking-wider">Student Messages</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 border-2 border-white hover:bg-white/20 transition-none"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto bg-white">
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <ClipLoader size={30} color="#000" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-10">
                                <ChatBubbleOutlineIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 font-bold text-sm">No messages yet</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className="p-4 border-b-2 border-black hover:bg-gray-100 cursor-pointer transition-none flex items-center gap-3"
                                >
                                    {conv.otherUser?.photoUrl ? (
                                        <img
                                            src={conv.otherUser.photoUrl}
                                            alt=""
                                            className="w-12 h-12 border-2 border-black object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-white font-black text-lg"
                                        style={{ display: conv.otherUser?.photoUrl ? 'none' : 'flex' }}
                                    >
                                        {conv.otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-black text-sm uppercase tracking-tight truncate">{conv.otherUser?.name}</h4>
                                            <span className="text-xs font-bold text-gray-400">{formatTime(conv.lastMessageAt)}</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 truncate">{conv.course?.title}</p>
                                        <p className="text-sm font-medium text-gray-600 truncate">{conv.lastMessage}</p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-black text-white text-xs font-black border-2 border-black flex items-center justify-center">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

        </>
    );
};

// Educator Chat Messages Component (inline)
const EducatorChatMessages = ({ conversation, token, userData }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = React.useRef(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [conversation._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const { data } = await axios.get(
                `${serverUrl}/api/chat/messages/${conversation._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(data.messages);
        } catch (error) {
            console.error('Fetch messages error:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/chat/message`,
                { conversationId: conversation._id, message: newMessage.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prev => [...prev, data.message]);
            setNewMessage('');
        } catch (error) {
            console.error('Send message error:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 border-b-2 border-black">
                {messages.map(msg => {
                    const isMe = msg.sender._id === userData._id;
                    return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] border-2 border-black px-4 py-2.5 ${
                                isMe
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-800'
                            }`}>
                                <p className="text-sm font-bold">{msg.message}</p>
                                <p className="text-[10px] mt-1 font-bold text-gray-400">{formatTime(msg.createdAt)}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 bg-white border-t-2 border-black flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-3 border-2 border-black text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-11 h-11 bg-black border-2 border-black text-white flex items-center justify-center font-black hover:bg-gray-800 disabled:opacity-50 transition-none"
                >
                    {sending ? <ClipLoader size={16} color="white" /> : '→'}
                </button>
            </form>
        </>
    );
};

export default ChatList;
