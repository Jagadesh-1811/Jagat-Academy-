import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const TeacherAssignments = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/assignment/course/${courseId}`);
            setAssignments(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await axios.delete(`${serverUrl}/api/assignment/delete/${id}`);
            toast.success('Assignment deleted');
            fetchAssignments();
        } catch (error) {
            toast.error('Failed to delete assignment');
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
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/addcourses/${courseId}`)} className="text-white hover:text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">Assignments</h1>
                    </div>
                    <Link to={`/admin/create-assignment/${courseId}`}
                        className="border-2 border-white text-white px-4 py-2 text-xs font-black uppercase hover:bg-white hover:text-black transition-none">
                        + New
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 space-y-4">
                {assignments.length === 0 ? (
                    <div className="border-4 border-black p-12 text-center">
                        <h3 className="font-black uppercase text-sm text-gray-500">No assignments found</h3>
                        <Link to={`/admin/create-assignment/${courseId}`}
                            className="inline-block mt-4 bg-black text-white px-6 py-3 text-xs font-black uppercase border-2 border-black">
                            Create Assignment
                        </Link>
                    </div>
                ) : (
                    assignments.map((a) => (
                        <div key={a._id} className="border-4 border-black p-4 bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-black uppercase text-sm">{a.title}</h3>
                                {a.description && <p className="text-xs text-gray-600 mt-1">{a.description}</p>}
                                {a.deadline && <p className="text-[10px] font-bold text-gray-500 mt-1">Due: {new Date(a.deadline).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/admin/edit-assignment/${courseId}/${a._id}`}
                                    className="border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">Edit</Link>
                                <Link to={`/view-submissions/${courseId}/${a._id}`}
                                    className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase border-2 border-black hover:bg-gray-800 transition-none">Submissions</Link>
                                <button onClick={() => handleDelete(a._id)}
                                    className="border-2 border-red-600 text-red-600 px-3 py-1 text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-none">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeacherAssignments;
