import React from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-12 pt-32">
        <div className="border-b-4 border-black pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">Terms & Conditions</h1>
          <p className="text-gray-500 text-sm font-bold mt-1">Last updated: January 2026</p>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              By accessing or using Jagat Academy, you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, you may not access the platform or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">2. Account Registration</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              You must provide accurate and complete information when creating an account. You are responsible 
              for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">3. Course Enrollment & Payments</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Course fees are clearly displayed at the time of enrollment. All payments are processed securely 
              through our payment partners. Refund policies are outlined separately in our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">4. User Conduct</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              You agree to use the platform for lawful purposes only. Harassment, cheating, plagiarism, or any 
              form of academic dishonesty is strictly prohibited and may result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">5. Intellectual Property</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              All course content, including videos, materials, and assessments, is the intellectual property 
              of Jagat Academy or its licensors. You may not redistribute, reproduce, or share course content 
              without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">6. Modifications</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We reserve the right to modify these terms at any time. Users will be notified of material changes 
              via email or platform notification. Continued use after changes constitutes acceptance of new terms.
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

export default TermsAndConditions;
