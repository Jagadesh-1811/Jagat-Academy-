import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import {
    FaCommentDots,
    FaBug,
    FaArrowLeft,
    FaCheck,
    FaEye,
    FaClock,
    FaEnvelope
} from 'react-icons/fa';

const FeedbackManager = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'feedback', 'issue'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'reviewed', 'resolved'
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/feedback/all`);
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch feedback');
        }
        setLoading(false);
    };

    const updateStatus = async (id, newStatus) => {
        setUpdating(true);
        try {
            await axios.patch(`${serverUrl}/api/feedback/status/${id}`, { status: newStatus });
            setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus } : f));
            if (selectedFeedback?._id === id) {
                setSelectedFeedback({ ...selectedFeedback, status: newStatus });
            }
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
        setUpdating(false);
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        const typeMatch = filter === 'all' || f.type === filter;
        const statusMatch = statusFilter === 'all' || f.status === statusFilter;
        return typeMatch && statusMatch;
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <ClipLoader size={50} color="black" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white border-t-8 border-black">
            {/* Header */}
            <div className="bg-black text-white py-6 px-6 border-b-4 border-black">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/teacher/dashboard')}
                            className="border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-none font-bold text-sm"
                        >
                            <FaArrowLeft className="inline mr-2" />
                            Back
                        </button>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">Feedback Manager</h1>
                            <p className="text-gray-400 text-sm font-bold">View and manage user feedback &amp; issues</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black">{feedbacks.length}</p>
                        <p className="text-gray-400 text-sm font-bold">Total Submissions</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Filters */}
                <div className="border-4 border-black p-4 mb-6 bg-white">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2 items-center">
                            <span className="text-black text-sm font-bold">Type:</span>
                            {['all', 'feedback', 'issue'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-4 py-2 border-2 border-black text-sm font-black uppercase transition-none ${
                                        filter === type
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black hover:bg-black hover:text-white'
                                    }`}
                                >
                                    {type === 'all' ? 'All' : type === 'feedback' ? 'Feedback' : 'Issues'}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-black text-sm font-bold">Status:</span>
                            {['all', 'pending', 'reviewed', 'resolved'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 border-2 border-black text-sm font-black uppercase transition-none ${
                                        statusFilter === status
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black hover:bg-black hover:text-white'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* List */}
                    <div className="lg:col-span-2">
                        {filteredFeedbacks.length === 0 ? (
                            <div className="border-4 border-black p-12 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="w-16 h-16 bg-gray-100 border-2 border-black flex items-center justify-center mx-auto mb-4">
                                    <FaCommentDots className="w-8 h-8 text-black" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase">No submissions found</h3>
                                <p className="text-gray-500 font-bold text-sm">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFeedbacks.map(feedback => (
                                    <div
                                        key={feedback._id}
                                        onClick={() => setSelectedFeedback(feedback)}
                                        className={`border-4 border-black p-5 cursor-pointer transition-none bg-white ${
                                            selectedFeedback?._id === feedback._id
                                                ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                                : 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 border-2 border-black flex items-center justify-center ${
                                                    feedback.type === 'feedback' ? 'bg-black' : 'bg-gray-200'
                                                }`}>
                                                    {feedback.type === 'feedback'
                                                        ? <FaCommentDots className="w-5 h-5 text-white" />
                                                        : <FaBug className="w-5 h-5 text-black" />
                                                    }
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-black">{feedback.subject}</h3>
                                                    <p className="text-sm text-gray-500 font-bold">{feedback.name}</p>
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1 px-3 py-1 border-2 border-black text-xs font-black uppercase ${
                                                feedback.status === 'pending' ? 'bg-yellow-200 text-black' :
                                                feedback.status === 'reviewed' ? 'bg-gray-200 text-black' :
                                                'bg-black text-white'
                                            }`}>
                                                {feedback.status === 'pending' && <FaClock className="w-3 h-3" />}
                                                {feedback.status === 'reviewed' && <FaEye className="w-3 h-3" />}
                                                {feedback.status === 'resolved' && <FaCheck className="w-3 h-3" />}
                                                {feedback.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 font-semibold text-sm line-clamp-2 mb-3">{feedback.message}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                                            <span>{formatDate(feedback.createdAt)}</span>
                                            <span className="flex items-center gap-1">
                                                <FaEnvelope className="w-3 h-3" />
                                                {feedback.email}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-1">
                        {selectedFeedback ? (
                            <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-12 h-12 border-2 border-black flex items-center justify-center ${
                                        selectedFeedback.type === 'feedback' ? 'bg-black' : 'bg-gray-200'
                                    }`}>
                                        {selectedFeedback.type === 'feedback'
                                            ? <FaCommentDots className="w-6 h-6 text-white" />
                                            : <FaBug className="w-6 h-6 text-black" />
                                        }
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-gray-500 uppercase">
                                            {selectedFeedback.type}
                                        </span>
                                        <h2 className="font-black text-black">{selectedFeedback.subject}</h2>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase border-b-2 border-black block pb-1 mb-1">From</label>
                                        <p className="text-black font-bold">{selectedFeedback.name}</p>
                                        <p className="text-gray-500 text-sm font-semibold">{selectedFeedback.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase border-b-2 border-black block pb-1 mb-1">Message</label>
                                        <p className="text-gray-700 font-semibold whitespace-pre-wrap">{selectedFeedback.message}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase border-b-2 border-black block pb-1 mb-1">Submitted</label>
                                        <p className="text-gray-700 font-bold">{formatDate(selectedFeedback.createdAt)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase block mb-2">Update Status</label>
                                    <div className="flex gap-2">
                                        {['pending', 'reviewed', 'resolved'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(selectedFeedback._id, status)}
                                                disabled={updating || selectedFeedback.status === status}
                                                className={`flex-1 py-2 border-2 border-black text-sm font-black uppercase transition-none ${
                                                    selectedFeedback.status === status
                                                        ? 'bg-black text-white'
                                                        : 'bg-white text-black hover:bg-black hover:text-white'
                                                } disabled:opacity-50`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <a
                                    href={`mailto:${selectedFeedback.email}?subject=Re: ${selectedFeedback.subject}`}
                                    className="mt-4 w-full flex items-center justify-center gap-2 bg-black text-white border-2 border-black py-3 font-black uppercase text-sm hover:bg-white hover:text-black transition-none"
                                >
                                    <FaEnvelope className="w-4 h-4" />
                                    Reply via Email
                                </a>
                            </div>
                        ) : (
                            <div className="border-4 border-black p-12 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="w-16 h-16 bg-gray-100 border-2 border-black flex items-center justify-center mx-auto mb-4">
                                    <FaEye className="w-8 h-8 text-black" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase">Select a submission</h3>
                                <p className="text-gray-500 text-sm font-bold">Click on any feedback or issue to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackManager;
