import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';

const FinishSignUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/finish-signup`, { email, role });
      toast.success('Profile updated! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative">
      {/* Back button */}
      <FaArrowLeft
        className='absolute top-6 left-6 w-5 h-5 cursor-pointer text-black hover:text-gray-600 z-10'
        onClick={() => navigate('/')}
      />
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-black flex items-center justify-center text-white font-black text-lg">JA</div>
            <div className="text-left">
              <p className="text-black font-black text-xl leading-none">JAGAT ACADEMY</p>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-1">Complete Registration</p>
            </div>
          </Link>
        </div>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="border-b-4 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black">Finish Sign Up</h1>
            <p className="text-gray-500 text-xs font-bold mt-1">Tell us about yourself</p>
          </div>

          {email && (
            <div className="bg-gray-50 border-2 border-black p-4 mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Email</p>
              <p className="text-black font-bold text-sm mt-1">{email}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                {['student', 'teacher', 'parent'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={`p-6 border-4 text-center font-black uppercase text-sm tracking-wider transition-all ${
                      role === option
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black hover:bg-gray-100'
                    }`}
                  >
                    {option === 'student' ? 'Student 👨‍🎓' : option === 'teacher' ? 'Teacher 👨‍🏫' : 'Parent 👨‍👩‍👧‍👦'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !role}
              className="w-full bg-black border-2 border-black text-white font-black py-4 uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : 'Complete Registration →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinishSignUp;
