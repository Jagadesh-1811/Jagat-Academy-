import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';

const ParentSettings = () => {
  const navigate = useNavigate();
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchParentSettings();
  }, []);

  const fetchParentSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${serverUrl}/api/student/parent-settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.settings) {
        setParentEmail(res.data.settings.parentEmail || '');
        setParentPhone(res.data.settings.parentPhone || '');
        setCurrentData(res.data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch parent settings:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!parentEmail && !parentPhone) {
      toast.error('Please enter at least one contact method');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${serverUrl}/api/student/parent-settings`,
        { parentEmail, parentPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Parent contact updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 py-12 pt-32">
        {/* Header */}
        <div className="border-b-4 border-black pb-4 mb-8">
          <ArrowBackLongIcon className='w-5 h-5 cursor-pointer text-black hover:opacity-70 mb-2' onClick={() => navigate(-1)} />
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">
            Parent Settings
          </h1>
          <p className="text-gray-500 text-sm font-bold mt-1">Manage your parent/guardian contact information</p>
        </div>

        {/* Info box */}
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-black text-xs">!</div>
            <p className="text-sm font-bold text-black uppercase tracking-wider">Why share parent contacts?</p>
          </div>
          <p className="text-gray-600 text-sm">
            Parent contact information allows Jagat Academy to share progress reports, 
            attendance updates, and important announcements with your parents or guardians.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
              Parent/Guardian Email
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@example.com"
              className="w-full border-2 border-black px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
              Parent/Guardian Phone
            </label>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border-2 border-black px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
            />
          </div>

          {currentData && (
            <div className="bg-gray-50 border-2 border-black p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Previously Saved</p>
              {currentData.parentEmail && <p className="text-sm text-black font-bold">Email: {currentData.parentEmail}</p>}
              {currentData.parentPhone && <p className="text-sm text-black font-bold">Phone: {currentData.parentPhone}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black border-2 border-black text-white font-black py-4 uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Contact Info →'}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default ParentSettings;
