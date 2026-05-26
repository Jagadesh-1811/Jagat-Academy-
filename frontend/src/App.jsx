import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { ToastContainer } from 'react-toastify';
import ForgotPassword from './pages/ForgotPassword'
import getCurrentUser from './customHooks/getCurrentUser'
import { useSelector } from 'react-redux'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Dashboard from './pages/teacher/Dashboard'
import Courses from './pages/teacher/Courses'
import AllCouses from './pages/AllCouses'
import AddCourses from './pages/teacher/AddCourses'
import TeacherAssignments from './pages/teacher/Assignments'
import CreateCourse from './pages/teacher/CreateCourse'
import CreateLecture from './pages/teacher/CreateLecture'
import EditLecture from './pages/teacher/EditLecture'
import CreateAssignment from './pages/teacher/CreateAssignment'

import getCouseData from './customHooks/getCouseData'
import ViewCourse from './pages/ViewCourse'
import ScrollToTop from './components/ScrollToTop'
import CertificateVerify from './pages/CertificateVerify'
import getCreatorCourseData from './customHooks/getCreatorCourseData'
import EnrolledCourse from './pages/EnrolledCourse'
import ViewLecture from './pages/ViewLecture'
import SearchWithAi from './pages/SearchWithAi'
import About from './pages/About'
import Feedback from './pages/Feedback'
import getAllReviews from './customHooks/getAllReviews'
import StudentDashboard from './pages/Dashboard.jsx'
import CertificateManager from './pages/teacher/CertificateManager'
import CreateDoubtSession from './pages/teacher/CreateDoubtSession';
import MaterialsManager from './pages/teacher/MaterialsManager';
import AdminFeedbackManager from './pages/admin/FeedbackManager';
import AdminLogin from './pages/admin/AdminLogin';
import Contact from './pages/Contact';
import StudentVoiceRequest from './pages/StudentVoiceRequest';
import TeacherCallRequests from './pages/teacher/TeacherCallRequests';
import AdminVoiceMonitor from './pages/admin/AdminVoiceMonitor';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import CookiePolicy from './pages/CookiePolicy';
import CookieConsent from './components/CookieConsent';

import FinishSignUp from './pages/FinishSignUp';
import AdminDoubtSessions from './pages/admin/AdminDoubtSessions';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailPage from './pages/VerifyEmailPage';
import EducatorLogin from './pages/educator/EducatorLogin';
import EducatorSignUp from './pages/educator/EducatorSignUp';
import EducatorApprovals from './pages/admin/EducatorApprovals';
import AuthProvider from './components/AuthProvider';
import AttendanceView from './pages/student/AttendanceView';
import AttendanceManager from './pages/teacher/AttendanceManager';
import ParentLogin from './pages/parent/ParentLogin';
import ParentSignUp from './pages/parent/ParentSignUp';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentSettings from './pages/student/ParentSettings';
import StudentAnalytics from './pages/student/StudentAnalytics';
import ParentAnalytics from './pages/parent/ParentAnalytics';
import ParentMessages from './pages/parent/ParentMessages';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import CourseDiscussion from './pages/CourseDiscussion';
import ResumeGenerator from './pages/student/ResumeGenerator';

// Lazy loaded heavy components
const GamificationHub = React.lazy(() => import('./pages/student/GamificationHub'));
const AICoursesGenerator = React.lazy(() => import('./pages/AICoursesGenerator'));
const AICoursesReview = React.lazy(() => import('./pages/AICoursesReview'));
const VoiceRoom = React.lazy(() => import('./components/VoiceRoom'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const EducatorAnalytics = React.lazy(() => import('./pages/teacher/EducatorAnalytics'));

import CelebrationModal from './components/CelebrationModal';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';


// Admin Route Protection Component
const AdminProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};


// Remove trailing slash from URL if present to avoid double slashes in routes
export const serverUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
function App() {

  let { userData } = useSelector(state => state.user)

  // Gamification real-time trigger states
  const [celebOpen, setCelebOpen] = React.useState(false);
  const [celebData, setCelebData] = React.useState(null);
  const [celebType, setCelebType] = React.useState('badge');

  React.useEffect(() => {
    if (!userData || !userData._id || userData.role !== 'student') return;

    const socket = io(serverUrl);
    socket.emit('register', userData._id);

    socket.on('badge:unlocked', (payload) => {
      setCelebType('badge');
      setCelebData(payload);
      setCelebOpen(true);
      toast.success(`🏅 Achievement Unlocked: ${payload.badge?.name}!`);
    });

    socket.on('level:up', (payload) => {
      setCelebType('level-up');
      setCelebData(payload);
      setCelebOpen(true);
      toast.success(`⚡ Level Up! Reached Level ${payload.level}!`);
    });

    return () => {
      socket.disconnect();
    };
  }, [userData?._id]);

  getCurrentUser()
  getCouseData()
  getCreatorCourseData()
  getAllReviews()
  return (
    <>
      {/* Firebase Auth Token Refresh Provider */}
      <AuthProvider />

      <ToastContainer />
      <ScrollToTop />
      <CookieConsent />
      <CelebrationModal isOpen={celebOpen} onClose={() => setCelebOpen(false)} data={celebData} type={celebType} />
      
      <React.Suspense fallback={
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      }>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={userData?.role !== "student" ? <Auth /> : <Navigate to={"/"} />} />
          <Route path='/about' element={<About />} />
          <Route path='/feedback' element={<Feedback />} />
          <Route path='/signup' element={userData?.role !== "student" ? <Auth /> : <Navigate to={"/"} />} />
          <Route path='/profile' element={userData ? <Profile /> : <Navigate to={"/signup"} />} />
          <Route path='/allcourses' element={userData ? <AllCouses /> : <Navigate to={"/signup"} />} />
          <Route path='/viewcourse/:courseId' element={userData ? <ViewCourse /> : <Navigate to={"/signup"} />} />
          <Route path='/course-discussion/:courseId' element={userData ? <CourseDiscussion /> : <Navigate to={"/signup"} />} />
          <Route path='/editprofile' element={userData ? <EditProfile /> : <Navigate to={"/signup"} />} />
          <Route path='/enrolledcourses' element={userData ? <EnrolledCourse /> : <Navigate to={"/signup"} />} />
          <Route path='/viewlecture/:courseId' element={userData ? <ViewLecture /> : <Navigate to={"/signup"} />} />
          <Route path='/searchwithai' element={userData ? <SearchWithAi /> : <Navigate to={"/signup"} />} />
          <Route path='/gamification' element={userData ? <GamificationHub /> : <Navigate to={"/signup"} />} />
          <Route path='/ai-courses' element={userData?.role === "student" ? <AICoursesGenerator /> : <Navigate to={"/signup"} />} />
          <Route path='/ai-courses-review' element={userData?.role === "educator" ? <AICoursesReview /> : <Navigate to={"/signup"} />} />

          <Route path='/dashboard' element={
            userData?.role === "educator"
              ? <Navigate to="/teacher/dashboard" />
              : userData?.role === "student"
                ? <StudentDashboard />
                : <Navigate to={"/signup"} />
          } />

          {/* Explicit teacher dashboard route */}
          <Route path='/teacher/dashboard' element={userData?.role === "educator" ? <Dashboard /> : <Navigate to="/signup" />} />
          <Route path='/courses' element={userData?.role === "educator" ? <Courses /> : <Navigate to={"/signup"} />} />
          <Route path='/addcourses/:courseId' element={userData?.role === "educator" ? <AddCourses /> : <Navigate to={"/signup"} />} />
          <Route path='/createcourses' element={userData?.role === "educator" ? <CreateCourse /> : <Navigate to={"/signup"} />} />
          <Route path='/createlecture/:courseId' element={userData?.role === "educator" ? <CreateLecture /> : <Navigate to={"/signup"} />} />
          <Route path='/editlecture/:courseId/:lectureId' element={userData?.role === "educator" ? <EditLecture /> : <Navigate to={"/signup"} />} />
          <Route path='/admin/assignments/:courseId' element={userData?.role === "educator" ? <TeacherAssignments /> : <Navigate to={"/signup"} />} />
          <Route path='/admin/create-assignment/:courseId' element={userData?.role === "educator" ? <CreateAssignment /> : <Navigate to={"/signup"} />} />
          <Route path='/admin/create-doubt-session/:courseId' element={userData?.role === "educator" ? <CreateDoubtSession /> : <Navigate to={"/signup"} />} />
          <Route path='/teacher/materials/:courseId' element={userData?.role === "educator" ? <MaterialsManager /> : <Navigate to={"/signup"} />} />
          <Route path='/admin/certificate-manager' element={userData?.role === "educator" ? <CertificateManager /> : <Navigate to={"/signup"} />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/admin/feedback-manager' element={<AdminProtectedRoute><AdminFeedbackManager /></AdminProtectedRoute>} />
          <Route path='/admin/dashboard' element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/voice-request' element={userData?.role === "student" ? <StudentVoiceRequest /> : <Navigate to={"/signup"} />} />
          <Route path='/voice-room/:roomId' element={userData ? <VoiceRoom /> : <Navigate to={"/signup"} />} />
          <Route path='/teacher-call-requests' element={userData?.role === "educator" ? <TeacherCallRequests /> : <Navigate to={"/signup"} />} />
          <Route path='/admin/voice-monitor' element={<AdminProtectedRoute><AdminVoiceMonitor /></AdminProtectedRoute>} />
          <Route path='/admin/doubt-sessions' element={<AdminProtectedRoute><AdminDoubtSessions /></AdminProtectedRoute>} />
          <Route path='/admin/educator-approvals' element={<AdminProtectedRoute><EducatorApprovals /></AdminProtectedRoute>} />
          <Route path='/forgotpassword' element={<ForgotPassword />} />

          {/* Legal Pages */}
          <Route path='/terms' element={<TermsAndConditions />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/refund' element={<RefundPolicy />} />
          <Route path='/cookies' element={<CookiePolicy />} />

          {/* Email Verification Routes */}
          <Route path='/verify-email/:token' element={<VerifyEmailPage />} />
          <Route path='/verify-email-sent' element={<VerifyEmail />} />
          <Route path='/finishSignUp' element={<FinishSignUp />} />

          {/* Educator Authentication - Separate from Student Auth */}
          <Route path='/educator/login' element={userData?.role !== "educator" ? <EducatorLogin /> : <Navigate to={"/teacher/dashboard"} />} />
          <Route path='/educator/signup' element={userData?.role !== "educator" ? <EducatorSignUp /> : <Navigate to={"/teacher/dashboard"} />} />

          {/* Attendance Management Routes */}
          <Route path='/attendance/:courseId' element={userData ? <AttendanceView /> : <Navigate to={"/signup"} />} />
          <Route path='/attendance' element={userData ? <AttendanceView /> : <Navigate to={"/signup"} />} />
          <Route path='/teacher/attendance/:courseId' element={userData?.role === "educator" ? <AttendanceManager /> : <Navigate to={"/signup"} />} />

          {/* Parent Portal Routes */}
          <Route path='/parent/login' element={userData?.role !== "parent" ? <ParentLogin /> : <Navigate to={"/parent/dashboard"} />} />
          <Route path='/parent/signup' element={userData?.role !== "parent" ? <ParentSignUp /> : <Navigate to={"/parent/dashboard"} />} />
          <Route path='/parent/dashboard' element={userData?.role === "parent" ? <ParentDashboard /> : <Navigate to={"/parent/login"} />} />
          <Route path='/student/parent-settings' element={userData?.role === "student" ? <ParentSettings /> : <Navigate to={"/signup"} />} />

          {/* Analytics & Reporting Routes */}
          <Route path='/student/analytics' element={userData?.role === "student" ? <StudentAnalytics /> : <Navigate to={"/signup"} />} />
          <Route path='/resume-generator' element={userData?.role === "student" ? <ResumeGenerator /> : <Navigate to={"/signup"} />} />
          <Route path='/teacher/analytics' element={userData?.role === "educator" ? <EducatorAnalytics /> : <Navigate to={"/signup"} />} />
          <Route path='/parent/analytics' element={userData?.role === "parent" ? <ParentAnalytics /> : <Navigate to={"/parent/login"} />} />
          <Route path='/parent/messages' element={userData?.role === "parent" ? <ParentMessages /> : <Navigate to={"/parent/login"} />} />
          <Route path='/admin/analytics' element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />

          {/* Public Certificate Verification – no login required (accessed via QR code) */}
          <Route path='/verify/:certId' element={<CertificateVerify />} />
          <Route path='/verify' element={<CertificateVerify />} />

        </Routes>
      </React.Suspense>

    </>

  )
}

export default App
