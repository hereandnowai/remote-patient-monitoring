
import React from 'react';
import type { Appointment, AppointmentStatus } from '../types';
import { CalendarDaysIcon, ClockIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface AppointmentHistoryPageProps {
  appointments: Appointment[];
}

const getStatusStyles = (status: AppointmentStatus): { icon: React.ElementType, bgColor: string, textColor: string, borderColor: string, iconColor: string } => {
  switch (status) {
    case 'Confirmed':
      return { icon: CheckCircleIcon, bgColor: 'bg-green-50 dark:bg-dark_bg_green_50', textColor: 'text-green-700 dark:text-dark_text_green_700', borderColor: 'border-green-500 dark:border-dark_border_green_500', iconColor: 'text-green-500 dark:text-dark_border_green_500' };
    case 'Completed':
      return { icon: CheckCircleIcon, bgColor: 'bg-gray-100 dark:bg-slate-700', textColor: 'text-gray-600 dark:text-slate-300', borderColor: 'border-gray-400 dark:border-slate-500', iconColor: 'text-gray-500 dark:text-slate-400' };
    case 'Cancelled':
      return { icon: XCircleIcon, bgColor: 'bg-red-50 dark:bg-dark_bg_red_50', textColor: 'text-red-700 dark:text-dark_text_red_700', borderColor: 'border-red-500 dark:border-dark_border_red_500', iconColor: 'text-red-500 dark:text-dark_border_red_500' };
    case 'Rescheduled':
        return { icon: ArrowPathIcon, bgColor: 'bg-yellow-50 dark:bg-dark_bg_yellow_50', textColor: 'text-yellow-700 dark:text-dark_text_yellow_700', borderColor: 'border-yellow-500 dark:border-dark_border_yellow_500', iconColor: 'text-yellow-500 dark:text-dark_border_yellow_500' };
    case 'Requested':
    default:
      return { icon: InformationCircleIcon, bgColor: 'bg-blue-50 dark:bg-dark_bg_blue_50', textColor: 'text-blue-700 dark:text-dark_text_blue_700', borderColor: 'border-blue-500 dark:border-dark_border_blue_500', iconColor: 'text-blue-500 dark:text-dark_border_blue_500' };
  }
};

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const { icon: StatusIcon, bgColor, textColor, borderColor, iconColor } = getStatusStyles(appointment.status);
  
  const preferredDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden border-l-4 ${borderColor} ${bgColor} animate-fadeIn`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`text-xl font-semibold ${textColor}`}>{appointment.reason}</h3>
            <p className="text-sm text-text_muted dark:text-dark_text_muted">For: <span className="font-medium text-text_default dark:text-dark_text_default">{appointment.name}</span></p>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} border ${borderColor}`}>
            <StatusIcon className={`h-4 w-4 mr-1.5 ${iconColor}`} />
            {appointment.status}
          </div>
        </div>

        <div className="space-y-2 text-sm text-text_muted dark:text-dark_text_muted mb-3">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
            Preferred: {preferredDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
            Around: {preferredDateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-dark_neutral_border">
          Requested On: {new Date(appointment.requestedAt).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
       {/* Future actions placeholder */}
       {/* { (appointment.status === 'Requested' || appointment.status === 'Confirmed') && (
        <div className={`px-5 py-3 border-t ${borderColor} ${bgColor === 'bg-gray-100 dark:bg-slate-700' ? 'bg-gray-200 dark:bg-slate-600' : bgColor } `}>
          <button className={`text-xs font-medium ${textColor} hover:opacity-80`}>
            {appointment.status === 'Requested' ? 'Cancel Request' : 'Reschedule/Cancel'}
          </button>
        </div>
      )} */}
    </div>
  );
};

const AppointmentHistoryPage: React.FC<AppointmentHistoryPageProps> = ({ appointments }) => {
  return (
    <div className="p-4 md:p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-3xl mx-auto">
      <div className="flex items-center mb-8">
        <CalendarDaysIcon className="h-10 w-10 text-primary mr-3" />
        <h2 className="text-3xl font-bold text-primary">Appointment History</h2>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDaysIcon className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-text_muted dark:text-dark_text_muted">No appointments have been requested yet.</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">
            You can request a new telehealth appointment from the "Telehealth" tab.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map(app => (
            <AppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistoryPage;
