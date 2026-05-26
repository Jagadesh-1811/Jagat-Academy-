import React from 'react';
import Nav from '../components/Nav';
import logo from '../assets/logo.jpg';
import CursorGlobe from '../components/CursorGlobe';
import Logos from '../components/Logos';
import Cardspage from '../components/Cardspage';
import ExploreCourses from '../components/ExploreCourses';
import About from '../components/About';
import ReviewPage from '../components/ReviewPage';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { SiOpenaccess } from 'react-icons/si';
import { FaSackDollar } from 'react-icons/fa6';
import { BiSupport } from 'react-icons/bi';
import { FaUsers } from 'react-icons/fa';

const stats = [
  { value: '40+', label: 'Curated courses' },
  { value: '24/7', label: 'Learning support' },
  { value: '1 path', label: 'Skill journey' },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-hidden bg-white text-black">
      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <Nav />

        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.10),_transparent_28%),linear-gradient(180deg,_#0a0a0a_0%,_#000_100%)]" />
          <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_40%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-3 border-2 border-white bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
              <img src={logo} alt="Jagat Academy Logo" className="h-6 w-6 object-cover border-2 border-white" />
              <span>Monochrome 3D learning experience</span>
            </div>

            <h1 className="max-w-xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-white md:text-7xl lg:text-[5.5rem]">
              Learn in a
              <span className="block text-white">
                skill galaxy.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/70 md:text-lg font-medium">
              Jagat Academy turns courses into a cinematic learning journey — immersive, focused, and built to help students grow faster.
            </p>

            <div className="mt-4 flex items-center gap-3 text-sm text-white/80 lg:hidden">
              <img src={logo} alt="JA icon" className="h-6 w-6 object-cover border-2 border-white" />
              <span className="font-bold">Here you can learn skills</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                className="border-2 border-white bg-white px-7 py-3.5 text-sm font-black text-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                onClick={() => navigate('/allcourses')}
              >
                Explore Courses
              </button>
              <button
                className="border-2 border-white bg-transparent px-7 py-3.5 text-sm font-black text-white uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                onClick={() => navigate('/searchwithai')}
              >
                Search with AI
              </button>
            </div>

            {/* Hero logos / badges (dark) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 border-2 border-white/20 bg-white/5 px-4 py-2">
                <SiOpenaccess className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white/90">Lifetime Access</span>
              </div>
              <div className="flex items-center gap-3 border-2 border-white/20 bg-white/5 px-4 py-2">
                <FaSackDollar className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white/90">Value For Money</span>
              </div>
              <div className="flex items-center gap-3 border-2 border-white/20 bg-white/5 px-4 py-2">
                <BiSupport className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white/90">Lifetime Support</span>
              </div>
              <div className="flex items-center gap-3 border-2 border-white/20 bg-white/5 px-4 py-2">
                <FaUsers className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white/90">Community</span>
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="border-2 border-white bg-white/10 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                  <div className="text-2xl font-black tracking-tight text-white">{stat.value}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 lg:left-[66%] top-[38%] z-0 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 lg:h-[520px] lg:w-[520px]">
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%)] blur-2xl" />
              <div className="absolute inset-[7%] rounded-full border border-white/15 bg-white/[0.02]" />
              <CursorGlobe className="relative z-10" />
            </div>
          </div>

          {/* Floating JA badge beside globe on large screens */}
          <div className="hidden lg:flex pointer-events-auto absolute left-[72%] top-[36%] z-20 -translate-y-1/2 items-center gap-3 border-2 border-white bg-white/10 px-3 py-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
            <img src={logo} alt="JA icon" className="h-10 w-10 object-cover border-2 border-white" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black text-white">Jagat Academy</span>
              <span className="text-xs font-bold text-white/70">Here you can learn skills</span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes heroFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(1deg); }
          }
          .hero-card { animation: heroFloat 8s ease-in-out infinite; }
          .hero-card-delayed { animation: heroFloat 9s ease-in-out infinite; animation-delay: 1s; }
          @keyframes orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-orbit { animation: orbit 18s linear infinite; transform-origin: 0 0; }
        `}</style>
      </section>

      <Logos />
      <ExploreCourses />
      <Cardspage />
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <About dark />
        </div>
      </section>
      <ReviewPage />
      <Footer />
    </div>
  );
}

export default Home;