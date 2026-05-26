import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlayCircle, FaChevronDown, FaChevronUp, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { auth } from '../../utils/Firebase';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';
import AIDoubtAssistant from '../components/AIDoubtAssistant';

function ViewLecture() {
  const { courseId } = useParams();
  const { courseData } = useSelector((state) => state.course);
  const { userData, token } = useSelector((state) => state.user);
  const selectedCourse = courseData?.find((course) => course._id === courseId);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [completedLectures, setCompletedLectures] = useState([]);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiInitialQuestion, setAiInitialQuestion] = useState('');
  const [aiBookmarkContext, setAiBookmarkContext] = useState(null);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const courseCreator = userData?._id === selectedCourse?.creator ? userData : null;
  const autoMarkedRef = useRef({});
  const loggedMilestonesRef = useRef({});

  useEffect(() => {
    loggedMilestonesRef.current = {};
    if (selectedLecture && token) {
      axios.post(`${serverUrl}/api/analytics/log`, { action: 'lecture_start', courseId, lectureId: selectedLecture._id, duration: 0 }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
  }, [selectedLecture, courseId, token]);

  useEffect(() => {
    const fetchModules = async () => {
      if (courseId && token) {
        setLoadingModules(true);
        try {
          const result = await axios.get(`${serverUrl}/api/module/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
          const fetchedModules = result.data.modules || [];
          setModules(fetchedModules);
          if (fetchedModules[0]?.lectures?.[0]) {
            setSelectedLecture(fetchedModules[0].lectures[0]);
            setExpandedModules({ 0: true });
          }
        } catch (error) {
          console.error('Error fetching modules:', error);
        } finally {
          setLoadingModules(false);
        }
      }
    };
    fetchModules();
  }, [courseId, token]);

  useEffect(() => {
    if (!loadingModules && modules.length === 0 && selectedCourse?.lectures?.length > 0) {
      const moduleMap = {};
      selectedCourse.lectures.forEach((lecture, index) => {
        const moduleNum = Math.floor(index / 3) + 1;
        const moduleKey = `Module ${moduleNum}`;
        if (!moduleMap[moduleKey]) {
          moduleMap[moduleKey] = { title: moduleKey, lectures: [], _id: `synthetic-${moduleNum}` };
        }
        moduleMap[moduleKey].lectures.push({ ...lecture, moduleNumber: moduleNum });
      });
      const fallbackModules = Object.values(moduleMap);
      setModules(fallbackModules);
      if (fallbackModules[0]?.lectures[0]) {
        setSelectedLecture(fallbackModules[0].lectures[0]);
        setExpandedModules({ 0: true });
      }
    }
  }, [loadingModules, modules.length, selectedCourse?.lectures]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (userData?._id && courseId) {
        try {
          const response = await axios.get(`${serverUrl}/api/progress/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
          setCompletedLectures(response.data.completedLectures || []);
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      }
    };
    fetchProgress();
  }, [userData?._id, courseId, token]);

  const toggleModule = (moduleIndex) => {
    setExpandedModules(prev => ({ ...prev, [moduleIndex]: !prev[moduleIndex] }));
  };

  const markAsCompleted = async (lectureId) => {
    try {
      await axios.post(`${serverUrl}/api/progress/complete`, { courseId, lectureId }, { headers: { Authorization: `Bearer ${token}` } });
      setCompletedLectures(prev => [...prev, lectureId]);
      toast.success("Lecture marked as completed!");
    } catch (error) {
      console.error("Error marking lecture as completed:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleVideoProgress = async (e) => {
    if (!selectedLecture) return;
    const { currentTime, duration } = e.target;
    if (!duration || duration <= 0) return;
    const watchedPercentage = currentTime / duration;
    const milestones = [20, 40, 60, 80, 100];
    const currentPercent = Math.round(watchedPercentage * 100);
    for (const milestone of milestones) {
      if (currentPercent >= milestone && !loggedMilestonesRef.current[milestone]) {
        loggedMilestonesRef.current[milestone] = true;
        axios.post(`${serverUrl}/api/analytics/log`, { action: 'lecture_progress', courseId, lectureId: selectedLecture._id, duration: Math.round(duration * (milestone / 100)), metadata: { videoProgressPercent: milestone } }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
    }
    if (watchedPercentage > 0.8 && !completedLectures.includes(selectedLecture._id)) {
      if (autoMarkedRef.current[selectedLecture._id]) return;
      autoMarkedRef.current[selectedLecture._id] = true;
      try {
        await axios.post(`${serverUrl}/api/progress/complete`, { courseId, lectureId: selectedLecture._id }, { headers: { Authorization: `Bearer ${token}` } });
        setCompletedLectures((prev) => [...prev, selectedLecture._id]);
        toast.success("Lecture completed! Progress updated.");
      } catch (error) {
        console.error("Progress update failed:", error);
      }
      axios.post(`${serverUrl}/api/attendance/mark`, { courseId, lectureId: selectedLecture._id, checkInMethod: 'auto' }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!selectedLecture || !token) { setBookmarks([]); return; }
      try {
        const res = await axios.get(`${serverUrl}/api/bookmark/lecture/${selectedLecture._id}`, { headers: { Authorization: `Bearer ${token}` } });
        setBookmarks(res.data || []);
      } catch (err) {
        const key = `bookmarks:${selectedLecture._id}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        setBookmarks(existing);
      }
    };
    loadBookmarks();
  }, [selectedLecture, token]);

  const addBookmark = async () => {
    if (!selectedLecture) return toast.error('Select a lecture first');
    const currentTime = Math.floor((videoRef.current?.currentTime) || 0);
    const note = window.prompt('Optional note for this bookmark (leave empty for none)') || '';
    if (!token) {
      const key = `bookmarks:${selectedLecture._id}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const newBm = { _id: `local-${Date.now()}`, lecture: selectedLecture._id, timestamp: currentTime, note, createdAt: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify([newBm, ...existing]));
      setBookmarks(prev => [newBm, ...prev]);
      return toast.success('Bookmark saved locally');
    }
    try {
      const res = await axios.post(`${serverUrl}/api/bookmark`, { lectureId: selectedLecture._id, courseId, timestamp: currentTime, note }, { headers: { Authorization: `Bearer ${token}` } });
      setBookmarks(prev => [res.data, ...prev]);
      toast.success('Bookmark saved');
    } catch (err) {
      console.error('Error saving bookmark', err);
      toast.error(err.response?.data?.message || 'Failed to save bookmark');
    }
  };

  const dispatch = useDispatch();

  const askDoubt = async (bookmark) => {
    const question = window.prompt('Enter your question about this point in the video:');
    if (!question) return;
    if (!token) { toast.error('Please login to ask a doubt'); navigate('/signup'); return; }
    try {
      let serverBookmark = bookmark;
      if (String(bookmark._id || '').startsWith('local-')) {
        const payload = { lectureId: bookmark.lecture || selectedLecture?._id, courseId, timestamp: bookmark.timestamp || 0, note: bookmark.note || '' };
        const createRes = await axios.post(`${serverUrl}/api/bookmark`, payload, { headers: { Authorization: `Bearer ${token}` } });
        serverBookmark = createRes.data;
        setBookmarks(prev => prev.map(b => b._id === bookmark._id ? serverBookmark : b));
      }
      const res = await axios.post(`${serverUrl}/api/bookmark/${serverBookmark._id}/doubt`, { question }, { headers: { Authorization: `Bearer ${token}` } });
      setBookmarks(prev => prev.map(b => b._id === serverBookmark._id ? { ...b, linkedDoubt: res.data._id } : b));
      toast.success('Doubt submitted. Opening assistant...');
      setAiInitialQuestion(question);
      setAiBookmarkContext({ bookmarkId: serverBookmark._id, lectureId: serverBookmark.lecture, timestamp: serverBookmark.timestamp, doubtId: res.data._id });
      setShowAIAssistant(true);
    } catch (err) {
      console.error('Error creating doubt', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        try {
          if (auth && auth.currentUser) {
            const refreshed = await auth.currentUser.getIdToken(true);
            dispatch(setToken(refreshed));
            localStorage.setItem('token', refreshed);
            const retryRes = await axios.post(`${serverUrl}/api/bookmark/${bookmark._id}/doubt`, { question }, { headers: { Authorization: `Bearer ${refreshed}` } });
            setBookmarks(prev => prev.map(b => b._id === bookmark._id ? { ...b, linkedDoubt: retryRes.data._id } : b));
            toast.success('Doubt submitted after token refresh. Opening assistant...');
            setAiInitialQuestion(question);
            setAiBookmarkContext({ bookmarkId: bookmark._id, lectureId: bookmark.lecture, timestamp: bookmark.timestamp, doubtId: retryRes.data._id });
            setShowAIAssistant(true);
            return;
          }
        } catch (refreshErr) {
          console.error('Token refresh or retry failed:', refreshErr);
        }
        toast.error('Not authorized — please login again');
        navigate('/signup');
        return;
      }
      toast.error(err.response?.data?.message || 'Failed to submit doubt');
    }
  };

  const calculateModuleDuration = (lectures) => {
    const minutes = lectures.length * 3.5;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <>
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b-4 border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <FaArrowLeft className="text-black w-5 h-5 cursor-pointer hover:text-gray-600 transition-none" onClick={() => navigate("/")} />
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">{selectedCourse?.title}</h1>
              <div className="mt-1 flex gap-4 text-sm font-bold text-gray-600">
                <span>Category: {selectedCourse?.category}</span>
                <span>•</span>
                <span>Level: {selectedCourse?.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:w-2/3">
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {/* Video Player */}
              <div className="aspect-video bg-black relative">
                {selectedLecture?.videoUrl ? (
                  <video ref={videoRef} src={selectedLecture.videoUrl} controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-cover" crossOrigin="anonymous" onTimeUpdate={handleVideoProgress} />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-center p-4 font-bold">
                    <p>Select a lecture to start watching</p>
                  </div>
                )}
                {selectedLecture?.videoUrl && (
                  <button onClick={addBookmark} className="absolute right-4 top-4 bg-white text-black border-2 border-black px-3 py-1 font-black uppercase text-xs">
                    Add Bookmark
                  </button>
                )}
              </div>

              {/* Lecture Info */}
              <div className="p-6 border-t-4 border-black">
                <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight mb-2">
                  {selectedLecture?.lectureTitle || "Select a lecture"}
                </h2>
                <p className="text-gray-600 text-sm font-bold">{selectedCourse?.title}</p>

                {selectedLecture && !completedLectures.includes(selectedLecture._id) && (
                  <button onClick={() => markAsCompleted(selectedLecture._id)} className="mt-4 px-4 py-2 bg-black text-white border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-none">
                    Mark as Completed
                  </button>
                )}

                {/* Bookmarks list */}
                <div className="mt-4">
                  <h3 className="text-sm font-black text-black uppercase tracking-wider mb-2">Bookmarks</h3>
                  {bookmarks.length === 0 ? (
                    <p className="text-xs text-gray-500 font-bold">No bookmarks yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {bookmarks.map((bm) => (
                        <li key={bm._id} className="flex items-center justify-between bg-gray-50 border-2 border-black p-2">
                          <div className="flex items-center gap-3">
                            <button className="text-sm font-black text-black" onClick={() => { if (videoRef.current) videoRef.current.currentTime = bm.timestamp; }}>
                              {formatTime(bm.timestamp)}
                            </button>
                            <div className="text-xs font-bold text-gray-600">{bm.note}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!bm.linkedDoubt && (
                              <button className="text-xs px-2 py-1 bg-black text-white font-black uppercase tracking-wider" onClick={() => askDoubt(bm)}>Ask</button>
                            )}
                            {bm.linkedDoubt && <span className="text-xs font-bold text-green-600">Submitted</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Instructor Info - Mobile */}
            {courseCreator && (
              <div className="lg:hidden mt-6 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-black text-black uppercase tracking-tight mb-4">Instructor</h3>
                <div className="flex items-center gap-4">
                  <img src={courseCreator.photoUrl || '/default-avatar.png'} alt="Instructor" className="w-16 h-16 object-cover border-4 border-black" />
                  <div>
                    <h4 className="text-base font-black text-black uppercase tracking-tight">{courseCreator.name}</h4>
                    <p className="text-sm text-gray-600 font-bold mt-1">{courseCreator.description || 'No bio available.'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Module List */}
          <div className="lg:w-1/3">
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-24">
              <div className="p-6 border-b-4 border-black">
                <h2 className="text-xl font-black text-black uppercase tracking-tight">Course Content</h2>
                <p className="text-sm text-gray-600 font-bold mt-1">{modules.length} modules</p>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {loadingModules ? (
                  <div className="flex items-center justify-center p-8"><ClipLoader size={30} color="#000" /><span className="ml-2 text-gray-600 font-bold">Loading...</span></div>
                ) : modules.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 font-bold">
                    <p>No modules available yet.</p>
                  </div>
                ) : (
                  modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border-b-2 border-black">
                      <button onClick={() => toggleModule(moduleIndex)} className="w-full px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-none">
                        <div className="flex-1 text-left">
                          <h3 className="text-base font-black text-black uppercase tracking-tight mb-1">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-600 font-bold">{calculateModuleDuration(module.lectures)} | {module.completedCount || 0}/{module.lectures.length}</p>
                        </div>
                        <div className="ml-4 text-black">{expandedModules[moduleIndex] ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}</div>
                      </button>
                      {expandedModules[moduleIndex] && (
                        <div className="bg-gray-50">
                          {module.lectures.map((lecture, lectureIndex) => {
                            const isCompleted = completedLectures.includes(lecture._id);
                            const isSelected = selectedLecture?._id === lecture._id;
                            return (
                              <button key={lectureIndex} onClick={() => setSelectedLecture(lecture)} className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition-none border-l-4 ${isSelected ? 'border-black bg-gray-100' : 'border-transparent'}`}>
                                <div className="text-gray-700">{isCompleted ? <FaCheckCircle className="w-5 h-5 text-black" /> : <FaPlayCircle className="w-5 h-5" />}</div>
                                <div className="flex-1 text-left">
                                  <p className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-gray-800'}`}>{lectureIndex + 1}. {lecture.lectureTitle}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Instructor Info - Desktop */}
              {courseCreator && (
                <div className="hidden lg:block p-6 border-t-4 border-black bg-gray-50">
                  <h3 className="text-sm font-black text-black uppercase tracking-wider mb-3">Instructor</h3>
                  <div className="flex items-center gap-3">
                    <img src={courseCreator.photoUrl || '/default-avatar.png'} alt="Instructor" className="w-12 h-12 object-cover border-4 border-black" />
                    <div>
                      <h4 className="text-sm font-black text-black uppercase tracking-tight">{courseCreator.name}</h4>
                      <p className="text-xs text-gray-600 font-bold mt-0.5 line-clamp-2">{courseCreator.description || 'No bio available.'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      {showAIAssistant && (
        <AIDoubtAssistant
          courseName={selectedCourse?.title || ''}
          onClose={() => { setShowAIAssistant(false); setAiInitialQuestion(''); setAiBookmarkContext(null); }}
          initialQuestion={aiInitialQuestion}
          bookmark={aiBookmarkContext}
        />
      )}
    </>
  );
}

export default ViewLecture;
