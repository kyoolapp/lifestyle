import React, { useEffect, useRef, useState } from 'react';
import { StatCard } from './StatCard.tsx';

interface StatData {
  icon: string;
  number: string;
  label: string;
  backgroundColor: string;
}

interface AnimatedStatsSectionProps {
  stats: StatData[];
}

export function AnimatedStatsSection({ stats }: AnimatedStatsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '-50px 0px', // Start animation 50px before the section is fully visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  return (
    <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          number={stat.number}
          label={stat.label}
          backgroundColor={stat.backgroundColor}
          delay={index * 200}
          triggerAnimation={isVisible}
        />
      ))}
    </div>
  );
}