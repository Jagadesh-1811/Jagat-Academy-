import React from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-12 pt-32">
        <div className="border-b-4 border-black pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">Privacy Policy</h1>
          <p className="text-gray-500 text-sm font-bold mt-1">Last updated: January 2026</p>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">1. Information We Collect</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We collect information you provide directly to us, including your name, email address, 
              educational background, and payment information when you create an account or enroll in courses. 
              We also automatically collect certain technical information about your device and usage of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We use the information we collect to provide, maintain, and improve our educational services, 
              process transactions, send administrative communications, and personalize your learning experience. 
              We may also use your information to communicate with you about courses, promotions, and updates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">3. Data Security</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We implement appropriate security measures to protect your personal information from unauthorized 
              access, alteration, disclosure, or destruction. However, no method of transmission over the Internet 
              or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">4. Third-Party Services</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We may employ third-party companies and individuals to facilitate our services, provide service-related 
              services, or assist us in analyzing how our services are used. These third parties have access to your 
              personal information only to perform these tasks on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">5. Contact Us</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@jagatacademy.com" className="text-black font-bold underline">privacy@jagatacademy.com</a>.
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

export default PrivacyPolicy;
