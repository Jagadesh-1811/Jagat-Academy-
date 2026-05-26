import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function StudentAnalytics() {
  const navigate = useNavigate();
  const { userData, token } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Interactive Goal Settings
  const [studyGoal, setStudyGoal] = useState(60); // 60 mins default goal
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(60);

  const fetchAnalytics = async () => {
    if (!userData?._id || !token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/analytics/student/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      toast.error('Failed to load learning analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userData?._id, token]);

  const handleSaveGoal = () => {
    setStudyGoal(tempGoal);
    setIsEditingGoal(false);
    toast.success(`Daily study goal updated to ${tempGoal} minutes!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <ClipLoader size={40} color="#000" />
        <span className="mt-4 font-black uppercase text-xs tracking-widest text-black">
          Compiling student insights...
        </span>
      </div>
    );
  }

  const todayMinutes = data?.dailyMinutesLog?.slice(-1)[0]?.minutes || 0;
  const goalPercentage = Math.min(100, Math.round((todayMinutes / studyGoal) * 100));

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans border-t-8 border-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header navigation bar */}
        <div className="border-b-4 border-black pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
            >
              ← Back to Main Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight mt-4 uppercase">
              My Learning Analytics
            </h1>
            <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
              Student Performance & AI Core Insights
            </p>
          </div>
          <div className="flex gap-4">
            <span className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider">
              🔥 {data?.streak || 0} Day Streak
            </span>
            <span className="border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider">
              🏆 {data?.percentile || 90}th Percentile
            </span>
          </div>
        </div>

        {/* Goals & Streak overview panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Goal card */}
          <div className="border-4 border-black p-6 space-y-4 bg-gray-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                Daily Study Target
              </span>
              <div className="flex justify-between items-end">
                <h2 className="text-4xl font-black">{todayMinutes}m</h2>
                <span className="text-xs text-gray-500 font-bold uppercase">
                  / {studyGoal}m Goal
                </span>
              </div>
              
              {/* ProgressBar */}
              <div className="w-full bg-gray-200 h-4 border-2 border-black mt-3">
                <div 
                  className="bg-black h-full transition-all duration-500" 
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
            </div>

            <div>
              {isEditingGoal ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 border-2 border-black text-xs font-mono text-center focus:outline-none"
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="bg-black text-white text-[10px] font-black px-3 py-1 border-2 border-black uppercase"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempGoal(studyGoal);
                    setIsEditingGoal(true);
                  }}
                  className="text-[10px] font-bold uppercase underline hover:text-gray-600"
                >
                  [Adjust Daily Target Goal]
                </button>
              )}
            </div>
          </div>

          {/* Streak tracker */}
          <div className="border-4 border-black p-6 space-y-2 text-center bg-black text-white flex flex-col justify-center items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Consistency Streak
            </span>
            <span className="text-6xl font-black select-none">🔥</span>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">
              {data?.streak || 0} Study Days
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {data?.streak >= 5 ? 'Elite Consistency Unlocked!' : 'Study daily to build your learning habits!'}
            </p>
          </div>

          {/* Attendance and eligibility */}
          <div className="border-4 border-black p-6 space-y-3 bg-gray-50 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                Attendance Verification Log
              </span>
              <h2 className="text-4xl font-black">{data?.attendanceRate}%</h2>
              <p className="text-xs text-gray-500 mt-1 font-semibold uppercase">
                Minimum requirement for certificates: 75%
              </p>
            </div>
            <span className={`w-full py-2 border-2 text-center text-xs font-black uppercase block tracking-wider ${
              data?.attendanceRate >= 75 ? 'bg-black text-white border-black' : 'border-dashed border-gray-400 text-black'
            }`}>
              {data?.attendanceRate >= 75 ? '🎓 Certification Eligible' : '⚠️ Certification Locked'}
            </span>
          </div>

        </div>

        {/* Study Hours Trend Graph */}
        <div className="border-4 border-black p-6 space-y-4">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              Study Time Analytics (Past 30 Days)
            </h2>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Daily minutes active in lecture and video playback
            </p>
          </div>

          <div className="h-64 w-full">
            {data?.dailyMinutesLog?.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-500 uppercase text-xs font-bold">
                No learning logs recorded in past 30 days. Start watching lecture videos to populate charts!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.dailyMinutesLog} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <YAxis stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', color: '#fff', border: '2px solid #000' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: 10 }}
                    itemStyle={{ fontSize: 10 }}
                  />
                  <Bar dataKey="minutes" fill="#000" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Forecasting & Course progress cards */}
        <div className="border-4 border-black p-6 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              Course Progress & AI Completion Forecast
            </h2>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Predictive timelines derived from standard linear regression study patterns
            </p>
          </div>

          {data?.coursesProgress?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 font-bold uppercase text-xs">
              No enrolled courses with active progress tracking.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.coursesProgress?.map((c) => (
                <div key={c.courseId} className="border-2 border-black p-4 space-y-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm uppercase max-w-[70%] truncate">
                      {c.title}
                    </h3>
                    <span className="text-xs font-mono font-black select-all bg-black text-white px-2 py-0.5">
                      {c.progress}%
                    </span>
                  </div>

                  {/* Progress tracker bar */}
                  <div className="w-full bg-gray-200 h-2 border border-black">
                    <div 
                      className="bg-black h-full" 
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-gray-600 border-t border-gray-250 pt-2">
                    <div>
                      <span className="text-gray-400 block">Lectures Marked</span>
                      {c.completedLecturesCount} / {c.totalLectures}
                    </div>
                    <div>
                      <span className="text-gray-400 block">AI Forecast Target</span>
                      {c.progress >= 100 ? (
                        <span className="text-black font-black">🏁 Completed</span>
                      ) : (
                        <span className="text-black font-black">🔮 Complete in {c.forecastedDaysLeft} Days</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Revised Insights Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* AI weak areas and recommendations panel */}
          <div className="border-4 border-black p-6 md:col-span-2 space-y-4 bg-black text-white">
            <div className="border-b border-gray-800 pb-2 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest text-white">
                  🧠 AI Core Weak Areas & Action Items
                </h2>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  Local Gemma:2b evaluation based on your submission logs
                </p>
              </div>
              <span className="text-[9px] border border-gray-800 text-gray-400 px-2 py-0.5 uppercase tracking-widest font-mono">
                GEMMA ACTIVE
              </span>
            </div>

            <p className="text-xs text-gray-300 italic font-medium leading-relaxed">
              "{data?.aiFeedback?.aiSummary}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                  Identify Target Weak Areas
                </span>
                <div className="space-y-1.5">
                  {data?.aiFeedback?.weakAreas?.map((area, index) => (
                    <div key={index} className="flex gap-2 items-center text-xs">
                      <span className="text-xs font-black">×</span>
                      <span className="text-white font-extrabold uppercase">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                  AI Action Recommendations
                </span>
                <div className="space-y-1.5">
                  {data?.aiFeedback?.recommendations?.map((rec, index) => (
                    <div key={index} className="flex gap-2 items-start text-xs">
                      <span className="text-xs font-black">•</span>
                      <span className="text-gray-300 font-semibold">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Performance scores card */}
          <div className="border-4 border-black p-6 space-y-4">
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-tight">
                Course Performance Metrics
              </h2>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">
                Assignment scores & tutor marks
              </p>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {data?.grades?.length === 0 ? (
                <div className="text-center py-8 text-gray-500 uppercase text-[10px] font-bold border border-dashed border-gray-300">
                  No graded logs found yet.
                </div>
              ) : (
                data?.grades?.map((g, index) => (
                  <div key={index} className="border border-black p-3 bg-gray-50 space-y-1">
                    <div className="flex justify-between items-center text-xs font-extrabold uppercase">
                      <span className="truncate max-w-[70%]">{g.assignmentTitle}</span>
                      <span className="font-mono bg-black text-white px-1.5 py-0.5">{g.score}%</span>
                    </div>
                    {g.feedback && (
                      <p className="text-[9px] text-gray-500 italic mt-1 leading-normal">
                        Feedback: {g.feedback}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
