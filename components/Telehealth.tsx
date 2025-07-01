
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Moved this import to the top
import { VideoCameraIcon, CalendarDaysIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Alert from './Alert'; 
import type { Appointment } from '../types'; // Import Appointment type

interface TelehealthProps {
  onRequestAppointment: (data: Omit<Appointment, 'id' | 'status' | 'requestedAt'>) => void;
}

const Telehealth: React.FC<TelehealthProps> = ({ onRequestAppointment }) => {
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [isRequestedLocally, setIsRequestedLocally] = useState(false); // Local state for UI confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if(!name.trim() || !reason.trim() || !preferredDate || !preferredTime) {
        setError("Please fill out all fields to request an appointment.");
        return;
    }
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const appointmentData = {
        name: name.trim(),
        reason: reason.trim(),
        preferredDate,
        preferredTime,
      };
      onRequestAppointment(appointmentData); // Call prop to lift state
      setIsRequestedLocally(true); // Set local state for UI update
      setIsLoading(false);
    }, 1500);
  };

  const resetForm = () => {
    setName('');
    setReason('');
    setPreferredDate('');
    setPreferredTime('');
    setIsRequestedLocally(false);
    setError(null);
    setIsLoading(false);
  }

  if (isRequestedLocally) {
    return (
      <div className="p-6 md:p-8 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-lg mx-auto text-center animate-fadeIn">
        <CheckCircleIcon className="h-20 w-20 text-status_green dark:text-green-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-primary mb-3">Appointment Requested!</h2>
        <p className="text-text_default dark:text-dark_text_default mb-2">Thank you, <span className="font-semibold">{name}</span>. Your request for a telehealth appointment regarding "{reason}" has been submitted.</p>
        <p className="text-text_muted dark:text-dark_text_muted mb-6">We will contact you shortly to confirm your appointment for around {new Date(preferredDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {preferredTime}.</p>
        <button
          onClick={resetForm}
          className="bg-primary hover:bg-primary-dark text-text_on_primary font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
        >
          Request Another Appointment
        </button>
         <Link to="/appointment-history" className="mt-4 block text-accent hover:text-accent-dark dark:hover:text-amber-300 font-semibold">
          View Appointment History &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-lg mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <VideoCameraIcon className="h-16 w-16 text-primary mx-auto mb-3" />
        <h2 className="text-3xl font-bold text-primary">Request Telehealth Appointment</h2>
        <p className="text-text_muted dark:text-dark_text_muted mt-1">Connect with your healthcare provider virtually.</p>
      </div>
      
      {error && <div className="my-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div> }

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Reason for Appointment</label>
          <textarea
            id="reason"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"
            placeholder="Briefly describe the reason for your visit (e.g., follow-up, new symptom)"
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Preferred Date</label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]} 
              className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default"
              style={{ colorScheme: 'light dark' }} 
            />
          </div>
          <div>
            <label htmlFor="preferredTime" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Preferred Time</label>
            <input
              type="time"
              id="preferredTime"
              name="preferredTime"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              required
              className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default"
              style={{ colorScheme: 'light dark' }} 
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent-dark text-text_on_accent font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <ArrowPathIcon className="animate-spin h-6 w-6 mr-2" />
          ) : (
            <CalendarDaysIcon className="h-6 w-6 mr-2" />
          )}
          {isLoading ? 'Submitting Request...' : 'Request Appointment'}
        </button>
      </form>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
        This is a request form. Actual appointment availability will be confirmed by our team. 
        For emergencies, please call 911 or visit the nearest emergency room.
      </p>
    </div>
  );
};

export default Telehealth;
