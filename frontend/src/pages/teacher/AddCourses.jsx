import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const TeacherAddCourses = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState({
        title: '', subtitle: '', description: '', category: '', level: '', price: ''
    });
    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        getCourseById();
    }, [courseId]);

    const getCourseById = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/course/getcourse/${courseId}`);
            if (res.data) {
                setCourse({
                    title: res.data.title || '', subtitle: res.data.subtitle || '',
                    description: res.data.description || '', category: res.data.category || '',
                    level: res.data.level || '', price: res.data.price || ''
                });
            }
        } catch (error) {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const editCourseHandler = async () => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(course).forEach(([k, v]) => formData.append(k, v));
            if (thumbnail) formData.append('thumbnail', thumbnail);

            await axios.post(`${serverUrl}/api/course/editcourse/${courseId}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Course updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    const removeCourse = async () => {
        if (!window.confirm('Delete this course?')) return;
        try {
            await axios.delete(`${serverUrl}/api/course/removecourse/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Course deleted');
            navigate('/courses');
        } catch (error) {
            toast.error('Failed to delete');
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
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/courses')} className="text-white hover:text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">Edit Course</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link to={`/createlecture/${courseId}`}
                            className="border-2 border-white text-white px-3 py-1.5 text-[10px] font-black uppercase hover:bg-white hover:text-black transition-none">
                            Lectures
                        </Link>
                        <Link to={`/teacher-call-requests`}
                            className="border-2 border-white text-white px-3 py-1.5 text-[10px] font-black uppercase hover:bg-white hover:text-black transition-none">
                            Call Requests
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="border-4 border-black p-6 bg-gray-50 space-y-4">
                    <h2 className="font-black uppercase text-xs border-b-2 border-black pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Title</label>
                            <input value={course.title} onChange={(e) => setCourse({...course, title: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Subtitle</label>
                            <input value={course.subtitle} onChange={(e) => setCourse({...course, subtitle: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Category</label>
                            <select value={course.category} onChange={(e) => setCourse({...course, category: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none">
                                <option>Web Development</option>
                                <option>App Development</option>
                                <option>AI/ML</option>
                                <option>Data Science</option>
                                <option>Others</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Level</label>
                            <select value={course.level} onChange={(e) => setCourse({...course, level: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none">
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Price (₹)</label>
                            <input type="number" value={course.price} onChange={(e) => setCourse({...course, price: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Thumbnail</label>
                            <input type="file" onChange={(e) => setThumbnail(e.target.files[0])}
                                className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-600">Description</label>
                        <textarea rows={3} value={course.description} onChange={(e) => setCourse({...course, description: e.target.value})}
                            className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={editCourseHandler} disabled={submitting}
                            className="bg-black text-white font-black py-3 px-8 text-xs uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {submitting ? <ClipLoader size={16} color="white" /> : 'Save Changes'}
                        </button>
                        <button onClick={removeCourse}
                            className="border-2 border-red-600 text-red-600 px-6 py-3 text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-none">
                            Delete Course
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAddCourses;
