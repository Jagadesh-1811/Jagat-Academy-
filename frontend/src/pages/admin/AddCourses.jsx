import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddCourses = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [course, setCourse] = useState({
        title: '', subtitle: '', description: '', category: '', level: '', price: ''
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [materialLink, setMaterialLink] = useState('');

    useEffect(() => {
        getCourseById();
    }, [courseId]);

    const getCourseById = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/course/getcourse/${courseId}`);
            if (res.data) {
                setCourse({
                    title: res.data.title || '',
                    subtitle: res.data.subtitle || '',
                    description: res.data.description || '',
                    category: res.data.category || '',
                    level: res.data.level || '',
                    price: res.data.price || ''
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
            formData.append('title', course.title);
            formData.append('subtitle', course.subtitle);
            formData.append('description', course.description);
            formData.append('category', course.category);
            formData.append('level', course.level);
            formData.append('price', course.price);
            if (thumbnail) formData.append('thumbnail', thumbnail);

            await axios.put(`${serverUrl}/api/course/editcourse/${courseId}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Course updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update course');
        } finally {
            setSubmitting(false);
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
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300"><ArrowBackIcon /></button>
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Edit Course</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 space-y-8">
                {/* Main Editor */}
                <div className="border-4 border-black p-6 bg-gray-50 space-y-6">
                    <h2 className="font-black uppercase text-sm tracking-wider border-b-2 border-black pb-2">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Title</label>
                            <input value={course.title} onChange={(e) => setCourse({...course, title: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Subtitle</label>
                            <input value={course.subtitle} onChange={(e) => setCourse({...course, subtitle: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Category</label>
                            <select value={course.category} onChange={(e) => setCourse({...course, category: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none">
                                <option value="">Select</option>
                                <option value="Web Development">Web Development</option>
                                <option value="App Development">App Development</option>
                                <option value="AI/ML">AI/ML</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Level</label>
                            <select value={course.level} onChange={(e) => setCourse({...course, level: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none">
                                <option value="">Select</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Price (₹)</label>
                            <input type="number" value={course.price} onChange={(e) => setCourse({...course, price: e.target.value})}
                                className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Thumbnail</label>
                            <input type="file" onChange={(e) => setThumbnail(e.target.files[0])}
                                className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Description</label>
                        <textarea rows={4} value={course.description} onChange={(e) => setCourse({...course, description: e.target.value})}
                            className="w-full border-2 border-black p-2 text-sm font-bold bg-white focus:outline-none" />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={editCourseHandler} disabled={submitting}
                            className="bg-black text-white font-black py-3 px-8 text-xs uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {submitting ? <ClipLoader size={16} color="white" /> : 'Save Changes'}
                        </button>
                        <Link to={`/createlecture/${courseId}`}
                            className="border-2 border-black px-6 py-3 text-xs font-black uppercase hover:bg-black hover:text-white transition-none">
                            Manage Lectures
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCourses;
