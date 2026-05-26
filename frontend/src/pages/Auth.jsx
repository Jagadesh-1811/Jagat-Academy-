import React, { useState } from 'react'
import logo from '../assets/logo.jpg'
import axios from 'axios'
import { serverUrl } from '../App'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { useDispatch } from 'react-redux'
import { setUserData, setToken } from '../redux/userSlice'
import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut } from '../../utils/Firebase'
import { signInWithPopup } from 'firebase/auth'

function Auth() {
    // Toggle between 'login' and 'signup' modes
    const [mode, setMode] = useState("login")

    // Form fields
    
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const role = "student"
    const [agreeToTerms, setAgreeToTerms] = useState(false)

    // UI states
    const navigate = useNavigate()
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const dispatch = useDispatch()

    const handleGoogleAuth = async () => {
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
                role: role || "user",
                firebaseUid: user.uid
            })

            const syncedUser = response.data.user;

            // Educators are strictly banned from logging in here
            if (syncedUser.role === 'educator') {
                toast.error("Educators are not permitted to log in here. Please use the Educator Portal.");
                await signOut(auth);
                setGoogleLoading(false);
                return;
            }

            dispatch(setUserData(syncedUser))
            dispatch(setToken(response.data.token))
            navigate("/")
            toast.success(mode === "login" ? "Login Successfully with Google" : "Sign Up Successfully with Google")
        } catch (error) {
            console.error("Google Auth Error:", error)
            if (error.code === 'auth/admin-restricted-operation') {
                toast.error("Google Sign-In is not enabled. Please enable it in Firebase Console.")
            } else if (error.code === 'auth/popup-blocked') {
                toast.error("Popup was blocked. Please allow popups for this site.")
            } else if (error.code === 'auth/popup-closed-by-user') {
                toast.error("Sign-in cancelled. Please try again.")
            } else if (error.code) {
                toast.error(`Firebase Error: ${error.code}`)
            } else {
                toast.error(error.response?.data?.message || "Google authentication failed. Please try again.")
            }
        }
        setGoogleLoading(false)
    }

    const handleLogin = async () => {
        if (!email.trim()) {
            toast.error("Please enter your email")
            return
        }
        if (!password.trim()) {
            toast.error("Please enter your password")
            return
        }

        setLoading(true)
        try {
            // 1. Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // 2. Check if email is verified
            if (!user.emailVerified) {
                await sendEmailVerification(user)
                toast.info("Email not verified. Verification email resent! Please check your inbox.")
                // Sign out so they can't access until verified
                await signOut(auth)
                setLoading(false)
                return
            }

            // 3. Get ID token
            const idToken = await user.getIdToken()

            // 4. Sync with backend
            const response = await axios.post(
                serverUrl + "/api/auth/firebase-sync",
                { email },
                { headers: { Authorization: `Bearer ${idToken}` } }
            )

            const syncedUser = response.data.user;

            // Educators are strictly banned from logging in here
            if (syncedUser.role === 'educator') {
                toast.error("Educators are not permitted to log in here. Please use the Educator Portal.");
                await signOut(auth);
                setLoading(false);
                return;
            }

            // 5. Store token and user data
            dispatch(setUserData(syncedUser))
            dispatch(setToken(idToken)) // Store Firebase ID token
            localStorage.setItem("token", idToken)

            navigate("/")
            toast.success("Login Successfully")
        } catch (error) {
            console.error("Login Error:", error)
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                toast.error("Invalid email or password")
            } else if (error.code === 'auth/wrong-password') {
                toast.error("Invalid password")
            } else if (error.code === 'auth/too-many-requests') {
                toast.error("Too many failed attempts. Please try again later.")
            } else {
                toast.error("Login failed. Please try again.")
            }
        }
        setLoading(false)
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

        let firebaseUserCreated = false

        try {
            // 1. Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user
            firebaseUserCreated = true // Mark that Firebase user was successfully created

            // 2. Send verification email
            await sendEmailVerification(user)

            // 3. Get ID token
            const idToken = await user.getIdToken()

            // 4. ATTEMPT to sync with backend (create MongoDB user)
            // This is non-blocking - if it fails, we still show verification page
            try {
                await axios.post(
                    serverUrl + "/api/auth/firebase-sync",
                    { name, email, role },
                    { headers: { Authorization: `Bearer ${idToken}` } }
                )
            } catch (syncError) {
                console.error("Backend sync failed (non-critical):", syncError)
                // Don't show error to user - they can complete sync on login
            }

            // 5. Sign out until they verify
            await signOut(auth)

            // 6. ALWAYS redirect to verification page if we got this far
            navigate('/verify-email-sent')

        } catch (error) {
            console.error("SignUp Error:", error)

            // If Firebase user was created but we hit an error later, still redirect
            if (firebaseUserCreated) {
                navigate('/verify-email-sent')
                return
            }

            // Otherwise, handle Firebase creation errors
            if (error.code === 'auth/email-already-in-use') {
                toast.error("Email already registered. Please login.")
                setTimeout(() => setMode("login"), 2000) // Auto-switch to login
            } else if (error.code === 'auth/weak-password') {
                toast.error("Password is too weak.")
            } else {
                toast.error(error.message || "Sign up failed. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (mode === "login") {
            handleLogin()
        } else {
            handleSignUp()
        }
    }

    return (
        <div className='bg-gray-100 w-screen h-screen flex items-center justify-center flex-col gap-3 relative'>
            {/* Back button */}
            <FaArrowLeft
                className='absolute top-6 left-6 w-5 h-5 cursor-pointer text-black hover:text-gray-600 z-10'
                onClick={() => navigate('/')}
            />
            <form className='w-[90%] md:w-[800px] h-auto min-h-[500px] bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex' onSubmit={handleSubmit}>
                <div className='md:w-[50%] w-full flex flex-col items-center justify-center gap-4 py-8 px-4'>

                    {/* Toggle Tabs */}
                    <div className='flex w-[85%] border-2 border-black p-1'>
                        <button
                            type="button"
                            className={`flex-1 py-2.5 text-sm font-black uppercase tracking-wider transition-none ${mode === 'login' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            onClick={() => setMode('login')}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2.5 text-sm font-black uppercase tracking-wider transition-none ${mode === 'signup' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            onClick={() => setMode('signup')}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Header */}
                    <div className='text-center'>
                        <h1 className='font-black text-black text-2xl uppercase tracking-tight'>
                            {mode === 'login' ? 'Student Login' : "Student Sign Up"}
                        </h1>
                        <h2 className='text-gray-500 text-sm font-bold mt-1'>
                            {mode === 'login' ? 'Login to your student account' : 'Create your student account'}
                        </h2>
                    </div>

                    {/* Name field (Sign Up only) */}
                    {mode === 'signup' && (
                        <div className='flex flex-col gap-1 w-[85%] items-start justify-center'>
                            <label htmlFor="name" className='font-black text-sm uppercase tracking-wider'>Name</label>
                            <input
                                id='name'
                                type="text"
                                className='border-2 border-black w-full h-[42px] text-sm px-4 font-bold focus:outline-none focus:ring-2 focus:ring-black'
                                placeholder='Your name'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                    )}

                    {/* Email field */}
                    <div className='flex flex-col gap-1 w-[85%] items-start justify-center'>
                        <label htmlFor="email" className='font-black text-sm uppercase tracking-wider'>Email</label>
                        <input
                            id='email'
                            type="email"
                            className='border-2 border-black w-full h-[42px] text-sm px-4 font-bold focus:outline-none focus:ring-2 focus:ring-black'
                            placeholder='Your email'
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>

                    {/* Password field */}
                    <div className='flex flex-col gap-1 w-[85%] items-start justify-center relative'>
                        <label htmlFor="password" className='font-black text-sm uppercase tracking-wider'>Password</label>
                        <input
                            id='password'
                            type={show ? "text" : "password"}
                            className='border-2 border-black w-full h-[42px] text-sm px-4 font-bold focus:outline-none focus:ring-2 focus:ring-black pr-10'
                            placeholder='***********'
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                        {!show && <VisibilityOffOutlinedIcon className='absolute w-[20px] h-[20px] cursor-pointer right-[4%] bottom-[11px] text-black' onClick={() => setShow(prev => !prev)} />}
                        {show && <VisibilityOutlinedIcon className='absolute w-[20px] h-[20px] cursor-pointer right-[4%] bottom-[11px] text-black' onClick={() => setShow(prev => !prev)} />}
                    </div>

                    {/* Terms & Conditions (Both Login and Sign Up) */}
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

                    {/* Submit button */}
                    <button
                        type="submit"
                        className='w-[85%] h-[46px] bg-black text-white font-black text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={loading || !agreeToTerms}
                    >
                        {loading ? <ClipLoader size={30} color='white' /> : (mode === 'login' ? "Login →" : "Sign Up →")}
                    </button>

                    {/* Divider */}
                    <div className='flex items-center w-[85%] gap-3'>
                        <div className='flex-1 h-[2px] bg-gray-300'></div>
                        <span className='text-gray-500 text-xs font-black uppercase tracking-wider'>or</span>
                        <div className='flex-1 h-[2px] bg-gray-300'></div>
                    </div>

                    {/* Google button */}
                    <button
                        type="button"
                        className='w-[85%] h-[46px] bg-white border-2 border-black text-black font-black text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={googleLoading || !agreeToTerms}
                        onClick={handleGoogleAuth}
                    >
                        {googleLoading ? <ClipLoader size={25} color='black' /> : <><GoogleIcon sx={{ fontSize: 22, color: '#4285F4' }} /> Continue with Google</>}
                    </button>

                    {/* Forgot password (Login only) */}
                    {mode === 'login' && (
                        <span
                            className='text-xs font-black text-gray-500 uppercase tracking-wider cursor-pointer hover:text-black'
                            onClick={() => navigate("/forgotpassword")}
                        >
                            Forgot your password?
                        </span>
                    )}

                    {mode === 'signup' && (
                        <div className='text-sm font-bold text-gray-500'>
                            Already have an account?{' '}
                            <span className='underline text-black cursor-pointer hover:text-gray-700' onClick={() => setMode('login')}>Login</span>
                        </div>
                    )}

                    {mode === 'login' && (
                        <div className='text-sm font-bold text-gray-500'>
                            Don't have an account?{' '}
                            <span className='underline text-black cursor-pointer hover:text-gray-700' onClick={() => setMode('signup')}>Sign up</span>
                        </div>
                    )}

                </div>

                {/* Right side - Logo */}
                <div className='w-[50%] bg-black md:flex items-center justify-center flex-col hidden border-l-4 border-black'>
                    <img src={logo} className='w-32 border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]' alt="" />
                    <span className='text-white text-xl font-black tracking-tight mt-4 uppercase'>JAGAT ACADEMY</span>
                    <span className='text-gray-400 text-xs font-bold tracking-wider mt-1'>INTEGRATED E-LEARNING PLATFORM</span>
                </div>
            </form>
        </div>
    )
}

export default Auth

