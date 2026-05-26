import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { setLectureData } from '../../redux/lectureSlice';

const TeacherEditLecture = () => {
    const navigate = useNavigate();
    const { courseId, lectureId } = useParams();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.user);
    const { lectureData } = useSelector((state) => state.lecture);
    const lecture = lectureData?.find((l) => l._id === lectureId);

    const [lectureTitle, setLectureTitle] = useState(lecture?.title || '');
    const [videoUrl, setVideoUrl] = useState(null);
    const [isPreviewFree, setIsPreviewFree] = useState(lecture?.isPreviewFree || false);
    const [loading, setLoading] = useState(false);

    const editLecture = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('lectureTitle', lectureTitle);
            formData.append('isPreviewFree', isPreviewFree);
            if (videoUrl) formData.append('video', videoUrl);

            await axios.post(`${serverUrl}/api/course/editlecture/${lectureId}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Lecture updated');
        } catch (error) {
            toast.error('Failed to update');
        } finally {
            setLoading(false);
        }
    };

    const removeLecture = async () => {
        if (!window.confirm('Delete this lecture?')) return;
        setLoading(true);
        try {
            await axios.delete(`${serverUrl}/api/course/removelecture/${lectureId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Lecture deleted');
            dispatch(setLectureData(lectureData.filter((l) => l._id !== lectureId)));
            navigate(`/createlecture/${courseId}`);
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setLoading(false);
        }
    };

    if (!lecture) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="font-black uppercase text-sm text-gray-500">Lecture not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(`/createlecture/${courseId}`)} className="text-white hover:text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Edit Lecture</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="border-4 border-black p-6 bg-gray-50 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-600">Lecture Title</label>
                        <input value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)}
                            className="w-full border-2 border-black p-3 text-sm font-bold bg-white focus:outline-none" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-600">Video File</label>
                        <input type="file" accept="video/*" onChange={(e) => setVideoUrl(e.target.files[0])}
                            className="w-full border-2 border-black p-2 text-sm bg-white focus:outline-none" />
                        {lecture.videoUrl && <p className="text-[10px] text-gray-500 font-bold mt-1">Current video attached</p>}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isPreviewFree} onChange={(e) => setIsPreviewFree(e.target.checked)}
                            className="w-4 h-4 border-2 border-black" />
                        <span className="text-xs font-bold uppercase">Free Preview</span>
                    </label>

                    <div className="flex gap-3 pt-2">
                        <button onClick={editLecture} disabled={loading}
                            className="bg-black text-white px-6 py-3 text-xs font-black uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {loading ? <ClipLoader size={16} color="white" /> : 'Save Changes'}
                        </button>
                        <button onClick={removeLecture} disabled={loading}
                            className="border-2 border-red-600 text-red-600 px-6 py-3 text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-none disabled:opacity-50">
                            Delete
                        </button>
                    </div>
                </div>

                <Link to={`/admin/create-assignment/${courseId}`}
                    className="block text-center border-2 border-black px-6 py-3 text-xs font-black uppercase hover:bg-black hover:text-white transition-none">
                    + Create Assignment for this Course
                </Link>
            </div>
        </div>
    );
};

export default TeacherEditLecture;
