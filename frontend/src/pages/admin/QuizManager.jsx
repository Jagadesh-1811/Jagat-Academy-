import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const AdminQuizManager = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.user);
    const { creatorCourseData } = useSelector((state) => state.course);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        quizLink: '', liveSessionLink: '', instructions: '', rewards: '', schedule: ''
    });

    useEffect(() => {
        if (selectedCourse) fetchQuizzes(selectedCourse);
    }, [selectedCourse]);

    const fetchQuizzes = async (courseId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${serverUrl}/api/quiz/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuizzes(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await axios.put(`${serverUrl}/api/quiz/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Quiz updated');
            } else {
                await axios.post(`${serverUrl}/api/quiz/create/${selectedCourse}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Quiz created');
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ quizLink: '', liveSessionLink: '', instructions: '', rewards: '', schedule: '' });
            fetchQuizzes(selectedCourse);
        } catch (error) {
            toast.error('Failed to save quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this quiz?')) return;
        try {
            await axios.delete(`${serverUrl}/api/quiz/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Quiz deleted');
            fetchQuizzes(selectedCourse);
        } catch (error) {
            toast.error('Failed to delete quiz');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">Quiz Manager</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Select Course</label>
                    <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full border-2 border-black p-3 text-sm font-bold bg-white focus:outline-none">
                        <option value="">Choose a course...</option>
                        {creatorCourseData?.map((c) => (
                            <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                    </select>
                </div>

                {selectedCourse && (
                    <>
                        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ quizLink: '', liveSessionLink: '', instructions: '', rewards: '', schedule: '' }); }}
                            className="border-2 border-black px-6 py-3 text-xs font-black uppercase hover:bg-black hover:text-white transition-none">
                            {showForm ? 'Cancel' : '+ New Quiz'}
                        </button>

                        {showForm && (
                            <div className="border-4 border-black p-6 bg-gray-50">
                                <h3 className="font-black uppercase text-xs mb-4">{editingId ? 'Edit Quiz' : 'Create Quiz'}</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-gray-600">Quiz Link</label>
                                            <input value={form.quizLink} onChange={(e) => setForm({...form, quizLink: e.target.value})}
                                                className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-gray-600">Live Session Link</label>
                                            <input value={form.liveSessionLink} onChange={(e) => setForm({...form, liveSessionLink: e.target.value})}
                                                className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-600">Instructions</label>
                                        <textarea rows={2} value={form.instructions} onChange={(e) => setForm({...form, instructions: e.target.value})}
                                            className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-gray-600">Rewards</label>
                                            <input value={form.rewards} onChange={(e) => setForm({...form, rewards: e.target.value})}
                                                className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-gray-600">Schedule</label>
                                            <input type="datetime-local" value={form.schedule} onChange={(e) => setForm({...form, schedule: e.target.value})}
                                                className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="bg-black text-white px-6 py-3 text-xs font-black uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                                        {loading ? <ClipLoader size={16} color="white" /> : (editingId ? 'Update' : 'Create')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {loading && !showForm ? (
                            <div className="flex justify-center py-8"><ClipLoader size={30} color="#000" /></div>
                        ) : quizzes.length === 0 ? (
                            <div className="border-4 border-black p-8 text-center">
                                <p className="text-gray-500 text-sm font-bold">No quizzes for this course</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {quizzes.map((quiz) => (
                                    <div key={quiz._id} className="border-4 border-black p-4 bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-black text-xs uppercase">Quiz</span>
                                                {quiz.instructions && <p className="text-xs text-gray-600 mt-1">{quiz.instructions}</p>}
                                                {quiz.rewards && <p className="text-[10px] text-gray-500 font-bold mt-1">Rewards: {quiz.rewards}</p>}
                                                {quiz.schedule && <p className="text-[10px] text-gray-500 mt-1">Schedule: {new Date(quiz.schedule).toLocaleString()}</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                {quiz.quizLink && <a href={quiz.quizLink} target="_blank" rel="noopener noreferrer"
                                                    className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase border-2 border-black">Quiz</a>}
                                                {quiz.liveSessionLink && <a href={quiz.liveSessionLink} target="_blank" rel="noopener noreferrer"
                                                    className="border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white">Live</a>}
                                                <button onClick={() => { setEditingId(quiz._id); setForm(quiz); setShowForm(true); }}
                                                    className="border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white">Edit</button>
                                                <button onClick={() => handleDelete(quiz._id)}
                                                    className="border-2 border-red-600 text-red-600 px-3 py-1 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminQuizManager;
