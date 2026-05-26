import React, { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaCommentAlt, FaBug, FaPaperPlane } from 'react-icons/fa';

const Feedback = () => {
    const [formType, setFormType] = useState('feedback');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${serverUrl}/api/feedback/submit`, {
                type: formType,
                ...formData
            });
            toast.success(response.data.message);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="w-full min-h-screen bg-white">
            <Nav />

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-6 pt-6 hidden md:block">
                <a
                    href="/"
                    className="inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                    ← Back to Home
                </a>
            </div>
            <section className="pt-32 pb-16 px-6 bg-black border-b-4 border-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-4">
                        We'd Love to Hear From You
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 font-bold max-w-2xl mx-auto">
                        Share your feedback or report any issues you've encountered. Your input helps us improve Jagat Academy.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-16 px-6 bg-gray-50 border-b-4 border-black">
                <div className="max-w-2xl mx-auto">
                    {/* Toggle Buttons */}
                    <div className="flex justify-center mb-10">
                        <div className="inline-flex bg-white border-4 border-black p-1">
                            <button
                                onClick={() => setFormType('feedback')}
                                className={`flex items-center gap-2 px-6 py-3 font-black uppercase text-xs tracking-wider transition-all ${formType === 'feedback'
                                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                                    : 'text-gray-600 hover:text-black'
                                }`}
                            >
                                <FaCommentAlt className="w-4 h-4" />
                                Feedback
                            </button>
                            <button
                                onClick={() => setFormType('issue')}
                                className={`flex items-center gap-2 px-6 py-3 font-black uppercase text-xs tracking-wider transition-all ${formType === 'issue'
                                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                                    : 'text-gray-600 hover:text-black'
                                }`}
                            >
                                <FaBug className="w-4 h-4" />
                                Report Issue
                            </button>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="mb-8 border-b-2 border-black pb-4">
                            <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-2">
                                {formType === 'feedback' ? 'Share Your Feedback' : 'Report an Issue'}
                            </h2>
                            <p className="text-gray-500 font-bold text-sm">
                                {formType === 'feedback'
                                    ? 'Let us know what you think about our platform, courses, or features.'
                                    : 'Found a bug or experiencing problems? Describe the issue in detail.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-black text-black uppercase mb-2 tracking-wider">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 border-2 border-black font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-black text-black uppercase mb-2 tracking-wider">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 border-2 border-black font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-2 tracking-wider">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder={formType === 'feedback' ? 'What is your feedback about?' : 'Brief description of the issue'}
                                    className="w-full px-4 py-3 border-2 border-black font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-2 tracking-wider">
                                    {formType === 'feedback' ? 'Your Feedback' : 'Issue Details'}
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder={formType === 'feedback'
                                        ? 'Share your thoughts, suggestions, or experience...'
                                        : 'Please describe the issue in detail. Include steps to reproduce if possible.'}
                                    className="w-full px-4 py-3 border-2 border-black font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 font-black uppercase text-sm tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <ClipLoader size={24} color="white" />
                                ) : (
                                    <>
                                        <FaPaperPlane className="w-4 h-4" />
                                        {formType === 'feedback' ? 'Submit Feedback' : 'Submit Issue Report'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mt-10">
                        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <div className="w-12 h-12 bg-black flex items-center justify-center mb-4">
                                <FaCommentAlt className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-base font-black text-black uppercase tracking-tight mb-2">Feedback</h3>
                            <p className="text-gray-500 text-sm font-bold">
                                Share your experience, suggestions for improvements, or praise for features you love.
                            </p>
                        </div>
                        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <div className="w-12 h-12 bg-black flex items-center justify-center mb-4">
                                <FaBug className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-base font-black text-black uppercase tracking-tight mb-2">Report Issues</h3>
                            <p className="text-gray-500 text-sm font-bold">
                                Found a bug or technical problem? Let us know so we can fix it quickly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Feedback;
