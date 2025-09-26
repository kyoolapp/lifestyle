import React, { useEffect, useState, useRef } from 'react';
import { Card } from './ui/card';

interface StatCardProps {
  icon: string;
  number: string;
  label: string;
  backgroundColor: string;
  delay?: number;
  triggerAnimation?: boolean;
}

export function StatCard({ icon, number, label, backgroundColor, delay = 0, triggerAnimation = false }: StatCardProps) {
  const [animatedNumber, setAnimatedNumber] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const numericValue = parseInt(number.replace('%', ''));
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedNumber / 100) * circumference;

  useEffect(() => {
    if (triggerAnimation && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
        let start = 0;
        const duration = 1500; // 1.5 seconds
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = Math.floor(numericValue * easeOutQuart);
          
          setAnimatedNumber(currentValue);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setAnimatedNumber(numericValue);
          }
        };
        
        animate();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [triggerAnimation, numericValue, delay, hasAnimated]);

  return (
    <Card 
      className={`p-6 text-center transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${backgroundColor} border-0 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Icon */}
      <div className="text-3xl mb-4">{icon}</div>
      
      {/* Circular Progress */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-out"
            style={{
              transitionDelay: `${delay}ms`
            }}
          />
        </svg>
        {/* Percentage number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {animatedNumber}%
          </span>
        </div>
      </div>
      
      {/* Label */}
      <p className="text-sm text-muted-foreground leading-relaxed">{label}</p>
    </Card>
  );
}