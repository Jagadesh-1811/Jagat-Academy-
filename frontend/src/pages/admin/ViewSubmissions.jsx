import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const SubmissionCard = ({ submission, onGrade }) => {
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    return (
        <div className="border-4 border-black p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-black text-xs uppercase">{submission.student?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500">{submission.student?.email}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
                </div>
                {submission.fileUrl && (
                    <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase border-2 border-black">
                        View
                    </a>
                )}
            </div>

            {submission.grade ? (
                <div className={`border-2 p-3 ${submission.grade === 'A' ? 'border-green-600 bg-green-50' : submission.grade === 'B' ? 'border-blue-600 bg-blue-50' : submission.grade === 'C' ? 'border-yellow-600 bg-yellow-50' : 'border-red-600 bg-red-50'}`}>
                    <span className="font-black text-sm uppercase">Grade: {submission.grade}</span>
                    {submission.feedback && <p className="text-xs mt-1 text-gray-600">{submission.feedback}</p>}
                </div>
            ) : (
                <div className="border-2 border-black p-3 bg-white space-y-2">
                    <select value={grade} onChange={(e) => setGrade(e.target.value)}
                        className="w-full border-2 border-black p-2 text-xs font-bold bg-white focus:outline-none">
                        <option value="">Select Grade</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                    <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Feedback..."
                        className="w-full border-2 border-black p-2 text-xs bg-white focus:outline-none" />
                    <button onClick={() => onGrade(submission._id, grade, feedback)} disabled={!grade}
                        className="w-full bg-black text-white py-2 text-[10px] font-black uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                        Submit Grade
                    </button>
                </div>
            )}
        </div>
    );
};

const ViewSubmissions = () => {
    const { courseId, assignmentId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.user);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/submission/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmissions(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    const assignGrade = async (submissionId, grade, feedback) => {
        try {
            await axios.post(`${serverUrl}/api/grade/assign`, { submissionId, grade, feedback }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Grade assigned');
            fetchSubmissions();
        } catch (error) {
            toast.error('Failed to assign grade');
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
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Submissions</h1>
                    <span className="text-gray-400 text-xs font-bold uppercase ml-auto">{submissions.length} Submissions</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-4">
                {submissions.length === 0 ? (
                    <div className="border-4 border-black p-12 text-center">
                        <h3 className="font-black uppercase text-sm text-gray-500">No Submissions Yet</h3>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <SubmissionCard key={sub._id} submission={sub} onGrade={assignGrade} />
                    ))
                )}
            </div>
        </div>
    );
};

export default ViewSubmissions;
