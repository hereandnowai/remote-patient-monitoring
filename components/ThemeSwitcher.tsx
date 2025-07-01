import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme, Theme } from '../contexts/ThemeContext'; // Check path

interface ThemeSwitcherProps {
  className?: string; // For custom positioning/styling of the container
  buttonSize?: 'sm' | 'md';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '', buttonSize = 'md' }) => {
  const { theme, setTheme } = useTheme();

  const themes: { name: Theme; label: string; icon: React.ElementType }[] = [
    { name: 'light', label: 'Light', icon: SunIcon },
    { name: 'dark', label: 'Dark', icon: MoonIcon },
    { name: 'system', label: 'System', icon: ComputerDesktopIcon },
  ];

  const iconSizeClass = buttonSize === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  const buttonPadding = buttonSize === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <div className={`flex items-center space-x-1 bg-neutral_bg dark:bg-dark_neutral_bg p-1 rounded-lg shadow ${className}`}>
      {themes.map((item) => (
        <button
          key={item.name}
          onClick={() => setTheme(item.name)}
          className={`
            ${buttonPadding} rounded-md transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50
            ${theme === item.name 
              ? 'bg-primary text-text_on_primary dark:bg-primary-dark dark:text-text_on_primary' 
              : 'text-text_muted hover:bg-neutral_border dark:text-dark_text_muted dark:hover:bg-dark_neutral_border'
            }
          `}
          aria-pressed={theme === item.name}
          aria-label={`Switch to ${item.label} theme`}
          title={`${item.label} Mode`}
        >
          <item.icon className={iconSizeClass} />
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
