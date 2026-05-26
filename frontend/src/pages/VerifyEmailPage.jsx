import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData, setToken } from '../redux/userSlice';
import { FaArrowLeft } from 'react-icons/fa';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setStatus('error');
      setMessage('No verification token found.');
    }
  }, [token]);

  const verifyToken = async (verificationToken) => {
    try {
      const res = await axios.get(`${serverUrl}/api/auth/verify-email/${verificationToken}`);
      if (res.data.token && res.data.user) {
        // Successfully verified — store tokens and redirect
        dispatch(setUserData(res.data.user));
        dispatch(setToken(res.data.token));
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');

        // Auto-redirect to home after 2 seconds
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStatus('error');
        setMessage('Unexpected response from server.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'The verification link is invalid or has expired.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative">
      {/* Back button */}
      <FaArrowLeft
        className='absolute top-6 left-6 w-5 h-5 cursor-pointer text-black hover:text-gray-600 z-10'
        onClick={() => navigate('/')}
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-black flex items-center justify-center text-white font-black text-lg">JA</div>
            <div className="text-left">
              <p className="text-black font-black text-xl leading-none">JAGAT ACADEMY</p>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-1">Email Verification</p>
            </div>
          </Link>
        </div>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
          {status === 'verifying' && (
            <div className="py-8">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-black font-bold uppercase tracking-wider">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-black uppercase text-black mb-2">Email Verified!</h2>
              <p className="text-gray-500 text-sm mb-2">{message}</p>
              <p className="text-gray-400 text-xs mb-6">Redirecting you to the home page...</p>
              <Link
                to="/"
                className="inline-block bg-black text-white font-black py-3 px-8 uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                Go to Home →
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-black text-3xl">!</span>
              </div>
              <h2 className="text-xl font-black uppercase text-black mb-2">Verification Failed</h2>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <Link
                to="/signup"
                className="inline-block bg-black text-white font-black py-3 px-8 uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                Sign Up →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
