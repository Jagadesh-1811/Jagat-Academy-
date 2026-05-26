import React, { useState } from 'react'
import logo from '../../assets/logo.jpg'
import axios from 'axios'
import { serverUrl } from '../../App'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import SchoolIcon from '@mui/icons-material/School';
import KeyIcon from '@mui/icons-material/Key';
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { useDispatch } from 'react-redux'
import { setUserData, setToken } from '../../redux/userSlice'
import { auth, googleProvider, createUserWithEmailAndPassword, sendEmailVerification, signOut } from '../../../utils/Firebase'
import { signInWithPopup } from 'firebase/auth'

// Educator invitation code - This should match the one in your backend .env
const EDUCATOR_INVITATION_CODE = "JAGAT2024EDU"

function EducatorSignUp() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [invitationCode, setInvitationCode] = useState("")
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const navigate = useNavigate()
    const [show, setShow] = useState(false)
    const [showCode, setShowCode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const dispatch = useDispatch()

    // Email verification states
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [otpCode, setOtpCode] = useState("")
    const [otpLoading, setOtpLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)

    const validateInvitationCode = () => {
        if (invitationCode.trim().toUpperCase() !== EDUCATOR_INVITATION_CODE) {
            toast.error("Invalid invitation code. Please contact administration for a valid code.")
            return false
        }
        return true
    }

    const handleGoogleAuth = async () => {
        if (!agreeToTerms) {
            toast.error("Please agree to the Terms & Conditions and Privacy Policy")
            return
        }
        if (!validateInvitationCode()) {
            return
        }

        setGoogleLoading(true)
        try {
            const result = await signInWithPopup(auth, googleProvider)
            const user = result.user

            // Get ID token
            const idToken = await user.getIdToken()

            // Sync with backend - create as educator
            const response = await axios.post(
                serverUrl + "/api/auth/firebase-sync",
                {
                    name: user.displayName,
                    email: user.email,
                    role: "educator"
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            )

            // Trigger 6-digit verification code email from backend
            try {
                await axios.post(serverUrl + "/api/auth/educator/send-code", { email: user.email })
                toast.success("A 6-digit professional verification code has been sent to your Google email!")
            } catch (codeError) {
                console.error("❌ Failed to send verification code:", codeError)
                toast.error("Failed to send 6-digit verification code. Please request a resend.")
            }

            // Set state variables
            setEmail(user.email)
            setName(user.displayName || "")

            // Transition to verification screen
            setIsVerifyingEmail(true)
        } catch (error) {
            console.error("Google Auth Error:", error)
            if (error.code === 'auth/popup-blocked') {
                toast.error("Popup was blocked. Please allow popups for this site.")
            } else if (error.code === 'auth/popup-closed-by-user') {
                toast.error("Sign-up cancelled. Please try again.")
            } else {
                toast.error(error.response?.data?.message || "Sign up failed. Please try again.")
            }
        }
        setGoogleLoading(false)
    }

    const handleSignUp = async () => {
        if (!agreeToTerms) {
            toast.error("Please agree to the Terms & Conditions and Privacy Policy")
            return
        }
        if (!validateInvitationCode()) {
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
            firebaseUserCreated = true

            // 2. Send verification email
            await sendEmailVerification(user)

            // 3. Get ID token
            const idToken = await user.getIdToken()

            // 4. Sync with backend - create as educator (IMPORTANT: must include role!)
            try {
                const syncResponse = await axios.post(
                    serverUrl + "/api/auth/firebase-sync",
                    { name, email, role: "educator" },
                    { headers: { Authorization: `Bearer ${idToken}` } }
                )
                console.log("✅ Educator account synced to backend:", syncResponse.data)
            } catch (syncError) {
                console.error("❌ Backend sync failed:", syncError)
                toast.warn("Account created but sync had issues. Please contact support if problems persist.")
            }

            // 5. Send 6-digit verification code to educator email from backend
            try {
                await axios.post(serverUrl + "/api/auth/educator/send-code", { email })
                toast.success("A 6-digit professional verification code has been sent to your email!")
            } catch (codeError) {
                console.error("❌ Failed to send verification code:", codeError)
                toast.error("Failed to send 6-digit verification code. Please request a resend.")
            }

            // 6. Move to verification screen
            setIsVerifyingEmail(true)

        } catch (error) {
            console.error("SignUp Error:", error)

            if (firebaseUserCreated) {
                // If user was created in Firebase, still let them verify
                try {
                    await axios.post(serverUrl + "/api/auth/educator/send-code", { email })
                    setIsVerifyingEmail(true)
                    toast.info("Please enter the verification code sent to your email to continue.")
                    return
                } catch (codeError) {
                    console.error("❌ Failed to send verification code:", codeError)
                }
            }

            if (error.code === 'auth/email-already-in-use') {
                toast.error("Email already registered. Please login instead.")
            } else if (error.code === 'auth/weak-password') {
                toast.error("Password is too weak.")
            } else {
                toast.error(error.message || "Sign up failed. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async (e) => {
        e.preventDefault()
        if (otpCode.trim().length !== 6) {
            toast.error("Please enter a valid 6-digit verification code.")
            return
        }

        setOtpLoading(true)
        try {
            const response = await axios.post(serverUrl + "/api/auth/educator/verify-code", {
                email: email.toLowerCase(),
                code: otpCode.trim()
            })

            if (response.data.success) {
                toast.success("Email verified successfully!")
                
                // Sign out from Firebase now that they are verified, until admin approves
                await signOut(auth)
                
                // Store educator flag for checking status and navigate to login
                localStorage.setItem('pendingEducatorSignup', 'true')
                navigate('/educator/login')
                toast.info("Account is now pending admin approval. You can check status anytime on the login portal.")
            } else {
                toast.error(response.data.message || "Verification failed.")
            }
        } catch (error) {
            console.error("Verification Error:", error)
            toast.error(error.response?.data?.message || "Invalid or expired verification code.")
        } finally {
            setOtpLoading(false)
        }
    }

    const handleResendCode = async () => {
        setResendLoading(true)
        try {
            await axios.post(serverUrl + "/api/auth/educator/send-code", { email })
            toast.success("A new verification code has been dispatched to your email!")
        } catch (error) {
            console.error("Resend Error:", error)
            toast.error("Failed to resend verification code. Please try again later.")
        } finally {
            setResendLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        handleSignUp()
    }

    return (
        <div className='bg-[#1a1a2e] w-full min-h-screen flex items-center justify-center p-4'>
            <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row'>

                {/* Left Side - Form or Verification Code */}
                {isVerifyingEmail ? (
                    <div className='w-full md:w-[55%] p-8 md:p-10 flex flex-col justify-center'>
                        {/* Educator Badge */}
                        <div className='inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-6 max-w-max'>
                            <SchoolIcon className='text-lg' />
                            <span className='font-semibold text-sm'>Email Verification</span>
                        </div>

                        {/* Header */}
                        <h1 className='text-2xl md:text-3xl font-bold text-black mb-1'>Verify Your Professional Email</h1>
                        <p className='text-gray-500 mb-6'>Enter the 6-digit verification code sent to <strong className="text-black">{email}</strong></p>

                        <form onSubmit={handleVerifyCode} className="space-y-5">
                            <div className='mb-5'>
                                <label htmlFor="otpCode" className='block text-sm font-semibold text-black mb-2'>
                                    6-Digit Verification Code
                                </label>
                                <input
                                    id='otpCode'
                                    type="text"
                                    maxLength={6}
                                    className='w-full h-[50px] px-4 border-2 border-black rounded-lg text-center font-mono text-2xl tracking-[10px] focus:outline-none focus:border-black transition-colors text-black'
                                    placeholder='000000'
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    value={otpCode}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className='w-full h-[50px] bg-black text-white font-semibold rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                disabled={otpLoading || otpCode.length !== 6}
                            >
                                {otpLoading ? <ClipLoader size={24} color='white' /> : "Verify Code & Complete Sign Up"}
                            </button>
                        </form>

                        {/* Sandbox Notice */}
                        <div className='mt-6 p-4 border-2 border-dashed border-gray-400 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-2'>
                            <p className='font-bold text-black'>💡 Sandbox/Development Reminder:</p>
                            <p>If you do not receive the email, please check the <strong>backend console terminal log</strong> where the 6-digit code has been printed!</p>
                        </div>

                        {/* Actions */}
                        <div className='mt-6 flex flex-col gap-3'>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                className='w-full h-[40px] bg-white border-2 border-black text-black font-semibold rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50'
                                disabled={resendLoading}
                            >
                                {resendLoading ? <ClipLoader size={18} color='black' /> : "Resend Verification Code"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsVerifyingEmail(false);
                                    setOtpCode("");
                                }}
                                className='text-center text-sm font-semibold text-gray-500 hover:text-black underline cursor-pointer mt-2'
                            >
                                ← Back to Registration Details
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='w-full md:w-[55%] p-8 md:p-10'>

                        {/* Educator Badge */}
                        <div className='inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-6'>
                            <SchoolIcon className='text-lg' />
                            <span className='font-semibold text-sm'>Educator Registration</span>
                        </div>

                        {/* Header */}
                        <h1 className='text-2xl md:text-3xl font-bold text-black mb-1'>Join as an Educator</h1>
                        <p className='text-gray-500 mb-6'>Create courses and inspire students</p>

                        <form onSubmit={handleSubmit}>
                            {/* Invitation Code Field */}
                            <div className='mb-5'>
                                <label htmlFor="invitationCode" className='flex items-center gap-2 text-sm font-semibold text-black mb-2'>
                                    <KeyIcon className='text-gray-600' />
                                    Invitation Code
                                    <span className='text-gray-500'>*</span>
                                </label>
                                <div className='relative'>
                                    <input
                                        id='invitationCode'
                                        type={showCode ? "text" : "password"}
                                        className='w-full h-[50px] px-4 pr-12 border-2 border-gray-800 bg-gray-50 rounded-lg text-base focus:outline-none focus:border-black transition-colors'
                                        placeholder='Enter your invitation code'
                                        onChange={(e) => setInvitationCode(e.target.value)}
                                        value={invitationCode}
                                    />
                                    <button
                                        type="button"
                                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black'
                                        onClick={() => setShowCode(prev => !prev)}
                                    >
                                        {showCode ? <VisibilityOutlinedIcon style={{ fontSize: 22 }} /> : <VisibilityOffOutlinedIcon style={{ fontSize: 22 }} />}
                                    </button>
                                </div>
                                <p className='text-xs text-gray-500 mt-1'>Contact admin to get your educator invitation code</p>
                            </div>

                            {/* Full Name Field */}
                            <div className='mb-5'>
                                <label htmlFor="name" className='block text-sm font-semibold text-black mb-2'>
                                    Full Name
                                </label>
                                <input
                                    id='name'
                                    type="text"
                                    className='w-full h-[50px] px-4 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-black transition-colors'
                                    placeholder='Your full name'
                                    onChange={(e) => setName(e.target.value)}
                                    value={name}
                                />
                            </div>

                            {/* Email Field */}
                            <div className='mb-5'>
                                <label htmlFor="email" className='block text-sm font-semibold text-black mb-2'>
                                    Email
                                </label>
                                <input
                                    id='email'
                                    type="email"
                                    className='w-full h-[50px] px-4 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-black transition-colors'
                                    placeholder='Your professional email'
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                />
                            </div>

                            {/* Password Field */}
                            <div className='mb-5 relative'>
                                <label htmlFor="password" className='block text-sm font-semibold text-black mb-2'>
                                    Password
                                </label>
                                <input
                                    id='password'
                                    type={show ? "text" : "password"}
                                    className='w-full h-[50px] px-4 pr-12 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-black transition-colors'
                                    placeholder='Min. 8 characters'
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                />
                                <button
                                    type="button"
                                    className='absolute right-4 top-[42px] text-gray-500 hover:text-black'
                                    onClick={() => setShow(prev => !prev)}
                                >
                                    {show ? <VisibilityOutlinedIcon style={{ fontSize: 22 }} /> : <VisibilityOffOutlinedIcon style={{ fontSize: 22 }} />}
                                </button>
                            </div>

                            {/* Terms & Conditions */}
                            <div className='flex items-start gap-3 mb-6'>
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className='w-5 h-5 mt-0.5 cursor-pointer accent-black rounded'
                                />
                                <label htmlFor="agreeTerms" className='text-sm text-gray-600'>
                                    I agree to the{' '}
                                    <Link to="/terms" className='text-black font-medium underline hover:text-gray-700'>
                                        Terms & Conditions
                                    </Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className='text-black font-medium underline hover:text-gray-700'>
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Sign Up Button */}
                            <button
                                type="submit"
                                className='w-full h-[50px] bg-black text-white font-semibold rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                disabled={loading || !agreeToTerms}
                            >
                                {loading ? <ClipLoader size={24} color='white' /> : "Create Educator Account"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className='flex items-center gap-4 my-6'>
                            <div className='flex-1 h-[1px] bg-gray-200'></div>
                            <span className='text-gray-400 text-sm'>or</span>
                            <div className='flex-1 h-[1px] bg-gray-200'></div>
                        </div>

                        {/* Google Button */}
                        <button
                            type="button"
                            className='w-full h-[50px] bg-white border-2 border-gray-200 text-black font-medium rounded-lg flex items-center justify-center gap-3 hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={googleLoading || !agreeToTerms}
                            onClick={handleGoogleAuth}
                        >
                            {googleLoading ? <ClipLoader size={24} color='black' /> : <><GoogleIcon style={{ fontSize: 22 }} /> Continue with Google</>}
                        </button>

                        {/* Links */}
                        <div className='mt-6 pt-6 border-t border-gray-100 space-y-2'>
                            <p className='text-center text-sm text-gray-600'>
                                Already have an educator account?{' '}
                                <span
                                    className='text-black font-semibold underline cursor-pointer hover:text-gray-700'
                                    onClick={() => navigate("/educator/login")}
                                >
                                    Login here
                                </span>
                            </p>
                            <p className='text-center text-sm text-gray-600'>
                                Are you a student?{' '}
                                <span
                                    className='text-black font-semibold underline cursor-pointer hover:text-gray-700'
                                    onClick={() => navigate("/login")}
                                >
                                    Student Login here
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Right Side - Branding */}
                <div className='hidden md:flex w-[45%] bg-black flex-col items-center justify-center p-10 text-center'>
                    <div className='bg-white p-4 rounded-2xl shadow-lg mb-6'>
                        <img src={logo} className='w-20 h-20 object-contain' alt="Jagat Academy" />
                    </div>

                    <h2 className='text-white text-2xl font-bold mb-2 text-center px-4'>JAGAT ACADEMY INTEGRATED E-LEARNING PLATFORM</h2>
                    <p className='text-gray-400 text-sm mb-8'>Educator Registration</p>

                    <div className='text-left'>
                        <p className='text-gray-400 text-sm mb-4'>Why become an educator?</p>
                        <ul className='space-y-2'>
                            <li className='text-white text-sm'>• Create and sell courses</li>
                            <li className='text-white text-sm'>• Reach thousands of students</li>
                            <li className='text-white text-sm'>• Track student progress</li>
                            <li className='text-white text-sm'>• Earn from your expertise</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EducatorSignUp

