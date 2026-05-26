import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../../App'; // Adjust the import path for serverUrl if needed
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const MyCertificates = () => {
    const { userData, token } = useSelector((state) => state.user);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for the PDF Viewer Placeholder
    const [activePdf, setActivePdf] = useState(null);

    useEffect(() => {
        if (userData?._id) {
            fetchCertificates();
        }
    }, [userData]);

    const fetchCertificates = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/certification/user/${userData._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCertificates(res.data);
        } catch (error) {
            toast.error("Failed to fetch certificates");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] bg-white flex items-center justify-center">
                <ClipLoader size={40} color="#000" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8">My Certificates</h2>

            {certificates.length === 0 ? (
                <div className="border-4 border-black p-12 text-center bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black uppercase text-lg text-gray-500">No Certificates Earned Yet</h3>
                    <p className="text-sm font-bold text-gray-400 mt-2">Complete courses to earn your certificates!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <div key={cert._id} className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:-translate-y-1 transition-transform">
                            <div>
                                <h3 className="font-black text-xl uppercase tracking-tight mb-2 leading-tight">
                                    {cert.courseId?.title || "Course Certificate"}
                                </h3>
                                <p className="text-sm font-bold text-gray-500 mb-1">
                                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                                </p>
                                <span className="text-xs font-bold text-yellow-600 uppercase border-2 border-yellow-600 inline-block px-2 py-1 mb-4 bg-yellow-50">
                                    {cert.level} Level
                                </span>
                            </div>
                            <button 
                                onClick={() => setActivePdf(cert.pdfUrl || cert.ipfsHash)}
                                className="w-full bg-black text-white font-black text-sm uppercase py-3 border-2 border-black hover:bg-white hover:text-black transition-colors mt-4"
                            >
                                View Certificate →
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* --- THE PDF VIEWER MODAL (PLACEHOLDER ATTACHMENT) --- */}
            {activePdf && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4 transition-opacity">
                    <div className="bg-white w-full max-w-5xl h-[90vh] border-4 border-black flex flex-col shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                        
                        <div className="flex justify-between items-center p-4 border-b-4 border-black bg-gray-50">
                            <h3 className="font-black uppercase text-lg text-black">Certificate Viewer</h3>
                            <div className="flex gap-3">
                                <a 
                                    href={activePdf} 
                                    download="Jagat_Academy_Certificate.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-white text-black font-black text-xs uppercase border-2 border-black hover:bg-black hover:text-white transition-colors"
                                >
                                    DOWNLOAD
                                </a>
                                <button 
                                    onClick={() => setActivePdf(null)}
                                    className="px-4 py-2 bg-black text-white font-black text-xs uppercase border-2 border-black hover:bg-white hover:text-black transition-colors"
                                >
                                    CLOSE (X)
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-grow w-full bg-gray-200 p-2">
                            <iframe src={activePdf} className="w-full h-full border-2 border-black" title="PDF Viewer" />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default MyCertificates;