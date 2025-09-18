import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MotivationalBannerProps {
  user: any;
}

export function MotivationalBanner({ user }: MotivationalBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Personalized motivational messages based on user data
  const motivationalMessages = [
    {
      message: `Hey ${user.name.split(' ')[0]}! 🌟 Ready to conquer your health goals today? Your journey at 48 is just getting started!`,
      theme: 'energy',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      message: `💪 Your body is capable of amazing things! Let's make today count with smart choices and steady progress.`,
      theme: 'strength',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      message: `🎯 Every small step matters! Your consistent effort is building the healthier, stronger you.`,
      theme: 'progress',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      message: `✨ Age is just a number - your commitment to health shows you're in your prime! Keep shining!`,
      theme: 'wisdom',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      message: `🌱 Growth happens outside your comfort zone. Today's workout could be your personal breakthrough!`,
      theme: 'growth',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      message: `🔥 Your dedication is inspiring! Remember, progress over perfection - you've got this!`,
      theme: 'dedication',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      message: `🌈 Health is wealth, and you're investing wisely! Today's choices create tomorrow's victories.`,
      theme: 'investment',
      gradient: 'from-teal-500 to-blue-500'
    }
  ];

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % motivationalMessages.length);
      setIsAnimating(false);
    }, 150);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const currentMessage = motivationalMessages[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6"
      >
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className={`absolute inset-0 bg-gradient-to-r ${currentMessage.gradient} opacity-90`} />
          <CardContent className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white flex-shrink-0" />
                </motion.div>
                
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-white font-medium text-sm sm:text-base leading-relaxed">
                    {currentMessage.message}
                  </p>
                </motion.div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="text-white hover:bg-white/20 rounded-full p-2 h-auto"
                  title="Next motivation"
                >
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/20 rounded-full p-2 h-auto"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {motivationalMessages.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white/40'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => !isAnimating && setCurrentIndex(index)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}