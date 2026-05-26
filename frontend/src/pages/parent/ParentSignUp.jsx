import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../../App';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function ParentSignUp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP inputs
  const [otpCode, setOtpCode] = useState('');
  
  // Interface steps: 'register' or 'verify'
  const [step, setStep] = useState('register');
  const [loading, setLoading] = useState(false);

  // Initialize from location state if redirected (e.g. from login unverified)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.step) {
      setStep(location.state.step);
    }
  }, [location.state]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('All fields are required.');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the Terms & Conditions.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${serverUrl}/api/parent/register`, {
        name,
        email,
        password,
      });

      if (response.data.success) {
        toast.success('Registration initiated. Verification OTP sent to your email.');
        setStep('verify');
      }
    } catch (error) {
      console.error('Parent registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${serverUrl}/api/parent/verify-email`, {
        email,
        code: otpCode.trim(),
      });

      if (response.data.success) {
        toast.success('Email verified successfully! You can now log in.');
        navigate('/parent/login');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    // To trigger a code resend, since there's no custom route, we notify the user.
    toast.info('To get a new code, please sign up again with your credentials.');
    setStep('register');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="border-b border-neutral-800 py-6 px-8 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-widest text-white hover:opacity-80 transition-opacity">
          JAGAT ACADEMY
        </Link>
        <span className="text-xs uppercase tracking-widest text-neutral-400">
          Parent Account Creation
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 rounded-none shadow-2xl">
          {step === 'register' ? (
            /* STEP 1: REGISTRATION FORM */
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight uppercase mb-2">
                  Parent Registration
                </h1>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">
                  Create an account to securely link with your students.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-neutral-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition-colors rounded-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-neutral-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition-colors rounded-none"
                    placeholder="parent@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-neutral-800 px-4 py-3 text-white text-sm focus:outline-none focus:border-white transition-colors rounded-none"
                    placeholder="At least 8 characters"
                    required
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 mr-3 border border-neutral-850 accent-white"
                  />
                  <label htmlFor="agree" className="text-xs text-neutral-400 leading-relaxed uppercase">
                    I agree to the{' '}
                    <Link to="/terms" className="text-white underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-white underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-neutral-200 transition-colors py-3 text-xs uppercase font-bold tracking-widest cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-neutral-900 text-center">
                <p className="text-xs text-neutral-400">
                  Already have a parent account?{' '}
                  <Link to="/parent/login" className="text-white underline font-semibold">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* STEP 2: OTP VERIFICATION CARD */
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight uppercase mb-2">
                  Verify Your Email
                </h1>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">
                  Enter the 6-digit verification code sent to <strong className="text-white">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-black border border-neutral-800 px-4 py-4 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-white transition-colors rounded-none"
                    placeholder="000000"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-neutral-200 transition-colors py-3 text-xs uppercase font-bold tracking-widest cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-neutral-900 text-center space-y-4">
                <button
                  onClick={handleResendCode}
                  className="text-xs text-neutral-400 uppercase underline tracking-wider hover:text-white transition-colors cursor-pointer"
                >
                  Did not receive code? Restart registration
                </button>
                <div>
                  <Link to="/parent/login" className="text-xs text-neutral-500 uppercase underline block hover:text-neutral-300">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-8 text-center text-xs text-neutral-600 uppercase tracking-wider">
        &copy; {new Date().getFullYear()} JAGAT ACADEMY. HIGH-CONTRAST SECURE FRAME.
      </footer>
    </div>
  );
}

export default ParentSignUp;
