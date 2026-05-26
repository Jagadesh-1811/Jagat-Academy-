import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { serverUrl } from '../App';
import { FaArrowLeft } from 'react-icons/fa';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const AICoursesReview = () => {
  const navigate = useNavigate();
  const { userData, token } = useSelector(state => state.user);
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('Approved');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeVideos, setActiveVideos] = useState({}); // stores { [moduleIndex]: videoObject }

  if (!userData || userData.role !== 'educator') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Educators Only</h2>
          <p className="text-gray-600 mb-6">You must be logged in as an educator to access this page.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-none"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Fetch all AI courses for review
  useEffect(() => {
    fetchCoursesForReview();
  }, []);

  const fetchCoursesForReview = async () => {
    try {
      setLoading(true);
      // Get all AI courses (not filtered by student)
      const response = await axios.get(
        `${serverUrl}/api/ai/all-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses for review');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (courseId) => {
    if (!feedback.trim()) {
      toast.error('Please enter feedback');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${serverUrl}/api/ai/course/${courseId}/status`,
        {
          status: status,
          feedback: feedback,
          educatorId: userData._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Course review submitted successfully!`);
        setFeedback('');
        setSelectedCourse(null);
        fetchCoursesForReview();
      }
    } catch (error) {
      console.error('Error reviewing course:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
      case 'approved':
        return 'bg-black text-white border-2 border-black';
      case 'RevisionsRequested':
      case 'revision_requested':
        return 'bg-gray-500 text-white border-2 border-black';
      case 'PendingEducatorReview':
      case 'pending':
        return 'bg-gray-200 text-black border-2 border-black';
      case 'Generating':
        return 'bg-white text-black border-2 border-black animate-pulse';
      default:
        return 'bg-white text-black border-2 border-black';
    }
  };

  const parseBoldText = (text) => {
    if (!text) return '';
    if (!text.includes('**')) return text;
    
    const parts = text.split('**');
    return parts.map((part, index) => {
      return index % 2 === 1 ? <strong key={index} className="font-bold text-gray-900">{part}</strong> : part;
    });
  };

  const formatContent = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    let listItems = [];
    const elements = [];
    
    const flushList = (key) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 my-2 space-y-1.5 text-sm text-gray-700">
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList(index);
        return;
      }
      
      if (trimmed.startsWith('# ')) {
        flushList(index);
        elements.push(
          <h1 key={index} className="text-xl font-bold text-black mt-4 mb-2 border-b border-gray-100 pb-1">
            {parseBoldText(trimmed.replace('# ', ''))}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList(index);
        elements.push(
          <h2 key={index} className="text-lg font-bold text-black mt-3 mb-2">
            {parseBoldText(trimmed.replace('## ', ''))}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList(index);
        elements.push(
          <h3 key={index} className="text-base font-semibold text-gray-900 mt-2 mb-1">
            {parseBoldText(trimmed.replace('### ', ''))}
          </h3>
        );
      } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const content = trimmed.substring(1).trim();
        listItems.push(
          <li key={`li-${index}`} className="text-sm text-gray-700 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '').trim();
        listItems.push(
          <li key={`li-${index}`} className="list-decimal text-sm text-gray-700 ml-4 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      } else {
        flushList(index);
        elements.push(
          <p key={index} className="text-sm text-gray-700 leading-relaxed my-2">
            {parseBoldText(trimmed)}
          </p>
        );
      }
    });
    
    flushList(lines.length);
    return elements;
  };

  const filteredCourses = filterStatus === 'all' 
    ? courses 
    : courses.filter(course => course.status === filterStatus);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PendingEducatorReview': return 'Pending Review';
      case 'RevisionsRequested': return 'Revision Requested';
      case 'Approved': return 'Approved';
      case 'Generating': return 'Generating';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Nav />
      <div className="flex-grow w-full px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-2 border-2 border-black px-4 py-2 font-black uppercase text-xs tracking-wider mb-4 hover:bg-black hover:text-white transition-colors"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">AI Courses Review</h1>
          <p className="text-gray-600">Review and provide feedback on student-generated AI courses</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'PendingEducatorReview', label: 'Pending Review' },
            { value: 'Approved', label: 'Approved' },
            { value: 'RevisionsRequested', label: 'Revisions Requested' }
          ].map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => setFilterStatus(filterOption.value)}
              className={`px-4 py-2 border-2 border-black font-black uppercase text-xs transition-none ${
                filterStatus === filterOption.value
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {loading && !selectedCourse ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border-4 border-black shadow-[6px_6px_0_#000]">
            <p className="text-gray-600">No courses found with status: {getStatusLabel(filterStatus)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Courses List */}
            <div className="lg:col-span-1">
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredCourses.map(course => (
                  <div
                    key={course._id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveVideos({}); // reset selected video state for new course
                    }}
                    className={`p-4 border-2 border-black cursor-pointer transition-none ${
                      selectedCourse?._id === course._id
                        ? 'bg-gray-200'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-bold text-black truncate mb-1">{course.topic}</h3>
                    <p className="text-xs text-gray-650 mb-2">Student: {course.studentId?.name || 'Unknown'}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 font-medium">{course.modules?.length || 0} modules</span>
                      <span className={`px-2.5 py-0.5 text-xs font-black uppercase ${getStatusBadgeColor(course.status)}`}>
                        {getStatusLabel(course.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Display */}
            {selectedCourse && (
              <div className="lg:col-span-3 space-y-6">
                {/* Course Header */}
                <div className="border-4 border-black p-6 bg-gray-50 shadow-[6px_6px_0_#000]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-black mb-1">{selectedCourse.topic}</h2>
                      <p className="text-gray-600 font-medium text-sm">Student: {selectedCourse.studentId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 mt-1">Generated: {new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
                      {selectedCourse.description && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Student's request: "{selectedCourse.description.substring(0, 120)}{selectedCourse.description.length > 120 ? '...' : ''}"
                        </p>
                      )}
                    </div>
                    <span className={`px-4 py-1.5 font-black uppercase text-xs ${getStatusBadgeColor(selectedCourse.status)}`}>
                      {getStatusLabel(selectedCourse.status)}
                    </span>
                  </div>
                  {selectedCourse.courseDescription && (
                    <div className="mt-4 p-4 bg-white border-2 border-black">
                      <p className="font-black uppercase text-xs tracking-wider text-gray-600 mb-2">Course Overview</p>
                      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                        {selectedCourse.courseDescription.split('\n').filter(line => line.trim()).map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-gray-500 font-medium">Difficulty Level</p>
                      <p className="font-bold text-black text-base">{selectedCourse.difficultyLevel}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Total Modules</p>
                      <p className="font-bold text-black text-base">{selectedCourse.modules?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Status</p>
                      <p className="font-bold text-black text-base capitalize">{selectedCourse.status}</p>
                    </div>
                  </div>
                </div>

                {/* Modules Content */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-black">Course Modules</h3>
                  {selectedCourse.modules?.map((module, idx) => {
                    const currentVideo = activeVideos[idx] || module.youtubeVideos?.[0];
                    return (
                      <div key={idx} className="border-4 border-black overflow-hidden bg-white shadow-[6px_6px_0_#000]">
                        {/* Module Header */}
                        <div className="bg-black text-white p-4">
                          <h4 className="text-lg font-bold">Module {idx + 1}: {module.title}</h4>
                        </div>

                        {/* Module Content */}
                        <div className="p-6 space-y-6">
                          {/* YouTube Video - Inline Playable Player */}
                          {currentVideo && (
                            <div className="bg-gray-50 p-5 border-2 border-black">
                              <p className="font-black uppercase text-gray-900 mb-3">Active Video Lesson</p>
                              
                              {/* Responsive iframe video container */}
                              <div className="aspect-video w-full overflow-hidden border-2 border-black bg-black">
                                <iframe
                                  src={currentVideo.embedUrl || `https://www.youtube.com/embed/${currentVideo.id}?autoplay=0&rel=0&modestbranding=1`}
                                  title={currentVideo.title}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full"
                                ></iframe>
                              </div>
                              
                              <div className="mt-4 bg-white p-4 border-2 border-black">
                                <p className="font-semibold text-gray-900 text-base mb-1">{currentVideo.title}</p>
                                <p className="text-sm text-gray-500 font-medium mb-3">By {currentVideo.channelTitle}</p>
                                <div className="flex gap-4 text-xs font-semibold text-gray-650">
                                  {currentVideo.viewCount > 0 && (
                                    <span className="bg-gray-100 border border-black px-2 py-1">{(currentVideo.viewCount / 1000000).toFixed(1)}M views</span>
                                  )}
                                  {currentVideo.duration && (
                                    <span className="bg-gray-100 border border-black px-2 py-1">{currentVideo.duration}</span>
                                  )}
                                  <a 
                                    href={currentVideo.watchUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-black hover:underline flex items-center gap-1 ml-auto"
                                  >
                                    Watch on YouTube
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Related YouTube Videos Selector */}
                          {module.youtubeVideos && module.youtubeVideos.length > 1 && (
                            <div>
                              <p className="font-black uppercase text-gray-900 mb-3 text-sm">Alternative Lessons</p>
                              <div className="grid grid-cols-2 gap-4">
                                {module.youtubeVideos.map((video, vidIdx) => {
                                  const isActive = currentVideo?.id === video.id;
                                  return (
                                    <div
                                      key={vidIdx}
                                      className={`group overflow-hidden border-2 transition-none cursor-pointer ${
                                        isActive ? 'border-black bg-gray-100' : 'border-black bg-white'
                                      }`}
                                      onClick={() => setActiveVideos(prev => ({ ...prev, [idx]: video }))}
                                    >
                                      <div className="relative bg-gray-300 aspect-video overflow-hidden">
                                        <img
                                          src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                                          alt={video.title}
                                          className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                                          onError={(e) => { 
                                            e.target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail'; 
                                          }}
                                        />
                                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${
                                          isActive ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
                                        }`}>
                                          <div className="text-white text-3xl font-bold">
                                            {isActive ? 'Playing' : 'Play'}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-3 bg-gray-50">
                                        <p className="text-xs font-bold text-gray-900 line-clamp-2">{video.title}</p>
                                        <p className="text-[10px] text-gray-500 font-medium mt-1">{video.channelTitle}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Structured Content (Formatted) */}
                          {module.structuredContent && (
                            <div>
                              <p className="font-black uppercase text-gray-900 mb-3">Learning Content</p>
                              <div className="bg-gray-50 p-6 border-2 border-black max-h-[450px] overflow-y-auto space-y-4">
                                {formatContent(module.structuredContent)}
                              </div>
                            </div>
                          )}


                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Review Panel */}
                <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_#000] sticky bottom-4 z-10">
                  <h3 className="text-lg font-bold text-black mb-4">Educator Review Decision</h3>

                  {/* Status Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Review Decision:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-black focus:outline-none font-semibold text-sm"
                    >
                      <option value="Approved">Approve and Publish</option>
                      <option value="RevisionsRequested">Request Revisions</option>
                      <option value="PendingEducatorReview">Leave Pending</option>
                    </select>
                  </div>

                  {/* Feedback */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback & Guidance:</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write your review comments or instructions for requested revisions..."
                      rows="3"
                      className="w-full px-4 py-2.5 border-2 border-black focus:outline-none text-sm resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(selectedCourse._id)}
                      disabled={loading}
                      className="flex-1 px-5 py-3 border-2 border-black bg-black text-white font-black uppercase text-xs hover:bg-white hover:text-black transition-none disabled:opacity-50"
                    >
                      {loading ? 'Submitting Review...' : 'Submit Review'}
                    </button>
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="px-5 py-3 border-2 border-black text-black font-black uppercase text-xs hover:bg-black hover:text-white transition-none"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {false && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4 flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <img 
              src={activeImage} 
              alt="Enlarged learning resource" 
              className="max-w-full max-h-[80vh] object-contain border-4 border-black" 
            />
            <button 
              className="absolute top-4 right-4 bg-white text-black border-2 border-black w-10 h-10 flex items-center justify-center font-bold hover:bg-black hover:text-white transition-none"
              onClick={() => setActiveImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
};

export default AICoursesReview;
