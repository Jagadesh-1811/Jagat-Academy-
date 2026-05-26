import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Assignments = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.user);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/assignment/course/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch assignments');
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
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
                        <ArrowBackIcon />
                    </button>
                    <h1 className="text-white font-black uppercase tracking-tight text-lg">Assignments</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-500 uppercase">
                        {assignments.length} Assignment{assignments.length !== 1 ? 's' : ''}
                    </p>
                    <Link to={`/admin/create-assignment/${courseId}`}
                        className="border-2 border-black px-4 py-2 text-xs font-black uppercase hover:bg-black hover:text-white transition-none">
                        + New Assignment
                    </Link>
                </div>

                {assignments.length === 0 ? (
                    <div className="border-4 border-black p-12 text-center">
                        <h3 className="text-lg font-black uppercase">No Assignments Yet</h3>
                        <p className="text-gray-500 text-xs font-bold mt-2">Create your first assignment to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assignments.map((assignment) => (
                            <div key={assignment._id} className="border-4 border-black p-4 bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black uppercase text-sm">{assignment.title}</h3>
                                        {assignment.description && (
                                            <p className="text-gray-500 text-xs mt-1">{assignment.description}</p>
                                        )}
                                        {assignment.deadline && (
                                            <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase">
                                                Due: {new Date(assignment.deadline).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/edit-assignment/${courseId}/${assignment._id}`}
                                            className="border-2 border-black px-3 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-none">
                                            Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Assignments;
