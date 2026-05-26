import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminFeedbackManager = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) { navigate('/admin/login'); return; }
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/feedback/all`);
            setFeedbacks(res.data?.feedbacks || []);
        } catch (error) {
            toast.error('Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`${serverUrl}/api/feedback/status/${id}`, { status });
            toast.success('Status updated');
            fetchFeedbacks();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try {
            await axios.delete(`${serverUrl}/api/feedback/${id}`);
            toast.success('Feedback deleted');
            setSelected(null);
            fetchFeedbacks();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const filtered = feedbacks.filter(f => {
        if (typeFilter !== 'all' && f.type !== typeFilter) return false;
        if (statusFilter !== 'all' && f.status !== statusFilter) return false;
        return true;
    });

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
                        <button onClick={() => navigate('/admin/dashboard')} className="text-white hover:text-gray-300"><ArrowBackIcon /></button>
                        <div>
                            <h1 className="text-white font-black uppercase tracking-tight text-lg">Feedback Manager</h1>
                            <p className="text-gray-400 text-xs font-bold uppercase">{feedbacks.length} Total Submissions</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* List */}
                <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap border-b-2 border-black pb-4">
                        {['all', 'feedback', 'issue'].map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 transition-none ${
                                    typeFilter === t ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'
                                }`}>{t}</button>
                        ))}
                        <span className="w-px bg-gray-300 mx-1" />
                        {['all', 'pending', 'reviewed', 'resolved'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 text-[10px] font-black uppercase border-2 transition-none ${
                                    statusFilter === s ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'
                                }`}>{s}</button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="border-4 border-black p-8 text-center">
                            <p className="text-gray-500 text-sm font-bold">No submissions found</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {filtered.map(f => (
                                <div key={f._id} onClick={() => setSelected(f)}
                                    className={`border-2 border-black p-3 cursor-pointer hover:bg-gray-100 transition-none ${
                                        selected?._id === f._id ? 'bg-black text-white' : ''
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-black text-xs uppercase">{f.subject || f.type}</span>
                                            <p className={`text-[10px] mt-0.5 ${selected?._id === f._id ? 'text-gray-300' : 'text-gray-500'}`}>
                                                {f.name || 'Anonymous'} · {new Date(f.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${
                                            f.status === 'resolved' ? 'border-green-600 text-green-600' :
                                            f.status === 'reviewed' ? 'border-blue-600 text-blue-600' :
                                            'border-gray-500 text-gray-500'
                                        }`}>
                                            {f.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail */}
                <div className="border-4 border-black p-6 bg-gray-50">
                    {selected ? (
                        <div className="space-y-4">
                            <h3 className="font-black uppercase text-sm border-b-2 border-black pb-2">Submission Details</h3>
                            <div className="space-y-2 text-xs">
                                <p><span className="font-black uppercase">From:</span> {selected.name || 'Anonymous'} ({selected.email || 'N/A'})</p>
                                <p><span className="font-black uppercase">Type:</span> <span className="uppercase font-bold">{selected.type}</span></p>
                                <p><span className="font-black uppercase">Subject:</span> {selected.subject || 'N/A'}</p>
                                <div className="border border-black p-3 bg-white mt-2">
                                    <p className="text-xs">{selected.message || selected.description}</p>
                                </div>
                                <p className="text-[10px] text-gray-500">{new Date(selected.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {selected.status !== 'resolved' && (
                                    <button onClick={() => updateStatus(selected._id, 'resolved')}
                                        className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase border-2 border-black hover:bg-gray-800 transition-none">
                                        Mark Resolved
                                    </button>
                                )}
                                {selected.status === 'pending' && (
                                    <button onClick={() => updateStatus(selected._id, 'reviewed')}
                                        className="border-2 border-black px-4 py-2 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">
                                        Mark Reviewed
                                    </button>
                                )}
                                <a href={`mailto:${selected.email}`}
                                    className="border-2 border-black px-4 py-2 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">
                                    Reply via Email
                                </a>
                                <button onClick={() => handleDelete(selected._id)}
                                    className="border-2 border-red-600 text-red-600 px-4 py-2 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-none">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-sm font-bold uppercase">Select a submission to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFeedbackManager;
