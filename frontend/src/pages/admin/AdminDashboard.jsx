import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0, totalEducators: 0, totalUsers: 0, totalCourses: 0,
        publishedCourses: 0, totalRevenue: 0, totalEnrollments: 0,
        newUsersToday: 0, newStudentsToday: 0, newEducatorsToday: 0,
        newUsersThisWeek: 0, feedbackCount: 0, issueCount: 0
    });
    const [courses, setCourses] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    const [doubtSessions, setDoubtSessions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [adminData, setAdminData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const admin = localStorage.getItem('adminData');
        if (!token) { navigate('/admin/login'); return; }
        if (admin) setAdminData(JSON.parse(admin));
        fetchAllData();
        let interval;
        if (autoRefresh) interval = setInterval(() => fetchAllData(true), 10000);
        return () => { if (interval) clearInterval(interval); };
    }, [navigate, autoRefresh]);

    const fetchAllData = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const statsRes = await axios.get(`${serverUrl}/api/admin/data/stats`);
            if (statsRes.data) setStats(prev => ({ ...prev, ...statsRes.data }));

            const coursesRes = await axios.get(`${serverUrl}/api/admin/data/courses/stats`);
            if (coursesRes.data?.courses) setCourses(coursesRes.data.courses);

            const usersRes = await axios.get(`${serverUrl}/api/admin/data/users/recent?limit=10&hours=168`);
            if (usersRes.data?.users) setRecentUsers(usersRes.data.users);

            const activityRes = await axios.get(`${serverUrl}/api/admin/data/activity?limit=15`);
            if (activityRes.data?.activities) setActivityFeed(activityRes.data.activities);

            try {
                const feedbackRes = await axios.get(`${serverUrl}/api/feedback/all`);
                if (feedbackRes.data) {
                    setStats(prev => ({
                        ...prev,
                        feedbackCount: feedbackRes.data.filter(f => f.type === 'feedback').length,
                        issueCount: feedbackRes.data.filter(f => f.type === 'issue').length
                    }));
                }
            } catch (err) {}

            try {
                const doubtRes = await axios.get(`${serverUrl}/api/doubt-session/all`);
                if (doubtRes.data) setDoubtSessions(doubtRes.data);
            } catch (err) {}

            setLastUpdated(new Date());
        } catch (error) {
            if (!silent) toast.error('Failed to fetch dashboard data');
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    const handleRefresh = () => { fetchAllData(); toast.success('Dashboard refreshed!'); };
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        toast.success('Logged out');
        navigate('/admin/login');
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const revenueData = courses.slice(0, 8).map(course => ({
        name: course.title?.slice(0, 12) + (course.title?.length > 12 ? '...' : '') || 'Course',
        revenue: course.revenue || 0,
        students: course.enrollmentCount || 0,
    }));

    const pieData = [
        { name: 'Feedback', value: stats.feedbackCount, color: '#000000' },
        { name: 'Issues', value: stats.issueCount, color: '#737373' }
    ];

    const userDistribution = [
        { name: 'Students', value: stats.totalStudents, color: '#000000' },
        { name: 'Educators', value: stats.totalEducators, color: '#404040' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <ClipLoader size={50} color="black" />
                    <p className="mt-4 font-bold text-black uppercase text-xs tracking-wider">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* ── Header ── */}
            <div className="bg-black text-white py-5 px-6 sticky top-0 z-50 border-b-4 border-gray-700">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-400 text-xs font-bold mt-0.5">
                            Welcome, {adminData?.name || 'Admin'} • <span className="text-green-400">● Live</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <label className="flex items-center gap-2 cursor-pointer mr-2">
                            <span className="text-xs text-gray-400 font-bold uppercase">Auto</span>
                            <div className="relative">
                                <input type="checkbox" checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)} className="sr-only" />
                                <div className={`w-9 h-5 border-2 border-white transition-colors ${autoRefresh ? 'bg-white' : 'bg-gray-600'}`}>
                                    <div className={`w-3.5 h-3.5 m-0.5 transition-transform ${autoRefresh ? 'translate-x-4 bg-black' : 'bg-gray-300'}`} />
                                </div>
                            </div>
                        </label>
                        <span className="text-xs text-gray-500 font-bold mr-2">Updated {formatTimeAgo(lastUpdated)}</span>
                        <button onClick={() => navigate('/admin/voice-monitor')}
                            className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-white hover:bg-gray-200 transition-colors">
                            Voice
                        </button>
                        <button onClick={() => navigate('/admin/doubt-sessions')}
                            className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-white hover:bg-gray-200 transition-colors">
                            Doubts
                        </button>
                        <button onClick={() => navigate('/admin/educator-approvals')}
                            className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-white hover:bg-gray-200 transition-colors">
                            Approvals
                        </button>
                        <button onClick={() => navigate('/admin/feedback-manager')}
                            className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-white hover:bg-gray-200 transition-colors">
                            Feedback
                        </button>
                        <button onClick={() => navigate('/admin/analytics')}
                            className="px-3 py-1.5 bg-white text-black text-xs font-black uppercase tracking-wider border-2 border-white hover:bg-gray-200 transition-colors">
                            Analytics
                        </button>
                        <button onClick={handleRefresh} disabled={refreshing}
                            className="px-3 py-1.5 bg-gray-800 text-white text-xs font-black uppercase tracking-wider border-2 border-gray-600 disabled:opacity-50">
                            {refreshing ? '...' : 'Refresh'}
                        </button>
                        <button onClick={handleLogout}
                            className="px-3 py-1.5 bg-gray-800 text-white text-xs font-black uppercase tracking-wider border-2 border-gray-600">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Total Students', value: stats.totalStudents },
                        { label: 'Teachers', value: stats.totalEducators },
                        { label: 'Courses', value: stats.totalCourses },
                        { label: 'Revenue', value: `₹${stats.totalRevenue?.toLocaleString() || 0}` },
                        { label: 'Enrollments', value: stats.totalEnrollments },
                        { label: 'New Today', value: stats.newUsersToday },
                    ].map((card, i) => (
                        <div key={i} className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-2xl font-black text-black">{card.value}</p>
                            <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Activity Banner ── */}
                <div className="bg-black border-4 border-gray-700 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Today's Activity</h2>
                            <p className="text-gray-400 text-xs font-bold">Real-time platform statistics</p>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-3xl font-black text-white">{stats.newStudentsToday}</p>
                                <p className="text-xs text-gray-400 font-bold mt-1">New Students</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-white">{stats.newEducatorsToday}</p>
                                <p className="text-xs text-gray-400 font-bold mt-1">New Teachers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-white">{stats.newUsersThisWeek}</p>
                                <p className="text-xs text-gray-400 font-bold mt-1">This Week</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Feed + Charts ── */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Activity */}
                    <div className="lg:col-span-1 bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                            <h2 className="text-sm font-black uppercase tracking-wider text-black">Live Activity</h2>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                <span className="w-2 h-2 bg-black animate-pulse" />Live
                            </span>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {activityFeed.length === 0 ? (
                                <p className="text-gray-500 text-center py-8 text-sm font-bold">No recent activity</p>
                            ) : (
                                activityFeed.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 border-2 border-black bg-gray-50">
                                        <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {activity.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{activity.message}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-400 font-bold">{formatTimeAgo(activity.timestamp)}</span>
                                                {activity.revenue > 0 && <span className="text-xs font-black text-black">+₹{activity.revenue}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-sm font-black uppercase tracking-wider text-black mb-4 border-b-2 border-black pb-2">Revenue by Course</h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ border: '2px solid #000', borderRadius: 0 }} />
                                    <Bar dataKey="revenue" fill="#000000" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="text-sm font-black uppercase tracking-wider text-black mb-4 border-b-2 border-black pb-2">Users</h2>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={userDistribution} cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                            {userDistribution.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: 0 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="text-sm font-black uppercase tracking-wider text-black mb-4 border-b-2 border-black pb-2">Feedback vs Issues</h2>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%"
                                            innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                            {pieData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: 0 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Users ── */}
                <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-black px-6 py-3 border-b-4 border-black">
                        <div className="flex items-center justify-between">
                            <h2 className="text-white font-black uppercase text-sm tracking-wider">Recent Users</h2>
                            <span className="text-xs text-gray-400 font-bold">Last 7 days</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-4 border-black bg-gray-50">
                                    {['User', 'Email', 'Role', 'Joined'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-black uppercase text-gray-600">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-gray-500 text-sm font-bold">No recent users</td></tr>
                                ) : (
                                    recentUsers.map(user => (
                                        <tr key={user._id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-black flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 text-sm font-bold">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 text-xs font-black uppercase border-2 ${
                                                    user.role === 'educator' ? 'bg-black text-white border-black' : 'bg-gray-200 text-gray-800 border-gray-400'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-sm font-bold">{formatDate(user.createdAt)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Course Table ── */}
                <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-black px-6 py-3 border-b-4 border-black">
                        <h2 className="text-white font-black uppercase text-sm tracking-wider">Course Revenue</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-4 border-black bg-gray-50">
                                    {['Course', 'Creator', 'Price', 'Enrolled', 'Revenue', 'Status'].map(h => (
                                        <th key={h} className="text-left py-3 px-4 text-xs font-black uppercase text-gray-600">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {courses.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm font-bold">No courses yet</td></tr>
                                ) : (
                                    courses.map(course => (
                                        <tr key={course._id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-4"><span className="font-bold text-gray-900 text-sm">{course.title}</span></td>
                                            <td className="py-3 px-4 text-gray-600 text-sm font-bold">{course.creator?.name || 'Unknown'}</td>
                                            <td className="py-3 px-4 text-gray-700 text-sm font-bold">₹{course.price || 0}</td>
                                            <td className="py-3 px-4 font-black text-gray-900 text-sm">{course.enrollmentCount || 0}</td>
                                            <td className="py-3 px-4 font-black text-gray-900 text-sm">₹{(course.revenue || 0).toLocaleString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 text-xs font-black uppercase border-2 ${
                                                    course.isPublished ? 'bg-black text-white border-black' : 'bg-gray-200 text-gray-700 border-gray-400'
                                                }`}>
                                                    {course.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div onClick={() => navigate('/admin/educator-approvals')}
                        className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-50 transition-colors">
                        <h3 className="font-black uppercase text-sm tracking-wider text-black">Educator Approvals</h3>
                        <p className="text-gray-500 text-xs font-bold mt-1">Review pending educator requests</p>
                    </div>
                    <div onClick={() => navigate('/admin/feedback-manager')}
                        className="bg-black border-4 border-gray-700 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-900 transition-colors">
                        <h3 className="font-black uppercase text-sm tracking-wider text-white">Feedback & Issues</h3>
                        <p className="text-gray-400 text-xs font-bold mt-1">{stats.feedbackCount + stats.issueCount} submissions</p>
                    </div>
                    <div onClick={() => navigate('/contact')}
                        className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-50 transition-colors">
                        <h3 className="font-black uppercase text-sm tracking-wider text-black">Contact Page</h3>
                        <p className="text-gray-500 text-xs font-bold mt-1">View contact information</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
