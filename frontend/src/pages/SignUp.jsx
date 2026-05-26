import React, { useState } from 'react'
import logo from '../assets/logo.jpg'
import axios from 'axios'
import { serverUrl } from '../App'
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { MdRemoveRedEye } from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'

import { auth, googleProvider } from '../../utils/Firebase'
import { signInWithPopup } from 'firebase/auth'


function SignUp() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("student")
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const navigate = useNavigate()
    let [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)

    const handleGoogleSignUp = async () => {
        if (!agreeToTerms) {
            toast.error("Please agree to the Terms & Conditions and Privacy Policy")
            return
        }
        setGoogleLoading(true)
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user
            const response = await axios.post(serverUrl + "/api/auth/googlesignup", {
                name: user.displayName,
                email: user.email,
                role: role || "user"
            })
            dispatch(setUserData(response.data.user))
            dispatch(setToken(response.data.token))
            navigate("/")
            toast.success("Sign Up Successfully with Google")
        } catch (error) {
            console.error("Google SignUp Error:", error)
            if (error.code === 'auth/admin-restricted-operation') {
                toast.error("Google Sign-In is not enabled. Please enable it in Firebase Console.")
            } else if (error.code === 'auth/popup-blocked') {
                toast.error("Popup was blocked. Please allow popups for this site.")
            } else if (error.code === 'auth/popup-closed-by-user') {
                toast.error("Sign-up cancelled. Please try again.")
            } else if (error.code) {
                toast.error(`Firebase Error: ${error.code}`)
            } else {
                toast.error(error.response?.data?.message || "Google sign up failed. Please try again.")
            }
        }
        setGoogleLoading(false)
    }

    const handleSignUp = async () => {
        if (!agreeToTerms) {
            toast.error("Please agree to the Terms & Conditions and Privacy Policy")
            return
        }

        if (!name.trim()) {
            toast.error("Please enter your name")
            return
        }

        if (!email.trim()) {
            toast.error("Please enter your email")
            return
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        try {
            // Sign up with backend (MongoDB) with email verification
            const response = await axios.post(serverUrl + "/api/auth/signup-verify", {
                name: name,
                email: email,
                password: password,
                role: role,
                frontendUrl: window.location.origin
            })

            const { emailSent, verificationLink } = response.data

            if (emailSent) {
                toast.success("Verification email sent! Please check your inbox.")
                navigate('/verify-email-sent')
            } else if (verificationLink) {
                // Dev mode - link returned directly
                toast.success("Account created! Use the link below to verify.")
                navigate('/verify-email-sent')
            } else {
                toast.success("Account created! Please check your email to verify.")
                navigate('/verify-email-sent')
            }

        } catch (error) {
            console.error("SignUp Error:", error)
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error(error.message || "Sign up failed. Please try again.")
            }
        }
        setLoading(false)
    }

    return (
        <div className='bg-gray-100 w-screen h-screen flex items-center justify-center flex-col gap-3 relative'>
            {/* Back button */}
            <FaArrowLeft
                className='absolute top-6 left-6 w-5 h-5 cursor-pointer text-black hover:text-gray-600 z-10'
                onClick={() => navigate('/')}
            />
            <form className='w-[90%] md:w-[800px] h-auto min-h-[500px] bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex' onSubmit={(e) => e.preventDefault()}>
                <div className='md:w-[50%] w-full flex flex-col items-center justify-center gap-4 py-8 px-4'>
                    <div className='text-center'>
                        <h1 className='font-black text-black text-3xl uppercase tracking-tight'>Let's get Started</h1>
                        <h2 className='text-gray-500 text-base font-bold mt-1'>Create your account</h2>
                    </div>
                    <div className='flex flex-col gap-1 w-[85%] items-start justify-center'>
                        <label htmlFor="name" className='font-black text-sm uppercase tracking-wider'>Name</label>
                        <input id='name' type="text" className='border-2 border-black w-full h-[42px] text-sm px-4 font-bold focus:outline-none focus:ring-2 focus:ring-black' placeholder='Your name' onChange={(e) => setName(e.target.value)} value={name} />
                    </div>
                    <div className='flex flex-col gap-1 w-[85%] items-start justify-center'>
                        <label htmlFor="email" className='font-black text-sm uppercase tracking-wider'>Email</label>
                        <input id='email' type="text" className='border-2 border-black w-full h-[42px] text-sm px-4 font-bold focus:outline-none focus:ring-2 focus:ring-black' placeholder='Your email' onChange={(e) => setEmail(e.target.value)} value={email} />
                    </div>
                    <div className='flex flex-col gap-1 w-[85%] items-start justify-center relative'>
                        <label htmlFor="password" className='font-black text-sm uppercase tracking-wider'>Password</label>
                        <input id='password' type={show ? "text" : "password"} className='border-2 border-black w-full h-[42px] text-sm px-4 font-bold focus:outline-none focus:ring-2 focus:ring-black pr-10' placeholder='***********' onChange={(e) => setPassword(e.target.value)} value={password} />
                        {!show && <MdOutlineRemoveRedEye className='absolute w-[20px] h-[20px] cursor-pointer right-[4%] bottom-[11px] text-black' onClick={() => setShow(prev => !prev)} />}
                        {show && <MdRemoveRedEye className='absolute w-[20px] h-[20px] cursor-pointer right-[4%] bottom-[11px] text-black' onClick={() => setShow(prev => !prev)} />}
                    </div>
                    <div className='flex w-[85%] items-center gap-3'>
                        <span className={`flex-1 py-2 border-2 text-center font-black text-sm uppercase tracking-wider cursor-pointer transition-none ${role === 'student' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`} onClick={() => setRole("student")}>Student</span>
                        <span className={`flex-1 py-2 border-2 text-center font-black text-sm uppercase tracking-wider cursor-pointer transition-none ${role === 'educator' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'}`} onClick={() => setRole("educator")}>Educator</span>
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div className='flex items-start gap-2 w-[85%]'>
                        <input
                            type="checkbox"
                            id="agreeTerms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className='mt-1 w-5 h-5 cursor-pointer accent-black border-2 border-black'
                        />
                        <label htmlFor="agreeTerms" className='text-xs font-bold text-gray-600'>
                            I agree to the{' '}
                            <Link to="/terms" className='text-black underline font-black'>
                                Terms & Conditions
                            </Link>
                            {' '}and{' '}
                            <Link to="/privacy" className='text-black underline font-black'>
                                Privacy Policy
                            </Link>
                        </label>
                    </div>

                    <button className='w-[85%] h-[46px] bg-black text-white font-black text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed' disabled={loading || !agreeToTerms} onClick={handleSignUp}>{loading ? <ClipLoader size={30} color='white' /> : "Sign Up →"}</button>

                    <div className='flex items-center w-[85%] gap-3'>
                        <div className='flex-1 h-[2px] bg-gray-300'></div>
                        <span className='text-gray-500 text-xs font-black uppercase tracking-wider'>or</span>
                        <div className='flex-1 h-[2px] bg-gray-300'></div>
                    </div>

                    <button className='w-[85%] h-[46px] bg-white border-2 border-black text-black font-black text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed' disabled={googleLoading || !agreeToTerms} onClick={handleGoogleSignUp}>
                        {googleLoading ? <ClipLoader size={25} color='black' /> : <><FcGoogle className='text-xl' /> Continue with Google</>}
                    </button>

                    <div className='text-sm font-bold text-gray-500'>Already have an account? <span className='underline text-black cursor-pointer hover:text-gray-700' onClick={() => navigate("/login")}>Login</span></div>

                </div>
                <div className='w-[50%] bg-black md:flex items-center justify-center flex-col hidden border-l-4 border-black'>
                    <img src={logo} className='w-32 border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]' alt="" />
                    <span className='text-white text-xl font-black tracking-tight mt-4 uppercase'>JAGAT ACADEMY</span>
                    <span className='text-gray-400 text-xs font-bold tracking-wider mt-1'>E-LEARNING PLATFORM</span>
                </div>

            </form>
        </div>
    )
}

export default SignUp

