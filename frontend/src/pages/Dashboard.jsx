import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import { serverUrl } from '../App';

// Level badge colour map
const LEVEL_STYLES = {
  Platinum: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', emoji: '💎' },
  Gold:     { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', emoji: '🥇' },
  Silver:   { bg: 'bg-gray-100',   text: 'text-gray-700',   border: 'border-gray-300',   emoji: '🥈' },
  Bronze:   { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', emoji: '🥉' },
};

// ─── My Certificates Tab ─────────────────────────────────────────────────────
const MyCertificates = ({ userId, token }) => {
  const [certs, setCerts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sharing, setSharing]   = useState(null); // certificateId being shared

  const fetchCerts = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${serverUrl}/api/certification/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCerts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const handleLinkedIn = async (certificateId) => {
    setSharing(certificateId);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/certification/share/linkedin`,
        { certificateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.open(data.shareUrl, '_blank');
    } catch {
      toast.error('Could not generate LinkedIn share link');
    } finally {
      setSharing(null);
    }
  };

  const handleVerify = (certificateId) => {
    window.open(`${serverUrl}/verify/${certificateId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading your certificates…</p>
      </div>
    );
  }

  if (certs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
        {/* Illustrated empty state */}
        <div className="w-24 h-24 rounded-full bg-[#F6F1E5] border-4 border-[#C5A059] flex items-center justify-center text-5xl shadow-lg">
          🎓
        </div>
        <h3 className="text-2xl font-bold text-[#1B365D]">No Certificates Yet</h3>
        <p className="text-gray-500 max-w-xs text-sm">
          Complete a course with <strong>≥ 80% progress</strong> to automatically earn your certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b-2 border-[#1B365D] pb-3">
        <span className="text-3xl">🏅</span>
        <h2 className="text-3xl font-extrabold text-[#1B365D] tracking-tight">My Certificates</h2>
        <span className="ml-auto bg-[#1B365D] text-white text-xs font-bold px-3 py-1 rounded-full">
          {certs.length} earned
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certs.map((cert) => {
          const style = LEVEL_STYLES[cert.level] || LEVEL_STYLES.Gold;
          const isRevoked = cert.status === 'revoked';
          return (
            <div
              key={cert._id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 overflow-hidden transition-transform hover:-translate-y-1 ${
                isRevoked ? 'border-red-300 opacity-70' : 'border-[#C5A059]'
              }`}
            >
              {/* Top colour bar */}
              <div className={`h-2 w-full ${ isRevoked ? 'bg-red-400' : 'bg-gradient-to-r from-[#1B365D] to-[#C5A059]' }`} />

              <div className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Certificate of Completion</p>
                    <h3 className="text-lg font-extrabold text-[#1B365D] leading-snug truncate">
                      {cert.courseId?.title || 'Course'}
                    </h3>
                  </div>
                  {/* Level badge */}
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${
                    style.bg} ${style.text} ${style.border}`}>
                    {style.emoji} {cert.level}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{new Date(cert.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs text-gray-400 truncate">
                    <span>🔑</span>
                    <span>{cert.certificateId}</span>
                  </div>
                </div>

                {/* Status pill */}
                {isRevoked ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs font-semibold">
                    ⚠️ This certificate has been revoked by the institution.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700 text-xs font-semibold">
                    ✅ Verified &amp; Issued by Jagadeeshwar C V, Founder
                  </div>
                )}

                {/* Action buttons */}
                {!isRevoked && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {/* Download PDF */}
                    {cert.pdfUrl && (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center justify-center gap-2 bg-[#1B365D] hover:bg-[#14294a] text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                        Download PDF
                      </a>
                    )}

                    {/* Verify */}
                    <button
                      onClick={() => handleVerify(cert.certificateId)}
                      className="flex items-center justify-center gap-2 bg-white border-2 border-[#1B365D] text-[#1B365D] hover:bg-[#F6F1E5] text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Verify
                    </button>

                    {/* LinkedIn */}
                    <button
                      onClick={() => handleLinkedIn(cert.certificateId)}
                      disabled={sharing === cert.certificateId}
                      className="flex items-center justify-center gap-2 bg-[#0077B5] hover:bg-[#005885] disabled:opacity-60 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors"
                    >
                      {sharing === cert.certificateId ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      )}
                      Add to LinkedIn
                    </button>
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

// Main App Component
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { userData, token } = useSelector(state => state.user);
  const [activeTab, setActiveTab] = useState('resume');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Resume State (ATS-friendly data structure)
  const [resume, setResume] = useState({
    fullName: 'John Doe',
    title: 'Aspiring Software Developer',
    email: 'john.doe@techprep.edu',
    phone: '+1 (555) 123-4567',
    linkedin: 'linkedin.com/in/johndoe',
    summary: 'Dedicated computer science student with a strong foundation in full-stack web development and a passion for creating scalable, efficient applications. Seeking an internship to apply technical skills in a challenging environment.',
    education: [
      { institution: 'State University', degree: 'B.S. Computer Science', duration: '2022 - 2026', details: 'GPA: 3.8/4.0' }
    ],
    experience: [
      { company: 'Tech Prep Solutions', position: 'Web Dev Intern', duration: 'Summer 2024', description: 'Developed a responsive inventory tracking module using React and Tailwind CSS, resulting in a 20% improvement in load time.' }
    ],
    skills: ['JavaScript', 'React', 'Python', 'SQL', 'Git', 'Tailwind CSS', 'Agile Methodology']
  });

  // Handler for Resume fields
  const handleResumeChange = (section, index, field, value) => {
    const updated = { ...resume };

    if (section === 'skills') {
      updated.skills = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else if (index !== undefined) {
      updated[section][index][field] = value;
    } else {
      updated[section] = value;
    }
    setResume(updated);
  };

  // Handler to add a new Experience entry
  const handleAddExperience = () => {
    setResume(prevResume => ({
      ...prevResume,
      experience: [
        ...prevResume.experience,
        { company: '', position: '', duration: '', description: '' }
      ]
    }));
  };

  // Handler to add a new Education entry
  const handleAddEducation = () => {
    setResume(prevResume => ({
      ...prevResume,
      education: [
        ...prevResume.education,
        { institution: '', degree: '', duration: '', details: '' }
      ]
    }));
  };

  // Handler to remove an entry from any section (experience or education)
  const handleRemoveEntry = (section, index) => {
    setResume(prevResume => ({
      ...prevResume,
      [section]: prevResume[section].filter((_, i) => i !== index)
    }));
  };

  // Function to simulate PDF download/print (ATS-friendly format)
  const downloadResumePDF = () => {
    const element = document.getElementById('resume-preview');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Resume - ' + resume.fullName + '</title>');
    printWindow.document.write('<style>body { font-family: Inter, sans-serif; margin: 0; padding: 0; color: #1f2937; } .ats-resume { padding: 3rem; max-width: 8.5in; margin: 0 auto; } .section-title { border-bottom: 2px solid #1f2937; padding-bottom: 0.25rem; margin-top: 1rem; margin-bottom: 0.75rem; font-size: 1.25rem; font-weight: 700; color: #1f2937; } .job-title { font-weight: 700; color: #1f2937; } .job-details { font-style: italic; color: #4b5563; font-size: 0.875rem; } .job-description-list { list-style-type: disc; margin-left: 1.5rem; font-size: 0.875rem; color: #374151; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <div className="flex h-screen bg-white font-sans text-gray-900">

        {/* Sidebar - High Contrast Black */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col shadow-xl`}>
          <div className="p-4 flex items-center justify-between h-16 border-b border-gray-700">
            {sidebarOpen && <h1 className="text-xl font-extrabold tracking-widest text-white">STUDENT HUB</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-full transition text-2xl">
              {sidebarOpen ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>}
            </button>
          </div>

          <nav className="flex-1 space-y-2 p-4 pt-6">
            {/* Resume Builder tab */}
            <TabButton icon={<DescriptionIcon />} label="Resume Builder" currentTab="resume" activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} />

            {/* My Certificates tab */}
            <TabButton icon={<SchoolIcon />} label="My Certificates" currentTab="certificates" activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} />

            {/* Learning Analytics Link */}
            <button
              onClick={() => navigate('/student/analytics')}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition duration-200 hover:bg-gray-800 text-gray-300"
            >
              <span className="text-2xl">📈</span>
              {sidebarOpen && <span className="text-sm font-medium">Learning Analytics</span>}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 md:p-8">

            {/* My Certificates Tab */}
            {activeTab === 'certificates' && (
              <MyCertificates userId={userData?._id} token={token} />
            )}

            {/* Resume Builder Tab Content */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-2 border-gray-900 pb-2">Resume Builder</h2>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* Editor Panel */}
                  <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 space-y-6 lg:max-h-[80vh] overflow-y-auto order-2 lg:order-1">
                    <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Edit Your Details</h3>

                    {/* Personal Info */}
                    <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={resume.fullName}
                        onChange={(e) => handleResumeChange('fullName', undefined, '', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                        placeholder="Your Full Name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Job Title/Role" type="text" value={resume.title} onChange={(e) => handleResumeChange('title', undefined, '', e.target.value)} placeholder="e.g., Aspiring Software Developer" />
                      <InputField label="Email" type="email" value={resume.email} onChange={(e) => handleResumeChange('email', undefined, '', e.target.value)} placeholder="email@example.com" />
                      <InputField label="Phone" type="tel" value={resume.phone} onChange={(e) => handleResumeChange('phone', undefined, '', e.target.value)} placeholder="+1 (555) 123-4567" />
                      <InputField label="LinkedIn URL" type="text" value={resume.linkedin} onChange={(e) => handleResumeChange('linkedin', undefined, '', e.target.value)} placeholder="linkedin.com/in/..." />
                    </div>

                    {/* Summary */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Summary</label>
                      <textarea
                        value={resume.summary}
                        onChange={(e) => handleResumeChange('summary', undefined, '', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 h-24 transition"
                        placeholder="A concise summary of your skills and goals."
                      />
                    </div>

                    {/* Experience Editor */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">Experience</h3>
                      {resume.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-gray-100 rounded-lg border border-gray-300 mb-4">
                          <InputField type="text" placeholder="Company" value={exp.company} onChange={(e) => handleResumeChange('experience', idx, 'company', e.target.value)} label="Company" />
                          <InputField type="text" placeholder="Position" value={exp.position} onChange={(e) => handleResumeChange('experience', idx, 'position', e.target.value)} label="Position" />
                          <InputField type="text" placeholder="Duration" value={exp.duration} onChange={(e) => handleResumeChange('experience', idx, 'duration', e.target.value)} label="Duration" />
                          <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Description (Use line breaks for bullet points)</label>
                          <textarea
                            placeholder="Project details, achievements, quantified results. (Use line breaks for bullet points)"
                            value={exp.description}
                            onChange={(e) => handleResumeChange('experience', idx, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-400 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                          />
                          <button
                            onClick={() => handleRemoveEntry('experience', idx)}
                            className="mt-2 text-black text-sm font-semibold flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Remove Entry
                          </button>
                        </div>
                      ))}

                      {/* Add Experience Button */}
                      <button
                        onClick={handleAddExperience}
                        className="w-full bg-black text-white font-bold py-2 rounded-lg transition-none text-sm flex items-center justify-center gap-2 mt-2 shadow-md"
                      >
                        + Add Experience Entry
                      </button>
                    </div>

                    {/* Education Editor */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 mt-6 border-b border-gray-300 pb-1">Education</h3>
                      {resume.education.map((edu, idx) => (
                        <div key={idx} className="p-4 bg-gray-100 rounded-lg border border-gray-300 mb-4">
                          <InputField type="text" placeholder="Institution Name" value={edu.institution} onChange={(e) => handleResumeChange('education', idx, 'institution', e.target.value)} label="Institution" />
                          <InputField type="text" placeholder="Degree/Certificate" value={edu.degree} onChange={(e) => handleResumeChange('education', idx, 'degree', e.target.value)} label="Degree/Certificate" />
                          <InputField type="text" placeholder="Duration (e.g., 2022 - 2026)" value={edu.duration} onChange={(e) => handleResumeChange('education', idx, 'duration', e.target.value)} label="Duration" />
                          <InputField type="text" placeholder="Details (e.g., GPA 3.8, Honors)" value={edu.details} onChange={(e) => handleResumeChange('education', idx, 'details', e.target.value)} label="Details" />
                          <button
                            onClick={() => handleRemoveEntry('education', idx)}
                            className="mt-2 text-black text-sm font-semibold flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Remove Entry
                          </button>
                        </div>
                      ))}
                      {/* Add Education Button */}
                      <button
                        onClick={handleAddEducation}
                        className="w-full bg-black text-white font-bold py-2 rounded-lg transition-none text-sm flex items-center justify-center gap-2 mt-2 shadow-md"
                      >
                        + Add Education Entry
                      </button>
                    </div>

                    {/* Skills Editor */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 mt-6">Skills (Comma Separated)</label>
                      <textarea
                        value={resume.skills.join(', ')}
                        onChange={(e) => handleResumeChange('skills', undefined, '', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 h-16 transition"
                        placeholder="e.g., JavaScript, React, Python, Tailwind CSS"
                      />
                    </div>
                  </div>

                  {/* Preview Panel */}
                  <div className="lg:max-h-[80vh] overflow-y-auto order-1 lg:order-2">
                    <div className="bg-white p-8 rounded-xl shadow-2xl sticky top-0 border-4 border-gray-900">
                      <div id="resume-preview" className="ats-resume bg-white p-2 text-gray-800">

                        {/* Header */}
                        <div className="text-center mb-6 pb-2 border-b-4 border-gray-900">
                          <h1 className="text-3xl font-extrabold tracking-wider uppercase text-gray-900">{resume.fullName}</h1>
                          <p className="text-lg font-medium text-gray-600 mb-2">{resume.title}</p>
                          <p className="text-sm text-gray-600 space-x-4">
                            <span>{resume.email}</span>
                            <span>|</span>
                            <span>{resume.phone}</span>
                            <span>|</span>
                            <a href={`https://${resume.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 underline">{resume.linkedin}</a>
                          </p>
                        </div>

                        {/* Summary */}
                        <Section title="Professional Summary">
                          <p className="text-sm leading-relaxed">{resume.summary}</p>
                        </Section>

                        {/* Skills */}
                        <Section title="Technical Skills">
                          <p className="text-sm font-medium">
                            <span className="font-bold mr-2">Skills:</span> {resume.skills.join(' | ')}
                          </p>
                        </Section>

                        {/* Experience */}
                        <Section title="Experience">
                          {resume.experience.map((exp, idx) => (
                            <div key={idx} className="mb-4">
                              <div className="flex justify-between items-baseline">
                                <p className="job-title text-base font-bold text-gray-900">{exp.position} at {exp.company}</p>
                                <p className="job-details text-sm italic text-gray-600">{exp.duration}</p>
                              </div>
                              <ul className="job-description-list mt-1 list-disc ml-5 text-sm text-gray-700 space-y-1">
                                {exp.description.split('\n').map((line, i) => (
                                  line.trim() && <li key={i}>{line}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </Section>

                        {/* Education */}
                        <Section title="Education">
                          {resume.education.map((edu, idx) => (
                            <div key={idx} className="mb-3">
                              <div className="flex justify-between items-baseline">
                                <p className="font-bold text-gray-900 text-base">{edu.degree} - {edu.institution}</p>
                                <p className="text-sm italic text-gray-600">{edu.duration}</p>
                              </div>
                              <p className="text-sm text-gray-700">{edu.details}</p>
                            </div>
                          ))}
                        </Section>

                      </div>

                      <button
                        onClick={downloadResumePDF}
                        className="w-full mt-6 bg-black text-white font-bold py-3 rounded-xl shadow-lg transition-none flex items-center justify-center gap-3 text-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        Download / Print ATS Resume
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}

// --- Helper Components ---

// Reusable Tab Button for Sidebar
const TabButton = ({ icon, label, currentTab, activeTab, setActiveTab, sidebarOpen }) => (
  <button
    onClick={() => setActiveTab(currentTab)}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition duration-200 ${activeTab === currentTab ? 'bg-white text-gray-900 shadow-md font-bold' : 'hover:bg-gray-800 text-gray-300'
      }`}
  >
    <span className="text-2xl">{icon}</span>
    {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
  </button>
);

// Reusable Input Field
const InputField = ({ label, type, value, onChange, placeholder = '', disabled = false }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mt-2 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition disabled:bg-gray-200 disabled:text-gray-600"
      placeholder={placeholder}
    />
  </div>
);

// Reusable Resume Section
const Section = ({ title, children }) => (
  <div className="mb-4">
    <h2 className="section-title text-xl font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-400 pb-1">{title}</h2>
    {children}
  </div>
);

