import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import { getBadgeIcon } from '../utils/gamificationHelpers';

// Custom lightweight high-performance Neo-Brutalist particle explosion
const ConfettiParticle = ({ delay, color, angle, distance }) => {
  const radians = (angle * Math.PI) / 180;
  const targetX = Math.cos(radians) * distance;
  const targetY = Math.sin(radians) * distance + 150; // Add gravity drop

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
      animate={{
        x: targetX,
        y: targetY,
        scale: [0.5, 1.2, 0.8, 0],
        opacity: [1, 1, 0.8, 0],
        rotate: Math.random() * 360 + 180,
      }}
      transition={{
        duration: 1.8,
        delay: delay,
        ease: [0.1, 0.8, 0.3, 1],
      }}
      className="absolute w-4 h-4 border-2 border-black"
      style={{
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '0%' : '50%',
      }}
    />
  );
};

const CelebrationModal = ({ isOpen, onClose, data, type }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Generate 65 particles on mount
      const colors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#000000', '#ffffff'];
      const generated = Array.from({ length: 65 }).map((_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * 360,
        distance: Math.random() * 220 + 80,
        delay: Math.random() * 0.25,
      }));
      setParticles(generated);

      // Auto-play high success audio cue (optional / silent fallback)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
        audio.volume = 0.2;
        audio.play();
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const isLevelUp = type === 'level-up';
  const rarityColors = {
    Common: 'bg-gray-150 border-gray-400 text-black',
    Rare: 'bg-blue-50 border-blue-500 text-blue-600',
    Epic: 'bg-purple-50 border-purple-500 text-purple-600 shadow-[4px_4px_0px_rgba(139,92,246,0.3)]',
    Legendary: 'bg-amber-50 border-amber-600 text-amber-700 shadow-[6px_6px_0px_#d97706] animate-pulse',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        
        {/* Confetti Explosion Layer */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {particles.map((p) => (
            <ConfettiParticle
              key={p.id}
              color={p.color}
              angle={p.angle}
              distance={p.distance}
              delay={p.delay}
            />
          ))}
        </div>

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className="relative max-w-md w-full bg-white border-4 border-black p-8 text-center shadow-[12px_12px_0px_#000]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <CloseIcon fontSize="small" />
          </button>

          {/* Heading Banner */}
          <div className="inline-block border-2 border-black bg-black text-white px-6 py-2 uppercase font-black text-xs tracking-widest mb-6 select-none">
            {isLevelUp ? '🎉 LEVEL ASCENSION 🎉' : '🏆 ACHIEVEMENT UNLOCKED 🏆'}
          </div>

          {/* Main Visual showcase */}
          <div className="flex flex-col items-center justify-center mb-6">
            {isLevelUp ? (
              <div className="relative">
                <div className="w-28 h-28 border-4 border-black bg-black text-white flex items-center justify-center text-5xl font-black shadow-[4px_4px_0px_#000]">
                  {data.level}
                </div>
                <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center text-sm font-bold">
                  🔥
                </div>
              </div>
            ) : (
              <div className={`w-28 h-28 border-4 flex flex-col items-center justify-center p-3 relative ${rarityColors[data.badge?.rarity || 'Common']}`}>
                <div className="flex items-center justify-center w-14 h-14 mb-1">
                  {getBadgeIcon(data.badge?.icon, 'text-current')}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider">{data.badge?.rarity || 'Common'}</span>
              </div>
            )}
          </div>

          {/* Title and descriptions */}
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
            {isLevelUp ? `Reached Level ${data.level}!` : data.badge?.name}
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-6 leading-relaxed max-w-sm mx-auto">
            {isLevelUp ? data.reason || 'You are climbing the heights of knowledge!' : data.badge?.description}
          </p>

          {/* Unlocked Reward badges */}
          <div className="border-2 border-black bg-gray-50 p-4 space-y-2 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
              REWARDS EARNED
            </span>
            <div className="flex justify-center gap-4">
              {data.xpReward > 0 && (
                <div className="border-2 border-black bg-black text-white px-3 py-1 font-mono text-xs font-black uppercase">
                  ⚡ +{data.xpReward} XP
                </div>
              )}
              {data.coinsReward > 0 && (
                <div className="border-2 border-black bg-white text-black px-3 py-1 font-mono text-xs font-black uppercase">
                  🪙 +{data.coinsReward} JC
                </div>
              )}
              {isLevelUp && data.coinsAwarded > 0 && (
                <div className="border-2 border-black bg-white text-black px-3 py-1 font-mono text-xs font-black uppercase">
                  🪙 +{data.coinsAwarded} JC
                </div>
              )}
            </div>

            {isLevelUp && data.unlockedFeatures && data.unlockedFeatures.length > 0 && (
              <div className="pt-2 border-t border-dashed border-gray-300">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  UNLOCKED COSMETICS
                </span>
                <div className="flex flex-wrap justify-center gap-1">
                  {data.unlockedFeatures.map((f, i) => (
                    <span key={i} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5">
                      🔓 {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.giftedBy && (
              <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                🎁 Gented by a learning classmate!
              </div>
            )}
          </div>

          {/* Action triggers */}
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] transition-all duration-150 cursor-pointer"
            >
              HELL YES!
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CelebrationModal;
