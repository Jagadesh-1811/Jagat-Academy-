import React, { useState } from 'react'
import logo from "../assets/logo.jpg"
import { IoMdPerson } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";
import { GiSplitCross } from "react-icons/gi";

import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setToken } from '../redux/userSlice';
function Nav() {
  let [showHam, setShowHam] = useState(false)
  let [showPro, setShowPro] = useState(false)
  let navigate = useNavigate()
  let dispatch = useDispatch()
  let { userData } = useSelector(state => state.user)

  const handleLogout = async () => {
    try {
      dispatch(setUserData(null))
      dispatch(setToken(null))
      localStorage.removeItem('token');
      toast.success("LogOut Successfully")
    } catch (error) {
      console.log(error)
      toast.error("Logout failed")
    }
  }
  return (
    <div className='h-[80px]'>
      <div className='w-full h-[80px] fixed top-0 z-50 bg-black border-b-4 border-black'>
        <div className='max-w-7xl mx-auto px-6 h-full flex items-center justify-between'>

          {/* Logo Section */}
          <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate("/")}>
            <div className='w-[50px] h-[50px] bg-white border-2 border-black flex items-center justify-center text-black font-black'>JA</div>
            <span className='text-white font-black text-xl tracking-tight hidden sm:block uppercase'>JAGAT ACADEMY</span>
          </div>

          {/* Desktop Menu */}
          <div className='hidden lg:flex items-center gap-6'>
            {!userData ? (
              <div className='w-[45px] h-[45px] bg-white border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors' onClick={() => setShowPro(prev => !prev)}>
                <IoMdPerson className='w-[24px] h-[24px] fill-black' />
              </div>
            ) : (
              <div className='relative cursor-pointer' onClick={() => setShowPro(prev => !prev)}>
                {userData?.photoUrl ? (
                  <img src={userData.photoUrl} className='w-[45px] h-[45px] object-cover border-2 border-white' alt="Profile" />
                ) : (
                  <div className='w-[45px] h-[45px] bg-white text-black flex items-center justify-center text-lg font-black border-2 border-white'>
                    {userData?.name ? userData.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            )}

            {userData && (
              <>
                <div className='px-6 py-2 bg-white text-black font-black text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]' onClick={() => navigate("/dashboard")}>
                  Dashboard
                </div>
                <span className='px-6 py-2 bg-white text-black font-black text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors' onClick={handleLogout}>
                  Log Out
                </span>
              </>
            )}

            {!userData && (
              <span className='px-8 py-2.5 bg-white border-2 border-white text-black font-black text-sm uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)]' onClick={() => navigate("/login")}>
                Login
              </span>
            )}
          </div>

          {/* Profile Dropdown */}
          {showPro && (
            <div className='absolute top-[90px] right-[20px] lg:right-[calc((100vw-1280px)/2+20px)] w-[200px] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col py-2'>
              <span className='px-6 py-3 text-black font-bold hover:bg-black hover:text-white cursor-pointer transition-colors text-sm' onClick={() => { navigate("/profile"); setShowPro(false); }}>MY PROFILE</span>
              <span className='px-6 py-3 text-black font-bold hover:bg-black hover:text-white cursor-pointer transition-colors text-sm' onClick={() => { navigate("/enrolledcourses"); setShowPro(false); }}>MY COURSES</span>
              {userData?.role === 'student' && (
                <>
                  <span className='px-6 py-3 text-black font-bold hover:bg-black hover:text-white cursor-pointer transition-colors text-sm' onClick={() => { navigate("/ai-courses"); setShowPro(false); }}>AI COURSES</span>
                  <span className='px-6 py-3 text-black font-bold hover:bg-black hover:text-white cursor-pointer transition-colors text-sm' onClick={() => { navigate("/gamification"); setShowPro(false); }}>GAMIFICATION HUB</span>
                  <span className='px-6 py-3 text-black font-bold hover:bg-black hover:text-white cursor-pointer transition-colors text-sm' onClick={() => { navigate("/student/parent-settings"); setShowPro(false); }}>PARENT SETTINGS</span>
                </>
              )}
              {userData?.role === 'educator' && (
                <span className='px-6 py-3 text-black font-bold hover:bg-black hover:text-white cursor-pointer transition-colors text-sm' onClick={() => { navigate("/ai-courses-review"); setShowPro(false); }}>REVIEW AI COURSES</span>
              )}
            </div>
          )}

          {/* Mobile Hamburger */}
          <GiHamburgerMenu className='w-[30px] h-[30px] text-white lg:hidden cursor-pointer' onClick={() => setShowHam(prev => !prev)} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center gap-8 duration-300 ease-in-out ${showHam ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}>
        <GiSplitCross className='w-[40px] h-[40px] text-black absolute top-6 right-6 cursor-pointer hover:rotate-90 transition-transform' onClick={() => setShowHam(false)} />

        {/* Mobile JA Badge */}
        <div className='w-[80px] h-[80px] bg-black border-2 border-black flex items-center justify-center mb-4'>
          <span className='text-white text-3xl font-black'>JA</span>
        </div>

        {/* Mobile Links */}
        <span className='text-2xl text-black font-black uppercase tracking-wider hover:bg-black hover:text-white px-8 py-2 cursor-pointer border-2 border-transparent hover:border-black transition-colors' onClick={() => { navigate("/profile"); setShowHam(false); }}>My Profile</span>
        <span className='text-2xl text-black font-black uppercase tracking-wider hover:bg-black hover:text-white px-8 py-2 cursor-pointer border-2 border-transparent hover:border-black transition-colors' onClick={() => { navigate("/enrolledcourses"); setShowHam(false); }}>My Courses</span>
        {userData?.role === 'student' && (
          <>
            <span className='text-2xl text-black font-black uppercase tracking-wider hover:bg-black hover:text-white px-8 py-2 cursor-pointer border-2 border-transparent hover:border-black transition-colors' onClick={() => { navigate("/ai-courses"); setShowHam(false); }}>AI Courses</span>
            <span className='text-2xl text-black font-black uppercase tracking-wider hover:bg-black hover:text-white px-8 py-2 cursor-pointer border-2 border-transparent hover:border-black transition-colors' onClick={() => { navigate("/gamification"); setShowHam(false); }}>Gamification Hub</span>
            <span className='text-2xl text-black font-black uppercase tracking-wider hover:bg-black hover:text-white px-8 py-2 cursor-pointer border-2 border-transparent hover:border-black transition-colors' onClick={() => { navigate("/student/parent-settings"); setShowHam(false); }}>Parent Settings</span>
          </>
        )}
        {userData?.role === 'educator' && (
          <span className='text-2xl text-black font-black uppercase tracking-wider hover:bg-black hover:text-white px-8 py-2 cursor-pointer border-2 border-transparent hover:border-black transition-colors' onClick={() => { navigate("/ai-courses-review"); setShowHam(false); }}>Review AI Courses</span>
        )}

        {userData ? (
          <>
            <div className='px-10 py-3 bg-black text-white font-black uppercase tracking-wider text-xl cursor-pointer hover:bg-gray-800 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]' onClick={() => { navigate("/dashboard"); setShowHam(false); }}>Dashboard</div>
            <span className='text-xl text-black font-black uppercase tracking-wider cursor-pointer hover:bg-black hover:text-white px-8 py-2 border-2 border-black' onClick={() => { handleLogout(); setShowHam(false); }}>Log Out</span>
          </>
        ) : (
          <span className='px-12 py-3 border-2 border-black bg-black text-white font-black uppercase tracking-wider text-xl cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]' onClick={() => { navigate("/login"); setShowHam(false); }}>Login</span>
        )}
      </div>
    </div>

  )
}

export default Nav