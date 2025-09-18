import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface Mood {
  emoji: string;
  label: string;
  motivation: string;
  color: string;
}

interface EmojiMoodSelectorProps {
  onSelect: (mood: Mood) => void;
  onSkip: () => void;
}

export function EmojiMoodSelector({ onSelect, onSkip }: EmojiMoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const moods: Mood[] = [
    {
      emoji: '💪',
      label: 'Strong',
      motivation: 'You\'re crushing it! Keep that power flowing!',
      color: 'bg-green-100 border-green-300'
    },
    {
      emoji: '🔥',
      label: 'On Fire',
      motivation: 'Unstoppable! You\'re in the zone today!',
      color: 'bg-orange-100 border-orange-300'
    },
    {
      emoji: '😤',
      label: 'Determined',
      motivation: 'That focus is incredible! Nothing can stop you!',
      color: 'bg-red-100 border-red-300'
    },
    {
      emoji: '😊',
      label: 'Good',
      motivation: 'Steady progress! Every rep counts!',
      color: 'bg-blue-100 border-blue-300'
    },
    {
      emoji: '😅',
      label: 'Challenging',
      motivation: 'Growth happens outside comfort zones! You got this!',
      color: 'bg-yellow-100 border-yellow-300'
    },
    {
      emoji: '😮‍💨',
      label: 'Tough',
      motivation: 'Every champion faces tough moments. You\'re building resilience!',
      color: 'bg-purple-100 border-purple-300'
    }
  ];

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setTimeout(() => {
      onSelect(mood);
    }, 1500); // Show motivation for 1.5 seconds
  };

  if (selectedMood) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: 1 }}
          className="text-6xl"
        >
          {selectedMood.emoji}
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-green-600">
            Awesome!
          </h3>
          <p className="text-gray-600 font-medium">
            {selectedMood.motivation}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">How are you feeling?</h3>
        <p className="text-sm text-muted-foreground">
          Share your energy level after this set
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {moods.map((mood, index) => (
          <motion.div
            key={mood.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`cursor-pointer hover:shadow-md transition-all duration-200 ${mood.color}`}
              onClick={() => handleMoodSelect(mood)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className="text-3xl">{mood.emoji}</div>
                <div className="text-sm font-medium">{mood.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <Button 
        variant="ghost" 
        onClick={onSkip}
        className="w-full text-muted-foreground"
      >
        Skip
      </Button>
    </div>
  );
}