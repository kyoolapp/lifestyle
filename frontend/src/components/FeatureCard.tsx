import React from 'react';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefit: string;
  colorScheme: string;
}

export function FeatureCard({ icon: Icon, title, description, benefit, colorScheme }: FeatureCardProps) {
  const getColorClasses = (scheme: string) => {
    switch (scheme) {
      case 'blue':
        return {
          card: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-950/30 dark:to-blue-900/30',
          iconBg: 'bg-blue-500/15',
          iconColor: 'text-blue-600 dark:text-blue-400',
          benefitBg: 'bg-blue-500/15',
          benefitText: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200/50 dark:border-blue-800/50'
        };
      case 'green':
        return {
          card: 'bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-950/30 dark:to-green-900/30',
          iconBg: 'bg-green-500/15',
          iconColor: 'text-green-600 dark:text-green-400',
          benefitBg: 'bg-green-500/15',
          benefitText: 'text-green-700 dark:text-green-300',
          border: 'border-green-200/50 dark:border-green-800/50'
        };
      case 'purple':
        return {
          card: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-950/30 dark:to-purple-900/30',
          iconBg: 'bg-purple-500/15',
          iconColor: 'text-purple-600 dark:text-purple-400',
          benefitBg: 'bg-purple-500/15',
          benefitText: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200/50 dark:border-purple-800/50'
        };
      case 'orange':
        return {
          card: 'bg-gradient-to-br from-orange-50/80 to-orange-100/80 dark:from-orange-950/30 dark:to-orange-900/30',
          iconBg: 'bg-orange-500/15',
          iconColor: 'text-orange-600 dark:text-orange-400',
          benefitBg: 'bg-orange-500/15',
          benefitText: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-200/50 dark:border-orange-800/50'
        };
      default:
        return {
          card: 'bg-gradient-to-br from-background to-muted/30',
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          benefitBg: 'bg-primary/5',
          benefitText: 'text-primary',
          border: 'border-primary/10'
        };
    }
  };

  const colors = getColorClasses(colorScheme);

  return (
    <Card className={`p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border ${colors.border} ${colors.card} shadow-lg relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-8 h-8 ${colors.iconColor}`} />
        </div>
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        <div className={`text-sm ${colors.benefitBg} rounded-xl p-4 border ${colors.border}`}>
          <span className={`${colors.benefitText} font-medium`}>✓ {benefit}</span>
        </div>
      </div>
    </Card>
  );
}