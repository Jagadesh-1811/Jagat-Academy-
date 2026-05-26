import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../../App';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// jsPDF is loaded via CDN inside index.html to prevent Vite 504 Optimizer bugs

function ParentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [linkingStudent, setLinkingStudent] = useState(false);
  const [studentSearchVal, setStudentSearchVal] = useState('');
  
  // Data lists
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null); // Selected student user object

  // Active student stats & details
  const [studentProgress, setStudentProgress] = useState([]);
  const [progressBlocked, setProgressBlocked] = useState(false);

  const [studentGrades, setStudentGrades] = useState([]);
  const [gradesBlocked, setGradesBlocked] = useState(false);

  const [studentAttendance, setStudentAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [attendanceBlocked, setAttendanceBlocked] = useState(false);

  const [studentAssignments, setStudentAssignments] = useState([]);
  const [assignmentsBlocked, setAssignmentsBlocked] = useState(false);

  const [studentOrders, setStudentOrders] = useState([]);

  // Educator chat states
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [newChatCourseId, setNewChatCourseId] = useState('');
  const [composingMessage, setComposingMessage] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const messageEndRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully.');
    navigate('/parent/login');
  };

  const fetchStudentsList = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${serverUrl}/api/parent/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setLinkedStudents(res.data.students);
        if (res.data.students.length > 0 && !activeStudent) {
          setActiveStudent(res.data.students[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load students list:', err);
      toast.error('Failed to load linked student profiles.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentSearchVal.trim()) {
      toast.error('Please enter a student email or linking code.');
      return;
    }
    setLinkingStudent(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${serverUrl}/api/parent/link-student`,
        { studentEmailOrCode: studentSearchVal.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setStudentSearchVal('');
        fetchStudentsList();
      }
    } catch (err) {
      console.error('Linking error:', err);
      toast.error(err.response?.data?.message || 'Linking failed.');
    } finally {
      setLinkingStudent(false);
    }
  };

  const fetchStudentData = async (studentId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Progress
      const progRes = await axios.get(`${serverUrl}/api/parent/student/${studentId}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (progRes.data.success) {
        setProgressBlocked(progRes.data.privacyBlocked);
        setStudentProgress(progRes.data.progress || []);
      }

      // Grades
      const gradeRes = await axios.get(`${serverUrl}/api/parent/student/${studentId}/grades`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (gradeRes.data.success) {
        setGradesBlocked(gradeRes.data.privacyBlocked);
        setStudentGrades(gradeRes.data.grades || []);
      }

      // Attendance
      const attRes = await axios.get(`${serverUrl}/api/parent/student/${studentId}/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (attRes.data.success) {
        setAttendanceBlocked(attRes.data.privacyBlocked);
        setStudentAttendance(attRes.data.records || []);
        setAttendanceSummary(attRes.data.summary || []);
      }

      // Assignments
      const assignRes = await axios.get(`${serverUrl}/api/parent/student/${studentId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (assignRes.data.success) {
        setAssignmentsBlocked(assignRes.data.privacyBlocked);
        setStudentAssignments(assignRes.data.assignments || []);
      }

      // Orders
      const orderRes = await axios.get(`${serverUrl}/api/parent/student/${studentId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orderRes.data.success) {
        setStudentOrders(orderRes.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load student data details:', err);
    }
  };

  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${serverUrl}/api/parent/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const fetchChatMessages = async (convId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${serverUrl}/api/chat/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setChatMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setSendingMsg(true);
    const token = localStorage.getItem('token');
    try {
      if (activeConv) {
        // Send to existing conversation
        const res = await axios.post(
          `${serverUrl}/api/chat/send`,
          { conversationId: activeConv._id, message: newMessageText.trim(), senderRole: 'parent' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setChatMessages((prev) => [...prev, res.data.message]);
          setNewMessageText('');
          fetchConversations();
        }
      } else if (composingMessage && newChatCourseId) {
        // Find course creator (educator)
        const progressRecord = studentProgress.find((p) => p.course && p.course._id === newChatCourseId);
        const courseRes = await axios.get(`${serverUrl}/api/course/${newChatCourseId}`);
        const educatorId = courseRes.data.course?.creator;

        if (!educatorId) {
          toast.error('Could not identify educator for this course.');
          return;
        }

        const res = await axios.post(
          `${serverUrl}/api/parent/message-educator`,
          { educatorId, courseId: newChatCourseId, messageText: newMessageText.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success('Message sent! Thread started.');
          setNewMessageText('');
          setComposingMessage(false);
          setNewChatCourseId('');
          fetchConversations();
          setActiveConv(res.data.conversation);
          fetchChatMessages(res.data.conversation._id);
        }
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
      toast.error('Message failed to deliver.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleExportPDF = () => {
    if (!activeStudent) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // PDF Header Frame
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('JAGAT ACADEMY', 15, 20);
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text('STUDENT PERFORMANCE & ACADEMIC CARD', 15, 30);
    doc.text(`DATE GENERATED: ${new Date().toLocaleDateString()}`, 130, 20);

    // Student Info Panel
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('STUDENT INFORMATION', 15, 55);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, 57, 195, 57);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`NAME: ${activeStudent.name.toUpperCase()}`, 15, 66);
    doc.text(`EMAIL: ${activeStudent.email.toUpperCase()}`, 15, 73);
    doc.text(`ROLE STATUS: LINKED PROFILE`, 15, 80);

    let yOffset = 95;

    // 1. Course Progress Table
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. COURSE WATCH PROGRESS', 15, yOffset);
    doc.line(15, yOffset + 2, 195, yOffset + 2);
    yOffset += 10;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    if (progressBlocked) {
      doc.text('[DATA PRIVACY LOCK: BLOCKED BY STUDENT]', 15, yOffset);
      yOffset += 10;
    } else if (!activeStudent.enrolledCourses || activeStudent.enrolledCourses.length === 0) {
      doc.text('No active course watch records found.', 15, yOffset);
      yOffset += 10;
    } else {
      activeStudent.enrolledCourses.forEach((course) => {
        const p = studentProgress.find((record) => record.course && record.course._id === course._id);
        const total = course.lectures?.length || 1;
        const completed = p ? (p.completedLectures?.length || 0) : 0;
        const rate = Math.round((completed / total) * 100);
        doc.text(`${course.title.toUpperCase()}`, 15, yOffset);
        doc.text(`${rate}% COMPLETE (${completed}/${total} LECTURES)`, 140, yOffset);
        yOffset += 8;
      });
    }

    yOffset += 8;

    // 2. Attendance Summary
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. LECTURE ATTENDANCE RATES', 15, yOffset);
    doc.line(15, yOffset + 2, 195, yOffset + 2);
    yOffset += 10;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    if (attendanceBlocked) {
      doc.text('[DATA PRIVACY LOCK: BLOCKED BY STUDENT]', 15, yOffset);
      yOffset += 10;
    } else if (attendanceSummary.length === 0) {
      doc.text('No attendance logs registered.', 15, yOffset);
      yOffset += 10;
    } else {
      attendanceSummary.forEach((s) => {
        doc.text(`${s.courseTitle.toUpperCase()}`, 15, yOffset);
        doc.text(`${s.attendanceRate}% ATTENDANCE (${s.presentCount}/${s.totalSessions} PRESENT)`, 140, yOffset);
        yOffset += 8;
      });
    }

    yOffset += 8;

    // 3. Quiz Grades Summary
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. ASSIGNMENT EVALUATION GRADES', 15, yOffset);
    doc.line(15, yOffset + 2, 195, yOffset + 2);
    yOffset += 10;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    if (gradesBlocked) {
      doc.text('[DATA PRIVACY LOCK: BLOCKED BY STUDENT]', 15, yOffset);
      yOffset += 10;
    } else if (studentGrades.length === 0) {
      doc.text('No graded submissions published.', 15, yOffset);
      yOffset += 10;
    } else {
      studentGrades.forEach((g) => {
        const title = g.submission?.assignment?.title || 'Course Assignment';
        doc.text(`${title.toUpperCase()}`, 15, yOffset);
        doc.text(`SCORE: ${g.marks || 0} | FEEDBACK: ${g.remarks || 'EXCELLENT'}`, 140, yOffset);
        yOffset += 8;
      });
    }

    // Footnote
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('OFFICIAL VERIFIED PORTAL REPORT - SECURE B&W SYSTEM LAYOUT', 15, 280);

    doc.save(`${activeStudent.name.replace(/\s+/g, '_')}_Progress_Card.pdf`);
    toast.success('B&W Report PDF downloaded!');
  };

  useEffect(() => {
    fetchStudentsList();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeStudent) {
      fetchStudentData(activeStudent._id);
    }
  }, [activeStudent]);

  useEffect(() => {
    if (activeConv) {
      fetchChatMessages(activeConv._id);
      const intv = setInterval(() => fetchChatMessages(activeConv._id), 4000);
      return () => clearInterval(intv);
    }
  }, [activeConv]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <span className="text-xs uppercase tracking-widest">Initialising Secure Frame...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-neutral-800 py-6 px-8 flex justify-between items-center bg-neutral-950">
        <div>
          <h1 className="text-xl font-bold tracking-widest">JAGAT ACADEMY</h1>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
            Parent Control Dashboard
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-black border border-neutral-800 text-neutral-400 hover:text-white px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          [LOG OUT]
        </button>
      </header>

      {/* Main Grid Frame */}
      <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Switcher and Link Profile Module */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Student Selector Card */}
          <div className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2">
              Select Student Profile
            </h2>
            {linkedStudents.length === 0 ? (
              <p className="text-xs text-neutral-500 uppercase">No student links verified yet.</p>
            ) : (
              <div className="space-y-2">
                {linkedStudents.map((stu) => (
                  <button
                    key={stu._id}
                    onClick={() => setActiveStudent(stu)}
                    className={`w-full text-left p-3 text-xs uppercase tracking-wider transition-colors block border ${
                      activeStudent?._id === stu._id
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-white border-neutral-800 hover:border-white'
                    }`}
                  >
                    {stu.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Link Student Card */}
          <div className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2">
              Link Profile Connection
            </h2>
            <form onSubmit={handleLinkStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-neutral-400 mb-1.5">
                  Student Email or Code
                </label>
                <input
                  type="text"
                  value={studentSearchVal}
                  onChange={(e) => setStudentSearchVal(e.target.value)}
                  placeholder="JAGT-STU-XXXXXX or email"
                  className="w-full bg-black border border-neutral-850 px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono rounded-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={linkingStudent}
                className="w-full bg-white text-black hover:bg-neutral-200 transition-colors py-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer disabled:opacity-50"
              >
                {linkingStudent ? 'LINKING...' : '[LINK PROFILE]'}
              </button>
            </form>
          </div>

          {/* Conversations Chat Module */}
          <div className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2 flex justify-between items-center">
              <span>Educator Chats</span>
              <button
                onClick={fetchConversations}
                className="text-[9px] text-neutral-500 underline hover:text-white"
              >
                [REFRESH]
              </button>
            </h2>

            {/* Direct Message New Starter Trigger */}
            {activeStudent && (
              <button
                onClick={() => {
                  setComposingMessage(true);
                  setActiveConv(null);
                }}
                className="w-full text-center py-2 text-[10px] font-bold border border-dashed border-neutral-800 uppercase hover:border-white text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                [+ INITIATE CHAT]
              </button>
            )}

            {conversations.length === 0 ? (
              <p className="text-[10px] text-neutral-600 uppercase pt-2">No chat threads found.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setActiveConv(conv);
                      setComposingMessage(false);
                    }}
                    className={`w-full text-left p-2.5 text-[10px] uppercase border transition-colors block ${
                      activeConv?._id === conv._id
                        ? 'bg-neutral-800 text-white border-white'
                        : 'bg-black text-neutral-400 border-neutral-900 hover:border-neutral-700'
                    }`}
                  >
                    <span className="block font-bold truncate text-white">{conv.educator?.name}</span>
                    <span className="block text-[8px] text-neutral-500 truncate mt-0.5">{conv.course?.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Active Student Insights, Privacy Gates, and Exporter */}
        <main className="lg:col-span-9 space-y-8">
          
          {activeStudent ? (
            <div className="space-y-8">
              
              {/* Header card with metadata and PDF Exporter */}
              <div className="bg-neutral-950 border border-neutral-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight uppercase">
                    Student: {activeStudent.name}
                  </h2>
                  <p className="text-xs uppercase text-neutral-400 tracking-wider font-mono">
                    Email: {activeStudent.email} | Linked Context
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 self-start md:self-auto">
                  <button
                    onClick={() => navigate(`/parent/analytics/${activeStudent._id}`)}
                    className="border border-white text-white hover:bg-white hover:text-black transition-colors px-4 py-3 text-xs uppercase font-bold tracking-widest cursor-pointer"
                  >
                    [VIEW COHORT ANALYTICS]
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="bg-white text-black hover:bg-neutral-200 transition-colors px-4 py-3 text-xs uppercase font-bold tracking-widest cursor-pointer"
                  >
                    [DOWNLOAD B&W PDF REPORT]
                  </button>
                </div>
              </div>

              {/* Grid: Watch Progress and Attendance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Course Completion / Watch Progress */}
                <section className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2">
                    Course Watch Progress
                  </h3>

                  {progressBlocked ? (
                    <div className="border border-neutral-900 p-8 text-center text-xs text-neutral-500 uppercase tracking-widest">
                      [DATA PRIVACY GATED BY STUDENT]
                    </div>
                  ) : !activeStudent.enrolledCourses || activeStudent.enrolledCourses.length === 0 ? (
                    <p className="text-xs text-neutral-500 uppercase">No active courses enrolled yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {activeStudent.enrolledCourses.map((course) => {
                        const p = studentProgress.find((record) => record.course && record.course._id === course._id);
                        const total = course.lectures?.length || 1;
                        const completed = p ? (p.completedLectures?.length || 0) : 0;
                        const rate = Math.round((completed / total) * 100);
                        return (
                          <div key={course._id} className="space-y-1">
                            <div className="flex justify-between text-xs uppercase tracking-wider">
                              <span className="font-semibold truncate pr-2">{course.title}</span>
                              <span className="font-mono">{rate}%</span>
                            </div>
                            {/* B&W Custom progress bar */}
                            <div className="w-full h-3 bg-black border border-neutral-800 rounded-none overflow-hidden">
                              <div
                                className="h-full bg-white transition-all duration-500"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Attendance Summary Panel */}
                <section className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2">
                    Lecture Attendance Rates
                  </h3>

                  {attendanceBlocked ? (
                    <div className="border border-neutral-900 p-8 text-center text-xs text-neutral-500 uppercase tracking-widest">
                      [DATA PRIVACY GATED BY STUDENT]
                    </div>
                  ) : attendanceSummary.length === 0 ? (
                    <p className="text-xs text-neutral-500 uppercase">No attendance history logs recorded.</p>
                  ) : (
                    <div className="space-y-4">
                      {attendanceSummary.map((s) => (
                        <div key={s.courseId} className="space-y-2">
                          <div className="flex justify-between text-xs uppercase tracking-wider">
                            <span className="font-semibold truncate pr-2">{s.courseTitle}</span>
                            <span className="font-mono">{s.attendanceRate}%</span>
                          </div>
                          {/* High Contrast B&W Grid Indicator */}
                          <div className="flex gap-1 h-4 bg-black border border-neutral-900 p-0.5">
                            {Array.from({ length: 10 }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`flex-grow h-full ${
                                  idx < Math.round(s.attendanceRate / 10) ? 'bg-white' : 'bg-neutral-950'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="block text-[9px] text-neutral-500 uppercase tracking-wider">
                            Attended: {s.presentCount} of {s.totalSessions} sessions
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Row 2: Grades & Assignments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Published Grades */}
                <section className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2">
                    Evaluated Quiz / Submission Grades
                  </h3>

                  {gradesBlocked ? (
                    <div className="border border-neutral-900 p-8 text-center text-xs text-neutral-500 uppercase tracking-widest">
                      [DATA PRIVACY GATED BY STUDENT]
                    </div>
                  ) : studentGrades.length === 0 ? (
                    <p className="text-xs text-neutral-500 uppercase">No grades evaluations published yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {studentGrades.map((grade) => (
                        <div key={grade._id} className="p-3 bg-black border border-neutral-900 space-y-1">
                          <span className="block text-xs uppercase font-bold tracking-wider text-white">
                            {grade.submission?.assignment?.title || 'Course Evaluation Task'}
                          </span>
                          <div className="flex justify-between text-[10px] text-neutral-400 font-mono uppercase">
                            <span>Score: {grade.marks || 0}</span>
                            <span>Grade: {grade.grade || 'N/A'}</span>
                          </div>
                          {grade.remarks && (
                            <p className="text-[10px] text-neutral-500 uppercase border-t border-neutral-950 pt-1 mt-1 font-mono">
                              * {grade.remarks}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Upcoming Assignments deadlines */}
                <section className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2">
                    Upcoming Course Tasks
                  </h3>

                  {assignmentsBlocked ? (
                    <div className="border border-neutral-900 p-8 text-center text-xs text-neutral-500 uppercase tracking-widest">
                      [DATA PRIVACY GATED BY STUDENT]
                    </div>
                  ) : studentAssignments.length === 0 ? (
                    <p className="text-xs text-neutral-500 uppercase">No upcoming task deadlines found.</p>
                  ) : (
                    <div className="space-y-3">
                      {studentAssignments.map((assign) => (
                        <div key={assign._id} className="p-3 bg-black border border-neutral-900 flex justify-between items-center">
                          <div>
                            <span className="block text-xs uppercase font-bold text-white tracking-wider">
                              {assign.title}
                            </span>
                            <span className="block text-[8px] text-neutral-500 uppercase tracking-widest">
                              Course: {assign.course?.title}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] text-neutral-300 font-mono">
                              {new Date(assign.deadline).toLocaleDateString()}
                            </span>
                            <span className="block text-[8px] uppercase tracking-widest text-neutral-500 font-bold">
                              DEADLINE
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Billing Order Histories */}
              <section className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
                <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-2">
                  Invoice & Order History
                </h3>
                {studentOrders.length === 0 ? (
                  <p className="text-xs text-neutral-500 uppercase">No payment invoice logs reported.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-neutral-800 text-neutral-500 uppercase">
                          <th className="py-2">Course Title</th>
                          <th className="py-2">Price Paid</th>
                          <th className="py-2">Date Purchased</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentOrders.map((order) => (
                          <tr key={order._id} className="border-b border-neutral-900 uppercase">
                            <td className="py-3 font-semibold text-white">{order.course?.title || 'Standard Course'}</td>
                            <td className="py-3 font-mono">INR {order.course?.price || 0}</td>
                            <td className="py-3 text-neutral-400 font-mono">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Chat Window Box overlay inside Dashboard */}
              {(activeConv || composingMessage) && (
                <section className="bg-neutral-950 border border-neutral-800 p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        {activeConv ? `Messaging: ${activeConv.educator?.name}` : 'Initiate Conversation'}
                      </h4>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
                        {activeConv ? `Course Thread: ${activeConv.course?.title}` : 'Choose Educator & Send message'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveConv(null);
                        setComposingMessage(false);
                      }}
                      className="text-xs text-neutral-400 hover:text-white underline"
                    >
                      [CLOSE CHAT]
                    </button>
                  </div>

                  {/* Form to Select Educator course and Compose message */}
                  {composingMessage && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase text-neutral-500 mb-1">
                          Select Enrolled Course
                        </label>
                        <select
                          value={newChatCourseId}
                          onChange={(e) => setNewChatCourseId(e.target.value)}
                          className="bg-black border border-neutral-800 text-xs px-3 py-2 text-white focus:outline-none focus:border-white w-full rounded-none"
                        >
                          <option value="">-- CHOOSE A COURSE --</option>
                          {studentProgress.map((p) => {
                            if (!p.course) return null;
                            return (
                              <option key={p.course._id} value={p.course._id}>
                                {p.course.title.toUpperCase()}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Existing Messages list log */}
                  {activeConv && (
                    <div className="bg-black border border-neutral-900 p-4 h-64 overflow-y-auto space-y-3">
                      {chatMessages.length === 0 ? (
                        <p className="text-[10px] text-neutral-600 uppercase text-center py-12">No messages in this chat yet.</p>
                      ) : (
                        chatMessages.map((msg) => {
                          const isParent = msg.senderRole === 'parent';
                          return (
                            <div key={msg._id} className={`flex flex-col ${isParent ? 'items-end' : 'items-start'}`}>
                              <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono mb-0.5">
                                {isParent ? 'YOU' : 'EDUCATOR'}
                              </span>
                              <div
                                className={`px-3 py-2 text-xs ${
                                  isParent ? 'bg-white text-black' : 'bg-neutral-850 text-white'
                                } max-w-xs`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messageEndRef} />
                    </div>
                  )}

                  {/* Send chat message bar */}
                  {(activeConv || (composingMessage && newChatCourseId)) && (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Enter message..."
                        className="flex-grow bg-black border border-neutral-800 text-xs px-4 py-2.5 text-white focus:outline-none focus:border-white rounded-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={sendingMsg}
                        className="bg-white text-black hover:bg-neutral-200 transition-colors px-6 text-xs uppercase font-bold tracking-widest cursor-pointer disabled:opacity-50"
                      >
                        [SEND]
                      </button>
                    </form>
                  )}
                </section>
              )}

            </div>
          ) : (
            <div className="bg-neutral-950 border border-neutral-800 p-12 text-center space-y-6">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight">Welcome to Parent Portal</h2>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-2">
                  No active student profile connections selected.
                </p>
              </div>
              <div className="max-w-xs mx-auto border border-dashed border-neutral-850 p-6 text-xs uppercase text-neutral-400">
                To link a student profile, enter their JAGT-STU linking code in the connecting segment in the left panel.
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-8 text-center text-xs text-neutral-600 uppercase tracking-widest bg-neutral-950">
        &copy; {new Date().getFullYear()} JAGAT ACADEMY. HIGH-CONTRAST SECURE FRAME.
      </footer>
    </div>
  );
}

export default ParentDashboard;
