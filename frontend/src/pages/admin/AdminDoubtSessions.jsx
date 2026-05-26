import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminDoubtSessions = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [doubtSessions, setDoubtSessions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchDoubtSessions();
    }, [navigate]);

    const fetchDoubtSessions = async () => {
        setRefreshing(true);
        try {
            const response = await axios.get(`${serverUrl}/api/doubt-session/all`);
            if (response.data) {
                setDoubtSessions(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch doubt sessions');
        }
        setLoading(false);
        setRefreshing(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredSessions = doubtSessions.filter(session =>
        session.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.course?.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <ClipLoader size={40} color="#000" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/dashboard')} className="text-white hover:text-gray-300">
                            <ArrowBackIcon />
                        </button>
                        <div>
                            <h1 className="text-white font-black uppercase tracking-tight text-lg">Doubt Sessions</h1>
                            <p className="text-gray-400 text-xs font-bold uppercase">Manage all doubt solving sessions</p>
                        </div>
                    </div>
                    <button onClick={fetchDoubtSessions} disabled={refreshing}
                        className="border-2 border-white text-white px-4 py-2 text-xs font-black uppercase hover:bg-white hover:text-black transition-none disabled:opacity-50">
                        {refreshing ? '⟳ Refreshing' : '↻ Refresh'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="border-4 border-black p-4 bg-gray-50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Sessions</span>
                        <p className="text-3xl font-black mt-1">{doubtSessions.length}</p>
                    </div>
                    <div className="md:col-span-2">
                        <input type="text" placeholder="Search by course or teacher..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border-2 border-black p-3 text-sm font-bold focus:outline-none bg-white" />
                    </div>
                </div>

                <div className="border-4 border-black">
                    <div className="border-b-2 border-black p-4 bg-gray-50">
                        <h2 className="font-black uppercase text-sm tracking-wider">All Doubt Sessions</h2>
                    </div>

                    {filteredSessions.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-black uppercase text-gray-900 mb-2">
                                {searchTerm ? 'No matching sessions' : 'No Doubt Sessions Yet'}
                            </h3>
                            <p className="text-gray-500 text-xs font-bold">
                                {searchTerm ? 'Try adjusting your search terms' : 'Teachers have not created any doubt sessions yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b-2 border-black bg-black text-white text-[10px] font-black uppercase">
                                        <th className="p-3">#</th>
                                        <th className="p-3">Course</th>
                                        <th className="p-3">Teacher</th>
                                        <th className="p-3">Created</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSessions.map((session, index) => (
                                        <tr key={session._id} className="border-b border-black hover:bg-gray-100 transition-none">
                                            <td className="p-3 font-bold text-gray-400">{index + 1}</td>
                                            <td className="p-3">
                                                <div className="font-bold text-sm">{session.course?.title || 'Unknown Course'}</div>
                                                <div className="text-[10px] text-gray-500">{session.course?.category}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-bold text-sm">{session.course?.creator?.name || 'Unknown'}</span>
                                            </td>
                                            <td className="p-3 text-gray-500 font-bold text-xs">{formatDate(session.createdAt)}</td>
                                            <td className="p-3">
                                                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                                                    className="bg-black text-white px-3 py-1.5 text-[10px] font-black uppercase border-2 border-black hover:bg-gray-800 transition-none">
                                                    Join Session
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDoubtSessions;
