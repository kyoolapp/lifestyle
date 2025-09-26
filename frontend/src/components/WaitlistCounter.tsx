import React, { useEffect, useState } from 'react';

export function WaitlistCounter() {
  const [count, setCount] = useState(0);
  const targetCount = 237;

  useEffect(() => {
    let current = 0;
    const increment = targetCount / 50; // Animation over ~1 second
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
      <div className="flex -space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-background flex items-center justify-center"
          >
            <span className="text-xs text-primary">👤</span>
          </div>
        ))}
      </div>
      <span>Join <strong className="text-primary">{count}</strong> executives already on the waitlist</span>
    </div>
  );
}