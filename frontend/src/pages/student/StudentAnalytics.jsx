import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';

const StudentAnalytics = () => {
  const navigate = useNavigate();
  const { userData, token } = useSelector(state => state.user);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData?._id) {
      fetchAnalytics();
    }
  }, [userData]);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/analytics/student/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgScore = () => {
    if (!analytics?.grades || analytics.grades.length === 0) return 0;
    const total = analytics.grades.reduce((sum, g) => sum + g.score, 0);
    return Math.round(total / analytics.grades.length);
  };

  const calculateCompleted = () => {
    if (!analytics?.coursesProgress) return 0;
    return analytics.coursesProgress.filter(c => c.progress >= 100).length;
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-6xl mx-auto px-4 py-12 pt-32">
        {/* Header */}
        <div className="border-b-4 border-black pb-4 mb-8">
          <ArrowBackLongIcon className='w-5 h-5 cursor-pointer text-black hover:opacity-70 mb-2' onClick={() => navigate(-1)} />
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">My Analytics</h1>
          <p className="text-gray-500 text-sm font-bold mt-1">Track your learning performance & AI Insights</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-red-600 font-bold text-center">{error}</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Courses</p>
                <p className="text-2xl font-black text-black">{analytics?.coursesProgress?.length || 0}</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-black text-black">{calculateCompleted()}</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Avg Score</p>
                <p className="text-2xl font-black text-black">{calculateAvgScore()}%</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Attendance</p>
                <p className="text-2xl font-black text-black">{analytics?.attendanceRate || 0}%</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Day Streak</p>
                <p className="text-2xl font-black text-black">{analytics?.streak || 0} 🔥</p>
              </div>
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Percentile</p>
                <p className="text-2xl font-black text-black">Top {100 - (analytics?.percentile || 50)}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Course Progress */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="bg-black px-6 py-4 border-b-4 border-black">
                  <h2 className="text-white font-black uppercase tracking-wider text-sm">Course Progress</h2>
                </div>
                {analytics?.coursesProgress && analytics.coursesProgress.length > 0 ? (
                  <div className="divide-y-2 divide-black flex-1">
                    {analytics.coursesProgress.map((course, index) => (
                      <div key={index} className="px-6 py-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-black text-sm">{course.title}</p>
                          <span className="text-sm font-black text-black">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 border-2 border-black h-4 mb-2">
                          <div
                            className="bg-black h-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-500 text-right">Estimated {course.forecastedDaysLeft} days left</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 border-black m-4 bg-gray-50 flex-1 flex items-center justify-center">
                    <p className="text-gray-500 font-bold">No course progress data yet.</p>
                  </div>
                )}
              </div>

              {/* AI Insights (Gemini) */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                <div className="bg-black px-6 py-4 border-b-4 border-black flex justify-between items-center">
                  <h2 className="text-white font-black uppercase tracking-wider text-sm">AI Performance Coach</h2>
                  <span className="text-xs border border-white px-2 py-1 text-white uppercase font-black">Gemini 2.0</span>
                </div>
                {analytics?.aiFeedback ? (
                  <div className="p-6 flex-1 space-y-6">
                    <div>
                      <p className="text-sm font-bold text-black leading-relaxed">
                        {analytics.aiFeedback.aiSummary}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">Identified Weak Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {analytics.aiFeedback.weakAreas?.map((area, i) => (
                          <span key={i} className="px-3 py-1 bg-red-100 text-red-800 border-2 border-red-800 text-xs font-bold uppercase">{area}</span>
                        )) || <span className="text-sm font-bold text-gray-400">None identified</span>}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">AI Recommendations</h3>
                      <ul className="space-y-2">
                        {analytics.aiFeedback.recommendations?.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm font-bold text-black">
                            <span className="text-yellow-500 mt-0.5">⚡</span> {rec}
                          </li>
                        )) || <li className="text-sm font-bold text-gray-400">Keep up the good work!</li>}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center border-2 border-black m-4 bg-gray-50 flex-1 flex items-center justify-center">
                    <p className="text-gray-500 font-bold">Complete more quizzes to unlock AI Insights.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Grades */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
              <div className="bg-black px-6 py-4 border-b-4 border-black">
                <h2 className="text-white font-black uppercase tracking-wider text-sm">Assignment Grades</h2>
              </div>
              {analytics?.grades && analytics.grades.length > 0 ? (
                <div className="divide-y-2 divide-black">
                  {analytics.grades.map((grade, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-100 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-black text-sm">{grade.assignmentTitle}</p>
                        <p className="text-gray-500 text-xs font-medium mt-1">Educator Feedback: {grade.feedback || "None"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-xl bg-gray-50">
                          {grade.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-black m-4 bg-gray-50">
                  <p className="text-gray-500 font-bold">No assignments submitted yet.</p>
                </div>
              )}
            </div>

          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StudentAnalytics;
