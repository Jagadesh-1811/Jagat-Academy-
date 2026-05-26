import React, { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../../App';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUserData, setToken } from '../../redux/userSlice';

function ParentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${serverUrl}/api/parent/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { user, token } = response.data;
        
        if (!user.emailVerified) {
          toast.info('Please verify your email first.');
          navigate('/parent/signup', { state: { email: user.email, step: 'verify' } });
          return;
        }

        dispatch(setUserData(user));
        dispatch(setToken(token));
        localStorage.setItem('token', token);
        
        toast.success('Parent Portal Access Granted.');
        navigate('/parent/dashboard');
      }
    } catch (error) {
      console.error('Parent login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="border-b border-neutral-800 py-6 px-8 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-widest text-white hover:opacity-80 transition-opacity">
          JAGAT ACADEMY
        </Link>
        <span className="text-xs uppercase tracking-widest text-neutral-400">
          Parent Portal Access
        </span>
      </header>

      {/* Main Form */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 p-8 rounded-none shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight uppercase mb-2">
              Parent Login
            </h1>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">
              Enter your credentials to monitor student progress.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                Parent Email Address
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
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-neutral-200 transition-colors py-3 text-xs uppercase font-bold tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authorizing...' : 'Log In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-900 text-center space-y-3">
            <p className="text-xs text-neutral-400">
              Need a parent account?{' '}
              <Link to="/parent/signup" className="text-white underline font-semibold hover:text-neutral-200">
                Register here
              </Link>
            </p>
            <p className="text-xs text-neutral-500">
              Looking for student login?{' '}
              <Link to="/login" className="text-neutral-300 underline hover:text-white">
                Student Portal
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 px-8 text-center text-xs text-neutral-600 uppercase tracking-wider">
        &copy; {new Date().getFullYear()} JAGAT ACADEMY. HIGH-CONTRAST SECURE FRAME.
      </footer>
    </div>
  );
}

export default ParentLogin;
