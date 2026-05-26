import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaPlus, FaCommentDots } from 'react-icons/fa';

const ParentMessages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [availableEducators, setAvailableEducators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [convRes, studentsRes] = await Promise.all([
         axios.get(`${serverUrl}/api/parent/conversations`, { headers }),
         axios.get(`${serverUrl}/api/parent/students`, { headers })
      ]);
      
      setConversations(convRes.data.conversations || []);

      // Extract unique educators from students' enrolled courses
      const educatorsMap = new Map();
      const students = studentsRes.data.students || [];
      students.forEach(student => {
         if (student.enrolledCourses) {
            student.enrolledCourses.forEach(course => {
               if (course.creator && course.creator._id) {
                  const key = `${course.creator._id}-${course._id}`;
                  if (!educatorsMap.has(key)) {
                     educatorsMap.set(key, {
                        educator: course.creator,
                        course: { _id: course._id, title: course.title }
                     });
                  }
               }
            });
         }
      });
      setAvailableEducators(Array.from(educatorsMap.values()));

    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvo) return;
    
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${serverUrl}/api/parent/message-educator`, {
        educatorId: selectedConvo.educator._id,
        courseId: selectedConvo.course._id,
        messageText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Message sent successfully!');
      setMessageText('');
      setShowNew(false);
      fetchData(); // Refresh to get the updated/new conversation
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = (educatorObj) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.educator._id === educatorObj.educator._id && c.course._id === educatorObj.course._id);
    if (existing) {
       setSelectedConvo(existing);
       setShowNew(false);
    } else {
       // Create a temporary convo object for the UI
       setSelectedConvo({
          isNew: true,
          educator: educatorObj.educator,
          course: educatorObj.course,
          lastMessage: "Start a new conversation..."
       });
       setShowNew(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Nav />
      <div className="flex-grow w-full max-w-6xl mx-auto px-4 py-12 pt-32">
        <div className="border-b-4 border-black pb-4 mb-8">
          <div className="flex items-start gap-3 mb-2">
            <ArrowBackLongIcon className='w-5 h-5 cursor-pointer text-black hover:-translate-x-1 transition-transform mt-1' onClick={() => navigate(-1)} />
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">Messages</h1>
              <p className="text-gray-500 text-sm font-bold mt-1">Communicate directly with your child's educators</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ClipLoader size={40} color="#000" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[60vh]">
            {/* Sidebar */}
            <div className="col-span-1 border-r-4 border-black flex flex-col bg-white">
              <div className="bg-black text-white p-4 font-black uppercase text-sm flex justify-between items-center border-b-4 border-black">
                <span>Conversations</span>
                <button 
                  onClick={() => setShowNew(!showNew)}
                  className="bg-white text-black p-1 hover:bg-gray-200 transition-colors"
                  title="New Message"
                >
                  <FaPlus />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {showNew ? (
                   <div className="p-4 bg-yellow-50 min-h-full">
                      <p className="font-black text-xs uppercase tracking-widest text-gray-500 mb-4">Select Educator to Message</p>
                      {availableEducators.length === 0 ? (
                         <p className="text-sm font-bold text-gray-400">Your child is not enrolled in any courses yet.</p>
                      ) : (
                         <div className="space-y-3">
                           {availableEducators.map((ed, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => startNewConversation(ed)}
                                className="border-2 border-black p-3 bg-white cursor-pointer hover:bg-black hover:text-white transition-colors group"
                              >
                                <p className="font-black text-sm">{ed.educator.name}</p>
                                <p className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 uppercase mt-1">{ed.course.title}</p>
                              </div>
                           ))}
                         </div>
                      )}
                   </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 flex flex-col items-center text-gray-400 text-center">
                     <FaCommentDots className="text-4xl mb-4" />
                     <p className="text-sm font-bold">No active conversations. Click the + icon to start messaging an educator.</p>
                  </div>
                ) : (
                  conversations.map((convo) => (
                    <div 
                      key={convo._id || 'new'}
                      onClick={() => setSelectedConvo(convo)}
                      className={`p-4 border-b-2 border-black cursor-pointer transition-colors ${selectedConvo && (selectedConvo._id === convo._id || (selectedConvo.isNew && selectedConvo.educator._id === convo.educator._id)) ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    >
                      <p className="font-black text-sm truncate">{convo.educator?.name || 'Educator'}</p>
                      <p className={`text-xs font-bold truncate mt-1 ${selectedConvo && (selectedConvo._id === convo._id || selectedConvo.isNew) ? 'text-gray-300' : 'text-gray-600'}`}>{convo.course?.title || 'Unknown Course'}</p>
                      {!selectedConvo?.isNew && <p className={`text-xs mt-2 truncate ${selectedConvo && selectedConvo._id === convo._id ? 'text-gray-400' : 'text-gray-500'}`}>{convo.lastMessage}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-2 flex flex-col relative bg-gray-50">
              {selectedConvo ? (
                <>
                  <div className="bg-white p-4 border-b-4 border-black flex justify-between items-center shadow-sm z-10">
                    <div>
                      <p className="font-black text-lg uppercase tracking-wider">{selectedConvo.educator?.name}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase">{selectedConvo.course?.title}</p>
                    </div>
                    <button className="bg-white text-black border-2 border-black px-4 py-2 text-xs font-black uppercase hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                      Schedule Meeting
                    </button>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-end">
                    {selectedConvo.isNew ? (
                       <div className="text-center text-gray-400 font-bold mb-4">Start a new conversation with {selectedConvo.educator.name}</div>
                    ) : (
                       <div className="bg-white border-2 border-black p-4 self-end max-w-[80%] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                         <p className="text-sm font-bold text-black">{selectedConvo.lastMessage}</p>
                         <p className="text-[10px] text-gray-500 mt-2 font-black uppercase">{new Date(selectedConvo.lastMessageAt).toLocaleString()}</p>
                       </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t-4 border-black bg-white flex gap-2 z-10">
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border-2 border-black p-3 text-sm font-bold focus:outline-none focus:bg-gray-50 transition-colors"
                    />
                    <button 
                      type="submit" 
                      disabled={sending || !messageText.trim()}
                      className="bg-black text-white px-8 py-3 font-black uppercase text-xs hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-[4px_4px_0px_0px_rgba(156,163,175,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  <div className="w-20 h-20 bg-white border-4 border-gray-300 flex items-center justify-center rotate-12 mb-6">
                     <FaCommentDots className="text-4xl text-gray-300" />
                  </div>
                  <p className="font-black uppercase text-lg text-gray-500 tracking-wider">No Conversation Selected</p>
                  <p className="text-sm font-bold mt-2 max-w-sm">Select a conversation from the sidebar or click the + icon to start a new message with an educator.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ParentMessages;
