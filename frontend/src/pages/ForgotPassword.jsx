import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { sendPasswordResetEmail, auth } from '../../utils/Firebase'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setEmailSent(true)
      toast.success("Password reset email sent! Please check your inbox.")
    } catch (error) {
      console.error("Reset password error:", error)
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email.")
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address.")
      } else {
        toast.error(error.message || "Failed to send reset email. Please try again.")
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6 border-2 border-black">
          {emailSent ? <CheckCircleIcon className="text-white text-4xl" /> : <LockIcon className="text-white text-4xl" />}
        </div>

        <h2 className="text-2xl font-black text-center text-black uppercase tracking-tight mb-3">
          {emailSent ? "Check Your Email" : "Forgot Password?"}
        </h2>

        <p className="text-sm text-gray-500 font-bold text-center mb-8">
          {emailSent
            ? `We've sent a password reset link to ${email}. Click the link in the email to set a new password.`
            : "Enter your email address and we'll send you a link to reset your password."
          }
        </p>

        {!emailSent ? (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 font-black uppercase text-sm tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color='white' /> : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setEmailSent(false)}
              className="w-full bg-white border-2 border-black text-black py-3 px-4 font-black uppercase text-sm tracking-wider hover:bg-gray-100 transition-colors"
            >
              Resend Link
            </button>
          </div>
        )}

        <div className="mt-8 text-center border-t-2 border-black pt-6">
          <button
            onClick={() => navigate("/auth")}
            className="text-sm text-gray-500 hover:text-black font-black uppercase tracking-wider flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowBackIcon className="mr-1" /> Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
