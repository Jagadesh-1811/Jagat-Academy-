import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent) return;

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBanner(true);
                setTimeout(() => setIsVisible(true), 50);
                window.removeEventListener('scroll', handleScroll);
            }
        };

        const timer = setTimeout(() => {
            if (!showBanner) {
                setShowBanner(true);
                setTimeout(() => setIsVisible(true), 50);
                window.removeEventListener('scroll', handleScroll);
            }
        }, 8000);

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [showBanner]);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
        setTimeout(() => setShowBanner(false), 300);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
        setTimeout(() => setShowBanner(false), 300);
    };

    if (!showBanner) return null;

    return (
        <>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100%); opacity: 0; }
                }
                .cookie-slide-up { animation: slideUp 0.4s ease-out forwards; }
                .cookie-slide-down { animation: slideDown 0.3s ease-in forwards; }
            `}</style>

            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300"
                style={{ opacity: isVisible ? 1 : 0 }}
            />

            {/* Cookie Banner */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 ${isVisible ? 'cookie-slide-up' : 'cookie-slide-down'}`}
            >
                <div className="max-w-4xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 bg-black border-2 border-black flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-black uppercase tracking-tight">We Value Your Privacy</h3>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cookie consent required</p>
                            </div>
                        </div>

                        {/* Content */}
                        <p className="text-gray-600 font-bold text-base mb-4 leading-relaxed">
                            We use cookies to enhance your browsing experience, serve personalized content,
                            and analyze our traffic. By clicking <strong>Accept All</strong>, you consent to our use of cookies.
                        </p>

                        <p className="text-gray-500 font-bold text-sm mb-6">
                            Learn more about how we use cookies in our{' '}
                            <Link
                                to="/cookies"
                                className="text-black font-black underline underline-offset-4 hover:text-gray-600 transition-none"
                            >
                                Cookie Policy
                            </Link>
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 py-4 px-6 font-black uppercase text-sm tracking-wider text-white bg-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                            >
                                ✓ Accept All Cookies
                            </button>
                            <button
                                onClick={handleDecline}
                                className="flex-1 py-4 px-6 font-black uppercase text-sm tracking-wider text-black bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                            >
                                ✗ Decline
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CookieConsent;
