import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';

function CertificateManager() {
    const navigate = useNavigate();
    const { token } = useSelector(state => state.user);
    const [certificationLink, setCertificationLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCertificationLink();
    }, [token]);

    const fetchCertificationLink = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverUrl}/api/certification/link`, { headers: { Authorization: `Bearer ${token}` } });
            setCertificationLink(response.data.link);
        } catch (error) {
            console.error('Error fetching certification link:', error);
            if (error.response && error.response.status === 404) {
                toast.info('No certification link set yet. Please create one.');
                setCertificationLink(''); // Clear link if not found
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch certification link.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await axios.post(
                `${serverUrl}/api/certification/manage`,
                { link: certificationLink },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response.data.message);
        } catch (error) {
            console.error('Error managing certification link:', error);
            toast.error(error.response?.data?.message || 'Failed to save certification link.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <ClipLoader size={50} color={'#000'} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative">
            {/* Back button */}
            <button
                onClick={() => navigate('/teacher/dashboard')}
                className="absolute top-6 left-6 flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
                <FaArrowLeft /> Back
            </button>
            <div className="w-full max-w-xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
                <h2 className="text-2xl font-black text-black text-center uppercase tracking-tight">Manage Certification Link</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="certificationLink" className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">
                            Certification Form/Page Link
                        </label>
                        <input
                            type="url"
                            id="certificationLink"
                            className="w-full p-3 border-2 border-black bg-white text-sm focus:bg-gray-100 transition-none outline-none"
                            placeholder="e.g., https://forms.gle/RqNdh925UHiokUYG9"
                            value={certificationLink}
                            onChange={(e) => setCertificationLink(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-black text-white py-4 border-2 border-black text-sm font-black uppercase tracking-wider hover:bg-white hover:text-black transition-none"
                            disabled={submitting}
                        >
                            {submitting ? <ClipLoader size={20} color='white' /> : 'Save Certification Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CertificateManager;

