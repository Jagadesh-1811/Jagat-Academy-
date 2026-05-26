import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const CreateDoubtSession = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.user);
    const [meetingLink, setMeetingLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, [courseId]);

    const fetchSessions = async () => {
        setFetching(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/doubt-session/doubt-session/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(data);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast.error("Failed to load existing doubt sessions");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!meetingLink.trim()) { toast.error('Enter a meeting link'); return; }
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/doubt-session/doubt-session`, { courseId, meetingLink }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Doubt session created');
            setMeetingLink('');
            fetchSessions(); // Refresh list instead of navigating back immediately
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this doubt session?")) return;
        try {
            await axios.delete(`${serverUrl}/api/doubt-session/doubt-session/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Doubt session deleted");
            fetchSessions();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete session");
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Manage Doubt Sessions</h1>
                </div>
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-8">
                {/* Form to Create */}
                <div className="border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">Create New Session</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Meeting Link</label>
                            <div className="flex items-center gap-2 border-2 border-black p-3 bg-white">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)}
                                    placeholder="https://meet.google.com/..." className="flex-1 text-sm font-bold focus:outline-none bg-transparent" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-black text-white font-black py-4 text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50">
                            {loading ? <ClipLoader size={20} color="white" /> : 'Create Session →'}
                        </button>
                    </form>
                </div>

                {/* List of Sessions */}
                <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-black p-4 bg-gray-50">
                        <h2 className="font-black uppercase text-xs tracking-wider">Active Doubt Sessions</h2>
                    </div>

                    {fetching ? (
                        <div className="p-8 text-center">
                            <ClipLoader size={25} color="black" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold text-xs uppercase">
                            No active doubt sessions for this course.
                        </div>
                    ) : (
                        <div className="divide-y divide-black">
                            {sessions.map((session, index) => (
                                <div key={session._id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Session #{index + 1} — {formatDate(session.createdAt)}</p>
                                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-black underline block truncate mt-1 hover:text-gray-600">
                                            {session.meetingLink}
                                        </a>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(session._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-black text-[9px] uppercase tracking-wider border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateDoubtSession;
