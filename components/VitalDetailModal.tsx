
import React, { useState, useEffect, useCallback } from 'react';
import type { VitalSign, BloodPressureReading } from '../types';
import { VitalType } from '../types';
import Alert from './Alert';
import { PencilSquareIcon, TrashIcon, XMarkIcon as CloseIcon } from '@heroicons/react/24/solid'; // Using solid XMarkIcon for close

interface VitalDetailModalProps {
  vital: VitalSign | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedVital: VitalSign) => void;
  onDelete: (id: string) => void;
}

const VitalDetailModal: React.FC<VitalDetailModalProps> = ({ vital, isOpen, onClose, onSave, onDelete }) => {
  const [editedVital, setEditedVital] = useState<VitalSign | null>(null);
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [singleValue, setSingleValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (vital) {
      setEditedVital(JSON.parse(JSON.stringify(vital))); 
      setNotes(vital.notes || '');
      if (vital.type === VitalType.BloodPressure) {
        const bp = vital.value as BloodPressureReading;
        setSystolic(String(bp.systolic));
        setDiastolic(String(bp.diastolic));
        setSingleValue('');
      } else {
        setSingleValue(String(vital.value));
        setSystolic('');
        setDiastolic('');
      }
      setValidationError(null);
    } else {
      setEditedVital(null); 
    }
  }, [vital]);

  const handleSave = () => {
    if (!editedVital) return;
    setValidationError(null);

    let updatedValue: number | BloodPressureReading;

    if (editedVital.type === VitalType.BloodPressure) {
      const sysNum = parseInt(systolic);
      const diaNum = parseInt(diastolic);
      if (isNaN(sysNum) || isNaN(diaNum) || sysNum <= 0 || diaNum <= 0 || sysNum <= diaNum || sysNum < 70 || sysNum > 250 || diaNum < 40 || diaNum > 150) {
        setValidationError('Invalid Blood Pressure. Systolic (70-250) must be greater than Diastolic (40-150).');
        return;
      }
      updatedValue = { systolic: sysNum, diastolic: diaNum };
    } else {
      const numValue = parseFloat(singleValue);
      if (isNaN(numValue) || numValue < 0) {
        setValidationError('Please enter a valid, non-negative numeric value.');
        return;
      }
      if (editedVital.type === VitalType.HeartRate && (numValue < 30 || numValue > 220)) {
        setValidationError('Heart Rate must be between 30 and 220 bpm.'); return;
      }
      if (editedVital.type === VitalType.Temperature && (numValue < 30 || numValue > 45)) {
        setValidationError(`Temperature must be between 30 and 45 ${editedVital.unit}.`); return;
      }
      if (editedVital.type === VitalType.OxygenSaturation && (numValue < 70 || numValue > 100)) {
        setValidationError('Oxygen Saturation must be between 70 and 100%.'); return;
      }
       if (editedVital.type === VitalType.Glucose && (numValue < 20 || numValue > 600)) {
        setValidationError(`Glucose must be between 20 and 600 ${editedVital.unit}.`); return;
      }
      if (editedVital.type === VitalType.Weight && (numValue < 1 || numValue > 500)) {
        setValidationError(`Weight must be between 1 and 500 ${editedVital.unit}.`); return;
      }
      updatedValue = numValue;
    }

    onSave({
      ...editedVital,
      value: updatedValue,
      notes: notes.trim() || undefined,
      timestamp: new Date(editedVital.timestamp), 
    });
  };
  
  const handleDeleteClick = () => {
    if (vital) {
        onDelete(vital.id);
    }
  }

  if (!isOpen || !editedVital) return null;

  const displayTimestamp = new Date(editedVital.timestamp).toLocaleString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div 
        className="fixed inset-0 bg-gray-600 dark:bg-black bg-opacity-75 dark:bg-opacity-60 flex items-center justify-center p-4 z-40 animate-fadeIn"
        aria-labelledby="vital-detail-modal-title"
        role="dialog"
        aria-modal="true"
    >
      <div className="bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-primary" id="vital-detail-modal-title">
                Edit Vital: {editedVital.type}
            </h2>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-md"
                aria-label="Close modal"
            >
            <CloseIcon className="h-7 w-7" />
          </button>
        </div>

        {validationError && <div className="my-3"><Alert type="error" message={validationError} onClose={() => setValidationError(null)} /></div>}

        <div className="space-y-4">
          <p className="text-sm text-text_muted dark:text-dark_text_muted">
            Logged on: <span className="font-medium text-text_default dark:text-dark_text_default">{displayTimestamp}</span>
          </p>
          
          {editedVital.type === VitalType.BloodPressure ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="systolic" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Systolic ({editedVital.unit})</label>
                <input
                  type="number" id="systolic" value={systolic} onChange={(e) => setSystolic(e.target.value)}
                  className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default"
                />
              </div>
              <div>
                <label htmlFor="diastolic" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Diastolic ({editedVital.unit})</label>
                <input
                  type="number" id="diastolic" value={diastolic} onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Value ({editedVital.unit})</label>
              <input
                type="number" step="any" id="value" value={singleValue} onChange={(e) => setSingleValue(e.target.value)}
                className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default"
              />
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Notes</label>
            <textarea
              id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"
              placeholder="e.g., Feeling a bit tired"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral_border dark:border-dark_neutral_border flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleDeleteClick}
            className="w-full sm:w-auto bg-status_red hover:bg-red-700 dark:hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center"
            aria-label="Delete this vital record"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete Record
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-text_muted dark:text-dark_text_muted font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-text_on_primary font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center"
            aria-label="Save changes to vital record"
          >
             <PencilSquareIcon className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default VitalDetailModal;