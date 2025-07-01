
import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, InformationCircleIcon, ShieldCheckIcon, QuestionMarkCircleIcon, Cog6ToothIcon, PaintBrushIcon, LanguageIcon } from '@heroicons/react/24/solid'; // Changed PaletteIcon to PaintBrushIcon
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSelector from './LanguageSelector';
import { SUPPORTED_LANGUAGES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsPageProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

interface SettingsItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  description: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ to, icon: Icon, label, description }) => (
  <Link 
    to={to} 
    className="block p-4 bg-neutral_bg dark:bg-dark_neutral_bg rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 hover:bg-primary-light dark:hover:bg-primary-dark/20 group"
  >
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-primary text-text_on_primary rounded-full group-hover:bg-primary-dark transition-colors">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text_default dark:text-dark_text_default group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors">{label}</h3>
        <p className="text-sm text-text_muted dark:text-dark_text_muted">{description}</p>
      </div>
    </div>
  </Link>
);


const SettingsPage: React.FC<SettingsPageProps> = ({ currentLanguage, onLanguageChange }) => {
  const { resolvedTheme } = useTheme();

  const settingLinks = [
    { to: "/profile", icon: UserIcon, label: "Profile", description: "View and manage your personal information." },
    { to: "/about", icon: InformationCircleIcon, label: "About App", description: "Learn more about this application." },
    { to: "/privacy", icon: ShieldCheckIcon, label: "Privacy Policy", description: "Read about how we protect your data." },
    { to: "/help", icon: QuestionMarkCircleIcon, label: "Help & Support", description: "Get assistance and find FAQs." },
  ];

  return (
    <div className="p-4 md:p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-3xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-8">
        <Cog6ToothIcon className="h-10 w-10 text-primary mr-3" />
        <h2 className="text-3xl font-bold text-primary">Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Account & App Information Links */}
        <section>
          <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default mb-3">General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingLinks.map(item => (
              <SettingsItem key={item.to} {...item} />
            ))}
          </div>
        </section>

        {/* Appearance Section */}
        <section className="pt-6 border-t border-neutral_border dark:border-dark_neutral_border">
          <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default mb-4 flex items-center">
            <PaintBrushIcon className="h-6 w-6 mr-2 text-primary" /> {/* Changed PaletteIcon to PaintBrushIcon */}
            Appearance
          </h3>
          <div className="p-4 bg-neutral_bg dark:bg-dark_neutral_bg rounded-lg shadow-md">
            <p className="text-sm font-medium text-text_muted dark:text-dark_text_muted mb-2">Theme</p>
            <ThemeSwitcher />
            <p className="text-xs text-text_muted dark:text-dark_text_muted mt-1">Choose between light, dark, or system default theme.</p>
          </div>
        </section>
        
        {/* Language Section */}
        <section className="pt-6 border-t border-neutral_border dark:border-dark_neutral_border">
          <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default mb-4 flex items-center">
            <LanguageIcon className="h-6 w-6 mr-2 text-primary" />
            Language
          </h3>
           <div className="p-4 bg-neutral_bg dark:bg-dark_neutral_bg rounded-lg shadow-md">
            <p className="text-sm font-medium text-text_muted dark:text-dark_text_muted mb-2">Application Language</p>
            <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
                supportedLanguages={SUPPORTED_LANGUAGES}
                theme={resolvedTheme === 'dark' ? 'darkHeader' : 'lightContainer'}
             />
             <p className="text-xs text-text_muted dark:text-dark_text_muted mt-1">Select your preferred language for the app interface.</p>
          </div>
        </section>
        
        {/* Placeholder for Notifications settings */}
        {/* <section className="pt-6 border-t border-neutral_border dark:border-dark_neutral_border">
          <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default mb-3">Notifications (Placeholder)</h3>
          <div className="p-4 bg-neutral_bg dark:bg-dark_neutral_bg rounded-lg shadow-md">
            <p className="text-text_muted dark:text-dark_text_muted">Notification settings will be available here.</p>
          </div>
        </section> */}

      </div>
    </div>
  );
};

export default SettingsPage;
