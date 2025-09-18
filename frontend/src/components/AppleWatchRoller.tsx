import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface AppleWatchRollerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
  className?: string;
}

export function AppleWatchRoller({ 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  suffix = '', 
  className = '' 
}: AppleWatchRollerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startValue = useRef(value);

  const values = [];
  for (let i = min; i <= max; i += step) {
    // Round to avoid floating point precision issues
    const roundedValue = Math.round(i / step) * step;
    values.push(parseFloat(roundedValue.toFixed(2)));
  }

  const currentIndex = values.findIndex(v => v === value);
  const itemHeight = 40;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY.current - e.clientY;
    const steps = Math.round(deltaY / itemHeight);
    const currentValueIndex = values.findIndex(v => v === startValue.current);
    const newIndex = Math.max(0, Math.min(values.length - 1, currentValueIndex + steps));
    
    if (values[newIndex] !== value) {
      onChange(values[newIndex]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  return (
    <div 
      ref={containerRef}
      className={`relative h-32 w-20 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={handleMouseDown}
    >
      {/* Selection indicator */}
      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-10 bg-blue-500/20 border-y-2 border-blue-500 pointer-events-none z-10" />
      
      {/* Values */}
      <motion.div
        className="absolute inset-x-0 py-12"
        animate={{
          y: -(currentIndex * itemHeight)
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300
        }}
      >
        {values.map((val, index) => {
          const distance = Math.abs(index - currentIndex);
          const opacity = Math.max(0.3, 1 - distance * 0.3);
          const scale = Math.max(0.7, 1 - distance * 0.1);
          
          return (
            <div
              key={val}
              className="flex items-center justify-center h-10 text-center font-medium"
              style={{
                opacity,
                transform: `scale(${scale})`,
                color: distance === 0 ? '#2563eb' : '#6b7280'
              }}
            >
              {step < 1 ? val.toFixed(2) : val}{suffix}
            </div>
          );
        })}
      </motion.div>
      
      {/* Gradient overlays */}
      <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-gray-100 to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-gray-200 to-transparent pointer-events-none z-20" />
    </div>
  );
}