
import React, { useState, useRef, useEffect } from 'react';
import type { LanguageOption } from '../types';
import { LanguageIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../contexts/ThemeContext'; // Import useTheme

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  supportedLanguages: LanguageOption[];
  menuAlignment?: 'left' | 'right'; 
  theme?: 'default' | 'darkHeader' | 'lightContainer'; 
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  supportedLanguages,
  menuAlignment = 'right',
  theme: themeProp = 'default', 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme(); // Get global theme (light or dark)

  const selectedLanguageName = supportedLanguages.find(lang => lang.code === currentLanguage)?.name || currentLanguage;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let buttonClasses = "inline-flex items-center justify-center w-full rounded-md border shadow-sm px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ";

  // Adjust button style based on its specific theme prop AND global theme
  if (themeProp === 'darkHeader') { // Typically used on primary yellow header
    buttonClasses += "border-text_on_primary/40 bg-black/10 text-text_on_primary hover:bg-black/20 focus:ring-offset-primary focus:ring-text_on_primary";
    // No specific dark mode change needed here if primary header color doesn't change
  } else if (themeProp === 'lightContainer') { // For light backgrounds or default
    if (resolvedTheme === 'dark') {
      buttonClasses += "border-dark_neutral_border bg-dark_neutral_card_bg text-dark_text_default hover:bg-dark_neutral_border focus:ring-offset-dark_neutral_card_bg focus:ring-primary";
    } else {
      buttonClasses += "border-neutral_border bg-neutral_card_bg text-text_default hover:bg-neutral_bg focus:ring-offset-neutral_card_bg focus:ring-primary";
    }
  } else { // Default theme
     if (resolvedTheme === 'dark') {
      buttonClasses += "border-dark_neutral_border bg-dark_neutral_card_bg text-dark_text_default hover:bg-dark_neutral_border focus:ring-offset-dark_neutral_card_bg focus:ring-primary";
    } else {
      buttonClasses += "border-neutral_border bg-neutral_card_bg text-text_default hover:bg-neutral_bg focus:ring-offset-neutral_card_bg focus:ring-primary";
    }
  }


  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={buttonClasses}
          id="options-menu"
          aria-haspopup="true"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <LanguageIcon className="h-5 w-5 mr-2" aria-hidden="true" />
          {selectedLanguageName}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          className={`origin-top-${menuAlignment} absolute ${menuAlignment}-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-dark_neutral_card_bg ring-1 ring-black dark:ring-dark_neutral_border ring-opacity-5 focus:outline-none z-50`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  setIsOpen(false);
                }}
                className={`${
                  currentLanguage === lang.code 
                  ? 'bg-primary-light text-text_on_primary dark:bg-primary-dark dark:text-text_on_primary' 
                  : 'text-gray-700 dark:text-dark_text_muted'
                } group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-dark_text_default transition-colors`}
                role="menuitem"
              >
                {lang.name}
                {currentLanguage === lang.code && (
                  <CheckIcon className="ml-auto h-5 w-5 text-primary dark:text-primary-light" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;