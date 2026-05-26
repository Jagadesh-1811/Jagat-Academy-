import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CertificateGenerator = () => {
  const { userData } = useSelector(state => state.user);
  const [searchParams] = useSearchParams();
  
  const [name, setName] = useState(userData?.name || '');
  const [course, setCourse] = useState(searchParams.get('course') || '');
  
  // State variables for upload and sharing
  const [isGenerating, setIsGenerating] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  
  // Ref to target the certificate container for PDF generation
  const certificateRef = useRef(null);

  const generateAndUploadPDF = async () => {
    if (!name || !course) {
      return alert("Please enter both the student's name and the course name.");
    }

    if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
      return alert("Missing Cloudinary Credentials! Please check your frontend .env file.");
    }

    setIsGenerating(true);
    
    try {
      // 1. Capture the DOM element as an image
      const element = certificateRef.current;
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#e4e5e7'
      });
      const imgData = canvas.toDataURL('image/png');

      // 2. Generate the PDF (Landscape A4)
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Convert PDF to Blob for uploading
      const pdfBlob = pdf.output('blob');

      // 3. Upload to Cloudinary (Unsigned API)
      const formData = new FormData();
      formData.append('file', pdfBlob, 'certificate.pdf');
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET); 

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.secure_url) {
        setCloudinaryUrl(data.secure_url);
        alert('Certificate successfully generated and uploaded!');
      } else {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }
    } catch (error) {
      console.error("Error generating/uploading PDF:", error);
      alert('Failed to generate or upload certificate. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnLinkedIn = () => {
    if (!cloudinaryUrl) return;
    const postText = `I'm thrilled to share that I have successfully completed the "${course}" course at Jagat Academy! 🎓✨\n\nCheck out my certificate here: ${cloudinaryUrl}\n\n#JagatAcademy #ContinuousLearning #Certificate`;
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
    window.open(linkedInUrl, '_blank');
  };

  const addToLinkedInProfile = () => {
    if (!cloudinaryUrl) return;
    const linkedInUrl = new URL('https://www.linkedin.com/profile/add');
    linkedInUrl.searchParams.append('startTask', 'CERTIFICATION_NAME');
    linkedInUrl.searchParams.append('name', course);
    linkedInUrl.searchParams.append('organizationName', 'Jagat Academy');
    linkedInUrl.searchParams.append('organizationId', '103849182');
    linkedInUrl.searchParams.append('issueYear', new Date().getFullYear().toString());
    linkedInUrl.searchParams.append('issueMonth', (new Date().getMonth() + 1).toString());
    linkedInUrl.searchParams.append('certUrl', cloudinaryUrl);
    window.open(linkedInUrl.toString(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full absolute top-0 left-0 z-50">
        <Nav />
      </div>
      
      {/* Controls Panel */}
      <div className="mt-28 mb-8 bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-4xl flex flex-col sm:flex-row gap-4 items-center justify-between border border-gray-700">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Student Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            placeholder="Enter student name"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Course Name</label>
          <input 
            type="text" 
            value={course} 
            onChange={(e) => setCourse(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            placeholder="Enter course name"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-5 sm:mt-0 w-full sm:w-auto">
          <button 
            onClick={generateAndUploadPDF}
            disabled={isGenerating}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Save to Cloudinary'}
          </button>

          {cloudinaryUrl && (
            <>
              <button onClick={shareOnLinkedIn} className="px-6 py-2 bg-[#0A66C2] text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap flex items-center justify-center gap-2">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Share as Post
              </button>
              <button onClick={addToLinkedInProfile} className="px-6 py-2 bg-transparent border-2 border-[#0A66C2] text-[#0A66C2] font-semibold rounded-lg shadow-lg hover:bg-[#0A66C2] hover:text-white transition-all whitespace-nowrap flex items-center justify-center gap-2">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Add to Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Certificate Wrapper - Ref attached here */}
      <div ref={certificateRef} className="w-full max-w-5xl aspect-[1.414/1] relative overflow-hidden bg-[#e4e5e7] shadow-2xl rounded-sm mx-auto flex">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] right-[-5%] w-[45%] h-[55%] bg-[#ff3b7c] rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
          <div className="absolute top-[20%] right-[5%] w-[50%] h-[60%] bg-[#ffe34d] rounded-full mix-blend-multiply filter blur-[120px] opacity-90"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[60%] bg-[#8b7ff9] rounded-full mix-blend-multiply filter blur-[120px] opacity-75"></div>
          <div className="absolute bottom-[-15%] right-[25%] w-[45%] h-[45%] bg-[#ff9a76] rounded-full mix-blend-multiply filter blur-[110px] opacity-60"></div>
        </div>
        <div className="relative z-10 w-full h-full p-[8%] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M18 10V24C18 27 15 30 11 30C8.5 30 6.5 28.5 5.5 26" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                <path d="M22 30L26.5 14L31 30" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M24 25H29" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
                <path d="M26.5 12L19 9L26.5 6L34 9L26.5 12Z" fill="#1a1a1a"/>
                <path d="M33 9V14" stroke="#1a1a1a" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="tracking-[0.15em] text-[10px] sm:text-xs md:text-sm font-semibold text-[#1a1a1a]">JAGAT ACADEMY</h3>
          </div>
          <div className="mt-[10%] flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#2c2c2c] uppercase tracking-wide leading-tight">Certificate <br />Of Completion</h1>
            <p className="mt-[6%] text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#333333]">This certificate is awarded to</p>
            <div className="mt-[4%] flex items-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-[#1a1a1a] leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{name || '<<NAME>>'}</h2>
            </div>
            <p className="mt-[6%] text-[7px] sm:text-[8px] md:text-[10px] lg:text-[11px] uppercase font-serif text-[#333333] leading-relaxed max-w-[65%] text-justify tracking-wide">
              Awarded for the successful completion of the {course || '<<COURSE>>'}. In recognition of outstanding performance and commitment to excellence.
            </p>
          </div>
          <div className="w-[20%] min-w-[120px] max-w-[200px] mt-auto">
            <div className="mb-2 w-full h-12 relative">
              <svg viewBox="0 0 100 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10 32 C 10 32 15 15 25 10 C 32 5 35 25 30 35 C 25 45 15 25 22 18 C 30 10 40 25 45 30 C 50 35 60 25 65 25 C 75 25 80 32 90 28" stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="w-full border-t-[1px] border-[#2c2c2c]"></div>
            <p className="mt-2 text-center text-[7px] sm:text-[8px] md:text-[10px] tracking-[0.15em] font-serif text-[#1a1a1a]">ACADEMY CEO</p>
          </div>
        </div>
      </div>
      
      <div className="w-full mt-auto pt-16">
        <Footer />
      </div>
    </div>
  );
};

export default CertificateGenerator;