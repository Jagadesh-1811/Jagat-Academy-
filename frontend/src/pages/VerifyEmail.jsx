import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const VerifyEmail = () => {
  const navigate = useNavigate();
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
          <div className="py-8">
            {/* Mail icon */}
            <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <h2 className="text-xl font-black uppercase text-black mb-2">Check Your Email</h2>
            <p className="text-gray-500 text-sm mb-4 max-w-xs mx-auto">
              We've sent a verification link to your email address. Please click the link to verify your account.
            </p>
            <div className="bg-gray-50 border-2 border-black p-4 mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Important</p>
              <p className="text-gray-600 text-xs mt-1">
                The link expires in 24 hours. If you don't see the email, check your spam folder.
              </p>
            </div>

            <Link
              to="/login"
              className="inline-block bg-black text-white font-black py-3 px-8 uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              Go to Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
