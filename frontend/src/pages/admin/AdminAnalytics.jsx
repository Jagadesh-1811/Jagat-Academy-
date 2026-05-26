import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip
} from 'recharts';

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Custom Report Builder State
  const [reportTitle, setReportTitle] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState({
    learning_time: true,
    quiz_percentiles: false,
    drop_offs: false,
    revenue: true
  });
  const [reportSchedule, setReportSchedule] = useState('none');
  const [recipientsText, setRecipientsText] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/analytics/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching admin platform analytics:', error);
      toast.error('Failed to load platform-wide analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      toast.error('Please configure a valid report title.');
      return;
    }

    const metricsList = Object.entries(selectedMetrics)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);

    if (metricsList.length === 0) {
      toast.error('Please pick at least one metric to compile.');
      return;
    }

    const emailsList = recipientsText
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    setSubmittingReport(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/analytics/report/generate`,
        {
          title: reportTitle,
          selectedMetrics: metricsList,
          schedule: reportSchedule,
          recipients: emailsList
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setReportTitle('');
        setRecipientsText('');
        setReportSchedule('none');
      }
    } catch (error) {
      console.error('Error scheduling custom report:', error);
      toast.error(error.response?.data?.message || 'Failed to save report configuration.');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <ClipLoader size={40} color="#000" />
        <span className="mt-4 font-black uppercase text-xs tracking-widest text-black">
          Generating platform-wide KPIs...
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
              onClick={() => navigate('/admin/dashboard')}
              className="text-xs font-bold border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-none"
            >
              ← Back to Admin Console
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight mt-4 uppercase">
              Platform Analytics Console
            </h1>
            <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider">
              System Health Metrics, Conversions, Categories & custom Builders
            </p>
          </div>
          <div className="flex gap-4">
            <span className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider">
              Platform Revenue: ₹{data?.stats?.totalRevenue || 0}
            </span>
            <span className="border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider">
              Uptime: {data?.stats?.uptime}
            </span>
          </div>
        </div>

        {/* Dynamic Platform KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border-4 border-black p-4 space-y-1 bg-gray-50">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              Active Learners
            </span>
            <h2 className="text-3xl font-black">{data?.stats?.totalStudents || 0}</h2>
          </div>
          <div className="border-4 border-black p-4 space-y-1 bg-gray-50">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              Educators Registered
            </span>
            <h2 className="text-3xl font-black">{data?.stats?.totalEducators || 0}</h2>
          </div>
          <div className="border-4 border-black p-4 space-y-1 bg-gray-50">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              API Response Speed
            </span>
            <h2 className="text-3xl font-black">{data?.stats?.apiResponseTimeMs}ms</h2>
          </div>
          <div className="border-4 border-black p-4 space-y-1 bg-black text-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
              Server Error Rate
            </span>
            <h2 className="text-3xl font-black text-white">{data?.stats?.errorRatePercent}%</h2>
          </div>
        </div>

        {/* Funnel Conversions & Geo spreads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* User acquisition funnel */}
          <div className="border-4 border-black p-6 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-tight">
                User Acquisition & Conversion Funnel
              </h2>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Conversion steps leading to paid subscription models
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.funnel} layout="vertical" margin={{ left: 30, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <YAxis dataKey="step" type="category" stroke="#000" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', color: '#fff', border: '2px solid #000' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: 10 }}
                    itemStyle={{ fontSize: 10 }}
                  />
                  <Bar dataKey="count" fill="#000" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular categories & Geo distributions */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Categories */}
            <div className="border-4 border-black p-6 bg-gray-50 space-y-4">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-tight">
                  Syllabus Categories Popularity
                </h3>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">
                  Course catalog enrollments
                </p>
              </div>

              <div className="space-y-2.5">
                {data?.categories?.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center text-xs font-bold uppercase border-b border-gray-200 pb-1.5">
                    <span>{cat.name}</span>
                    <span className="font-mono bg-black text-white px-2 py-0.5">{cat.enrollments} Enrolls</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Geo Active Spread */}
            <div className="border-4 border-black p-6 space-y-4">
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-tight">
                  Geographic Learner Distributions
                </h3>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">
                  Region active ratios
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs uppercase font-bold text-gray-700">
                {data?.geoData?.map((g, index) => (
                  <div key={index} className="border border-black p-2 bg-gray-50">
                    <span className="text-gray-400 block text-[9px]">Region</span>
                    <div className="flex justify-between items-center">
                      <span>{g.region}</span>
                      <span className="font-black text-black">{g.activeUsers}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Custom scheduled report builder form */}
        <div className="border-4 border-black p-8 space-y-6">
          <div className="border-b-2 border-black pb-2">
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              🛠️ Custom Layout Report Builder & Scheduler
            </h2>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Select panels, configure automatic schedules, and register dispatches to educator lists
            </p>
          </div>

          <form onSubmit={handleCreateReport} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs uppercase font-bold">
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-gray-700">Report Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Syllabus Progress Cohort"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full border-2 border-black p-2 focus:outline-none bg-white text-black font-semibold rounded-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray-700">Select Analytics Panels to Compile</label>
                <div className="space-y-2 border-2 border-dashed border-gray-300 p-4 bg-gray-50">
                  {Object.entries(selectedMetrics).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSelectedMetrics(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="accent-black border-2 border-black"
                      />
                      <span>{key.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-gray-700">Automated Dispatch Schedule</label>
                  <select
                    value={reportSchedule}
                    onChange={(e) => setReportSchedule(e.target.value)}
                    className="w-full border-2 border-black p-2 bg-white text-black focus:outline-none rounded-none"
                  >
                    <option value="none">Manual Dispatch Only</option>
                    <option value="daily">Every Morning (Daily at 8 AM)</option>
                    <option value="weekly">Every Sunday (Weekly)</option>
                    <option value="monthly">First Day of Month (Monthly)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-700">Recipients (Comma Separated Emails)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. educator1@academy.com, guardian@home.com"
                    value={recipientsText}
                    onChange={(e) => setRecipientsText(e.target.value)}
                    className="w-full border-2 border-black p-2 focus:outline-none bg-white text-black font-semibold rounded-none resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingReport}
                className="w-full bg-black text-white hover:bg-gray-800 text-sm font-black py-4 border-2 border-black uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-none mt-4"
              >
                {submittingReport ? 'Scheduling Campaign...' : '[ Compile & Save Custom Layout ]'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
