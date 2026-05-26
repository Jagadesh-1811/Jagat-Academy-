import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import img from "../../assets/empty.jpg"; // fallback photo
import { useNavigate } from 'react-router-dom';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CancelIcon from '@mui/icons-material/Cancel';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { serverUrl } from '../../App';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QuizManager from './QuizManager';
import ChatList from '../../components/ChatList';



const getGradeColor = (grade, isBackground = false) => {
    switch (grade) {
        case 'A': return isBackground ? '#D4EDDA' : '#28A745'; // Green
        case 'B': return isBackground ? '#CCE5FF' : '#007BFF'; // Blue
        case 'C': return isBackground ? '#FFF3CD' : '#FFC107'; // Yellow
        case 'D': return isBackground ? '#F8D7DA' : '#DC3545'; // Red
        default: return isBackground ? '#E2E6EA' : '#6C757D'; // Gray
    }
};

function Dashboard() {
    const navigate = useNavigate()
    const { userData, token } = useSelector((state) => state.user);
    const { creatorCourseData } = useSelector((state) => state.course);
    const [submissions, setSubmissions] = useState({});
    const [grades, setGrades] = useState({}); // State to hold grades for each submission
    const [feedback, setFeedback] = useState({}); // State to hold feedback for each submission
    const [submittingGrade, setSubmittingGrade] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(true);
    const [deletedAssignments, setDeletedAssignments] = useState([]); // Track deleted assignments

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to delete this assignment? All submissions will also be removed.")) {
            return;
        }
        try {
            await axios.delete(`${serverUrl}/api/assignment/delete/${assignmentId}`, { headers: { Authorization: `Bearer ${token}` } });
            setDeletedAssignments(prev => [...prev, assignmentId]);
            toast.success("Assignment deleted successfully");
        } catch (error) {
            console.error("Error deleting assignment:", error);
            toast.error(error.response?.data?.message || "Failed to delete assignment.");
        }
    };


    const handleGradeChange = (submissionId, value) => {
        setGrades(prev => ({ ...prev, [submissionId]: value }));
    };

    const handleFeedbackChange = (submissionId, value) => {
        setFeedback(prev => ({ ...prev, [submissionId]: value }));
    };

    const assignGrade = async (submissionId, assignmentId) => {
        setSubmittingGrade(true);
        try {
            const selectedGrade = grades[submissionId];
            const selectedFeedback = feedback[submissionId];

            if (!selectedGrade) {
                toast.error("Please select a grade.");
                setSubmittingGrade(false);
                return;
            }

            // Validate required fields before sending
            if (!submissionId || !assignmentId) {
                toast.error("Submission or Assignment ID missing.");
                setSubmittingGrade(false);
                return;
            }

            const result = await axios.post(
                `${serverUrl}/api/grade/assign`,
                { submissionId, assignmentId, grade: selectedGrade, feedback: selectedFeedback || "" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refetch submissions for the assignment to get updated grade
            const { data } = await axios.get(
                `${serverUrl}/api/submission/${assignmentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmissions(prevSubmissions => ({
                ...prevSubmissions,
                [assignmentId]: data.submissions
            }));
            toast.success("Grade assigned successfully!");
        } catch (error) {
            console.error("Error assigning grade:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to assign grade.");
        } finally {
            setSubmittingGrade(false);
        }
    };

    const rejectSubmission = async (submissionId, assignmentId) => {
        const selectedFeedback = feedback[submissionId];
        if (!selectedFeedback || selectedFeedback.trim() === '') {
            toast.error("Please provide feedback when rejecting a submission.");
            return;
        }

        setSubmittingGrade(true);
        try {
            await axios.post(
                `${serverUrl}/api/grade/assign`,
                { submissionId, assignmentId, status: 'rejected', feedback: selectedFeedback },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refetch submissions
            const { data } = await axios.get(
                `${serverUrl}/api/submission/${assignmentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmissions(prevSubmissions => ({
                ...prevSubmissions,
                [assignmentId]: data.submissions
            }));
            toast.success("Submission rejected successfully!");
        } catch (error) {
            console.error("Error rejecting submission:", error);
            toast.error(error.response?.data?.message || "Failed to reject submission.");
        } finally {
            setSubmittingGrade(false);
        }
    };

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setLoadingSubmissions(true);
                const newSubmissions = {};
                for (const course of creatorCourseData) {
                    if (course.assignments) { // Ensure assignments exist
                        for (const assignment of course.assignments) {
                            if (assignment && assignment._id) { // Check if assignment and assignment._id are not null/undefined
                                const { data } = await axios.get(
                                    `${serverUrl}/api/submission/${assignment._id}`,
                                    { headers: { Authorization: `Bearer ${token}` } }
                                );
                                newSubmissions[assignment._id] = data.submissions;
                            }
                        }
                    }
                }
                setSubmissions(newSubmissions);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoadingSubmissions(false);
            }
        };

        if (creatorCourseData) {
            fetchSubmissions();
        }
    }, [creatorCourseData, token]);

    // update based on your store

    // Sample data - Replace with real API/course data
    const courseProgressData = creatorCourseData?.map(course => ({
        name: course.title.slice(0, 10) + "...",
        lectures: course.lectures.length || 0
    })) || [];

    const enrollData = creatorCourseData?.map(course => ({
        name: course.title.slice(0, 10) + "...",
        enrolled: course.enrolledStudents?.length || 0
    })) || [];

    const totalEarnings = creatorCourseData?.reduce((sum, course) => {
        const studentCount = course.enrolledStudents?.length || 0;
        const courseRevenue = course.price ? course.price * studentCount : 0;
        return sum + courseRevenue;
    }, 0) || 0;

    return (
        <div className="flex min-h-screen bg-white">
            <div className="w-full px-6 py-10 bg-white space-y-10">
                {/* Welcome Section */}
                <div className="max-w-5xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col md:flex-row items-center gap-6">
                    <img
                        src={userData?.photoUrl || img}
                        alt="Educator"
                        className="w-28 h-28 object-cover border-4 border-black"
                    />
                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-2xl font-black text-black flex items-center gap-2">
                            Welcome, {userData?.name || "Educator"} <AutoAwesomeIcon className="text-black" />
                        </h1>
                        <h1 className='text-xl font-semibold text-gray-800'>Total Earning : <span className='font-light text-gray-900'>₹{totalEarnings.toLocaleString()}</span>  </h1>
                        <p className="text-gray-600 text-sm">
                            {userData?.description || "Start creating amazing courses for your students!"}
                        </p>
                        <h1 className='px-4 text-center py-3 border-2 bg-black border-2 border-black text-white text-sm font-black flex items-center justify-center gap-2 cursor-pointer hover:bg-white hover:text-black transition-none' onClick={() => navigate("/courses")}>Create Courses</h1>
                        <h1 className='px-4 text-center py-3 border-2 bg-black border-2 border-black text-white text-sm font-black flex items-center justify-center gap-2 cursor-pointer mt-2 hover:bg-white hover:text-black transition-none' onClick={() => navigate("/admin/feedback-manager")}>View Feedback & Issues</h1>
                        <h1 className='px-4 text-center py-3 border-2 bg-black border-2 border-black text-white text-sm font-black flex items-center justify-center gap-2 cursor-pointer mt-2 hover:bg-white hover:text-black transition-none' onClick={() => navigate("/teacher/analytics")}>Learning & Course Analytics</h1>
                    </div>
                </div>

                {/* Graphs Section */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Course Progress Chart */}
                    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-lg font-black uppercase tracking-tight mb-4">Course Progress (Lectures)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={courseProgressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="lectures" fill="black" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Enrolled Students Chart */}
                    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-lg font-black uppercase tracking-tight mb-4">Student Enrollment</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={enrollData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="enrolled" fill="black" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mt-8">
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4">Assignment Submissions</h2>
                    {loadingSubmissions ? (
                        <div className="flex justify-center items-center h-40">
                            <ClipLoader size={30} color={'#000'} />
                        </div>
                    ) : (
                        <>
                            {creatorCourseData?.map((course) => (
                                <div key={course._id} className="mb-8">
                                    <h3 className="text-lg font-black mb-2">{course.title}</h3>
                                    {course.assignments?.filter(a => !deletedAssignments.includes(a._id)).map((assignment) => (
                                        <div key={assignment._id} className="border-2 border-black p-4 mb-4 bg-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-md font-semibold">{assignment.title}</h4>
                                                <button
                                                    className="bg-black text-white px-3 py-2 border-2 border-black text-xs font-black hover:bg-white hover:text-black transition-none flex items-center gap-1"
                                                    onClick={() => handleDeleteAssignment(assignment._id)}
                                                >
                                                    <FaTrash /> Remove
                                                </button>
                                            </div>
                                            <ul className="list-disc pl-6 mt-2">
                                                {submissions[assignment._id]?.map((submission) => (
                                                    submission && (
                                                        <li key={submission._id} className="text-sm border-b pb-2 mb-2 last:border-b-0">
                                                            <span className="font-semibold">{submission.student?.name || "Unknown Student"}: </span>
                                                            <a href={submission.submissionLink} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                                                                {submission.submissionLink}
                                                            </a>
                                                            {submission.grade ? (
                                                                submission.grade.status === 'rejected' ? (
                                                                    <div className="mt-2 p-3 rounded-md bg-gray-200 border border-red-300">
                                                                        <p className="font-semibold text-gray-500 flex items-center gap-2"><CancelIcon /> Rejected</p>
                                                                        <p className="text-gray-500 text-sm mt-1">Feedback: {submission.grade.feedback}</p>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className="mt-2 p-2 rounded-md"
                                                                        style={{ backgroundColor: getGradeColor(submission.grade.grade, true) }}
                                                                    >
                                                                        <p className="font-semibold">
                                                                            Grade: <span style={{ color: getGradeColor(submission.grade.grade) }}>{submission.grade.grade}</span>
                                                                        </p>
                                                                        <p className="text-gray-700">Feedback: {submission.grade.feedback}</p>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="mt-2 p-2 bg-gray-200 rounded-md">
                                                                    <h5 className="font-bold text-sm mb-2 uppercase">Assign Grade</h5>
                                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                                        <select
                                                                            className="w-full sm:w-1/3 border-2 border-black px-3 py-2 bg-white"
                                                                            value={grades[submission._id] || ''}
                                                                            onChange={(e) => handleGradeChange(submission._id, e.target.value)}
                                                                        >
                                                                            <option value="">Select Grade</option>
                                                                            <option value="A">A</option>
                                                                            <option value="B">B</option>
                                                                            <option value="C">C</option>
                                                                            <option value="D">D</option>
                                                                        </select>
                                                                        <textarea
                                                                            className="w-full sm:flex-1 border-2 border-black px-2 py-1 resize-none text-sm"
                                                                            placeholder="Add feedback (optional)"
                                                                            value={feedback[submission._id] || ''}
                                                                            onChange={(e) => handleFeedbackChange(submission._id, e.target.value)}
                                                                            rows="1"
                                                                        ></textarea>
                                                                        <button
                                                                            className="bg-black text-white px-4 py-2 border-2 border-black hover:bg-white hover:text-black transition-none w-full sm:w-auto text-sm font-bold"
                                                                            onClick={() => assignGrade(submission._id, assignment._id)}
                                                                            disabled={submittingGrade}
                                                                        >
                                                                            {submittingGrade ? <ClipLoader size={15} color={'white'} /> : 'Grade'}
                                                                        </button>
                                                                        <button
                                                                            className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-none w-full sm:w-auto text-sm font-bold"
                                                                            onClick={() => rejectSubmission(submission._id, assignment._id)}
                                                                            disabled={submittingGrade}
                                                                        >
                                                                            {submittingGrade ? <ClipLoader size={15} color={'white'} /> : 'Reject'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <QuizManager />
            </div>

            {/* Chat List for Student Messages */}
            <ChatList />
        </div>
    );
}

export default Dashboard;

