import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'

function ResetPassword() {
    const navigate = useNavigate()
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    setIsValidSession(true)
                } else {
                    setIsValidSession(false)
                }
            } catch (error) {
                console.error("Session check error:", error)
                setIsValidSession(false)
            }
            setCheckingSession(false)
        }
        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true)
                setCheckingSession(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            toast.success("Password reset successfully!")
            await supabase.auth.signOut()
            navigate("/login")
        } catch (error) {
            console.error("Password reset error:", error)
            toast.error(error.message || "Failed to reset password. Please try again.")
        }
        setLoading(false)
    }

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <ClipLoader size={50} color='black' />
                </div>
            </div>
        )
    }

    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="bg-white border-4 border-black p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-4xl font-black">!</span>
                    </div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                        Invalid or Expired Link
                    </h2>
                    <p className="text-gray-500 font-bold mb-6">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <button
                        onClick={() => navigate("/forgotpassword")}
                        className="w-full bg-black text-white py-3 px-4 font-black uppercase text-sm tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                    >
                        Request New Link
                    </button>
                    <div
                        className="text-sm text-center mt-4 text-gray-500 cursor-pointer hover:text-black font-black uppercase tracking-wider"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="bg-white border-4 border-black p-8 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black text-center text-black uppercase tracking-tight mb-2">
                    Reset Your Password
                </h2>
                <p className="text-sm text-gray-500 font-bold text-center mb-6">
                    Enter a new password below to regain access to your account.
                </p>

                <form className="space-y-5" onSubmit={handleResetPassword}>
                    <div>
                        <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter new password (min 8 characters)"
                            className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                            onChange={(e) => setNewPassword(e.target.value)}
                            value={newPassword}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Re-enter new password"
                            className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-none font-black uppercase text-sm tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={25} color='white' /> : "Reset Password"}
                    </button>
                </form>

                <div
                    className="text-center text-sm mt-6 text-gray-500 cursor-pointer hover:text-black font-black uppercase tracking-wider border-t-2 border-black pt-4"
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </div>
            </div>
        </div>
    )
}

export default ResetPassword
