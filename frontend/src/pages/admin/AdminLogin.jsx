import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { serverUrl } from '../../App';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${serverUrl}/api/admin/login`, {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminData', JSON.stringify(response.data.admin));
                toast.success('Welcome Admin!');
                navigate('/admin/dashboard');
            } else {
                toast.error(response.data.message || 'Login failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
            {/* Back button */}
            <Link
                to="/"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors border-2 border-white/30 px-4 py-2 text-xs font-black uppercase tracking-wider"
            >
                <ArrowBackIcon /> Back to Home
            </Link>
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-10" 
                style={{
                    backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
            
            {/* Decorative pulsing elements */}
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/10" 
                style={{animation: 'pulse 4s ease-in-out infinite'}} />
            <div className="absolute bottom-20 right-20 w-48 h-48 border border-white/10" 
                style={{animation: 'pulse 4s ease-in-out infinite 1s'}} />
            <div className="absolute top-1/2 right-40 w-24 h-24 bg-white/5" />

            {/* Login Card */}
            <div className="relative w-full max-w-md bg-white border-4 border-black p-8"
                style={{boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)'}}>
                
                {/* Logo area */}
                <div className="flex items-center justify-center mb-8">
                    <div className="w-14 h-14 bg-black flex items-center justify-center">
                        <span className="text-white font-black text-xl">JA</span>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-center uppercase tracking-tight mb-1">
                    Admin Login
                </h1>
                <p className="text-gray-500 text-xs text-center uppercase font-bold mb-8">
                    Jagat Academy Management
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">Email</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                <EmailIcon className="text-black" style={{fontSize: '18px'}} />
                            </div>
                            <input
                                type="email"
                                placeholder="admin@jagatacademy.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused(null)}
                                className="w-full border-3 border-black py-3 pl-10 pr-3 text-sm font-bold focus:outline-none bg-white placeholder-gray-400"
                                style={{borderWidth: '3px'}}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase tracking-wider text-gray-600">Password</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                <LockIcon className="text-black" style={{fontSize: '18px'}} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused(null)}
                                className="w-full border-3 border-black py-3 pl-10 pr-10 text-sm font-bold focus:outline-none bg-white placeholder-gray-400"
                                style={{borderWidth: '3px'}}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                {showPassword ? (
                                    <VisibilityOffIcon className="text-gray-500" style={{fontSize: '18px'}} />
                                ) : (
                                    <VisibilityIcon className="text-gray-500" style={{fontSize: '18px'}} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-black py-4 uppercase text-sm tracking-wider border-2 border-black hover:bg-gray-800 active:translate-y-0.5 transition-none disabled:opacity-50"
                        style={{boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)'}}
                    >
                        {loading ? <ClipLoader size={20} color="white" /> : 'Sign In →'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-6 font-bold uppercase tracking-wider">
                    Authorized personnel only
                </p>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
