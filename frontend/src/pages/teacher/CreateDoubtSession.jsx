import React, { useState } from 'react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!meetingLink.trim()) { toast.error('Enter a meeting link'); return; }
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/doubt-session/doubt-session`, { courseId, meetingLink }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Doubt session created');
            navigate(-1);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Create Doubt Session</h1>
                </div>
            </div>
            <div className="max-w-xl mx-auto p-6">
                <div className="border-4 border-black p-6 bg-gray-50">
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
                            className="w-full bg-black text-white font-black py-4 text-xs uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {loading ? <ClipLoader size={20} color="white" /> : 'Create Session →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateDoubtSession;
