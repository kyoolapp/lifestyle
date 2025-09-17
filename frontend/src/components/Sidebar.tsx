import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Home, 
  Heart, 
  Droplets, 
  ChefHat, 
  Dumbbell, 
  User,
  Crown,
  LogOut,
  Smartphone,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'activity', label: 'Activity', icon: Home },
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'health', label: 'Health Metrics', icon: Heart },
    { id: 'water', label: 'Water Tracker', icon: Droplets },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'devices', label: 'Connected Devices', icon: Smartphone },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm sm:text-base">H</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold">Health Hub</h1>
            <p className="text-sm text-muted-foreground">Stay Healthy</p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs sm:text-sm">{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {user.isPremium ? 'Premium' : 'Free'}
              </p>
              {user.isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <ul className="space-y-1 sm:space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-2 sm:px-3 py-2 sm:py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm hidden sm:inline truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 sm:p-4 border-t border-border space-y-3">
        {!user.isPremium && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2 sm:p-3 text-white">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Upgrade to Premium</span>
            </div>
            <p className="text-xs opacity-90 mb-1 sm:mb-2 hidden sm:block">
              Get ingredient-based recipes and unlimited access
            </p>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-1 px-2 rounded transition-colors">
              <span className="hidden sm:inline">Upgrade Now</span>
              <span className="sm:hidden">Upgrade</span>
            </button>
          </div>
        )}
        
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-2 sm:px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 sm:hidden bg-background/80 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden sm:flex w-16 lg:w-64 bg-card border-r border-border flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out sm:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}