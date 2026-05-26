import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Tooltip,
  Legend
} from 'recharts';

export default function ParentAnalytics() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchAnalytics = async () => {
    if (!childId || !token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/analytics/parent/${childId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching parent child analytics:', error);
      toast.error('Failed to load child learning analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [childId, token]);

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/analytics/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data?.studentName || 'student'}_cohort_report.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success('Cohort CSV downloaded successfully!');
    } catch (error) {
      console.error('Error exporting analytics CSV:', error);
      toast.error('Failed to export CSV report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <ClipLoader size={40} color="#000" />
        <span className="mt-4 font-black uppercase text-xs tracking-widest text-black">
          Generating child cohort logs...
        </span>
      </div>
    );
  }

  // Handle student privacy gate
  if (data?.privacyGated) {
    return (
      <div className="min-h-screen bg-white text-black p-6 font-sans border-t-8 border-black flex items-center justify-center">
        <div className="max-w-md w-full border-4 border-black p-8 text-center bg-gray-50 space-y-6">
          <span className="text-5xl block select-none">🔒</span>
          <h1 className="text-2xl font-black uppercase tracking-tight">Data Sharing Gated</h1>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">
            Your child has toggled analytics sharing off from their student portal settings. 
            To view streaks, learning times, and forecasting timelines, please ask them to share analytics from their portal settings.
          </p>
          <button
            onClick={() => navigate('/parent/dashboard')}
            className="w-full bg-black text-white hover:bg-gray-800 text-xs font-black py-3 border-2 border-black uppercase transition-none"
          >
            Return to Parent Dashboard
          </button>
        </div>
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
              onClick={() => navigate('/parent/dashboard')}
              className="text-xs font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
            >
              ← Back to Parent Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight mt-4 uppercase">
              Child Performance watch
            </h1>
            <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
              Student name: {data?.studentName} • Comparative Peer Analytics
            </p>
          </div>
          <div>
            <button
              onClick={handleExportCSV}
              className="border-2 border-black px-4 py-2 bg-black text-white hover:bg-gray-800 text-xs font-black uppercase tracking-wider"
            >
              [Export Cohort CSV Report]
            </button>
          </div>
        </div>

        {/* Dynamic Engagement Alerts */}
        {data?.alerts?.length > 0 && (
          <div className="space-y-3">
            {data?.alerts?.map((alert, index) => (
              <div key={index} className="border-4 border-black p-4 bg-gray-50 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm uppercase">{alert.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-normal uppercase font-semibold">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Peer Study Duration Comparison */}
        <div className="border-4 border-black p-6 space-y-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-tight">
              Weekly Learning Consistency vs Peer Cohort Averages
            </h2>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Child minutes studied in comparison to course average study duration
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.peerComparison} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', color: '#fff', border: '2px solid #000' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 10 }}
                  itemStyle={{ fontSize: 10 }}
                />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar dataKey="child" fill="#000" radius={[2, 2, 0, 0]} name={`${data?.studentName || 'Child'} mins`} />
                <Bar dataKey="peerAverage" fill="#9ca3af" radius={[2, 2, 0, 0]} name="Peer average mins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI and Progress Table */}
        <div className="border-4 border-black p-6">
          <div className="border-b-2 border-black pb-2 mb-4">
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              LMS ROI Breakdown & Course Invoices
            </h2>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Comparative analysis of cost investments against child syllabus completions
            </p>
          </div>

          {data?.investments?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 font-bold uppercase text-xs">
              No paid course subscriptions linked to this student profile.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-black text-left text-xs uppercase font-bold text-black">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-black">
                    <th className="px-4 py-3">Course / Lecture Suite</th>
                    <th className="px-4 py-3">Cost Investment</th>
                    <th className="px-4 py-3">Progress Completed</th>
                    <th className="px-4 py-3">Unlocked Certificates</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b border-black">
                  {data?.investments?.map((inv, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">{inv.courseTitle}</td>
                      <td className="px-4 py-4">₹{inv.cost}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{inv.progress}%</span>
                          <div className="w-20 bg-gray-200 h-2 border border-black inline-block">
                            <div className="bg-black h-full" style={{ width: `${inv.progress}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 border font-black ${
                          inv.unlockedCertificates > 0 ? 'bg-black text-white border-black' : 'border-dashed border-gray-400 text-gray-500'
                        }`}>
                          {inv.unlockedCertificates > 0 ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
