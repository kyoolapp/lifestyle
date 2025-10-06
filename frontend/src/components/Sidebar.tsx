import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
  Sparkles,
  Users
} from 'lucide-react';

interface SidebarProps {
  user: any;
  onLogout?: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  const navItems = [
    { id: 'activity', label: 'Activity', icon: Home, path: '/dashboard' },
    { id: 'search', label: 'Search Users', icon: Search, path: '/search' },
    { id: 'features', label: 'Features', icon: Sparkles, path: '/features' },
    { id: 'health', label: 'Health Metrics', icon: Heart, path: '/health' },
    { id: 'water', label: 'Water Tracker', icon: Droplets, path: '/water' },
    { id: 'recipes', label: 'Recipes', icon: ChefHat, path: '/recipes' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, path: '/fitness' },
    { id: 'devices', label: 'Connected Devices', icon: Smartphone, path: '/devices' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 sm:p-6 border-b border-border" />

      {/* User header wrapped in Link */}
      <Link
        to="/profile"
        title="Open profile"
        onClick={() => setIsMobileMenuOpen(false)}
        className="block p-3 sm:p-4 border-b border-border hover:bg-accent/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs sm:text-sm">
              {user.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {user.isPremium ? 'Premium' : 'Free'}
              </p>
              {user.isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
            </div>
          </div>
        </div>
      </Link>

      
        {/*<Link 
          to="/friends" 
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/friends' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Users className="w-5 h-5" />
          Friends
        </Link>
        
        {/*<Link 
          to="/friend-requests" 
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/friend-requests' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Users className="w-5 h-5" />
          Friend Requests
        </Link>*/}
      

      {/* Nav items */}
      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <ul className="space-y-1 sm:space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-2 sm:px-3 py-2 sm:py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  title={item.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm hidden sm:inline truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
      </nav>

      {/* Footer actions */}
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
