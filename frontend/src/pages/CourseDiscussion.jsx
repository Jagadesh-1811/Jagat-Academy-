import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaArrowLeftLong, FaComments, FaPaperPlane, FaUsers } from 'react-icons/fa6';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const CourseDiscussion = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, userData } = useSelector((state) => state.user);
  const [discussion, setDiscussion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages]);

  const appendMessage = (incomingMessage) => {
    setMessages((prev) => {
      if (!incomingMessage?._id) return prev;
      if (prev.some((item) => item._id === incomingMessage._id)) return prev;
      return [...prev, incomingMessage];
    });
  };

  useEffect(() => {
    if (!token || !userData?._id || !courseId) return;

    const socket = io(serverUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('register', userData._id);
      socket.emit('join-course-discussion', { courseId });
      setSocketReady(true);
    });

    socket.on('course-discussion:message', (payload) => {
      if (String(payload?.courseId) !== String(courseId)) return;
      appendMessage(payload.message);
    });

    socket.on('course-discussion:error', (payload) => {
      if (payload?.message) {
        toast.error(payload.message);
      }
    });

    return () => {
      socket.emit('leave-course-discussion', { courseId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [courseId, token, userData?._id]);

  useEffect(() => {
    const loadDiscussion = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${serverUrl}/api/course-discussion/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDiscussion(data.discussion);

        const messagesRes = await axios.get(`${serverUrl}/api/course-discussion/${courseId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(messagesRes.data.messages || []);
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to load class discussion';
        toast.error(message);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (token && courseId) {
      loadDiscussion();
    }
  }, [courseId, navigate, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages]);

  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formatDate = (date) => {
    const today = new Date();
    const msgDate = new Date(date);
    return today.toDateString() === msgDate.toDateString()
      ? 'Today'
      : msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!messageText.trim() || sending) return;

    try {
      setSending(true);
      const { data } = await axios.post(
        `${serverUrl}/api/course-discussion/${courseId}/messages`,
        { message: messageText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      appendMessage(data.message);
      setMessageText('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <ClipLoader size={42} color="#000" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-black">
      <Nav />
      <div className="flex-grow w-full px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none mb-4"
        >
          <FaArrowLeftLong /> Back
        </button>

        <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="bg-black text-white px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-300">
                <FaUsers /> Course Discussion
              </div>
              <h1 className="text-lg md:text-2xl font-bold mt-1">
                {discussion?.course?.title || 'Class Discussion'}
              </h1>
            </div>
            <div className="text-right text-xs text-gray-300">
              <p>{sortedMessages.length} messages</p>
              <p>{socketReady ? 'Live' : 'Connecting...'}</p>
            </div>
          </div>

          <div className="h-[65vh] overflow-y-auto px-4 md:px-6 py-5 space-y-4 bg-gray-50">
            {sortedMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <FaComments className="text-4xl mb-3 text-gray-400" />
                <p className="font-bold text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400 mt-1">Start the first discussion for this course.</p>
              </div>
            ) : (
              sortedMessages.map((msg, index) => {
                const isMe = msg.sender?._id === userData?._id;
                const showDate = index === 0 || formatDate(sortedMessages[index - 1].createdAt) !== formatDate(msg.createdAt);

                return (
                  <React.Fragment key={msg._id}>
                    {showDate && (
                      <div className="flex justify-center">
                        <span className="text-xs uppercase tracking-widest text-gray-500 bg-white border-2 border-black px-3 py-1 font-bold">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] md:max-w-[68%] px-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isMe ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className={`text-xs font-bold ${isMe ? 'text-gray-300' : 'text-gray-500'}`}>
                            {isMe ? 'You' : msg.sender?.name || 'Student'}
                          </p>
                          <p className={`text-[10px] ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t-4 border-black bg-white p-4">
            <div className="flex items-center gap-3">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message to the class..."
                className="flex-1 border-2 border-black bg-gray-50 px-4 py-3 text-sm outline-none focus:bg-gray-100 transition-none"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="inline-flex items-center justify-center gap-2 border-2 border-black bg-black px-5 py-3 text-sm font-bold text-white disabled:opacity-50 hover:bg-white hover:text-black transition-none"
              >
                {sending ? <ClipLoader size={16} color="#fff" /> : <FaPaperPlane />}
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDiscussion;