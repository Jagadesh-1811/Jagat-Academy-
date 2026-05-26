import React from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-12 pt-32">
        <div className="border-b-4 border-black pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">Cookie Policy</h1>
          <p className="text-gray-500 text-sm font-bold mt-1">How we use cookies</p>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">1. What Are Cookies</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help us 
              remember your preferences, authenticate your sessions, and improve your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">2. How We Use Cookies</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We use cookies for essential platform functionality (authentication, session management), 
              analytics (understanding how you use the platform), and personalization (remembering your 
              preferences and course progress).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">3. Managing Cookies</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              You can control and manage cookies through your browser settings. Please note that disabling 
              certain cookies may affect the functionality and performance of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">4. Third-Party Cookies</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We may use third-party services (such as analytics providers) that set their own cookies. 
              These third parties have their own cookie policies governing the use of your data.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block bg-white border-2 border-black px-6 py-3 font-black uppercase text-sm tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
