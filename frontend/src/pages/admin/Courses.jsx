import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { setCreatorCourseData } from '../../redux/courseSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminCourses = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.user);
    const { creatorCourseData } = useSelector((state) => state.course);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/course/getcreatorcourses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            dispatch(setCreatorCourseData(res.data));
        } catch (error) {
            toast.error('Failed to fetch courses');
        } finally {
            setLoading(false);
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
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-white hover:text-gray-300"><ArrowBackIcon /></button>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">My Courses</h1>
                    </div>
                    <Link to="/createcourses"
                        className="border-2 border-white text-white px-4 py-2 text-xs font-black uppercase hover:bg-white hover:text-black transition-none">
                        + Create Course
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {(!creatorCourseData || creatorCourseData.length === 0) ? (
                    <div className="border-4 border-black p-16 text-center">
                        <h3 className="text-lg font-black uppercase mb-2">No Courses Yet</h3>
                        <p className="text-gray-500 text-xs font-bold mb-4">Start building your course catalog.</p>
                        <Link to="/createcourses"
                            className="bg-black text-white px-6 py-3 text-xs font-black uppercase border-2 border-black inline-block">
                            Create Your First Course
                        </Link>
                    </div>
                ) : (
                    <div className="border-4 border-black overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black text-white text-[10px] font-black uppercase">
                                    <th className="p-3">Course</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Students</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {creatorCourseData.map((course) => (
                                    <tr key={course._id} className="border-b border-black hover:bg-gray-100 transition-none">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                {course.thumbnail && (
                                                    <img src={course.thumbnail} alt="" className="w-10 h-10 object-cover border border-black" />
                                                )}
                                                <span className="font-bold text-sm">{course.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-xs font-bold">{course.category}</td>
                                        <td className="p-3 font-bold">₹{course.price}</td>
                                        <td className="p-3 font-bold">{course.enrolledStudents?.length || 0}</td>
                                        <td className="p-3">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 ${
                                                course.isPublished 
                                                    ? 'border-black bg-black text-white' 
                                                    : 'border-gray-300 text-gray-500'
                                            }`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Link to={`/addcourses/${course._id}`}
                                                    className="border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">
                                                    Edit
                                                </Link>
                                                <Link to={`/admin/create-doubt-session/${course._id}`}
                                                    className="border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">
                                                    Doubt Session
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourses;
