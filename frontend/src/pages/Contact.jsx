import React from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import {
    FaWhatsapp,
    FaInstagram,
    FaLinkedin,
    FaEnvelope,
    FaPhone,
    FaLightbulb,
    FaUpload,
    FaLink,
    FaFileAlt,
    FaCheckCircle
} from 'react-icons/fa';

const Contact = () => {
    const socialLinks = [
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp className="w-6 h-6" />,
            link: 'https://wa.me/918919548737',
            handle: '+91 89195 48737'
        },
        {
            name: 'Instagram',
            icon: <FaInstagram className="w-6 h-6" />,
            link: 'https://www.instagram.com/offical.jagat/',
            handle: '@official.jagat'
        },
        {
            name: 'LinkedIn',
            icon: <FaLinkedin className="w-6 h-6" />,
            link: 'https://linkedin.com/company/jagatacademy',
            handle: 'Jagat Academy'
        },
        {
            name: 'Email',
            icon: <FaEnvelope className="w-6 h-6" />,
            link: 'mailto:official.jagat.services@gmail.com',
            handle: 'official.jagat.services@gmail.com'
        }
    ];

    const assignmentSteps = [
        {
            step: 1,
            icon: <FaFileAlt className="w-8 h-8" />,
            title: 'View Assignment',
            description: 'Go to your enrolled course and navigate to the Assignments section. Read the assignment instructions carefully.'
        },
        {
            step: 2,
            icon: <FaUpload className="w-8 h-8" />,
            title: 'Prepare Your Work',
            description: 'Complete the assignment as per the given instructions. Upload your work to Google Drive, GitHub, or any file sharing platform.'
        },
        {
            step: 3,
            icon: <FaLink className="w-8 h-8" />,
            title: 'Submit Link',
            description: 'Copy the shareable link of your uploaded work. Make sure the link has proper access permissions (Anyone with link can view).'
        },
        {
            step: 4,
            icon: <FaCheckCircle className="w-8 h-8" />,
            title: 'Wait for Review',
            description: 'Your instructor will review your submission and provide a grade along with feedback. Check your dashboard for updates.'
        }
    ];

    return (
        <div className="w-full min-h-screen bg-white">
            <Nav />

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-6 pt-6 hidden md:block">
                <a
                    href="/"
                    className="inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                    ← Back to Home
                </a>
            </div>
            <section className="pt-32 pb-16 px-6 bg-black border-b-4 border-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 font-bold max-w-2xl mx-auto">
                        Have questions? We're here to help. Reach out to us through any of the channels below.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-16 px-6 bg-gray-50 border-b-4 border-black">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6 border-2 border-black">
                                <FaEnvelope className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-black uppercase mb-3 tracking-tight">Email Us</h3>
                            <p className="text-gray-500 font-bold mb-5 text-base">We'll respond within 24 hours</p>
                            <a href="mailto:official.jagat.services@gmail.com" className="text-black font-black text-lg hover:underline underline-offset-4">
                                official.jagat.services@gmail.com
                            </a>
                        </div>
                        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
                                <FaPhone className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-black uppercase mb-3 tracking-tight">Call Us</h3>
                            <p className="text-gray-500 font-bold mb-5 text-base">Mon-Sat, 10am-5pm IST</p>
                            <a href="tel:+918919548737" className="text-black font-black text-lg hover:underline underline-offset-4">
                                +91 8919548737
                            </a>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-2xl font-black text-black mb-6 text-center uppercase tracking-tight">Connect With Us</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-black text-white border-2 border-black p-6 flex items-center gap-6 hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                                >
                                    <div className="w-16 h-16 border-2 border-white flex items-center justify-center bg-white/10">
                                        <span className="text-3xl">{social.icon}</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-xl uppercase">{social.name}</p>
                                        <p className="text-sm font-bold text-white/80 mt-1">{social.handle}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Submit Assignment Section */}
            <section className="py-16 px-6 bg-white border-b-4 border-black">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tight mb-4">
                            How to Submit Assignment
                        </h2>
                        <p className="text-gray-500 font-bold text-base max-w-2xl mx-auto">
                            Follow these simple steps to submit your assignments and get graded by your instructor.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {assignmentSteps.map((item, index) => (
                            <div key={index} className="relative">
                                <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all h-full">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-black text-white flex items-center justify-center border-2 border-black">
                                            {item.icon}
                                        </div>
                                        <span className="text-4xl font-black text-gray-200">0{item.step}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-black uppercase mb-2 tracking-tight">{item.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.description}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 text-2xl font-black">
                                        →
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Tips Box */}
                    <div className="mt-12 bg-black border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]">
                        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2 uppercase tracking-tight"><FaLightbulb className="text-white" /> Important Tips</h3>
                        <ul className="space-y-3 text-white font-bold">
                            <li className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                Make sure your submission link is accessible (set to "Anyone with link can view")
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                Submit before the deadline to avoid late submission penalties
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                Use Google Drive, GitHub, or similar platforms to host your files
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                Include your name and roll number in the file if required
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-6 bg-black border-b-4 border-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Still Have Questions?</h2>
                    <p className="text-gray-300 font-bold mb-8">
                        Can't find what you're looking for? Send us your feedback or report an issue.
                    </p>
                    <a
                        href="/feedback"
                        className="inline-block px-8 py-4 bg-white text-black font-black uppercase text-sm tracking-wider border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                    >
                        Submit Feedback →
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;
