import React from 'react'
import {
  FaInfoCircle,
  FaCheckCircle,
  FaPlayCircle,
  FaUsers,
  FaChartLine,
  FaMedal,
  FaHeadset
} from 'react-icons/fa';

function About({ dark = false }) {
  const containerBg = dark ? 'bg-black' : 'bg-white';
  const textPrimary = dark ? 'text-white' : 'text-black';
  const textMuted = dark ? 'text-white/70' : 'text-gray-600';
  const iconColor = dark ? 'text-white' : 'text-black';
  const borderColor = dark ? 'border-white/30' : 'border-black';
  const hoverBg = dark ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  const features = [
    { icon: FaPlayCircle, title: 'Quality Courses' },
    { icon: FaUsers, title: 'Expert Educators' },
    { icon: FaChartLine, title: 'Progress Tracking' },
    { icon: FaMedal, title: 'Certifications' },
    { icon: FaHeadset, title: 'Live Support' }
  ];

  const badges = ['Simplified Learning', 'Expert Trainers', 'Lifetime Access', '24/7 Support'];

  return (
    <div className={`w-full min-h-[80vh] flex flex-col items-center justify-center py-16 px-4 md:px-8 ${containerBg}`}>

      {/* Section Header */}
      <div className='flex items-center gap-4 mb-6'>
        <FaInfoCircle className={`text-[40px] ${iconColor}`} />
        <span className={`text-lg font-medium tracking-wide ${textPrimary}`}>ABOUT US</span>
        <FaInfoCircle className={`text-[40px] ${iconColor}`} />
      </div>

      {/* Main Title */}
      <div className='text-center max-w-3xl mb-10'>
        <h1 className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-2`}>
          JAGAT ACADEMY
        </h1>
        <p className={`text-xl ${textMuted} font-medium`}>
          Integrated E-Learning Platform
        </p>
      </div>

      {/* Description */}
      <p className={`text-center ${textMuted} max-w-2xl mb-12 leading-relaxed`}>
        A comprehensive e-learning management system designed to empower educators and students
        with modern tools for seamless online education, progress tracking, and collaboration.
      </p>

      {/* Features Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mb-12`}>
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className={`flex flex-col items-center p-4 ${hoverBg} rounded-xl transition cursor-pointer`}>
              <div className={`w-16 h-16 ${borderColor} border-2 rounded-2xl flex items-center justify-center mb-3`}>
                <Icon className={`text-[32px] ${iconColor}`} />
              </div>
              <span className={`text-sm font-medium text-center ${textPrimary}`}>{f.title}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Badges */}
      <div className='flex flex-wrap justify-center gap-6 text-sm'>
        {badges.map((t) => (
          <div key={t} className='flex items-center gap-2'>
            <FaCheckCircle className={`text-[20px] ${iconColor}`} />
            <span className={`${textPrimary}`}>{t}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default About
