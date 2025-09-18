import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Timer,
  Footprints,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface QuickWalkTimerProps {
  onBack: () => void;
}

export function QuickWalkTimer({ onBack }: QuickWalkTimerProps) {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(20 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(startTime);
    setIsCompleted(false);
  };

  const progress = ((startTime - timeLeft) / startTime) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Quick Walk</h1>
          <p className="text-muted-foreground">20-minute refreshing walk</p>
        </div>
      </div>

      {/* Timer Card */}
      <div className="max-w-md mx-auto">
        <Card className={`transition-all duration-300 ${
          isCompleted ? 'bg-green-50 border-green-200' : 
          isRunning ? 'bg-blue-50 border-blue-200' : 
          'border-gray-200'
        }`}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Footprints className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">
              {isCompleted ? 'Walk Completed!' : 'Quick Walk Timer'}
            </CardTitle>
            {!isCompleted && (
              <div className="flex justify-center gap-2 mt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Light Exercise
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  20 minutes
                </Badge>
              </div>
            )}
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {/* Timer Display */}
            <motion.div
              className="space-y-4"
              animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
            >
              <div className={`text-6xl font-bold ${
                isCompleted ? 'text-green-600' : 
                isRunning ? 'text-blue-600' : 
                'text-gray-700'
              }`}>
                {formatTime(timeLeft)}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress 
                  value={progress} 
                  className={`h-2 ${
                    isCompleted ? 'bg-green-100' : 
                    isRunning ? 'bg-blue-100' : 
                    'bg-gray-100'
                  }`}
                />
                <p className="text-sm text-muted-foreground">
                  {isCompleted ? 'Congratulations!' : 
                   `${Math.round(progress)}% complete`}
                </p>
              </div>
            </motion.div>

            {/* Control Buttons */}
            <div className="flex gap-3 justify-center">
              {!isCompleted ? (
                <>
                  {!isRunning ? (
                    <Button
                      onClick={handleStart}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {timeLeft === startTime ? 'Start Walk' : 'Resume'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePause}
                      size="lg"
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  {timeLeft !== startTime && (
                    <Button
                      onClick={handleStop}
                      size="lg"
                      variant="outline"
                      className="border-gray-200 px-6"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center"
                    >
                      <Timer className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <div className="space-y-1">
                      <p className="font-medium text-green-700">Great job!</p>
                      <p className="text-sm text-muted-foreground">
                        You completed your 20-minute walk
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleStop}
                      variant="outline"
                      className="flex-1"
                    >
                      Start Again
                    </Button>
                    <Button
                      onClick={onBack}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Walking Tips */}
            {!isCompleted && (
              <div className="bg-muted/30 rounded-lg p-4 text-left">
                <h4 className="font-medium text-sm mb-2">Walking Tips:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Maintain a comfortable, steady pace</li>
                  <li>• Keep your head up and shoulders relaxed</li>
                  <li>• Swing your arms naturally</li>
                  <li>• Stay hydrated</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}