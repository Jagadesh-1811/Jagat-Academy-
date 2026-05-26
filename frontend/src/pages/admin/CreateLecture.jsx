import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { setLectureData } from '../../redux/lectureSlice';

const CreateLecture = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.user);
    const { lectureData } = useSelector((state) => state.lecture);
    const [lectureTitle, setLectureTitle] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLectures();
    }, [courseId]);

    const fetchLectures = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/course/getcourselectures/${courseId}`);
            dispatch(setLectureData(res.data));
        } catch (error) {
            toast.error('Failed to fetch lectures');
        }
    };

    const createLectureHandler = async () => {
        if (!lectureTitle.trim()) { toast.error('Please enter a lecture title'); return; }
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/course/createlecture/${courseId}`, { title: lectureTitle }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Lecture created');
            setLectureTitle('');
            fetchLectures();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create lecture');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/addcourses/${courseId}`)} className="text-white hover:text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">Manage Lectures</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="border-4 border-black p-6 bg-gray-50">
                    <h2 className="font-black uppercase text-xs tracking-wider mb-4">Add New Lecture</h2>
                    <div className="flex gap-3">
                        <input type="text" placeholder="Lecture title..." value={lectureTitle}
                            onChange={(e) => setLectureTitle(e.target.value)}
                            className="flex-1 border-2 border-black p-3 text-sm font-bold bg-white focus:outline-none" />
                        <button onClick={createLectureHandler} disabled={loading}
                            className="bg-black text-white px-6 py-3 text-xs font-black uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {loading ? <ClipLoader size={16} color="white" /> : 'Create'}
                        </button>
                    </div>
                </div>

                <div className="border-4 border-black">
                    <div className="border-b-2 border-black p-4 bg-gray-50">
                        <h2 className="font-black uppercase text-xs tracking-wider">Lectures ({lectureData?.length || 0})</h2>
                    </div>
                    <div className="divide-y-2 divide-black">
                        {lectureData?.length > 0 ? lectureData.map((lecture, index) => (
                            <div key={lecture._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-none">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                                    <span className="font-bold text-sm">{lecture.title}</span>
                                </div>
                                <Link to={`/editlecture/${courseId}/${lecture._id}`}
                                    className="border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">
                                    Edit
                                </Link>
                            </div>
                        )) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-500 text-sm font-bold">No lectures yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLecture;
