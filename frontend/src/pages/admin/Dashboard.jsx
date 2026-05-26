import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { setCreatorCourseData } from '../../redux/courseSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import QuizManager from './QuizManager';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.user);
    const { creatorCourseData } = useSelector((state) => state.course);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [submissions, setSubmissions] = useState([]);

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
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const totalStudents = creatorCourseData?.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0) || 0;
    const totalEarnings = creatorCourseData?.reduce((acc, c) => acc + (c.price || 0) * (c.enrolledStudents?.length || 0), 0) || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <ClipLoader size={40} color="#000" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-white font-black uppercase tracking-tight text-xl">Admin Dashboard</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase">Course Management Console</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="border-2 border-white text-white px-3 py-1.5 text-[10px] font-black uppercase">
                            Earnings: ₹{totalEarnings}
                        </span>
                        <Link to="/createcourses"
                            className="border-2 border-white text-white px-3 py-1.5 text-[10px] font-black uppercase hover:bg-white hover:text-black transition-none">
                            + Course
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border-4 border-black p-4 bg-gray-50">
                        <span className="text-[10px] font-black uppercase text-gray-500">Courses</span>
                        <p className="text-3xl font-black mt-1">{creatorCourseData?.length || 0}</p>
                    </div>
                    <div className="border-4 border-black p-4 bg-gray-50">
                        <span className="text-[10px] font-black uppercase text-gray-500">Students</span>
                        <p className="text-3xl font-black mt-1">{totalStudents}</p>
                    </div>
                    <div className="border-4 border-black p-4 bg-gray-50">
                        <span className="text-[10px] font-black uppercase text-gray-500">Lectures</span>
                        <p className="text-3xl font-black mt-1">{creatorCourseData?.reduce((acc, c) => acc + (c.lectures?.length || 0), 0) || 0}</p>
                    </div>
                    <div className="border-4 border-black p-4 bg-black text-white">
                        <span className="text-[10px] font-black uppercase text-gray-400">Pending</span>
                        <p className="text-3xl font-black mt-1">{submissions.filter(s => !s.grade).length}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b-2 border-black pb-4">
                    {['overview', 'submissions', 'quizzes'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-2 text-xs font-black uppercase border-2 transition-none ${
                                tab === t ? 'bg-black text-white border-black' : 'border-black hover:bg-black hover:text-white'
                            }`}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {tab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border-4 border-black p-4">
                            <h3 className="font-black uppercase text-xs mb-4">Course Progress</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={creatorCourseData?.map(c => ({ name: c.title?.slice(0, 15), lectures: c.lectures?.length || 0 }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                    <YAxis tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                    <Tooltip />
                                    <Bar dataKey="lectures" fill="#000" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="border-4 border-black p-4">
                            <h3 className="font-black uppercase text-xs mb-4">Student Enrollment</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={creatorCourseData?.map(c => ({ name: c.title?.slice(0, 15), students: c.enrolledStudents?.length || 0 }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                    <YAxis tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                    <Tooltip />
                                    <Bar dataKey="students" fill="#000" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {tab === 'submissions' && (
                    <div className="border-4 border-black p-4">
                        <h3 className="font-black uppercase text-xs mb-4">Recent Submissions</h3>
                        {submissions.length === 0 ? (
                            <p className="text-gray-500 text-xs font-bold text-center py-8">No submissions yet</p>
                        ) : (
                            <div className="space-y-2">
                                {submissions.slice(0, 10).map((s) => (
                                    <div key={s._id} className="border-2 border-black p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold">{s.student?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-gray-500">{s.assignment?.title}</p>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 ${
                                            s.grade ? 'border-black bg-black text-white' : 'border-gray-500 text-gray-500'
                                        }`}>
                                            {s.grade || 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'quizzes' && <QuizManager />}
            </div>
        </div>
    );
};

export default AdminDashboard;
