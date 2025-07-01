
import React, { useState } from 'react';
import type { VitalSign, BloodPressureReading } from '../types';
import { VitalType } from '../types';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import Alert from './Alert'; 

interface VitalsInputProps {
  onAddVital: (vital: VitalSign) => void;
}

const VitalsInput: React.FC<VitalsInputProps> = ({ onAddVital }) => {
  const [vitalType, setVitalType] = useState<VitalType>(VitalType.BloodPressure);
  const [value, setValue] = useState<string>('');
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [unit, setUnit] = useState<string>('mmHg');
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as VitalType;
    setVitalType(newType);
    setValue('');
    setSystolic('');
    setDiastolic('');
    setNotes('');
    setFeedback(null);
    switch (newType) {
      case VitalType.BloodPressure: setUnit('mmHg'); break;
      case VitalType.Glucose: setUnit('mg/dL'); break;
      case VitalType.HeartRate: setUnit('bpm'); break;
      case VitalType.Temperature: setUnit('°C'); break; 
      case VitalType.OxygenSaturation: setUnit('%'); break;
      case VitalType.Weight: setUnit('kg'); break; 
      default: setUnit('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    let vitalValue: number | BloodPressureReading;

    if (vitalType === VitalType.BloodPressure) {
      const sysNum = parseInt(systolic);
      const diaNum = parseInt(diastolic);
      if (!systolic || !diastolic || isNaN(sysNum) || isNaN(diaNum) || sysNum <= 0 || diaNum <= 0 || sysNum <= diaNum || sysNum < 70 || sysNum > 250 || diaNum < 40 || diaNum > 150) {
        setFeedback({type: 'error', message: 'Invalid Blood Pressure. Systolic (70-250) must be greater than Diastolic (40-150).'});
        return;
      }
      vitalValue = { systolic: sysNum, diastolic: diaNum };
    } else {
      const numValue = parseFloat(value);
      if (!value || isNaN(numValue) || numValue < 0) { 
        setFeedback({type: 'error', message: 'Please enter a valid, non-negative numeric value.'});
        return;
      }
      if (vitalType === VitalType.HeartRate && (numValue < 30 || numValue > 220)) {
        setFeedback({type: 'error', message: 'Heart Rate must be between 30 and 220 bpm.'}); return;
      }
      if (vitalType === VitalType.Temperature && (numValue < 30 || numValue > 45)) { 
        setFeedback({type: 'error', message: `Temperature must be between 30 and 45 °C.`}); return;
      }
      if (vitalType === VitalType.OxygenSaturation && (numValue < 70 || numValue > 100)) {
        setFeedback({type: 'error', message: 'Oxygen Saturation must be between 70 and 100%.'}); return;
      }
      if (vitalType === VitalType.Glucose && (numValue < 20 || numValue > 600)) {
        setFeedback({type: 'error', message: `Glucose must be between 20 and 600 ${unit}.`}); return;
      }
      if (vitalType === VitalType.Weight && (numValue < 1 || numValue > 500)) { 
        setFeedback({type: 'error', message: `Weight must be between 1 and 500 kg.`}); return;
      }
      vitalValue = numValue;
    }
    
    const newVital: VitalSign = {
      id: Date.now().toString(),
      type: vitalType,
      value: vitalValue,
      unit,
      timestamp: new Date(),
      notes: notes.trim() || undefined,
    };
    onAddVital(newVital);
    setFeedback({type: 'success', message: `✅ Vital Record Added Successfully`}); 
    
    setValue('');
    setSystolic('');
    setDiastolic('');
    setNotes('');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-lg mx-auto animate-fadeIn">
      <h2 className="text-2xl font-semibold text-primary mb-6 text-center flex items-center justify-center">
        <PlusCircleIcon className="h-8 w-8 mr-2 text-primary-dark" />
        Log New Vital Sign
      </h2>
      {feedback && (
        <div className="my-4">
          <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="vitalType" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Vital Sign Type</label>
          <select
            id="vitalType"
            name="vitalType"
            value={vitalType}
            onChange={handleTypeChange}
            className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary transition duration-150 bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default dark:focus:border-primary-dark"
          >
            {Object.values(VitalType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {vitalType === VitalType.BloodPressure ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="systolic" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Systolic ({unit})</label>
              <input
                type="number"
                id="systolic"
                name="systolic"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="e.g., 120"
                className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary transition duration-150 bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default dark:focus:border-primary-dark"
              />
            </div>
            <div>
              <label htmlFor="diastolic" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Diastolic ({unit})</label>
              <input
                type="number"
                id="diastolic"
                name="diastolic"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="e.g., 80"
                className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary transition duration-150 bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default dark:focus:border-primary-dark"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Value ({unit})</label>
            <input
              type="number"
              step="any" 
              id="value"
              name="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                vitalType === VitalType.Glucose ? "e.g., 90" :
                vitalType === VitalType.HeartRate ? "e.g., 70" :
                vitalType === VitalType.Temperature ? "e.g., 36.5" :
                vitalType === VitalType.OxygenSaturation ? "e.g., 98" :
                vitalType === VitalType.Weight ? "e.g., 70.5" : ""
              }
              className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary transition duration-150 bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default dark:focus:border-primary-dark"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted mb-1">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g., Feeling a bit tired, after meal, etc."
            className="w-full p-3 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary transition duration-150 bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default dark:focus:border-primary-dark"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-text_on_primary font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Add Vital Reading
        </button>
      </form>
    </div>
  );
};

export default VitalsInput;