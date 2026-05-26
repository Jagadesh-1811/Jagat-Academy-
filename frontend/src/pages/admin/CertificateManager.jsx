import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CertificateManager = () => {
    const navigate = useNavigate();
    const [certificationLink, setCertificationLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCertificationLink();
    }, [token]);

    const fetchCertificationLink = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/certification/link`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data?.link) {
                setCertificationLink(response.data.link);
            }
        } catch (error) {
            console.error('Error fetching certification link:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await axios.post(`${serverUrl}/api/certification/manage`, 
                { certificationLink },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success('Certification link saved successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save certification link');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <ClipLoader size={40} color="#000" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate('/admin/dashboard')} className="text-white hover:text-gray-300 transition-colors">
                        <ArrowBackIcon />
                    </button>
                    <div>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">Certificate Manager</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase">Manage Certification Application Link</p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6">
                <div className="border-4 border-black p-6 bg-gray-50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                                Certification Form Link
                            </label>
                            <input
                                type="url"
                                value={certificationLink}
                                onChange={(e) => setCertificationLink(e.target.value)}
                                placeholder="https://forms.google.com/..."
                                className="w-full border-2 border-black p-3 text-sm font-bold focus:outline-none bg-white"
                            />
                        </div>
                        <button type="submit" disabled={submitting}
                            className="w-full bg-black text-white font-black py-3 text-xs uppercase border-2 border-black hover:bg-gray-800 transition-none disabled:opacity-50">
                            {submitting ? <ClipLoader size={16} color="white" /> : 'Save Certification Link'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CertificateManager;
