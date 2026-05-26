import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import logo from '../assets/logo.jpg';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t-4 border-black">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Jagat Academy Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">JAGAT ACADEMY</h3>
                <p className="text-xs text-gray-500 font-bold tracking-wider">INTEGRATED E-LEARNING PLATFORM</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Empowering learners with quality education.
              Master new skills, earn certifications, and
              transform your career with expert-led courses.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors text-white/70">
                <FacebookOutlinedIcon sx={{ fontSize: 16 }} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors text-white/70">
                <TwitterIcon sx={{ fontSize: 16 }} />
              </a>
              <a href="https://www.instagram.com/offical.jagat/" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors text-white/70">
                <InstagramIcon sx={{ fontSize: 16 }} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors text-white/70">
                <LinkedInIcon sx={{ fontSize: 16 }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-sm font-black uppercase tracking-wider border-b-2 border-white/20 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-white font-medium text-sm">Home</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white font-medium text-sm">Student Dashboard</Link></li>
              <li><Link to="/allcourses" className="text-gray-400 hover:text-white font-medium text-sm">All Courses</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white font-medium text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white font-medium text-sm">Contact</Link></li>
              <li><Link to="/feedback" className="text-gray-400 hover:text-white font-medium text-sm">Feedback</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-5">
            <h4 className="text-sm font-black uppercase tracking-wider border-b-2 border-white/20 pb-2">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-gray-400 hover:text-white font-medium text-sm">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white font-medium text-sm">Privacy Policy</Link></li>
              <li><Link to="/refund" className="text-gray-400 hover:text-white font-medium text-sm">Refund Policy</Link></li>
              <li><Link to="/cookies" className="text-gray-400 hover:text-white font-medium text-sm">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h4 className="text-sm font-black uppercase tracking-wider border-b-2 border-white/20 pb-2">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                <EmailOutlinedIcon sx={{ fontSize: 16 }} />
                <a href="mailto:official.jagat.services@gmail.com" className="hover:text-white transition-colors">official.jagat.services@gmail.com</a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                <PhoneOutlinedIcon sx={{ fontSize: 16 }} />
                <a href="tel:+918919548737" className="hover:text-white transition-colors">+91 8919548737</a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm font-medium">
                <LocationOnOutlinedIcon sx={{ fontSize: 16, marginTop: '2px' }} />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs font-bold">
              © {currentYear} JAGAT ACADEMY. ALL RIGHTS RESERVED.
            </p>
            <p className="text-gray-500 text-xs font-bold flex items-center gap-1">
              MADE WITH <FavoriteIcon sx={{ color: '#ffffff', fontSize: 12 }} /> FOR LEARNERS WORLDWIDE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
