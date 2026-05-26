import React from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function About({ dark = false }) {
  const features = [
    {
      number: "01",
      title: "Immersive Learning",
      description:
        "Step into a cinematic 3D learning environment where every course feels like an interactive journey, not just another video playlist.",
    },
    {
      number: "02",
      title: "Structured Curriculum",
      description:
        "Master skills with a clear, module-based system — from beginner to advanced, with guided progress at every stage.",
    },
    {
      number: "03",
      title: "Expert Guidance",
      description:
        "Learn from seasoned educators and industry professionals who bring real-world experience into every lesson.",
    },
    {
      number: "04",
      title: "Community Driven",
      description:
        "Join a thriving community of learners. Collaborate, share insights, and grow together in a supportive environment.",
    },
  ];

  const stats = [
    { value: "40+", label: "Courses" },
    { value: "95%", label: "Satisfaction" },
    { value: "24/7", label: "Support" },
  ];

  const isDark = dark;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <Nav />
      <div className="flex-grow w-full">

      {/* ─── Hero Section ─── */}
      <section className={`border-b-4 border-black ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className={`inline-flex items-center gap-2 border-2 px-4 py-2 mb-8 text-xs font-black uppercase tracking-widest ${isDark ? 'border-white text-white' : 'border-black text-black'}`}>
              <span className={`w-2 h-2 ${isDark ? 'bg-white' : 'bg-black'}`}></span>
              OUR STORY
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-[-0.04em]">
              We're Building the
              <span className={`block mt-2 ${isDark ? 'text-white' : 'text-black'}`}>
                Future of Learning.
              </span>
            </h1>
            <p className={`mt-6 max-w-xl text-base md:text-lg font-bold leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Jagat Academy is an integrated e-learning platform designed to make education
              immersive, accessible, and effective. We transform traditional course delivery
              into a cinematic learning journey.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className={`border-2 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] ${isDark ? 'border-white bg-white/10' : 'border-black bg-white'}`}>
                  <div className="text-2xl font-black tracking-tight">{stat.value}</div>
                  <div className={`text-xs font-black uppercase tracking-widest mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className={`border-b-4 border-black py-24 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 border-2 px-4 py-2 mb-6 text-xs font-black uppercase tracking-widest ${isDark ? 'border-white text-white' : 'border-black text-black'}`}>
              WHY JAGAT
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              What Sets Us Apart
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.number}
                className={`border-4 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-none ${isDark ? 'bg-black border-white' : 'bg-white border-black'}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 border-2 flex items-center justify-center font-black text-lg ${isDark ? 'border-white text-white' : 'border-black text-black'}`}>
                    {feature.number}
                  </div>
                </div>
                <h3 className={`text-2xl font-black uppercase tracking-tight mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm font-bold leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission Section ─── */}
      <section className={`border-b-4 border-black py-24 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 border-2 px-4 py-2 mb-6 text-xs font-black uppercase tracking-widest ${isDark ? 'border-white text-white' : 'border-black text-black'}`}>
                OUR MISSION
              </div>
              <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                Education for
                <span className="block">Everyone.</span>
              </h2>
              <p className={`text-base font-bold leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                We believe quality education should be accessible to all. Our platform combines
                cutting-edge technology with curated content to deliver an experience that's
                both powerful and intuitive.
              </p>
            </div>
            <div className={`border-4 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-black border-white' : 'bg-gray-50 border-black'}`}>
              <div className="space-y-6">
                <div className={`border-2 p-6 ${isDark ? 'border-white/20' : 'border-black'}`}>
                  <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>40+</div>
                  <div className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Curated Courses</div>
                </div>
                <div className={`border-2 p-6 ${isDark ? 'border-white/20' : 'border-black'}`}>
                  <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>100%</div>
                  <div className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Self-Paced Learning</div>
                </div>
                <div className={`border-2 p-6 ${isDark ? 'border-white/20' : 'border-black'}`}>
                  <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>24/7</div>
                  <div className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Learning Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={`py-24 ${isDark ? 'bg-black' : 'bg-black'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-300 font-bold text-lg mb-8 max-w-xl mx-auto">
            Join thousands of students already learning on Jagat Academy.
          </p>
          <a
            href="/allcourses"
            className="inline-block px-8 py-4 bg-white text-black font-black uppercase text-sm tracking-wider border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none"
          >
            Explore Courses →
          </a>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}

export default About;
