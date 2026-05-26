import React, { useState, useEffect } from 'react';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const StreakCounter = ({
  iconColor = '#f97316',
  iconSize = '1.5em',
  textColor = '#1f2937',
  textSize = '1.125rem',
  className = '',
}) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const calculateStreak = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const storedStreak = parseInt(localStorage.getItem('streakCount') || '0');
      const storedLastVisit = localStorage.getItem('lastVisitDate');
      let lastVisit = storedLastVisit ? new Date(storedLastVisit) : null;

      let currentStreak = storedStreak;

      if (lastVisit) {
        lastVisit.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastVisit.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
          localStorage.setItem('streakCount', currentStreak.toString());
          localStorage.setItem('lastVisitDate', today.toISOString());
        } else if (diffDays > 1) {
          currentStreak = 1;
          localStorage.setItem('streakCount', currentStreak.toString());
          localStorage.setItem('lastVisitDate', today.toISOString());
        }
      } else {
        currentStreak = 1;
        localStorage.setItem('streakCount', currentStreak.toString());
        localStorage.setItem('lastVisitDate', today.toISOString());
      }

      setStreak(currentStreak);
    };

    calculateStreak();
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      clearStreak();
      setStreak(0);
    };

    window.addEventListener('logout', handleLogout);
    return () => window.removeEventListener('logout', handleLogout);
  }, []);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${className}`}
      title={
        streak > 0
          ? `You have a ${streak}-day streak!`
          : 'Start your daily streak!'
      }
    >
      <WhatshotIcon style={{ fontSize: iconSize, color: iconColor }} />
      <span style={{ color: textColor, fontSize: textSize }} className="font-black">
        {streak}
      </span>
    </div>
  );
};

export const clearStreak = () => {
  localStorage.removeItem('streakCount');
  localStorage.removeItem('lastVisitDate');
};

export default StreakCounter;
