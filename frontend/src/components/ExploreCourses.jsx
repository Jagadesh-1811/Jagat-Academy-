import React from 'react'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import DesignServicesOutlinedIcon from '@mui/icons-material/DesignServicesOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useNavigate } from 'react-router-dom';

function ExploreCourses() {
  const navigate = useNavigate()
  return (
    <div className='w-full max-w-7xl mx-auto min-h-[50vh] lg:h-[50vh] flex flex-col lg:flex-row items-center justify-center gap-4 px-[30px] overflow-hidden py-12'>
      <div className='w-full lg:w-[350px] flex flex-col items-start justify-center gap-3 md:px-[40px] px-[20px]'>
        <span className='text-4xl font-black uppercase tracking-tight'>Explore</span>
        <span className='text-4xl font-black uppercase tracking-tight'>Our Courses</span>
        <p className='text-base font-medium text-gray-600 mt-2'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem vel iure explicabo laboriosam accusantium expedita laudantium facere magnam.</p>
        <button className='px-6 py-3 border-2 border-black bg-black text-white font-black text-sm uppercase tracking-wider flex gap-2 mt-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all' onClick={() => navigate("/allcourses")}>Explore Courses <ArrowForwardOutlinedIcon sx={{ color: 'white', fontSize: 24 }} /></button>

      </div>
      <div className='w-[720px] max-w-[90%] lg:h-[300px] md:min-h-[300px] flex items-center justify-center lg:gap-[60px] gap-[50px] flex-wrap mb-[50px] lg:mb-[0px]'>
        <div className='w-[110px] h-[140px] font-black text-xs uppercase tracking-wider flex flex-col gap-3 text-center'>
          <div className='w-[110px] h-[95px] bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all'><ComputerOutlinedIcon sx={{ fontSize: 45, color: '#000000' }} /></div>
          Web Development
        </div>
        <div className='w-[110px] h-[140px] font-black text-xs uppercase tracking-wider flex flex-col gap-3 text-center'>
          <div className='w-[110px] h-[95px] bg-gray-100 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all'><DesignServicesOutlinedIcon sx={{ fontSize: 45, color: '#000000' }} /></div>
          UI UX Designing
        </div>
        <div className='w-[110px] h-[140px] font-black text-xs uppercase tracking-wider flex flex-col gap-3 text-center'>
          <div className='w-[110px] h-[95px] bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all'><PhoneIphoneOutlinedIcon sx={{ fontSize: 40, color: '#000000' }} /></div>
          App Development
        </div>
        <div className='w-[110px] h-[140px] font-black text-xs uppercase tracking-wider flex flex-col gap-3 text-center'>
          <div className='w-[110px] h-[95px] bg-gray-100 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all'><SecurityOutlinedIcon sx={{ fontSize: 40, color: '#000000' }} /></div>
          Ethical Hacking
        </div>
        <div className='w-[110px] h-[140px] font-black text-xs uppercase tracking-wider flex flex-col gap-3 text-center'>
          <div className='w-[110px] h-[95px] bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all'><PsychologyOutlinedIcon sx={{ fontSize: 45, color: '#000000' }} /></div>
          AI/ML
        </div>
        <div className='w-[110px] h-[140px] font-black text-xs uppercase tracking-wider flex flex-col gap-3 text-center'>
          <div className='w-[110px] h-[95px] bg-gray-100 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all'><AssessmentOutlinedIcon sx={{ fontSize: 40, color: '#000000' }} /></div>
          Data Analytics
        </div>
        <div className='w-[110px] h-[140px] font-black text-xs uppercase tracking-wider flex flex-col gap-3 text-center'>
          <div className='w-[110px] h-[95px] bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all'><AutoAwesomeOutlinedIcon sx={{ fontSize: 40, color: '#000000' }} /></div>
          AI Tools
        </div>
      </div>


    </div>
  )
}

export default ExploreCourses
