import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CreateCourse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const { token } = useSelector((state) => state.user);

    const CreateCourseHandler = async () => {
        setLoading(true);
        try {
            const result = await axios.post(serverUrl + "/api/course/create", { title, category }, 
                { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Course Created");
            navigate("/courses");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate("/courses")} className="text-white hover:text-gray-300"><ArrowBackIcon /></button>
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Create Course</h1>
                </div>
            </div>
            <div className="max-w-xl mx-auto p-6">
                <div className="border-4 border-black p-6 bg-gray-50">
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Course Title</label>
                            <input type="text" placeholder="Enter course title" value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-2 border-black px-4 py-3 text-sm font-bold focus:outline-none bg-white" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-600">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}
                                className="w-full border-2 border-black px-4 py-3 text-sm font-bold bg-white focus:outline-none">
                                <option value="">Select category</option>
                                <option value="App Development">App Development</option>
                                <option value="AI/ML">AI/ML</option>
                                <option value="AI Tools">AI Tools</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Data Analytics">Data Analytics</option>
                                <option value="Ethical Hacking">Ethical Hacking</option>
                                <option value="UI UX Designing">UI UX Designing</option>
                                <option value="Web Development">Web Development</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading}
                            onClick={CreateCourseHandler}
                            className="w-full bg-black text-white font-black py-4 text-xs uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {loading ? <ClipLoader size={20} color="white" /> : 'Create Course →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
