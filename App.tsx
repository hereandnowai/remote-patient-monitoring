
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomeIcon, HeartIcon, PlusCircleIcon, BookOpenIcon, VideoCameraIcon, ChatBubbleLeftEllipsisIcon, DocumentTextIcon, Cog6ToothIcon, UserIcon, ShieldCheckIcon, QuestionMarkCircleIcon, XMarkIcon, LanguageIcon, ListBulletIcon, CalendarDaysIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Added CalendarDaysIcon, InformationCircleIcon

import Dashboard from './components/Dashboard';
import VitalsInput from './components/VitalsInput';
import MedicationManager from './components/MedicationManager';
import EducationalContent from './components/EducationalContent';
import Telehealth from './components/Telehealth';
import Chatbot from './components/Chatbot';
import SymptomLogger from './components/SymptomLogger';
import LanguageSelector from './components/LanguageSelector';
import VitalHistoryPage from './components/VitalHistoryPage';
import AppointmentHistoryPage from './components/AppointmentHistoryPage';
import Alert from './components/Alert'; 
import ThemeSwitcher from './components/ThemeSwitcher'; 
import { ThemeProvider, useTheme } from './contexts/ThemeContext'; 
import { APP_NAME, COMPANY_LOGO_URL, COMPANY_NAME, DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGES } from './constants';
import type { VitalSign, Medication, SymptomLog, Appointment } from './types';

// New Page Imports
import SettingsPage from './components/SettingsPage';
import AboutPage from './components/AboutPage';

// Placeholder for PrivacyPolicy, to be enhanced
const PrivacyPolicyPage: React.FC = () => (
    <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl animate-fadeIn max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-10 w-10 text-primary mr-3" />
            <h2 className="text-3xl font-bold text-primary">Privacy Policy</h2>
        </div>
        <div className="prose dark:prose-invert max-w-none text-text_default dark:text-dark_text_default">
            <p>Your privacy is important to us. This Remote Patient Monitoring application ({APP_NAME}) is provided by {COMPANY_NAME}.</p>
            <h3 className="text-xl font-semibold mt-4">Information We Collect (Simulated)</h3>
            <p>When you use our app, we may collect the following types of information (this is a simulation for demonstration purposes):</p>
            <ul>
                <li><strong>Personal Information:</strong> Name, contact details, date of birth (if provided for profile).</li>
                <li><strong>Health Data:</strong> Vital signs (blood pressure, heart rate, etc.), medications, symptoms, and any notes you log. This data is stored securely.</li>
                <li><strong>Usage Data:</strong> How you interact with the app, features used, and technical data about your device and connection.</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4">How We Use Your Information (Simulated)</h3>
            <p>We use your information to:</p>
            <ul>
                <li>Provide and maintain the app's services.</li>
                <li>Enable you to track and manage your health data.</li>
                <li>Facilitate telehealth appointments (if requested).</li>
                <li>Offer AI-powered insights (with your explicit action).</li>
                <li>Improve the app and develop new features (based on anonymized and aggregated data).</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4">Data Security (Simulated)</h3>
            <p>We implement robust security measures to protect your data, including encryption and secure servers. Access to your personal health information is restricted.</p>
            <h3 className="text-xl font-semibold mt-4">HIPAA Compliance (Simulated)</h3>
            <p>For users in the United States, we strive to operate in a manner consistent with the Health Insurance Portability and Accountability Act (HIPAA). This includes measures to protect the privacy and security of Protected Health Information (PHI).</p>
            <h3 className="text-xl font-semibold mt-4">Sharing Your Information (Simulated)</h3>
            <p>We do not sell your personal information. We may share your data in the following circumstances (simulated):</p>
            <ul>
                <li>With healthcare providers you authorize (e.g., during a telehealth session).</li>
                <li>With third-party service providers who assist us in operating the app (under strict confidentiality agreements).</li>
                <li>If required by law or to protect our rights.</li>
            </ul>
            <h3 className="text-xl font-semibold mt-4">Your Rights (Simulated)</h3>
            <p>You may have rights to access, correct, or delete your personal information, subject to applicable laws. Please contact us for assistance.</p>
            <h3 className="text-xl font-semibold mt-4">Changes to This Policy</h3>
            <p>We may update this privacy policy from time to time. We will notify you of any significant changes.</p>
            <h3 className="text-xl font-semibold mt-4">Contact Us</h3>
            <p>If you have any questions about this privacy policy, please contact us at privacy@{COMPANY_NAME.toLowerCase().replace(/\s+/g, '')}.com (this is a placeholder email).</p>
        </div>
    </div>
);

// Placeholder for HelpPage, to be enhanced
const HelpPage: React.FC = () => (
    <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl animate-fadeIn max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
            <QuestionMarkCircleIcon className="h-10 w-10 text-primary mr-3" />
            <h2 className="text-3xl font-bold text-primary">Help & Support</h2>
        </div>
        <div className="prose dark:prose-invert max-w-none text-text_default dark:text-dark_text_default">
            <h3 className="text-xl font-semibold mt-4">Frequently Asked Questions (FAQs)</h3>
            <p><strong>Q: How do I log my blood pressure?</strong></p>
            <p>A: Navigate to the "Log Vitals" tab, select "Blood Pressure" from the dropdown, enter your systolic and diastolic readings, and click "Add Vital Reading".</p>
            <p><strong>Q: Can I edit a medication I've already added?</strong></p>
            <p>A: Yes, go to the "Meds" tab, find the medication you wish to edit, and click the pencil icon (✏️) next to it. This will open the form with the medication's details for you to modify.</p>
            <p><strong>Q: Is my data secure?</strong></p>
            <p>A: We take data security very seriously. Please refer to our <Link to="/privacy" className="text-primary hover:underline dark:hover:text-primary-light">Privacy Policy</Link> for more details.</p>
            <p><strong>Q: How does the AI Chatbot (Aura) work?</strong></p>
            <p>A: Aura is an AI assistant powered by Google's Gemini model. It can provide general health information and help you navigate the app. It cannot provide medical advice. For any medical concerns, please consult your doctor.</p>
            
            <h3 className="text-xl font-semibold mt-6">Troubleshooting</h3>
            <p><strong>Problem: The app is slow or not loading.</strong></p>
            <p>Solution: Check your internet connection. Try clearing your browser's cache or restarting the app. If the issue persists, please contact support.</p>
            <p><strong>Problem: Speech-to-text is not working.</strong></p>
            <p>Solution: Ensure your browser has permission to access your microphone. Speech-to-text functionality depends on browser support; try using a modern browser like Chrome or Firefox.</p>

            <h3 className="text-xl font-semibold mt-6">Contact Support</h3>
            <p>If you need further assistance or have specific questions not covered here, please contact our support team:</p>
            <ul>
                <li>Email: support@{COMPANY_NAME.toLowerCase().replace(/\s+/g, '')}.com (placeholder)</li>
                <li>Phone: 1-800-555-0199 (placeholder)</li>
            </ul>
             <p className="mt-4 text-sm">Thank you for using {APP_NAME}!</p>
        </div>
    </div>
);

// Placeholder for ProfilePage, to be enhanced
const ProfilePage: React.FC = () => (
     <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl animate-fadeIn max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-6">
            <UserIcon className="h-20 w-20 text-primary p-3 bg-primary-light dark:bg-primary-dark/30 rounded-full mb-4" />
            <h2 className="text-3xl font-bold text-primary">User Profile</h2>
        </div>
        <div className="space-y-4 text-text_default dark:text-dark_text_default">
            <div>
                <label className="text-sm font-medium text-text_muted dark:text-dark_text_muted">Full Name (Placeholder)</label>
                <p className="mt-1 p-3 bg-neutral_bg dark:bg-dark_neutral_bg rounded-md">Jane Doe</p>
            </div>
            <div>
                <label className="text-sm font-medium text-text_muted dark:text-dark_text_muted">Email (Placeholder)</label>
                <p className="mt-1 p-3 bg-neutral_bg dark:bg-dark_neutral_bg rounded-md">jane.doe@example.com</p>
            </div>
            <div>
                <label className="text-sm font-medium text-text_muted dark:text-dark_text_muted">Date of Birth (Placeholder)</label>
                <p className="mt-1 p-3 bg-neutral_bg dark:bg-dark_neutral_bg rounded-md">January 1, 1980</p>
            </div>
             <div>
                <label className="text-sm font-medium text-text_muted dark:text-dark_text_muted">Member Since (Placeholder)</label>
                <p className="mt-1 p-3 bg-neutral_bg dark:bg-dark_neutral_bg rounded-md">{new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
            <div className="pt-4">
                <button 
                    className="w-full bg-primary hover:bg-primary-dark text-text_on_primary font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-200"
                    onClick={() => alert('Edit Profile functionality would be here.')}
                >
                    Edit Profile (Simulated)
                </button>
            </div>
        </div>
    </div>
);


interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  currentPath: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, currentPath }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ease-in-out
                ${currentPath === to 
                  ? 'bg-primary text-text_on_primary dark:bg-primary-dark dark:text-text_on_primary shadow-md' 
                  : 'text-gray-700 dark:text-dark_text_muted hover:bg-primary-light dark:hover:bg-primary-dark/30 hover:text-text_on_primary dark:hover:text-dark_text_default'
                }`}
  >
    <Icon className="h-6 w-6 mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

// Renamed AppContent to MainAppLayout
const MainAppLayout: React.FC = () => { 
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>(DEFAULT_LANGUAGE_CODE);
  const [symptomPatternAlert, setSymptomPatternAlert] = useState<string | null>(null);
  const [appFeedback, setAppFeedback] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  const location = useLocation();
  const { resolvedTheme } = useTheme(); // useTheme must be used within a ThemeProvider

  const addVitalSign = useCallback((vital: VitalSign) => {
    setVitalSigns(prev => [...prev, vital].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const editVitalSign = useCallback((updatedVital: VitalSign) => {
    setVitalSigns(prev => prev.map(v => v.id === updatedVital.id ? updatedVital : v).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const deleteVitalSign = useCallback((vitalId: string) => {
    setVitalSigns(prev => prev.filter(v => v.id !== vitalId));
  }, []);

  const addMedication = useCallback((med: Medication) => {
    setMedications(prev => [...prev, med].sort((a,b) => a.time.localeCompare(b.time)));
  }, []);

  const editMedication = useCallback((updatedMed: Medication) => {
    setMedications(prev => prev.map(med => med.id === updatedMed.id ? updatedMed : med).sort((a,b) => a.time.localeCompare(b.time)));
  }, []);

  const deleteMedication = useCallback((medId: string) => {
    setMedications(prev => prev.filter(med => med.id !== medId));
  }, []);

  const toggleMedicationTaken = useCallback((id: string) => {
    setMedications(prev => prev.map(med => med.id === id ? { ...med, takenToday: !med.takenToday, takenTimestamp: !med.takenToday ? new Date() : undefined } : med));
  }, []);

  const addSymptomLog = useCallback((log: SymptomLog) => {
    setSymptomPatternAlert(null); 
    const updatedSymptoms = [...symptoms, log].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setSymptoms(updatedSymptoms);

    const mainSymptomKeyword = log.description.toLowerCase().split(/,|\band\b|\bwith\b/)[0].trim().replace(/^(persistent|mild|severe|slight|constant|intermittent)\s+/,'').trim();

    if (mainSymptomKeyword && mainSymptomKeyword.length > 3) { 
      const relevantSymptoms = updatedSymptoms.filter(s => {
        const sDescriptionLower = s.description.toLowerCase();
        const keywordRegex = new RegExp(`\\b${mainSymptomKeyword}(\\s|,|\\.|$)`, 'i');
        return keywordRegex.test(sDescriptionLower);
      });

      if (relevantSymptoms.length >= 3) {
        const uniqueDays = new Set<string>();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0,0,0,0);

        relevantSymptoms.forEach(s => {
          const symptomDate = new Date(s.timestamp);
          if (symptomDate >= sevenDaysAgo) {
            uniqueDays.add(symptomDate.toDateString());
          }
        });

        if (uniqueDays.size >= 3) {
          setSymptomPatternAlert(`You've reported symptoms related to "${mainSymptomKeyword}" on ${uniqueDays.size} different days in the last week. If this persists or worsens, please consider consulting your healthcare provider.`);
        }
      }
    }
  }, [symptoms]); 
  
  const requestTelehealthAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'status' | 'requestedAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      status: 'Requested',
      requestedAt: new Date(),
    };
    setAppointments(prev => [newAppointment, ...prev].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
    setAppFeedback({type: 'success', message: `Telehealth appointment for ${appointmentData.name} on ${appointmentData.preferredDate} successfully requested!`});
    setTimeout(() => setAppFeedback(null), 5000);
  }, []);

  const navItems = [
    { to: "/", icon: HomeIcon, label: "Dashboard" },
    { to: "/vitals", icon: PlusCircleIcon, label: "Log Vitals" },
    { to: "/vitals-history", icon: ListBulletIcon, label: "History"}, 
    { to: "/medications", icon: HeartIcon, label: "Meds" }, 
    { to: "/symptoms", icon: DocumentTextIcon, label: "Symptoms" },
    { to: "/telehealth", icon: VideoCameraIcon, label: "Telehealth" },
    { to: "/appointment-history", icon: CalendarDaysIcon, label: "Appointments"},
    { to: "/chatbot", icon: ChatBubbleLeftEllipsisIcon, label: "AI Chat" },
    { to: "/education", icon: BookOpenIcon, label: "Learn" },
  ];
  
  const mobileMenuItems = [
    ...navItems,
    { to: "/profile", icon: UserIcon, label: "Profile" },
    { to: "/settings", icon: Cog6ToothIcon, label: "Settings" },
    { to: "/about", icon: InformationCircleIcon, label: "About App" },
    { to: "/privacy", icon: ShieldCheckIcon, label: "Privacy Policy" },
    { to: "/help", icon: QuestionMarkCircleIcon, label: "Help & Support" },
  ].filter((item, index, self) => 
    index === self.findIndex((t) => ( t.to === item.to))
  ); // Deduplicate items based on 'to' path

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  }
  
  useEffect(() => {
    setSymptomPatternAlert(null);
    setAppFeedback(null); 
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral_bg dark:bg-dark_neutral_bg text-text_default dark:text-dark_text_default font-sans transition-colors duration-300">
      <header className="bg-primary shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <img src={COMPANY_LOGO_URL} alt="Company Logo" className="h-10 w-10 rounded-full border-2 border-white dark:border-dark_neutral_border" />
            <div>
              <h1 className="text-xl font-bold text-text_on_primary">{APP_NAME}</h1>
              <p className="text-xs text-text_on_primary opacity-80">{COMPANY_NAME}</p>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <ThemeSwitcher buttonSize="sm" />
            </div>
             <div className="hidden md:block ml-2">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                supportedLanguages={SUPPORTED_LANGUAGES}
                theme="darkHeader" 
              />
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text_on_primary md:hidden p-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-white">
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Cog6ToothIcon className="h-7 w-7" /> }
            </button>
          </div>
        </div>
      </header>

      <div 
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out md:hidden 
                    ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} 
                    bg-neutral_card_bg dark:bg-dark_neutral_card_bg bg-opacity-95 dark:bg-opacity-95 backdrop-blur-sm text-text_default dark:text-dark_text_default shadow-lg overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-4 border-b border-neutral_border dark:border-dark_neutral_border sticky top-0 bg-neutral_card_bg dark:bg-dark_neutral_card_bg bg-opacity-90 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-primary">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-text_default dark:text-dark_text_default p-2 rounded-md hover:bg-neutral_bg dark:hover:bg-dark_neutral_bg">
              <XMarkIcon className="h-7 w-7" />
            </button>
        </div>
        <nav className="p-4">
            <div className="mb-6">
                <p className="text-sm font-medium text-text_muted dark:text-dark_text_muted mb-2">Theme</p>
                <ThemeSwitcher />
            </div>
            <div className="mb-6">
                <p className="text-sm font-medium text-text_muted dark:text-dark_text_muted mb-2">Language</p>
                <LanguageSelector 
                    currentLanguage={currentLanguage} 
                    onLanguageChange={(lang) => { setCurrentLanguage(lang); setIsMenuOpen(false);}} 
                    supportedLanguages={SUPPORTED_LANGUAGES} 
                    theme={resolvedTheme === 'dark' ? 'darkHeader' : 'lightContainer'}
                />
            </div>

            <ul className="space-y-1">
            {mobileMenuItems.map(item => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center p-3 rounded-lg text-base font-medium transition-colors duration-200
                              ${location.pathname === item.to 
                                ? 'bg-primary text-text_on_primary dark:bg-primary-dark dark:text-text_on_primary' 
                                : 'text-text_default dark:text-dark_text_default hover:bg-neutral_bg dark:hover:bg-dark_neutral_bg'
                              }`}
                >
                  <item.icon className={`h-6 w-6 mr-3 ${location.pathname === item.to ? 'text-text_on_primary dark:text-text_on_primary' : 'text-primary dark:text-primary-light'}`} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t border-neutral_border dark:border-dark_neutral_border text-center">
            <p className="text-xs text-text_muted dark:text-dark_text_muted">&copy; {new Date().getFullYear()} {COMPANY_NAME}</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-2 py-4 md:px-4 md:py-6">
        {symptomPatternAlert && 
            <div className="mb-4">
                <Alert type="warning" title="Symptom Pattern Detected" message={symptomPatternAlert} onClose={() => setSymptomPatternAlert(null)} />
            </div>
        }
        {appFeedback && 
            <div className="mb-4">
                <Alert type={appFeedback.type} message={appFeedback.message} onClose={() => setAppFeedback(null)} />
            </div>
        }
        <Routes>
          <Route path="/" element={<Dashboard vitalSigns={vitalSigns} medications={medications} symptoms={symptoms} appointments={appointments} />} />
          <Route path="/vitals" element={<VitalsInput onAddVital={addVitalSign} />} />
          <Route path="/vitals-history" element={<VitalHistoryPage vitalSigns={vitalSigns} onEditVital={editVitalSign} onDeleteVital={deleteVitalSign} />} />
          <Route path="/medications" element={<MedicationManager medications={medications} onAddMedication={addMedication} onEditMedication={editMedication} onDeleteMedication={deleteMedication} onToggleTaken={toggleMedicationTaken} />} />
          <Route path="/symptoms" element={<SymptomLogger onAddSymptom={addSymptomLog} currentLanguage={currentLanguage} />} />
          <Route path="/education" element={<EducationalContent />} />
          <Route path="/telehealth" element={<Telehealth onRequestAppointment={requestTelehealthAppointment} />} />
          <Route path="/appointment-history" element={<AppointmentHistoryPage appointments={appointments} />} />
          <Route path="/chatbot" element={<Chatbot currentLanguage={currentLanguage}/>} />

          {/* Settings Related Routes */}
          <Route path="/settings" element={<SettingsPage currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/help" element={<HelpPage />} />

          <Route path="*" element={
              <div className="text-center py-10">
                <h2 className="text-2xl font-semibold">Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
                <Link to="/" className="text-primary hover:underline mt-4 inline-block">Go to Dashboard</Link>
              </div>
            } />
        </Routes>
      </main>

      <nav className="bg-neutral_card_bg dark:bg-dark_neutral_card_bg shadow-t sticky bottom-0 z-30 border-t border-neutral_border dark:border-dark_neutral_border md:hidden">
        <div className="container mx-auto px-2 py-1.5 grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map(item => ( // Show only first 5 for bottom nav, rest in menu
            <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} currentPath={location.pathname} />
          ))}
        </div>
      </nav>
    </div>
  );
};

// This is the component that will be exported
const App: React.FC = () => { // Reverted to default export
  return (
    <ThemeProvider> {/* ThemeProvider wraps the main layout */}
      <MainAppLayout />
    </ThemeProvider>
  );
};

export default App; // Reverted to default export
