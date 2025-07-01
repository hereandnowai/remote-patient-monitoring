
import React from 'react';
import { HeartIcon, ChartBarIcon, ScaleIcon, SparklesIcon, FireIcon, BeakerIcon, ArrowTrendingUpIcon, CalendarDaysIcon } from '@heroicons/react/24/solid'; // Added CalendarDaysIcon
import type { VitalSign, Medication, SymptomLog, BloodPressureReading, Appointment } from '../types'; // Added Appointment
import { VitalType } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  vitalSigns: VitalSign[];
  medications: Medication[];
  symptoms: SymptomLog[];
  appointments: Appointment[]; // Added appointments
}

const getStatusColor = (type: VitalType, value: number | BloodPressureReading): string => {
  if (type === VitalType.BloodPressure && typeof value === 'object' && value !== null && 'systolic' in value && 'diastolic' in value) {
    const { systolic, diastolic } = value as BloodPressureReading;
    if (systolic < 90 || diastolic < 60) return 'bg-status_blue'; 
    if (systolic < 120 && diastolic < 80) return 'bg-status_green';
    if (systolic < 130 && diastolic < 80) return 'bg-status_yellow';
    if (systolic < 140 || diastolic < 90) return 'bg-status_red opacity-75'; 
    return 'bg-status_red'; 
  }
  if (type === VitalType.Glucose && typeof value === 'number') {
    if (value < 70) return 'bg-status_red'; 
    if (value <= 100) return 'bg-status_green';
    if (value <= 125) return 'bg-status_yellow'; 
    return 'bg-status_red'; 
  }
  if (type === VitalType.HeartRate && typeof value === 'number') {
    if (value < 60 || value > 100) return 'bg-status_yellow';
    return 'bg-status_green';
  }
   if (type === VitalType.Temperature && typeof value === 'number') {
    if (value < 36.1) return 'bg-status_yellow'; 
    if (value <= 37.2) return 'bg-status_green'; 
    if (value < 38) return 'bg-status_yellow'; 
    return 'bg-status_red'; 
  }
  if (type === VitalType.OxygenSaturation && typeof value === 'number') {
    if (value < 90) return 'bg-status_red';
    if (value < 95) return 'bg-status_yellow';
    return 'bg-status_green';
  }
  return 'bg-gray-400 dark:bg-gray-500'; 
};

const VitalCard: React.FC<{ vital: VitalSign }> = ({ vital }) => {
  const statusColor = getStatusColor(vital.type, vital.value);
  let displayValue: string;
  let IconElement: React.ElementType; 

  switch (vital.type) {
    case VitalType.BloodPressure:
      const bp = vital.value as BloodPressureReading;
      displayValue = `${bp.systolic}/${bp.diastolic} ${vital.unit}`;
      IconElement = HeartIcon; 
      break;
    case VitalType.Glucose:
      displayValue = `${vital.value} ${vital.unit}`;
      IconElement = BeakerIcon; 
      break;
    case VitalType.HeartRate:
      displayValue = `${vital.value} ${vital.unit}`;
      IconElement = HeartIcon;
      break;
    case VitalType.Temperature:
      displayValue = `${vital.value} ${vital.unit}`;
      IconElement = FireIcon;
      break;
    case VitalType.OxygenSaturation:
      displayValue = `${vital.value} ${vital.unit}`;
      IconElement = ArrowTrendingUpIcon; 
      break;
    case VitalType.Weight:
      displayValue = `${vital.value} ${vital.unit}`;
      IconElement = ScaleIcon;
      break;
    default:
      displayValue = `${vital.value} ${vital.unit}`;
      IconElement = ChartBarIcon;
  }
  
  return (
    <Link 
        to={`/vitals-history?type=${encodeURIComponent(vital.type)}&id=${vital.id}`} 
        className={`block p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200 ${statusColor} text-white animate-fadeIn focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark dark:focus:ring-offset-dark_neutral_bg`}
        aria-label={`View details for ${vital.type} reading of ${displayValue}`}
        role="button" 
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{vital.type}</h3>
        <IconElement className="h-8 w-8 opacity-80" />
      </div>
      <p className="text-3xl font-bold">{displayValue}</p>
      <p className="text-xs opacity-90 mt-1">{new Date(vital.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(vital.timestamp).toLocaleDateString()}</p>
      {vital.notes && <p className="text-xs mt-2 italic opacity-80">Note: {vital.notes}</p>}
    </Link>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ vitalSigns, medications, symptoms, appointments }) => {
  const latestVitals: { [key in VitalType]?: VitalSign } = {};
  vitalSigns.forEach(vital => {
    if (!latestVitals[vital.type] || new Date(vital.timestamp) > new Date(latestVitals[vital.type]!.timestamp)) {
      latestVitals[vital.type] = vital;
    }
  });
  const latestVitalsArray = Object.values(latestVitals);

  const upcomingMedications = medications
    .filter(med => !med.takenToday)
    .sort((a,b) => a.time.localeCompare(b.time))
    .slice(0, 3);

  const recentSymptoms = symptoms 
    .slice(0,3);

  const upcomingAppointments = appointments
    .filter(app => app.status === 'Requested' || app.status === 'Confirmed')
    .sort((a,b) => new Date(a.preferredDate + 'T' + a.preferredTime).getTime() - new Date(b.preferredDate + 'T' + b.preferredTime).getTime())
    .slice(0,2);


  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-2xl text-text_on_primary animate-fadeIn">
        <h2 className="text-3xl font-bold">Welcome Back!</h2>
        <p className="mt-1 opacity-80">Here's your health summary for today.</p>
      </div>

      {latestVitalsArray.length > 0 ? (
        <div className="animate-fadeIn">
          <h3 className="text-2xl font-semibold text-text_default dark:text-dark_text_default mb-4">Latest Vitals <span className="text-sm font-normal text-text_muted dark:text-dark_text_muted">(Click a card for history)</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestVitalsArray.map(vital => vital && <VitalCard key={vital.id} vital={vital} />)}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-lg text-center animate-fadeIn">
          <ChartBarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default">No Vital Signs Logged Yet</h3>
          <p className="text-text_muted dark:text-dark_text_muted mt-1">Start by adding your vitals using the <Link to="/vitals" className="text-primary hover:underline dark:hover:text-primary-light font-semibold">Log Vitals</Link> tab.</p>
        </div>
      )}
      
      {medications.length > 0 && (
        <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-lg animate-fadeIn">
          <h3 className="text-2xl font-semibold text-text_default dark:text-dark_text_default mb-4">Upcoming Medications</h3>
          {upcomingMedications.length > 0 ? (
            <ul className="space-y-3">
              {upcomingMedications.map(med => (
                <li key={med.id} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-status_blue dark:border-blue-400">
                  <div>
                    <p className="font-semibold text-status_blue dark:text-blue-300">{med.name} <span className="text-sm text-gray-600 dark:text-gray-400">({med.dosage})</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled for {med.time}</p>
                  </div>
                   <Link to="/medications">
                    <SparklesIcon className="h-6 w-6 text-status_blue dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200" />
                   </Link>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-text_muted dark:text-dark_text_muted">All medications for today seem to be logged as taken. Well done!</p>
          )}
           <Link to="/medications" className="mt-4 inline-block text-primary hover:underline dark:hover:text-primary-light font-semibold">Manage All Medications &rarr;</Link>
        </div>
      )}

      {appointments.length > 0 && (
         <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-lg animate-fadeIn">
          <h3 className="text-2xl font-semibold text-text_default dark:text-dark_text_default mb-4">Upcoming Appointments</h3>
           {upcomingAppointments.length > 0 ? (
            <ul className="space-y-3">
              {upcomingAppointments.map(app => (
                <li key={app.id} className={`flex justify-between items-center p-3 rounded-lg border 
                  ${app.status === 'Confirmed' ? 'bg-green-50 dark:bg-dark_bg_green_50 border-status_green dark:border-dark_border_green_500' : 'bg-orange-50 dark:bg-yellow-900/50 border-status_yellow dark:border-dark_border_yellow_500'}`}>
                  <div>
                    <p className={`font-semibold ${app.status === 'Confirmed' ? 'text-status_green dark:text-dark_text_green_700' : 'text-status_yellow dark:text-dark_text_yellow_700'}`}>{app.reason} <span className="text-sm text-gray-600 dark:text-gray-400">({app.status})</span></p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Preferred: {new Date(app.preferredDate + 'T' + app.preferredTime).toLocaleString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                   <Link to="/appointment-history">
                    <CalendarDaysIcon className={`h-6 w-6 ${app.status === 'Confirmed' ? 'text-status_green dark:text-dark_text_green_700' : 'text-status_yellow dark:text-dark_text_yellow_700'} hover:opacity-75`} />
                   </Link>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-text_muted dark:text-dark_text_muted">No upcoming telehealth appointments.</p>
          )}
           <Link to="/appointment-history" className="mt-4 inline-block text-primary hover:underline dark:hover:text-primary-light font-semibold">View All Appointments &rarr;</Link>
        </div>
      )}

      {symptoms.length > 0 && (
         <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-lg animate-fadeIn">
          <h3 className="text-2xl font-semibold text-text_default dark:text-dark_text_default mb-4">Recent Symptoms</h3>
           <ul className="space-y-3">
              {recentSymptoms.map(log => (
                <li key={log.id} className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg border border-status_purple dark:border-purple-400">
                  <p className="font-semibold text-status_purple dark:text-purple-300">{log.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Severity: {log.severity}/10</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Logged at: {new Date(log.timestamp).toLocaleString()}</p>
                  {log.notes && <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">Note: {log.notes}</p>}
                </li>
              ))}
            </ul>
             <Link to="/symptoms" className="mt-4 inline-block text-primary hover:underline dark:hover:text-primary-light font-semibold">Log or View More Symptoms &rarr;</Link>
        </div>
      )}

      {latestVitalsArray.length === 0 && medications.length === 0 && symptoms.length === 0 && appointments.length === 0 && (
         <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-lg text-center animate-fadeIn">
            <SparklesIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text_default dark:text-dark_text_default">Your Dashboard is Empty</h3>
            <p className="text-text_muted dark:text-dark_text_muted mt-1">Start by logging your vitals, medications, or symptoms to see your health summary here.</p>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
