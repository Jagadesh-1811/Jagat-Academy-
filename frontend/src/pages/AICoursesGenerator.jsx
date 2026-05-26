import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { serverUrl } from '../App';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const AICoursesGenerator = () => {
  const navigate = useNavigate();
  const { userData, token } = useSelector(state => state.user);
  
  const [formData, setFormData] = useState({
    topic: '',
    difficultyLevel: 'Beginner',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const [showGeneratedCourses, setShowGeneratedCourses] = useState(false);
  const [showApprovedOnly, setShowApprovedOnly] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeVideos, setActiveVideos] = useState({});

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to generate AI courses</h2>
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateCourse = async (e) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${serverUrl}/api/ai/course/generate`,
        {
          topic: formData.topic,
          difficultyLevel: formData.difficultyLevel
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('AI course generated successfully');
        setGeneratedCourses(prev => [response.data.course, ...prev]);
        setFormData({ topic: '', difficultyLevel: 'Beginner', description: '' });
        setShowGeneratedCourses(true);
      }
    } catch (error) {
      console.error('Error generating course:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI course');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAICourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${serverUrl}/api/ai/my-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setGeneratedCourses(response.data.courses);
        setShowGeneratedCourses(true);
        toast.success('Courses loaded');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch your AI courses');
    } finally {
      setLoading(false);
    }
  };

  const displayedCourses = showApprovedOnly
    ? generatedCourses.filter(course => (course.status || '').toLowerCase() === 'approved')
    : generatedCourses;

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Nav />
      <div className="flex-grow w-full py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Course Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Create personalized courses with advanced AI technology
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-8 sticky top-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-6">Generate New Course</h2>

              <form onSubmit={handleGenerateCourse} className="space-y-6">
                {/* Topic Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Topic
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Machine Learning Basics, Python Programming..."
                    className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:bg-gray-100 transition-none"
                    disabled={loading}
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Description & Details
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what you want to learn in detail — topics you're interested in, specific skills you want to build, projects you want to work on..."
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:bg-gray-100 transition-none resize-none text-sm"
                    disabled={loading}
                  />
                  <p className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">
                    This helps AI generate more relevant content and find better YouTube videos for you.
                  </p>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-black bg-white focus:outline-none focus:bg-gray-100 transition-none"
                    disabled={loading}
                  >
                    <option value="Beginner">Beginner (2 modules)</option>
                    <option value="Intermediate">Intermediate (4 modules)</option>
                    <option value="Advanced">Advanced (5 modules)</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 border-2 border-black font-black uppercase text-sm transition-none ${
                    loading
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-white hover:text-black'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Course'
                  )}
                </button>

                <button
                  type="button"
                  onClick={fetchMyAICourses}
                  disabled={loading}
                  className={`w-full py-3 px-4 border-2 border-black font-black uppercase text-sm transition-none ${
                    loading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  My Courses
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !showApprovedOnly;
                    setShowApprovedOnly(nextValue);
                    // Always refresh when switching to approved-only to avoid stale list
                    if (nextValue) {
                      fetchMyAICourses();
                    }
                  }}
                  disabled={loading}
                  className={`w-full py-3 px-4 border-2 border-black font-black uppercase text-sm transition-none ${
                    loading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : showApprovedOnly
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {showApprovedOnly ? 'Showing Approved' : 'Show Approved Only'}
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-gray-100 border-2 border-black">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">How it works:</span>
                  <br />
                  OpenAI writes in-depth module lessons (~5000 words each in flowing paragraphs), YouTube supplies playable video lessons matched to your description, and the platform structures everything into a course ready for review.
                </p>
              </div>
            </div>
          </div>

          {/* Courses Display Section */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <AICourseDetailView 
                course={selectedCourse} 
                onBack={() => setSelectedCourse(null)} 
                activeVideos={activeVideos}
                setActiveVideos={setActiveVideos}
              />
            ) : showGeneratedCourses && displayedCourses.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showApprovedOnly ? 'Approved Courses' : 'Generated Courses'}
                </h2>
                {displayedCourses.map((course) => (
                  <AIGeneratedCourseCard 
                    key={course._id} 
                    course={course} 
                    onViewDetails={() => {
                      setSelectedCourse(course);
                      setActiveVideos({});
                    }}
                  />
                ))}
              </div>
            ) : showGeneratedCourses && displayedCourses.length === 0 ? (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {showApprovedOnly ? 'No approved AI courses yet.' : 'No AI courses generated yet. Create your first one!'}
                </p>
              </div>
            ) : (
              <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] p-12">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome to AI Course Generation
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    Enter a topic and difficulty level on the left, and let our AI system create a complete course for you.
                  </p>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="flex items-start">
                      <span className="font-semibold text-black mr-3">1.</span>
                      <p className="text-gray-700"><strong>Content Planning:</strong> Topic breakdown into focused modules</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-black mr-3">2.</span>
                      <p className="text-gray-700"><strong>Content Generation:</strong> OpenAI-powered lesson writing (~5000 words per module)</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-black mr-3">3.</span>
                      <p className="text-gray-700"><strong>Video Matching:</strong> YouTube lessons matched to your description</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-semibold text-black mr-3">4.</span>
                      <p className="text-gray-700"><strong>Assembly:</strong> Organizing into structured course modules</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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

// AI Generated Course Card Component
const AIGeneratedCourseCard = ({ course, onViewDetails }) => {
  const statusColors = {
    'Generating': 'bg-white text-black border-black',
    'PendingEducatorReview': 'bg-gray-200 text-black border-black',
    'RevisionsRequested': 'bg-gray-500 text-white border-black',
    'Approved': 'bg-black text-white border-black'
  };

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden transition-none">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.topic}</h3>
            <p className="text-gray-600">
              Difficulty: <span className="font-semibold">{course.difficultyLevel}</span>
            </p>
          </div>
          <span className={`px-4 py-2 border-2 font-black uppercase text-xs whitespace-nowrap ml-4 ${statusColors[course.status]}`}>
            {course.status}
          </span>
        </div>

        {/* Modules Info */}
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            <strong>{course.modules?.length || 0} modules</strong>
          </p>
          {course.modules && course.modules.length > 0 && (
            <div className="space-y-2">
              {course.modules.map((module, idx) => (
                <div key={idx} className="flex items-center text-gray-700">
                  <span className="text-sm mr-2 font-medium">Module {idx + 1}:</span>
                  <span>{module.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
          <span>
            {new Date(course.createdAt).toLocaleDateString()}
          </span>
          <button 
            onClick={onViewDetails} 
            className="text-black hover:text-gray-700 font-semibold"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Detailed view for students
const AICourseDetailView = ({ course, onBack, activeVideos, setActiveVideos }) => {
  const parseBoldText = (text) => {
    if (!text) return '';
    if (!text.includes('**')) return text;
    
    const parts = text.split('**');
    return parts.map((part, index) => {
      return index % 2 === 1 ? <strong key={index} className="font-bold text-gray-905">{part}</strong> : part;
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
          <h1 key={index} className="text-xl font-bold text-black mt-4 mb-2 border-b border-gray-105 pb-1">
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
          <li key={`li-${index}`} className="text-sm text-gray-705 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '').trim();
        listItems.push(
          <li key={`li-${index}`} className="list-decimal text-sm text-gray-705 ml-4 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      } else {
        flushList(index);
        elements.push(
          <p key={index} className="text-sm text-gray-705 leading-relaxed my-2">
            {parseBoldText(trimmed)}
          </p>
        );
      }
    });
    
    flushList(lines.length);
    return elements;
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
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white font-black uppercase text-xs transition-none"
        >
          Back to My Courses
        </button>
        <span className={`px-3 py-1 text-xs font-black uppercase ${getStatusBadgeColor(course.status)}`}>
          {getStatusLabel(course.status)}
        </span>
      </div>

      {/* Course Header */}
      <div className="border-4 border-black p-6 bg-gray-50 shadow-[6px_6px_0_#000]">
        <h2 className="text-2xl font-bold text-black mb-1">{course.topic}</h2>
        
        {/* Course Description */}
        {course.courseDescription && (
          <div className="mt-3 p-4 bg-white border-2 border-black">
            <p className="font-black uppercase text-xs tracking-wider text-gray-600 mb-2">About This Course</p>
            <div className="text-sm text-gray-700 leading-relaxed space-y-2">
              {course.courseDescription.split('\n').filter(line => line.trim()).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-gray-500 font-medium">Difficulty Level</p>
            <p className="font-bold text-black text-base">{course.difficultyLevel}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Total Modules</p>
            <p className="font-bold text-black text-base">{course.modules?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Created On</p>
            <p className="font-bold text-black text-base">{new Date(course.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-black">Course Modules</h3>
        {course.modules?.map((module, idx) => {
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
                    <p className="font-black uppercase text-gray-900 mb-3">Video Lesson</p>
                    
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
                              <p className="text-[10px] text-gray-550 font-medium mt-1">{video.channelTitle}</p>
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
    </div>
  );
};

export default AICoursesGenerator;
