import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import jsPDF from 'jspdf';
import { FaFilePdf, FaMoneyCheckAlt, FaBookOpen } from 'react-icons/fa';

const ParentAnalytics = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  
  // Analytics data states
  const [analytics, setAnalytics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildAnalytics(selectedChild);
    } else {
      setAnalytics(null);
      setAssignments([]);
      setOrders([]);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${serverUrl}/api/parent/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const students = res.data.students || [];
      setChildren(students);
      if (students.length > 0) {
        setSelectedChild(students[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch children:', err);
      toast.error('Failed to load linked children');
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchChildAnalytics = async (childId) => {
    setLoadingAnalytics(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all required data for the selected child
      const [attendanceRes, progressRes, gradesRes, assignmentsRes, ordersRes] = await Promise.all([
        axios.get(`${serverUrl}/api/parent/student/${childId}/attendance`, { headers }).catch(e => ({ data: { summary: [], records: [] } })),
        axios.get(`${serverUrl}/api/parent/student/${childId}/progress`, { headers }).catch(e => ({ data: { progress: [] } })),
        axios.get(`${serverUrl}/api/parent/student/${childId}/grades`, { headers }).catch(e => ({ data: { grades: [] } })),
        axios.get(`${serverUrl}/api/parent/student/${childId}/assignments`, { headers }).catch(e => ({ data: { assignments: [] } })),
        axios.get(`${serverUrl}/api/parent/student/${childId}/orders`, { headers }).catch(e => ({ data: { orders: [] } }))
      ]);

      const attendanceData = attendanceRes.data;
      const progressData = progressRes.data;
      const gradesData = gradesRes.data;
      setAssignments(assignmentsRes.data.assignments || []);
      setOrders(ordersRes.data.orders || []);

      if (attendanceData.privacyBlocked || progressData.privacyBlocked || gradesData.privacyBlocked) {
         toast.info("Some analytics data is hidden by the student's privacy settings.");
      }

      // Calculate aggregated metrics
      let totalAttendanceRate = 0;
      let attendanceCourseCount = 0;
      if (attendanceData.summary) {
        attendanceData.summary.forEach(c => {
          totalAttendanceRate += c.attendanceRate;
          attendanceCourseCount++;
        });
      }
      const avgAttendance = attendanceCourseCount > 0 ? Math.round(totalAttendanceRate / attendanceCourseCount) : 0;

      let totalScore = 0;
      let gradesCount = 0;
      if (gradesData.grades) {
        gradesData.grades.forEach(g => {
          if (g.score !== undefined && g.score !== null) {
            totalScore += g.score;
            gradesCount++;
          }
        });
      }
      const avgScore = gradesCount > 0 ? Math.round(totalScore / gradesCount) : 0;

      let completedCourses = 0;
      let reports = [];
      let chartData = [];
      
      if (progressData.progress) {
        progressData.progress.forEach(p => {
          if (p.completedLectures?.length === p.course?.lectures?.length) {
            completedCourses++;
          }
          const progressPercent = p.course?.lectures?.length ? Math.round((p.completedLectures?.length || 0) / p.course.lectures.length * 100) : 0;
          reports.push({
            title: `Progress in ${p.course?.title}`,
            courseTitle: p.course?.title,
            progressPercent,
            date: p.lastUpdated || new Date()
          });
        });
      }

      // Match attendance and progress for the comparative chart
      chartData = reports.map(r => {
          const attendance = attendanceData.summary?.find(s => s.courseTitle === r.courseTitle);
          return {
             name: r.courseTitle,
             Attendance: attendance ? attendance.attendanceRate : 0,
             Progress: r.progressPercent
          }
      });

      // Calculate pseudo time spent based on attendance logs
      const estimatedTimeSpent = (attendanceData.records?.length || 0) * 1.5; // Assume 1.5 hrs per session

      setAnalytics({
        avgAttendance,
        avgScore,
        totalCompleted: completedCourses,
        activeDays: attendanceData.records?.length || 0,
        estimatedTimeSpent,
        reports: reports, 
        attendanceSummary: attendanceData.summary || [],
        chartData,
        privacyBlocked: attendanceData.privacyBlocked && progressData.privacyBlocked
      });

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load child analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const child = children.find(c => c._id === selectedChild);
    if (!child) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`JAGAT ACADEMY`, 105, 20, null, null, "center");
    
    doc.setFontSize(16);
    doc.text(`Student Progress Report`, 105, 30, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Student Name: ${child.name}`, 20, 50);
    doc.text(`Email: ${child.email}`, 20, 58);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 66);
    
    doc.line(20, 72, 190, 72);

    doc.setFont("helvetica", "bold");
    doc.text("Performance Overview", 20, 85);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Average Attendance: ${analytics?.avgAttendance || 0}%`, 30, 95);
    doc.text(`Average Assignment Score: ${analytics?.avgScore || 0}%`, 30, 103);
    doc.text(`Total Courses Completed: ${analytics?.totalCompleted || 0}`, 30, 111);
    doc.text(`Total Active Sessions: ${analytics?.activeDays || 0}`, 30, 119);

    doc.line(20, 130, 190, 130);

    doc.setFont("helvetica", "bold");
    doc.text("Course Progress", 20, 140);
    doc.setFont("helvetica", "normal");
    
    let yPos = 150;
    if (analytics?.reports && analytics.reports.length > 0) {
        analytics.reports.forEach(r => {
            doc.text(`• ${r.courseTitle}: ${r.progressPercent}% Complete`, 30, yPos);
            yPos += 8;
            if (yPos > 270) { doc.addPage(); yPos = 20; }
        });
    } else {
        doc.text("No active courses or progress recorded.", 30, yPos);
    }

    doc.save(`${child.name.replace(/\s+/g, '_')}_Progress_Report.pdf`);
    toast.success("Report downloaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Nav />

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-12 pt-32">
        {/* Header */}
        <div className="border-b-4 border-black pb-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-start gap-4">
            <ArrowBackLongIcon className='w-6 h-6 cursor-pointer text-black hover:-translate-x-1 transition-transform mt-2' onClick={() => navigate(-1)} />
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">Analytics Hub</h1>
              <p className="text-gray-500 text-sm font-bold mt-2 tracking-wide uppercase">Deep dive into academic performance</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/parent/dashboard"
              className="bg-white border-2 border-black px-6 py-3 font-black uppercase text-xs tracking-wider hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              ← Back to Portal
            </Link>
            {analytics && !analytics.privacyBlocked && (
               <button
                 onClick={generatePDF}
                 className="bg-red-600 text-white border-2 border-red-600 px-6 py-3 font-black uppercase text-xs tracking-wider hover:bg-red-700 transition-all flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(185,28,28,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
               >
                 <FaFilePdf />
                 Download PDF Report
               </button>
            )}
          </div>
        </div>

        {loadingInitial ? (
          <div className="flex items-center justify-center py-20">
            <ClipLoader size={40} color="#000" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Switcher */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-black text-white p-4 font-black uppercase tracking-widest text-sm border-2 border-black">
                Select Profile
              </div>
              <div className="flex flex-col gap-4">
              {children.length > 0 ? (
                children.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child._id)}
                    className={`bg-white border-4 border-black p-4 text-left transition-all ${
                      selectedChild === child._id ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <p className={`font-black text-lg uppercase tracking-wider ${selectedChild === child._id ? 'text-white' : 'text-black'}`}>{child.name}</p>
                    <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${selectedChild === child._id ? 'text-gray-300' : 'text-gray-500'}`}>
                      Courses: {child.enrolledCourses?.length || 0}
                    </p>
                  </button>
                ))
              ) : (
                <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-gray-500 font-bold text-center">No children linked to your account yet.</p>
                </div>
              )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
            {selectedChild && (
              loadingAnalytics ? (
                <div className="flex items-center justify-center py-32 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <ClipLoader size={50} color="#000" />
                </div>
              ) : analytics ? (
                analytics.privacyBlocked ? (
                    <div className="bg-white border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZWVlIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]">
                        <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-3xl">🔒</span>
                        </div>
                        <p className="text-black font-black text-xl uppercase tracking-wider">Access Restricted</p>
                        <p className="text-gray-600 font-bold text-sm mt-2 max-w-md mx-auto">This student has disabled analytics visibility in their privacy settings.</p>
                    </div>
                ) : (
                <div className="space-y-8">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Avg Attendance</p>
                      <p className="text-4xl font-black text-black tracking-tighter">{analytics.avgAttendance || 0}<span className="text-xl">%</span></p>
                    </div>
                    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Avg Score</p>
                      <p className="text-4xl font-black text-black tracking-tighter">{analytics.avgScore || 0}<span className="text-xl">%</span></p>
                    </div>
                    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Platform Time (Est)</p>
                      <p className="text-4xl font-black text-black tracking-tighter">{analytics.estimatedTimeSpent}<span className="text-xl">h</span></p>
                    </div>
                    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Active Days</p>
                      <p className="text-4xl font-black text-black tracking-tighter">{analytics.activeDays || 0}</p>
                    </div>
                  </div>

                  {/* Recharts - Comparative Performance */}
                  <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <h3 className="text-sm font-black uppercase tracking-widest mb-6">Attendance vs Progress</h3>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analytics.chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ border: '4px solid black', borderRadius: 0, fontWeight: 'bold' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                            <Bar dataKey="Attendance" fill="#000000" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Assignments */}
                      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-96">
                        <div className="bg-black px-6 py-4 border-b-4 border-black flex gap-3 items-center">
                          <FaBookOpen className="text-white" />
                          <h2 className="text-white font-black uppercase tracking-widest text-sm">Upcoming Assignments</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                           {assignments.length > 0 ? (
                              <div className="space-y-3">
                                 {assignments.map(a => (
                                    <div key={a._id} className="border-2 border-black p-3 hover:bg-yellow-50 transition-colors">
                                       <p className="font-black text-sm uppercase">{a.title}</p>
                                       <p className="text-[10px] font-bold text-gray-500 mt-1">{a.course?.title}</p>
                                       <p className="text-xs font-bold mt-2 text-red-600">Due: {new Date(a.deadline).toLocaleDateString()}</p>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-gray-400 font-bold text-center mt-10 text-sm">No upcoming assignments.</p>
                           )}
                        </div>
                      </div>

                      {/* Billing / Orders */}
                      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-96">
                        <div className="bg-black px-6 py-4 border-b-4 border-black flex gap-3 items-center">
                          <FaMoneyCheckAlt className="text-white" />
                          <h2 className="text-white font-black uppercase tracking-widest text-sm">Fee & Payment Status</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                           {orders.length > 0 ? (
                              <div className="space-y-3">
                                 {orders.map(o => (
                                    <div key={o._id} className="border-2 border-black p-3 flex justify-between items-center hover:bg-green-50 transition-colors">
                                       <div>
                                          <p className="font-black text-sm uppercase truncate max-w-[150px]">{o.course?.title}</p>
                                          <p className="text-[10px] font-bold text-gray-500 mt-1">{new Date(o.createdAt).toLocaleDateString()}</p>
                                       </div>
                                       <div className="text-right">
                                          <p className="font-black text-lg text-green-600">₹{o.course?.price}</p>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-black bg-green-200 px-2 inline-block">Paid</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-gray-400 font-bold text-center mt-10 text-sm">No payment history found.</p>
                           )}
                        </div>
                      </div>
                  </div>

                  {/* Course Progress Breakdown */}
                  {analytics.reports && analytics.reports.length > 0 && (
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <div className="bg-black px-6 py-4 border-b-4 border-black">
                        <h2 className="text-white font-black uppercase tracking-widest text-sm">Course Progress Breakdown</h2>
                      </div>
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analytics.reports.map((report, index) => (
                          <div key={index} className="border-2 border-black p-4 bg-gray-50">
                             <p className="font-black text-sm uppercase tracking-wide mb-3">{report.courseTitle}</p>
                             <div className="w-full bg-white h-6 border-2 border-black relative overflow-hidden">
                                <div className="bg-black h-full transition-all duration-1000 ease-out" style={{ width: `${report.progressPercent}%` }}></div>
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black mix-blend-difference text-white">
                                  {report.progressPercent}% COMPLETED
                                </span>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
                )
              ) : null
            )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ParentAnalytics;
