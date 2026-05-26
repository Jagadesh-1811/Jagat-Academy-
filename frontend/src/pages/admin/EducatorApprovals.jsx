import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EducatorApprovals = () => {
    const navigate = useNavigate();
    const [educators, setEducators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, id: null });
    const [rejectNote, setRejectNote] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) { navigate('/admin/login'); return; }
        fetchEducators();
    }, [filter]);

    const fetchEducators = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/admin/data/educators?status=${filter}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setEducators(res.data?.educators || []);
        } catch (error) {
            toast.error('Failed to fetch educators');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await axios.post(`${serverUrl}/api/admin/data/educators/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            toast.success('Educator approved');
            fetchEducators();
        } catch (error) {
            toast.error('Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectNote.trim()) { toast.error('Please provide a reason'); return; }
        setActionLoading(rejectModal.id);
        try {
            await axios.post(`${serverUrl}/api/admin/data/educators/${rejectModal.id}/reject`, 
                { note: rejectNote }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            toast.success('Educator rejected');
            setRejectModal({ open: false, id: null });
            setRejectNote('');
            fetchEducators();
        } catch (error) {
            toast.error('Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this educator?')) return;
        setActionLoading(id);
        try {
            await axios.delete(`${serverUrl}/api/admin/data/educators/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            toast.success('Educator deleted');
            fetchEducators();
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setActionLoading(null);
        }
    };

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
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard')} className="text-white hover:text-gray-300"><ArrowBackIcon /></button>
                    <div>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">Educator Approvals</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase">Manage Educator Registration Requests</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Filter */}
                <div className="flex gap-2 border-b-2 border-black pb-4">
                    {['pending', 'approved', 'rejected', 'all'].map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-xs font-black uppercase border-2 transition-none ${
                                filter === f ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'
                            }`}>
                            {f}
                        </button>
                    ))}
                </div>

                {educators.length === 0 ? (
                    <div className="border-4 border-black p-12 text-center">
                        <h3 className="text-lg font-black uppercase">No {filter} educators</h3>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {educators.map((edu) => (
                            <div key={edu._id} className="border-4 border-black p-4 bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-sm uppercase">{edu.name || edu.email}</h3>
                                    <p className="text-xs text-gray-500">{edu.email}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Registered: {new Date(edu.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {edu.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleApprove(edu._id)} disabled={actionLoading === edu._id}
                                                className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                                                {actionLoading === edu._id ? <ClipLoader size={12} color="white" /> : 'Approve'}
                                            </button>
                                            <button onClick={() => setRejectModal({ open: true, id: edu._id })}
                                                className="border-2 border-black px-4 py-2 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {edu.status !== 'pending' && (
                                        <span className={`px-3 py-2 text-[10px] font-black uppercase border-2 ${
                                            edu.status === 'approved' ? 'bg-black text-white border-black' : 'border-red-600 text-red-600'
                                        }`}>
                                            {edu.status}
                                        </span>
                                    )}
                                    {edu.status === 'rejected' && (
                                        <button onClick={() => handleDelete(edu._id)} disabled={actionLoading === edu._id}
                                            className="border-2 border-red-600 text-red-600 px-4 py-2 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-none disabled:opacity-50">
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRejectModal({ open: false, id: null })}>
                    <div className="bg-white border-4 border-black p-6 max-w-md w-full mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-black uppercase text-sm mb-3">Rejection Reason</h3>
                        <textarea rows={3} value={rejectNote} onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="Provide a reason..."
                            className="w-full border-2 border-black p-2 text-sm mb-4 focus:outline-none" />
                        <div className="flex gap-2">
                            <button onClick={handleReject} disabled={actionLoading === rejectModal.id}
                                className="bg-red-600 text-white px-4 py-2 text-xs font-black uppercase border-2 border-red-600 hover:bg-red-700 transition-none disabled:opacity-50">
                                {actionLoading === rejectModal.id ? <ClipLoader size={12} color="white" /> : 'Confirm Reject'}
                            </button>
                            <button onClick={() => setRejectModal({ open: false, id: null })} 
                                className="border-2 border-black px-4 py-2 text-xs font-black uppercase hover:bg-black hover:text-white transition-none">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EducatorApprovals;
