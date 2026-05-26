import axios from 'axios';
import React, { useEffect, useState } from 'react'
import img from '../assets/empty.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ChatWindow from '../components/ChatWindow';
import AIDoubtAssistant from '../components/AIDoubtAssistant';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { setSelectedCourseData } from '../redux/courseSlice';
import { setModuleData, toggleModuleExpand } from '../redux/moduleSlice';
import {
  FaArrowLeft,
  FaLock,
  FaPlayCircle,
  FaComment,
  FaRobot,
  FaCheckCircle,
  FaTimesCircle,
  FaCircle,
  FaMicrophone,
  FaStar,
  FaComments,
  FaUsers
} from 'react-icons/fa';

const getGradeColor = (grade, isBackground = false) => {
  switch (grade) {
    case 'A': return isBackground ? '#D4EDDA' : '#28A745';
    case 'B': return isBackground ? '#CCE5FF' : '#007BFF';
    case 'C': return isBackground ? '#FFF3CD' : '#FFC107';
    case 'D': return isBackground ? '#F8D7DA' : '#DC3545';
    default: return isBackground ? '#E2E6EA' : '#6C757D';
  }
};

function ViewCourse() {

  const { courseId } = useParams();
  const navigate = useNavigate()
  const { courseData } = useSelector(state => state.course)
  const { userData, token } = useSelector(state => state.user)
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [creatorData, setCreatorData] = useState(null)
  const dispatch = useDispatch()
  const { lectureData } = useSelector(state => state.lecture)
  const { selectedCourseData } = useSelector(state => state.course)
  const { expandedModules } = useSelector(state => state.module)
  const [selectedCreatorCourse, setSelectedCreatorCourse] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submissionLinks, setSubmissionLinks] = useState({});
  const [studentSubmissionsWithGrades, setStudentSubmissionsWithGrades] = useState([]);
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [fetchingMaterials, setFetchingMaterials] = useState(true);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [doubtSession, setDoubtSession] = useState(null);
  const [educatorLiveRoom, setEducatorLiveRoom] = useState(null);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [courseModules, setCourseModules] = useState([]);
  const [courseProgress, setCourseProgress] = useState(0);
  const [claimingCertificate, setClaimingCertificate] = useState(false);
  const [fullCourseData, setFullCourseData] = useState(null);

  const handleJoinVoiceRoom = async (roomId) => {
    if (!roomId) {
      toast.error("Invalid room ID");
      return;
    }
    setJoiningRoom(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/voice-room/join/${roomId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Joining room...");
        navigate(`/voice-room/${roomId}`);
      }
    } catch (error) {
      console.error("Join room error:", error);
      toast.error(error.response?.data?.message || "Failed to join room");
    } finally {
      setJoiningRoom(false);
    }
  };

  const handleAssignmentSubmit = async (assignmentId) => {
    try {
      const submissionLink = submissionLinks[assignmentId];
      if (!submissionLink) {
        toast.error("Please provide a submission link.");
        return;
      }
      const { data } = await axios.post(
        `${serverUrl}/api/submission/submit`,
        { assignmentId, submissionLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error(error.response?.data?.message || error.message || "An unexpected error occurred.");
    }
  };

  const handleReview = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating (1-5 stars).");
      return;
    }
    try {
      const result = await axios.post(serverUrl + "/api/review/givereview", { rating, comment, courseId }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success("Review Added")
      console.log(result.data)
      setRating(0)
      setComment("")
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating(selectedCourseData?.reviews);

  const fetchCourseData = async () => {
    courseData.map((item) => {
      if (item && item._id === courseId) {
        dispatch(setSelectedCourseData(item))
        console.log(selectedCourseData)
        return null;
      }
    })
  }

  const checkEnrollment = () => {
    const verify = userData?.enrolledCourses?.some(c => {
      const enrolledId = (c && typeof c === 'object') ? c._id : c;
      return enrolledId?.toString() === courseId?.toString();
    });
    console.log("Enrollment verified:", verify);
    setIsEnrolled(!!verify);
  };

  useEffect(() => {
    const fetchModules = async () => {
      if (courseId && token) {
        try {
          const result = await axios.get(
            `${serverUrl}/api/module/course/${courseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const modules = result.data.modules || [];
          setCourseModules(modules);
          dispatch(setModuleData(modules));
          if (selectedCourseData) {
            dispatch(setSelectedCourseData({ ...selectedCourseData, modules: modules }));
          }
        } catch (error) {
          console.error('Error fetching modules:', error);
          if (error.response?.status !== 404) {
            console.log('Failed to fetch modules');
          }
        }
      }
    };
    fetchModules();
  }, [courseId, token, dispatch]);

  useEffect(() => {
    fetchCourseData()
    checkEnrollment()
  }, [courseId, courseData, lectureData, userData])

  // Fetch full course with populated assignments & quizzes
  useEffect(() => {
    const fetchFullCourse = async () => {
      if (!courseId || !token) return;
      try {
        const res = await axios.get(`${serverUrl}/api/course/getcourselectures/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFullCourseData(res.data);
      } catch (err) {
        console.error('Full course fetch error:', err);
      }
    };
    fetchFullCourse();
  }, [courseId, token]);

  useEffect(() => {
    const fetchStudentGrades = async () => {
      if (userData?._id && courseId) {
        try {
          const result = await axios.get(`${serverUrl}/api/grade/student`, { headers: { Authorization: `Bearer ${token}` } });
          const gradesForCurrentCourse = result.data.grades.filter(grade =>
            grade.submission?.assignment?.course?._id === courseId
          );
          setStudentSubmissionsWithGrades(gradesForCurrentCourse);
        } catch (error) {
          console.error("Error fetching student grades:", error);
          toast.error(error.response?.data?.message || "Failed to fetch student grades.");
        }
      }
    };
    const fetchCourseMaterials = async () => {
      if (isEnrolled) {
        try {
          setFetchingMaterials(true);
          const response = await axios.get(`${serverUrl}/api/material/course/${courseId}/materials`, { headers: { Authorization: `Bearer ${token}` } });
          setCourseMaterials(response.data);
        } catch (error) {
          console.error("Error fetching course materials:", error);
          toast.error(error.response?.data?.message || "Failed to fetch course materials.");
        } finally {
          setFetchingMaterials(false);
        }
      }
    };
    const fetchCourseQuizzes = async () => {
      if (isEnrolled) {
        try {
          const response = await axios.get(`${serverUrl}/api/quiz/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
          setCourseQuizzes(response.data.quizzes);
        } catch (error) {
          console.error("Error fetching course quizzes:", error);
          toast.error(error.response?.data?.message || "Failed to fetch course quizzes.");
        }
      }
    };
    const fetchDoubtSession = async () => {
      if (isEnrolled) {
        try {
          const response = await axios.get(`${serverUrl}/api/doubt-session/doubt-session/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
          setDoubtSession(response.data[0]);
        } catch (error) {
          console.error("Error fetching doubt session:", error);
          if (error.response?.status !== 404) {
            toast.error(error.response?.data?.message || "Failed to fetch doubt session.");
          }
        }
      }
    };
    const fetchCourseProgress = async () => {
      if (isEnrolled && userData?._id) {
        try {
          const response = await axios.get(`${serverUrl}/api/progress/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
          setCourseProgress(response.data.progressPercentage || 0);
        } catch (error) {
          console.error("Error fetching course progress:", error);
        }
      }
    };
    fetchStudentGrades();
    fetchCourseMaterials();
    fetchCourseQuizzes();
    fetchDoubtSession();
    fetchCourseProgress();
  }, [courseId, userData?._id, isEnrolled, token]);

  useEffect(() => {
    const getCreator = async () => {
      if (selectedCourseData?.creator) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/course/getcreator`,
            { userId: selectedCourseData.creator },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCreatorData(result.data);
          console.log(result.data)
        } catch (error) {
          console.error("Error fetching creator:", error);
        }
      }
    };
    getCreator();
  }, [selectedCourseData, token]);

  useEffect(() => {
    const fetchEducatorLiveRoom = async () => {
      if (creatorData?._id && isEnrolled && token) {
        try {
          const response = await axios.get(
            `${serverUrl}/api/voice-room/educator/${creatorData._id}/live`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.hasLiveRoom) {
            setEducatorLiveRoom(response.data.room);
          } else {
            setEducatorLiveRoom(null);
          }
        } catch (error) {
          console.error("Error fetching educator live room:", error);
        }
      }
    };
    fetchEducatorLiveRoom();
    const interval = setInterval(fetchEducatorLiveRoom, 10000);
    return () => clearInterval(interval);
  }, [creatorData?._id, isEnrolled, token]);

  useEffect(() => {
    if (creatorData?._id && courseData.length > 0) {
      const creatorCourses = courseData.filter(
        (course) => course.creator === creatorData._id && course && course._id !== courseId
      );
      setSelectedCreatorCourse(creatorCourses);
    }
  }, [creatorData, courseData]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnroll = async (courseId, userId) => {
    if (!userId) {
      toast.error("Please log in to enroll in the course.");
      return;
    }
    try {
      toast.info("Processing Sandbox Mock Enrollment...");
      try {
        const verifyRes = await axios.post(serverUrl + "/api/payment/verify-payment", {
          razorpay_order_id: "mock_order",
          razorpay_payment_id: "bypass",
          razorpay_signature: "mock_sig",
          courseId,
          userId
        }, { headers: { Authorization: `Bearer ${token}` } });
        setIsEnrolled(true);
        toast.success("Sandbox Enrollment Successful!");
        const updatedUserResult = await axios.get(serverUrl + "/api/user/currentuser", { headers: { Authorization: `Bearer ${token}` } });
        dispatch(setUserData(updatedUserResult.data));
        return;
      } catch (sandboxError) {
        console.warn("Direct Sandbox bypass failed, falling back to Razorpay...", sandboxError);
      }
      const orderData = await axios.post(serverUrl + "/api/payment/create-order", { courseId, userId }, { headers: { Authorization: `Bearer ${token}` } });
      console.log(orderData)
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: "INR",
        name: "Jagat Academy",
        description: "Course Enrollment Payment",
        order_id: orderData.data.id,
        handler: async function (response) {
          console.log("Razorpay Response:", response);
          try {
            const verifyRes = await axios.post(serverUrl + "/api/payment/verify-payment", { ...response, courseId, userId }, { headers: { Authorization: `Bearer ${token}` } });
            setIsEnrolled(true)
            toast.success(verifyRes.data.message);
            const updatedUserResult = await axios.get(serverUrl + "/api/user/currentuser", { headers: { Authorization: `Bearer ${token}` } })
            dispatch(setUserData(updatedUserResult.data))
          } catch (verifyError) {
            toast.error("Payment verification failed.");
            console.error("Verification Error:", verifyError);
          }
        },
      };
      
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load payment gateway.");
        return;
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error("Something went wrong while enrolling.");
      console.error("Enroll Error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Nav />
      <div className="flex-grow w-full p-6">
      <div className="max-w-6xl mx-auto bg-white border-4 border-black p-6 space-y-6 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            {selectedCourseData?.thumbnail ? <img src={selectedCourseData?.thumbnail} alt="Course Thumbnail" className="w-full object-cover border-2 border-black" /> : <img src={img} alt="Course Thumbnail" className="w-full object-cover border-2 border-black" />}
          </div>
          <div className="flex-1 space-y-2 mt-[20px]">
            <h1 className="text-2xl font-black uppercase tracking-tight">{selectedCourseData?.title}</h1>
            <p className="text-gray-600 font-bold">{selectedCourseData?.subTitle}</p>
            <div className="flex items-start flex-col justify-between">
              <div className="text-black font-black flex items-center gap-1 text-sm">
                <FaStar className="text-black" /> {avgRating} <span className="text-gray-500">(1,200 reviews)</span>
              </div>
              <div>
                <span className="text-lg font-black text-black">{selectedCourseData?.price}</span>
                <span className="line-through text-sm text-gray-400 ml-1">₹599</span>
              </div>
            </div>
            <ul className="text-sm font-bold text-gray-700 space-y-1 pt-2">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-gray-700" /> 10+ hours of video content</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-gray-700" /> Lifetime access to course materials</li>
            </ul>
            {!isEnrolled ? <button className="bg-black text-white px-6 py-2 border-2 border-black font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none mt-3" onClick={() => handleEnroll(courseId, userData?._id)}>
              Enroll Now
            </button> :
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="bg-black text-white px-6 py-2 border-2 border-black font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-none" onClick={() => navigate(`/viewlecture/${courseId}`)}>
                  Watch Now
                </button>
                <button className="bg-white text-black px-6 py-2 border-2 border-black font-black uppercase text-sm tracking-wider hover:bg-gray-50 transition-none" onClick={() => navigate(`/attendance/${courseId}`)}>
                  Attendance
                </button>
              </div>
            }
            {isEnrolled && (
              <div className="flex flex-wrap gap-2 mt-3">
                {doubtSession && (
                  <a href={doubtSession.meetingLink} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-6 py-2 border-2 border-black font-black uppercase text-xs tracking-wider hover:bg-gray-800 transition-none inline-block">
                    Doubt Session
                  </a>
                )}
                {educatorLiveRoom ? (
                  <button
                    onClick={() => handleJoinVoiceRoom(educatorLiveRoom.roomId)}
                    disabled={joiningRoom}
                    className="bg-black text-white px-6 py-2 border-2 border-black font-black uppercase text-xs tracking-wider flex items-center gap-2 disabled:opacity-50 transition-none"
                  >
                    {joiningRoom ? 'Joining...' : <><FaCircle className="text-gray-500" /> Room Live ({educatorLiveRoom.participantCount})</>}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/voice-request')}
                    className="bg-black text-white px-6 py-2 border-2 border-black font-black uppercase text-xs tracking-wider flex items-center gap-2 hover:bg-gray-800 transition-none"
                  >
                    <FaMicrophone /> Voice Room
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* What You'll Learn */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">What You'll Learn</h2>
          <ul className="pl-6 text-gray-700 space-y-1 font-bold list-disc">
            <li>Learn {selectedCourseData?.category} from Beginning</li>
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">Requirements</h2>
          <p className="text-gray-700 font-bold">Basic programming knowledge is helpful but not required.</p>
        </div>

        {/* Who This Course Is For */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">Who This Course is For</h2>
          <p className="text-gray-700 font-bold">Beginners, aspiring developers, and professionals looking to upgrade skills.</p>
        </div>

        {isEnrolled && (
          <div>
            {/* Doubt Solving Sessions */}
            {doubtSession && (
              <div className="mt-4 p-5 border-4 border-black bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
                <h2 className="text-lg font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                  <FaComments /> Doubt Solving Session
                </h2>
                <p className="text-sm text-gray-300 mb-3">Your educator has scheduled a live doubt-solving session. Click the button below to join.</p>
                <a
                  href={doubtSession.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-black px-6 py-2 border-2 border-white font-black uppercase text-sm tracking-wider hover:bg-gray-200 transition-none"
                >
                  Join Doubt Session →
                </a>
              </div>
            )}

            <h2 className="text-xl font-black uppercase tracking-tight mb-2 mt-6">Assignments</h2>
            {((fullCourseData?.assignments?.length > 0 ? fullCourseData.assignments : selectedCourseData?.assignments) || []).length === 0 ? (
              <p className="text-gray-500 font-bold border-2 border-dashed border-gray-300 p-4">No assignments have been posted for this course yet.</p>
            ) : (
              ((fullCourseData?.assignments?.length > 0 ? fullCourseData.assignments : selectedCourseData?.assignments) || []).map((assignment) => {
                if (!assignment) return null;
                const studentGrade = studentSubmissionsWithGrades.find(
                  (gradeEntry) => gradeEntry.submission?.assignment?._id === assignment._id
                );
                return (
                  <div key={assignment._id} className="border-2 border-black p-4 mb-4 bg-gray-50">
                    <h3 className="text-lg font-black">{assignment.title}</h3>
                    {assignment.description && <p className="text-gray-600 font-bold text-sm">{assignment.description}</p>}
                    <p className="text-xs font-bold text-gray-500">Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
                    {assignment.referenceLink && (
                      <a href={assignment.referenceLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-black text-white px-4 py-2 border-2 border-black font-black uppercase text-xs tracking-wider mt-3 hover:bg-gray-800 transition-none">
                        View
                      </a>
                    )}
                    {studentGrade ? (
                      studentGrade.status === 'rejected' ? (
                        <div className="mt-4">
                          <div className="p-3 border-2 border-red-300 mb-4">
                            <p className="font-black text-gray-500 flex items-center gap-2"><FaTimesCircle /> Submission Rejected</p>
                            <p className="text-gray-500 text-sm mt-1 font-bold">Feedback: {studentGrade.feedback}</p>
                          </div>
                          <p className="text-sm text-gray-600 font-bold mb-2">Resubmit your assignment:</p>
                          <input type="text" placeholder="Enter your new submission link" className="w-full border-2 border-black p-2 font-bold" onChange={(e) => setSubmissionLinks(prev => ({ ...prev, [assignment._id]: e.target.value }))} />
                          <button className="bg-black text-white mt-3 px-4 py-2 border-2 border-black font-black uppercase text-xs tracking-wider hover:bg-gray-800 transition-none" onClick={() => handleAssignmentSubmit(assignment._id)}>Resubmit</button>
                        </div>
                      ) : (
                        <div className="mt-4 p-3 border-2 border-black" style={{ backgroundColor: getGradeColor(studentGrade.grade, true) }}>
                          <p className="font-black">Your Grade: <span style={{ color: getGradeColor(studentGrade.grade) }}>{studentGrade.grade}</span></p>
                          <p className="text-gray-700 font-bold">Feedback: {studentGrade.feedback}</p>
                        </div>
                      )
                    ) : (
                      <div className="mt-4">
                        <input type="text" placeholder="Enter your submission link" className="w-full border-2 border-black p-2 font-bold" onChange={(e) => setSubmissionLinks(prev => ({ ...prev, [assignment._id]: e.target.value }))} />
                        <button className="bg-black text-white mt-3 px-4 py-2 border-2 border-black font-black uppercase text-xs tracking-wider hover:bg-gray-800 transition-none" onClick={() => handleAssignmentSubmit(assignment._id)}>Submit</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Course Materials Section */}
            <div className="mt-8">
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">Course Materials</h2>
              {fetchingMaterials ? (
                <div className="flex justify-center items-center h-20"><ClipLoader size={30} color='#000' /></div>
              ) : courseMaterials.length === 0 ? (
                <p className="text-gray-600 font-bold">No materials available for this course yet.</p>
              ) : (
                <ul className="space-y-3">
                  {courseMaterials.map((material) => (
                    <li key={material._id} className="flex items-center justify-between p-3 border-2 border-black bg-gray-50">
                      <div>
                        <p className="font-black">{material.title}</p>
                      </div>
                      <a href={material.url} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-4 py-2 border-2 border-black font-black uppercase text-xs tracking-wider hover:bg-gray-800 transition-none">View</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Course Quizzes Section */}
        {isEnrolled && (
          <div className="mt-8">
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">Course Quizzes</h2>
            {courseQuizzes.length === 0 ? (
              <p className="text-gray-500 font-bold border-2 border-dashed border-gray-300 p-4">No quizzes have been scheduled for this course yet.</p>
            ) : (
              <ul className="space-y-3">
                {courseQuizzes.map((quiz) => (
                  <li key={quiz._id} className="flex items-center justify-between p-3 border-2 border-black bg-gray-50">
                    <div>
                      <p className="font-black">{quiz.instructions}</p>
                      <p className="text-xs font-bold text-gray-500">Scheduled: {new Date(quiz.schedule).toLocaleString()}</p>
                      <p className="text-xs font-bold text-gray-500">Rewards: {quiz.rewards}</p>
                    </div>
                    <a href={quiz.quizLink} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-3 py-2 border-2 border-black font-black uppercase text-xs tracking-wider hover:bg-gray-800 transition-none">Take Quiz</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Certificate Section */}
        {isEnrolled && (
          <div className="mt-8 p-6 border-4 border-black bg-gray-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">Certificate</h2>
            <p className="text-sm text-gray-600 font-bold mb-4">
              Complete at least 80% of the course to be eligible for the completion certificate.
            </p>
            <div className="mb-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-black uppercase tracking-wider">Current Progress</span>
                <span className="text-sm font-black">{courseProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 border border-black">
                <div className="bg-black h-full transition-none" style={{ width: `${Math.min(100, courseProgress)}%` }} />
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  setClaimingCertificate(true);
                  const { data } = await axios.post(`${serverUrl}/api/certification/claim`, { courseId }, { headers: { Authorization: `Bearer ${token}` } });
                  toast.success(data.message || "Certificate claimed! Check your Dashboard.");
                } catch (error) {
                  toast.error(error.response?.data?.message || "Failed to claim certificate");
                } finally {
                  setClaimingCertificate(false);
                }
              }}
              disabled={courseProgress < 80 || claimingCertificate}
              className={`px-6 py-2 border-2 border-black font-black uppercase text-sm tracking-wider transition-none ${courseProgress >= 80 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'}`}
            >
              {claimingCertificate ? "Generating..." : "Claim Certificate"}
            </button>
            {courseProgress >= 80 && (
              <p className="text-xs text-gray-500 mt-2 font-bold">
                View it in the "My Certificates" section of your Dashboard.
              </p>
            )}
          </div>
        )}

        {/* Course Curriculum with Modules */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white w-full md:w-2/5 p-6 border-2 border-black">
            <h2 className="text-xl font-black mb-1 text-black uppercase tracking-tight">Course Resources</h2>
            <p className="text-sm text-gray-600 font-bold mb-4">{courseModules.length} Modules</p>
            <div className="flex flex-col gap-3">
              {courseModules.length > 0 ? (
                courseModules.map((module, moduleIndex) => {
                  const moduleLectures = module.lectures || [];
                  return (
                    <div key={module._id} className="module-container">
                      <div
                        className="p-4 border-2 border-black cursor-pointer transition-none"
                        style={{ backgroundColor: expandedModules[module._id] ? '#f3eff8' : '#fafafa' }}
                        onClick={() => dispatch(toggleModuleExpand(module._id))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-black text-sm mb-1 text-black uppercase tracking-tight">
                              Module {moduleIndex + 1}: {module.title}
                            </h3>
                            <p className="text-xs text-gray-600 font-bold">{moduleLectures.length} lectures</p>
                          </div>
                          <span className="text-black font-black">{expandedModules[module._id] ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {expandedModules[module._id] && (
                        <div className="mt-2 ml-4 space-y-2">
                          {moduleLectures.map((lecture, lectureIndex) => (
                            <button
                              key={lecture._id}
                              disabled={!lecture.isPreviewFree && !isEnrolled}
                              onClick={() => { if (lecture.isPreviewFree || isEnrolled) setSelectedLecture(lecture); }}
                              className={`flex items-center gap-3 px-4 py-3 border-2 transition-none text-left w-full ${lecture.isPreviewFree || isEnrolled ? 'cursor-pointer border-black hover:bg-gray-100' : 'cursor-not-allowed opacity-50 border-gray-200 bg-gray-50'} ${selectedLecture?._id === lecture._id ? 'bg-black text-white' : 'bg-white'}`}
                            >
                              <span className="text-base">{lecture.isPreviewFree || isEnrolled ? <FaPlayCircle /> : <FaLock />}</span>
                              <span className="text-sm font-bold flex-1">{lectureIndex + 1}. {lecture.lectureTitle}</span>
                              {lecture.duration && <span className="text-xs text-gray-500 font-bold">{lecture.duration}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                selectedCourseData?.lectures?.map((lecture, index) => (
                  <button
                    key={lecture._id || index}
                    disabled={!lecture.isPreviewFree && !isEnrolled}
                    onClick={() => { if (lecture.isPreviewFree || isEnrolled) setSelectedLecture(lecture); }}
                    className={`flex items-center gap-3 px-4 py-3 border-2 transition-none text-left ${lecture.isPreviewFree || isEnrolled ? 'hover:bg-gray-100 cursor-pointer border-black' : 'cursor-not-allowed opacity-40 border-gray-200 bg-gray-50'} ${selectedLecture?.lectureTitle === lecture.lectureTitle ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    <span className="text-base">{lecture.isPreviewFree || isEnrolled ? <FaPlayCircle /> : <FaLock />}</span>
                    <span className="text-sm font-bold flex-1">{index + 1}. {lecture.lectureTitle}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-white w-full md:w-3/5 p-6 border-2 border-black">
            <div className="aspect-video w-full mb-4 bg-black flex items-center justify-center border-2 border-black">
              {selectedLecture?.videoUrl ? (
                <video src={selectedLecture.videoUrl} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">Select a lecture to watch</span>
              )}
            </div>
            <h3 className="text-lg font-black mb-1 text-black uppercase tracking-tight">{selectedLecture?.lectureTitle || 'Lecture Title'}</h3>
            <p className="text-gray-600 text-sm font-bold">{selectedCourseData?.title}</p>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-8 border-t-4 border-black pt-6">
          <h2 className="text-xl font-black uppercase tracking-tight mb-2">Write a Review</h2>
          <div className="mb-4">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} onClick={() => setRating(star)} className={star <= rating ? "text-black" : "text-gray-300"} />
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your comment here..." className="w-full border-2 border-black p-2 font-bold" rows="3" />
            <button className="bg-black text-white mt-3 px-4 py-2 border-2 border-black font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none" onClick={handleReview}>
              Submit Review →
            </button>
          </div>

          {/* Instructor Info */}
          <div className="flex items-center gap-4 pt-4 border-t-4 border-black">
            {creatorData?.photoUrl ? <img src={creatorData?.photoUrl} alt="Instructor" className="w-16 h-16 object-cover border-4 border-black" /> : <img src={img} alt="Instructor" className="w-16 h-16 object-cover border-4 border-black" />}
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">{creatorData?.name}</h3>
              <p className="text-sm text-gray-600 font-bold">{creatorData?.description}</p>
              <p className="text-sm text-gray-600 font-bold">{creatorData?.email}</p>
            </div>
          </div>
          <div className="mt-6">
            <p className='text-xl font-black uppercase tracking-tight mb-2'>Other Courses by the Educator</p>
            <div className='w-full flex items-start justify-center lg:justify-start flex-wrap gap-6 py-5'>
              {selectedCreatorCourse?.map((item, index) => (item && <Card key={index} thumbnail={item.thumbnail} title={item.title} id={item._id} price={item.price} category={item.category} />))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Buttons */}
      {isEnrolled && creatorData && (
        <>
          {!showChat && !showAIAssistant && (
            <button onClick={() => setShowChat(true)} className="fixed bottom-6 left-6 bg-white text-black border-4 border-black px-4 py-3 flex items-center gap-2 z-40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none" title="Chat with Mentor">
              <FaComments className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-wider">Mentor Chat</span>
            </button>
          )}
          {showChat && <ChatWindow courseId={courseId} educatorName={creatorData?.name} onClose={() => setShowChat(false)} />}
          {!showChat && !showAIAssistant && (
            <button onClick={() => navigate(`/course-discussion/${courseId}`)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black border-4 border-black px-4 py-3 flex items-center gap-2 z-40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none" title="Class Discussion">
              <FaUsers className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-wider">Class Chat</span>
            </button>
          )}
          {!showAIAssistant && !showChat && (
            <button onClick={() => setShowAIAssistant(true)} className="fixed bottom-6 right-6 bg-black text-white border-4 border-black px-4 py-3 flex items-center gap-2 z-40 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none" title="Jagat AI Assistant">
              <FaRobot className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-wider">Jagat AI</span>
            </button>
          )}
          {showAIAssistant && <AIDoubtAssistant courseName={selectedCourseData?.title} onClose={() => setShowAIAssistant(false)} />}
        </>
      )}
      </div>
      <Footer />
    </div>
  )
}

export default ViewCourse
