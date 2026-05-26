import React, { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { FaPrint, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ResumeGenerator = () => {
  const navigate = useNavigate();
  const [personalInfo, setPersonalInfo] = useState({ name: '', email: '', phone: '', linkedin: '', portfolio: '' });
  const [education, setEducation] = useState([{ institution: '', degree: '', year: '', gpa: '' }]);
  const [experience, setExperience] = useState([{ company: '', role: '', duration: '', description: '' }]);
  const [skills, setSkills] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const addEducation = () => setEducation([...education, { institution: '', degree: '', year: '', gpa: '' }]);
  const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '', description: '' }]);

  const updateEducation = (index, field, value) => {
    const newEd = [...education];
    newEd[index][field] = value;
    setEducation(newEd);
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden">
        <Nav />
      </div>

      <div className="print:hidden bg-black py-8 px-6 border-b-4 border-black">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-white font-black uppercase text-2xl tracking-tight">ATS Resume Generator</h1>
              <p className="text-gray-400 font-bold text-sm mt-1">Build an ATS-friendly, clean text resume</p>
            </div>
          </div>
          <button onClick={handlePrint} className="bg-white text-black px-6 py-2 border-2 border-white font-black uppercase text-xs flex items-center gap-2 hover:bg-gray-200 transition-none">
            <FaPrint /> Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 print:block print:p-0">
        
        {/* Editor Form - Hidden on Print */}
        <div className="w-full md:w-1/2 space-y-6 print:hidden">
          {/* Personal Info */}
          <div className="border-4 border-black p-4 bg-gray-50">
            <h2 className="font-black uppercase text-sm border-b-2 border-black pb-2 mb-4">Personal Information</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Full Name" value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} className="w-full border-2 border-black p-2 text-sm font-bold bg-white" />
              <div className="flex gap-2">
                <input type="email" placeholder="Email" value={personalInfo.email} onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
                <input type="text" placeholder="Phone" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="LinkedIn URL" value={personalInfo.linkedin} onChange={e => setPersonalInfo({...personalInfo, linkedin: e.target.value})} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
                <input type="text" placeholder="Portfolio / GitHub" value={personalInfo.portfolio} onChange={e => setPersonalInfo({...personalInfo, portfolio: e.target.value})} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="border-4 border-black p-4 bg-gray-50">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
              <h2 className="font-black uppercase text-sm">Education</h2>
              <button onClick={addEducation} className="text-black hover:text-gray-600"><FaPlus /></button>
            </div>
            {education.map((ed, i) => (
              <div key={i} className="mb-4 space-y-2 border-l-4 border-black pl-3">
                <input type="text" placeholder="Institution" value={ed.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} className="w-full border-2 border-black p-2 text-sm font-bold bg-white" />
                <input type="text" placeholder="Degree" value={ed.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} className="w-full border-2 border-black p-2 text-sm font-bold bg-white" />
                <div className="flex gap-2">
                  <input type="text" placeholder="Year (e.g. 2020 - 2024)" value={ed.year} onChange={e => updateEducation(i, 'year', e.target.value)} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
                  <input type="text" placeholder="GPA / Score" value={ed.gpa} onChange={e => updateEducation(i, 'gpa', e.target.value)} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="border-4 border-black p-4 bg-gray-50">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
              <h2 className="font-black uppercase text-sm">Experience & Projects</h2>
              <button onClick={addExperience} className="text-black hover:text-gray-600"><FaPlus /></button>
            </div>
            {experience.map((exp, i) => (
              <div key={i} className="mb-4 space-y-2 border-l-4 border-black pl-3">
                <input type="text" placeholder="Company / Project Name" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className="w-full border-2 border-black p-2 text-sm font-bold bg-white" />
                <div className="flex gap-2">
                  <input type="text" placeholder="Role" value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
                  <input type="text" placeholder="Duration (e.g. Jan 2023 - Present)" value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} className="w-1/2 border-2 border-black p-2 text-sm font-bold bg-white" />
                </div>
                <textarea rows={3} placeholder="Description (Use bullet points format)" value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} className="w-full border-2 border-black p-2 text-sm font-bold bg-white resize-none" />
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="border-4 border-black p-4 bg-gray-50">
            <h2 className="font-black uppercase text-sm border-b-2 border-black pb-2 mb-4">Skills</h2>
            <textarea rows={3} placeholder="E.g. JavaScript, React, Node.js, Python" value={skills} onChange={e => setSkills(e.target.value)} className="w-full border-2 border-black p-2 text-sm font-bold bg-white resize-none" />
          </div>
        </div>

        {/* ATS Resume Preview (Always visible, full width on print) */}
        <div className="w-full md:w-1/2 print:w-full bg-white border-2 border-gray-200 print:border-none p-8 font-serif shadow-lg print:shadow-none min-h-[1056px]">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-3xl font-black uppercase tracking-widest">{personalInfo.name || 'YOUR NAME'}</h1>
            <div className="text-sm mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 font-bold">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
              {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
            </div>
          </div>

          {/* Education Section */}
          {(education[0].institution || education[0].degree) && (
            <div className="mb-6">
              <h2 className="text-lg font-black uppercase border-b border-black mb-2 tracking-widest">Education</h2>
              {education.map((ed, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between font-black">
                    <span>{ed.institution}</span>
                    <span>{ed.year}</span>
                  </div>
                  <div className="flex justify-between italic text-sm">
                    <span>{ed.degree}</span>
                    <span>{ed.gpa && `GPA: ${ed.gpa}`}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience Section */}
          {(experience[0].company || experience[0].role) && (
            <div className="mb-6">
              <h2 className="text-lg font-black uppercase border-b border-black mb-2 tracking-widest">Experience</h2>
              {experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between font-black">
                    <span>{exp.company}</span>
                    <span>{exp.duration}</span>
                  </div>
                  <div className="font-bold italic text-sm mb-1">{exp.role}</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {exp.description.split('\n').filter(line => line.trim()).map((line, j) => (
                      <li key={j}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Skills Section */}
          {skills && (
            <div className="mb-6">
              <h2 className="text-lg font-black uppercase border-b border-black mb-2 tracking-widest">Skills</h2>
              <p className="text-sm leading-relaxed">{skills}</p>
            </div>
          )}
        </div>

      </div>

      <div className="print:hidden">
        <Footer />
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:w-full {
            width: 100% !important;
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeGenerator;
