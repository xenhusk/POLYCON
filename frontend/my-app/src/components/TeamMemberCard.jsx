import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// CSS for flip animation and flowing glow effects
const flipStyles = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .card-flip {
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), scale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center center;
  }
  .card-flip.flipped {
    transform: rotateY(180deg) scale(1.1);
    z-index: 10;
  }
  .card-front, .card-back {
    backface-visibility: hidden;
  }
  .card-back {
    transform: rotateY(180deg);
  }
  .card-container {
    transition: all 0.3s ease;
    position: relative;
  }
  .card-container.flipped {
    z-index: 20;
  }
  
  /* Flowing Glow Effects */
  .glow-container {
    position: relative;
    overflow: visible;
  }
  
  .glow-container::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border-radius: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  .glow-container:hover::before {
    opacity: 0.8;
  }
  
  .glow-container.flipped::before {
    opacity: 0.6;
  }
  
  /* Blue Glow */
  .glow-blue::before {
    animation: flowingGlowBlue 3s ease-in-out infinite;
  }
  
  @keyframes flowingGlowBlue {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(59, 130, 246, 0.5),
        0 0 40px rgba(59, 130, 246, 0.3),
        0 0 60px rgba(59, 130, 246, 0.1);
      transform: scale(1);
    }
    25% {
      box-shadow: 
        0 0 25px rgba(59, 130, 246, 0.6),
        0 0 45px rgba(59, 130, 246, 0.4),
        0 0 65px rgba(59, 130, 246, 0.2);
      transform: scale(1.02);
    }
    50% {
      box-shadow: 
        0 0 30px rgba(59, 130, 246, 0.7),
        0 0 50px rgba(59, 130, 246, 0.5),
        0 0 70px rgba(59, 130, 246, 0.3);
      transform: scale(1.05);
    }
    75% {
      box-shadow: 
        0 0 25px rgba(59, 130, 246, 0.6),
        0 0 45px rgba(59, 130, 246, 0.4),
        0 0 65px rgba(59, 130, 246, 0.2);
      transform: scale(1.02);
    }
  }
  
  /* Green Glow */
  .glow-green::before {
    animation: flowingGlowGreen 3s ease-in-out infinite;
  }
  
  @keyframes flowingGlowGreen {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(74, 222, 128, 0.5),
        0 0 40px rgba(74, 222, 128, 0.3),
        0 0 60px rgba(74, 222, 128, 0.1);
      transform: scale(1);
    }
    25% {
      box-shadow: 
        0 0 25px rgba(74, 222, 128, 0.6),
        0 0 45px rgba(74, 222, 128, 0.4),
        0 0 65px rgba(74, 222, 128, 0.2);
      transform: scale(1.02);
    }
    50% {
      box-shadow: 
        0 0 30px rgba(74, 222, 128, 0.7),
        0 0 50px rgba(74, 222, 128, 0.5),
        0 0 70px rgba(74, 222, 128, 0.3);
      transform: scale(1.05);
    }
    75% {
      box-shadow: 
        0 0 25px rgba(74, 222, 128, 0.6),
        0 0 45px rgba(74, 222, 128, 0.4),
        0 0 65px rgba(74, 222, 128, 0.2);
      transform: scale(1.02);
    }
  }
  
  /* Purple Glow */
  .glow-purple::before {
    animation: flowingGlowPurple 3s ease-in-out infinite;
  }
  
  @keyframes flowingGlowPurple {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(168, 85, 247, 0.5),
        0 0 40px rgba(168, 85, 247, 0.3),
        0 0 60px rgba(168, 85, 247, 0.1);
      transform: scale(1);
    }
    25% {
      box-shadow: 
        0 0 25px rgba(168, 85, 247, 0.6),
        0 0 45px rgba(168, 85, 247, 0.4),
        0 0 65px rgba(168, 85, 247, 0.2);
      transform: scale(1.02);
    }
    50% {
      box-shadow: 
        0 0 30px rgba(168, 85, 247, 0.7),
        0 0 50px rgba(168, 85, 247, 0.5),
        0 0 70px rgba(168, 85, 247, 0.3);
      transform: scale(1.05);
    }
    75% {
      box-shadow: 
        0 0 25px rgba(168, 85, 247, 0.6),
        0 0 45px rgba(168, 85, 247, 0.4),
        0 0 65px rgba(168, 85, 247, 0.2);
      transform: scale(1.02);
    }
  }
  
  /* Orange Glow */
  .glow-orange::before {
    animation: flowingGlowOrange 3s ease-in-out infinite;
  }
  
  @keyframes flowingGlowOrange {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(251, 146, 60, 0.5),
        0 0 40px rgba(251, 146, 60, 0.3),
        0 0 60px rgba(251, 146, 60, 0.1);
      transform: scale(1);
    }
    25% {
      box-shadow: 
        0 0 25px rgba(251, 146, 60, 0.6),
        0 0 45px rgba(251, 146, 60, 0.4),
        0 0 65px rgba(251, 146, 60, 0.2);
      transform: scale(1.02);
    }
    50% {
      box-shadow: 
        0 0 30px rgba(251, 146, 60, 0.7),
        0 0 50px rgba(251, 146, 60, 0.5),
        0 0 70px rgba(251, 146, 60, 0.3);
      transform: scale(1.05);
    }
    75% {
      box-shadow: 
        0 0 25px rgba(251, 146, 60, 0.6),
        0 0 45px rgba(251, 146, 60, 0.4),
        0 0 65px rgba(251, 146, 60, 0.2);
      transform: scale(1.02);
    }
  }
  
  /* Floating Objects Animations */
  .floating-object {
    position: absolute;
    opacity: 0.3;
    pointer-events: none;
    z-index: 1;
  }
  
  .float-1 {
    animation: float1 6s ease-in-out infinite;
  }
  
  .float-2 {
    animation: float2 8s ease-in-out infinite;
  }
  
  .float-3 {
    animation: float3 7s ease-in-out infinite;
  }
  
  .float-4 {
    animation: float4 9s ease-in-out infinite;
  }
  
  .float-5 {
    animation: float5 5s ease-in-out infinite;
  }
  
  @keyframes float1 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.2;
    }
    25% {
      transform: translateY(-10px) rotate(90deg);
      opacity: 0.4;
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
      opacity: 0.3;
    }
    75% {
      transform: translateY(-10px) rotate(270deg);
      opacity: 0.4;
    }
  }
  
  @keyframes float2 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg) scale(1);
      opacity: 0.3;
    }
    33% {
      transform: translateY(-15px) rotate(120deg) scale(1.1);
      opacity: 0.5;
    }
    66% {
      transform: translateY(-25px) rotate(240deg) scale(0.9);
      opacity: 0.2;
    }
  }
  
  @keyframes float3 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.4;
    }
    50% {
      transform: translateY(-18px) rotate(180deg);
      opacity: 0.2;
    }
  }
  
  @keyframes float4 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg) scale(1);
      opacity: 0.2;
    }
    25% {
      transform: translateY(-12px) rotate(90deg) scale(1.2);
      opacity: 0.4;
    }
    50% {
      transform: translateY(-22px) rotate(180deg) scale(0.8);
      opacity: 0.3;
    }
    75% {
      transform: translateY(-12px) rotate(270deg) scale(1.1);
      opacity: 0.5;
    }
  }
  
  @keyframes float5 {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0.3;
    }
    20% {
      transform: translateY(-8px) rotate(72deg);
      opacity: 0.5;
    }
    40% {
      transform: translateY(-16px) rotate(144deg);
      opacity: 0.2;
    }
    60% {
      transform: translateY(-24px) rotate(216deg);
      opacity: 0.4;
    }
    80% {
      transform: translateY(-16px) rotate(288deg);
      opacity: 0.3;
    }
  }
`;

// Inject styles into head
if (typeof document !== 'undefined') {
  const styleId = 'team-member-card-flip-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = flipStyles;
    document.head.appendChild(style);
  }
}

const TeamMemberCard = ({
  name,
  role,
  quote,
  profileImage,
  socialLinks,
  gradientColors,
  delay = 0.1,
  isOpen = false,
  onToggle,
}) => {
  const cardRef = useRef(null);

  // Function to determine glow color class based on gradient colors
  const getGlowClass = (gradientColors) => {
    if (gradientColors.includes('blue')) return 'glow-blue';
    if (gradientColors.includes('green')) return 'glow-green';
    if (gradientColors.includes('purple')) return 'glow-purple';
    if (gradientColors.includes('orange')) return 'glow-orange';
    return 'glow-blue'; // default fallback
  };

  // Function to generate floating objects based on color theme
  const getFloatingObjects = (gradientColors) => {
    const baseColor = gradientColors.includes('blue') ? 'blue' : 
                     gradientColors.includes('green') ? 'green' :
                     gradientColors.includes('purple') ? 'purple' :
                     gradientColors.includes('orange') ? 'orange' : 'blue';
    
    const colorClasses = {
      blue: 'text-blue-400',
      green: 'text-green-400', 
      purple: 'text-purple-400',
      orange: 'text-orange-400'
    };

    const colorClass = colorClasses[baseColor];

    return [
      { id: 1, icon: '●', class: `float-1 ${colorClass}`, position: 'top-4 left-6' },
      { id: 2, icon: '▲', class: `float-2 ${colorClass}`, position: 'top-8 right-8' },
      { id: 3, icon: '◆', class: `float-3 ${colorClass}`, position: 'top-16 left-12' },
      { id: 4, icon: '★', class: `float-4 ${colorClass}`, position: 'top-20 right-4' },
      { id: 5, icon: '●', class: `float-5 ${colorClass}`, position: 'top-12 right-16' },
      { id: 6, icon: '▲', class: `float-1 ${colorClass}`, position: 'top-6 left-20' },
      { id: 7, icon: '◆', class: `float-2 ${colorClass}`, position: 'top-14 right-12' },
      { id: 8, icon: '★', class: `float-3 ${colorClass}`, position: 'top-18 left-8' }
    ];
  };

  const handleFlip = () => {
    onToggle();
  };

  const closeCard = () => {
    if (isOpen) {
      onToggle();
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && isOpen) {
        closeCard();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`group relative perspective-1000 card-container glow-container ${getGlowClass(gradientColors)} ${isOpen ? 'flipped' : ''}`}
    >
      {/* Card Container with Flip Effect */}
      <div 
        className={`card-flip w-full h-80 ${isOpen ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        {/* Front of Card */}
        <div className="card-front absolute inset-0 w-full h-full">
          <motion.div
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            className={`relative w-full h-full bg-gradient-to-br ${gradientColors} rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
          >
            <div className="flex flex-col items-center justify-center h-full relative">
              {/* Floating Decorative Objects */}
              {getFloatingObjects(gradientColors).map((obj) => (
                <div
                  key={obj.id}
                  className={`floating-object ${obj.class} ${obj.position} text-lg`}
                >
                  {obj.icon}
                </div>
              ))}
              
              {/* Semi-transparent overlay for better text readability */}
              <div className="absolute inset-0 bg-black/20 rounded-lg z-0"></div>
              
              {/* Profile Photo */}
              <div
                className={`
                  w-32 h-32
                  mx-auto mb-6
                  rounded-full
                  bg-white/90
                  flex items-end justify-center
                  relative
                  shadow-xl
                  ring-4 ring-white/50
                  ring-offset-2 ring-offset-white/30
                  transition-all duration-300 ease-in-out
                  hover:scale-110
                  hover:-translate-y-1
                  z-10
                `}
              >
                <img
                  src={profileImage}
                  alt={name.split(' ').map(n => n[0]).join('')}
                  className="
                    w-[130%] h-[130%] 
                    object-cover 
                    [object-position:50%_70%] 
                    [clip-path:inset(0%_0%_0%_0%_round_50%_49%_47%_47%)] 
                    transition-all duration-300 ease-in-out
                    text-gray-800 
                    text-xl
                    font-bold
                  "
                />
              </div>

              {/* Member Info */}
              <div className="relative z-10">
                <h5 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center drop-shadow-lg">
                  {name}
                </h5>
                <p className="text-sm sm:text-base font-medium text-white/90 text-center drop-shadow-md">
                  {role}
                </p>
              </div>
            </div>

            {/* Hover Overlay with Flip Button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-20"
              transition={{ duration: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlip();
                }}
                className="bg-white text-gray-800 px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Flip
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Back of Card (Detailed Info) */}
        <div className="card-back absolute inset-0 w-full h-full">
          <div className={`relative w-full h-full bg-gradient-to-br ${gradientColors} rounded-lg p-4 sm:p-6 shadow-2xl overflow-hidden`}>
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full -translate-x-8 -translate-y-8"></div>
            </div>
            
            <div className="h-full flex flex-col relative z-10">
              {/* Content */}
              <div className="flex-1 space-y-3 overflow-hidden pt-4">
                {/* Profile Section */}
                <div className="text-center">
                  <div
                    className={`
                      w-16 h-16
                      mx-auto mb-3
                      rounded-full
                      bg-white/90
                      flex items-end justify-center
                      relative
                      shadow-lg
                      ring-2 ring-white/50
                      ring-offset-1 ring-offset-white/30
                    `}
                  >
                    <img
                      src={profileImage}
                      alt={name.split(' ').map(n => n[0]).join('')}
                      className="
                        w-[130%] h-[130%] 
                        object-cover 
                        [object-position:50%_70%] 
                        [clip-path:inset(0%_0%_0%_0%_round_50%_49%_47%_47%)] 
                        transition-all duration-300 ease-in-out
                      "
                    />
                  </div>
                </div>

                {/* Quote Section */}
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-white/60 shadow-md">
                  <div className="flex items-center justify-center mb-1">
                    <svg className="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inspiration</span>
                  </div>
                  <p className="text-xs text-gray-700 italic text-center leading-relaxed font-medium">
                    "{quote}"
                  </p>
                </div>

                {/* Social Links Section */}
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-white/60 shadow-md">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Connect</span>
                  </div>
                  <div className="flex justify-center space-x-2">
                    {socialLinks.map((link, index) => (
                      <motion.a
                        key={index}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.bgColor} text-white p-2 rounded-full hover:${link.hoverColor} transition-all duration-200 shadow-md hover:shadow-lg`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d={link.iconPath} />
                        </svg>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;
