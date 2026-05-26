import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function EducatorAnalytics() {
  const navigate = useNavigate();
  const { userData, token } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchAnalytics = async () => {
    if (!userData?._id || !token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/analytics/educator/${userData._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching educator analytics:', error);
      toast.error('Failed to load educator analytics dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userData?._id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <ClipLoader size={40} color="#000" />
        <span className="mt-4 font-black uppercase text-xs tracking-widest text-black">
          Compiling educator dashboard analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans border-t-8 border-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header navigation bar */}
        <div className="border-b-4 border-black pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="text-xs font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
            >
              ← Back to Educator Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight mt-4 uppercase">
              Educator Command Center
            </h1>
            <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
              Lecture Drop-Off Retention, Quiz Common Mistakes & Earnings
            </p>
          </div>
          <div className="flex gap-4">
            <span className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider">
              Total Earnings: ₹{data?.totalEarning || 0}
            </span>
            <span className="border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider">
              Refund Rate: {data?.refundRate || 0}%
            </span>
          </div>
        </div>

        {/* Top course stats list grid */}
        <div className="border-4 border-black p-6 space-y-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-tight">
              My Created Courses Overview
            </h2>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Enrollments and syllabus completion stats
            </p>
          </div>

          {data?.courses?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 font-bold uppercase text-xs">
              No created courses found. Build and publish courses to activate analytics trackers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data?.courses?.map((c) => (
                <div key={c.courseId} className="border-2 border-black p-4 space-y-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-sm uppercase truncate max-w-[70%]">
                      {c.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center border-t border-gray-250 pt-2 text-[10px] uppercase font-bold text-gray-600">
                    <div>
                      <span className="text-gray-400 block">Enrolled</span>
                      <span className="text-black font-black text-xs">{c.enrollmentCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Complete</span>
                      <span className="text-black font-black text-xs">{c.completionRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Revenue</span>
                      <span className="text-black font-black text-xs">₹{c.revenue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video watch drops chart & Live session attendance log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dropoff area curve */}
          <div className="border-4 border-black p-6 lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-tight">
                Average Video Playback Retention Curve
              </h2>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Syllabus progress watch retention percent across lecture timelines (drop-off triggers)
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.retentionCurve} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="position" stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <YAxis stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', color: '#fff', border: '2px solid #000' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: 10 }}
                    itemStyle={{ fontSize: 10 }}
                  />
                  <Area type="monotone" dataKey="retention" stroke="#000" strokeWidth={2} fill="#e5e7eb" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live attendance list */}
          <div className="border-4 border-black p-6 space-y-4 bg-gray-50">
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-tight">
                Live Attendance Logs
              </h2>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">
                Recent Zego video rooms audit counts
              </p>
            </div>

            <div className="space-y-3">
              {data?.attendanceStats?.map((s, index) => (
                <div key={index} className="border border-black p-3 bg-white space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase">
                    <span className="truncate max-w-[70%]">{s.session}</span>
                    <span className="font-mono bg-black text-white px-2 py-0.5">{s.attendance}% Present</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 border border-black">
                    <div className="bg-black h-full" style={{ width: `${s.attendance}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quiz Common Mistakes Tracker */}
        <div className="border-4 border-black p-6 space-y-4 bg-black text-white">
          <div className="border-b border-gray-800 pb-2">
            <h2 className="text-lg font-black uppercase tracking-widest text-white">
              ⚠️ Quiz Critical Mistake Markers
            </h2>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">
              Questions in active quizzes where student fail rate exceeds 50%
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.quizCommonMistakes?.map((m, index) => (
              <div key={index} className="border-2 border-white p-4 space-y-3 bg-gray-900">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] bg-white text-black font-black uppercase px-2 py-0.5 tracking-wider">
                    {m.topic}
                  </span>
                  <span className="text-xs text-red-400 font-mono font-black">
                    💥 {m.failRate}% Fail Rate
                  </span>
                </div>
                <p className="text-xs text-gray-200 font-semibold leading-relaxed">
                  {m.question}
                </p>
                <div className="text-[9px] text-gray-400 uppercase font-bold border-t border-gray-800 pt-2">
                  💡 Educator Advice: Review this topic inside upcoming live voice rooms or doubt groups.
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
