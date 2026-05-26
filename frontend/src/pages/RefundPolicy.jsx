import React from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-4xl mx-auto px-4 py-12 pt-32">
        <div className="border-b-4 border-black pb-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black">Refund Policy</h1>
          <p className="text-gray-500 text-sm font-bold mt-1">Last updated: January 2026</p>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">1. Course Refunds</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We offer a 7-day refund policy for most courses. If you are not satisfied with a course, 
              you may request a refund within 7 days of purchase, provided you have not completed more 
              than 25% of the course content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">2. How to Request a Refund</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              To request a refund, please contact our support team at{' '}
              <a href="mailto:support@jagatacademy.com" className="text-black font-bold underline">support@jagatacademy.com</a>{' '}
              with your account details and course name. Refunds will be processed within 5-10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">3. Non-Refundable Items</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Certificate issuance fees, physical merchandise, and completed course bundles are non-refundable. 
              Subscription fees are prorated based on usage at the time of cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black uppercase tracking-wider text-black mb-3">4. Exceptions</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              We reserve the right to make exceptions to this policy on a case-by-case basis. 
              Extenuating circumstances will be reviewed by our support team.
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

export default RefundPolicy;
