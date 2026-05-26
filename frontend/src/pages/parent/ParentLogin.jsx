import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUserData, setToken } from '../../redux/userSlice';

const ParentLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/parent/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch(setToken(res.data.token));
      dispatch(setUserData(res.data.user));
      toast.success('Logged in successfully');
      navigate('/parent/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-black flex items-center justify-center text-white font-black text-lg">
              JA
            </div>
            <div className="text-left">
              <p className="text-black font-black text-xl leading-none">JAGAT ACADEMY</p>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-1">Parent Portal</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="border-b-4 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black">Parent Login</h1>
            <p className="text-gray-500 text-xs font-bold mt-1">Monitor your child's progress</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full border-2 border-black px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border-2 border-black px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black border-2 border-black text-white font-black py-4 uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : 'Login →'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-500 text-sm font-bold">
              Don't have an account?{' '}
              <Link to="/parent/signup" className="text-black underline hover:text-gray-600">
                Sign Up
              </Link>
            </p>
            <Link to="/login" className="block text-xs text-gray-400 font-bold hover:text-black transition-colors">
              ← Back to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentLogin;
