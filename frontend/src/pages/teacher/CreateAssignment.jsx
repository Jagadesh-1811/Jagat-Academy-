import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const CreateAssignment = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.user);
    const [title, setTitle] = useState('');
    const [referenceLink, setReferenceLink] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/assignment/create/${courseId}`, { title, referenceLink, deadline }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Assignment created');
            navigate(`/createlecture/${courseId}`);
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
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Create Assignment</h1>
                </div>
            </div>
            <div className="max-w-xl mx-auto p-6">
                <div className="border-4 border-black p-6 bg-gray-50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Assignment Title</label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-2 border-black p-3 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Reference Link</label>
                            <input type="url" value={referenceLink} onChange={(e) => setReferenceLink(e.target.value)}
                                placeholder="Google Docs, GitHub..."
                                className="w-full border-2 border-black p-3 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Deadline</label>
                            <input type="datetime-local" required value={deadline} onChange={(e) => setDeadline(e.target.value)}
                                className="w-full border-2 border-black p-3 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-black text-white font-black py-4 text-xs uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {loading ? <ClipLoader size={20} color="white" /> : 'Create →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateAssignment;
