
import React, { useState, useEffect } from 'react';
import type { Medication } from '../types';
import { PlusCircleIcon, CheckCircleIcon, XCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import Alert from './Alert';
import ConfirmationModal from './ConfirmationModal';

interface MedicationManagerProps {
  medications: Medication[];
  onAddMedication: (medication: Medication) => void;
  onEditMedication: (medication: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onToggleTaken: (id: string) => void;
}

interface MedicationItemProps {
  medication: Medication;
  onToggleTaken: (id: string) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
}

const MedicationItem: React.FC<MedicationItemProps> = ({ medication, onToggleTaken, onEdit, onDelete }) => {
  return (
    <li className={`p-4 rounded-lg shadow-md flex items-start justify-between transition-all duration-300 animate-fadeIn 
                    ${medication.takenToday 
                      ? 'bg-green-50 dark:bg-dark_bg_green_50 border-l-4 border-status_green dark:border-dark_border_green_500' 
                      : 'bg-amber-50 dark:bg-dark_bg_yellow_50 border-l-4 border-amber-400 dark:border-dark_border_yellow_500'
                    }`}>
      <div className="flex-grow">
        <h4 className={`font-semibold text-lg 
                        ${medication.takenToday 
                          ? 'text-status_green dark:text-dark_text_green_700' 
                          : 'text-amber-700 dark:text-dark_text_yellow_700'
                        }`}>{medication.name}</h4>
        <p className="text-sm text-gray-600 dark:text-dark_text_muted">{medication.dosage} - {medication.frequency}</p>
        <p className="text-sm text-gray-500 dark:text-dark_text_muted">{medication.notes && `Notes: ${medication.notes}`}</p>
        <p className="text-sm text-gray-500 dark:text-dark_text_muted">Scheduled for: {medication.time}</p>
        {medication.takenToday && medication.takenTimestamp && (
            <p className="text-xs text-gray-500 dark:text-dark_text_muted mt-1">Taken at: {new Date(medication.takenTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        )}
      </div>
      <div className="flex flex-col items-end space-y-2 ml-2 flex-shrink-0">
        <button
          onClick={() => onToggleTaken(medication.id)}
          className={`p-2 rounded-full transition-colors duration-200 text-white
                      ${medication.takenToday 
                        ? 'bg-status_green hover:bg-green-600 dark:bg-status_green dark:hover:bg-green-500' 
                        : 'bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600'
                      }`}
          aria-label={medication.takenToday ? `Mark ${medication.name} as not taken` : `Mark ${medication.name} as taken`}
        >
          {medication.takenToday ? <XCircleIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
        </button>
        <div className="flex space-x-1">
            <button 
                onClick={() => onEdit(medication)} 
                className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary p-1.5 rounded-md hover:bg-primary-light dark:hover:bg-primary-dark/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Edit ${medication.name}`}
            >
                <PencilIcon className="h-5 w-5"/>
            </button>
            <button 
                onClick={() => onDelete(medication.id)} 
                className="text-status_red hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-status_red"
                aria-label={`Delete ${medication.name}`}
            >
                <TrashIcon className="h-5 w-5"/>
            </button>
        </div>
      </div>
    </li>
  );
};


const MedicationManager: React.FC<MedicationManagerProps> = ({ medications, onAddMedication, onEditMedication, onDeleteMedication, onToggleTaken }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [medicationIdToDelete, setMedicationIdToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (editingMedication) {
      setName(editingMedication.name);
      setDosage(editingMedication.dosage);
      setFrequency(editingMedication.frequency);
      setTime(editingMedication.time);
      setNotes(editingMedication.notes || '');
      setShowForm(true);
    } else {
      resetFormFields();
    }
  }, [editingMedication]);

  const resetFormFields = () => {
    setName('');
    setDosage('');
    setFrequency('');
    setTime('08:00');
    setNotes('');
  };

  const handleOpenFormForAdd = () => {
    setEditingMedication(null); 
    resetFormFields(); 
    setShowForm(true);
    setFeedback(null);
  };
  
  const handleOpenFormForEdit = (med: Medication) => {
    setEditingMedication(med);
    setShowForm(true);
    setFeedback(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMedication(null); 
    resetFormFields(); 
    setFeedback(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !time) {
        setFeedback({type: 'error', message: "Please fill in all required fields: Name, Dosage, Frequency, and Time."});
        return;
    }

    const medicationData = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      time,
      notes: notes.trim() || undefined,
    };

    if (editingMedication) {
      onEditMedication({ ...editingMedication, ...medicationData });
      setFeedback({type: 'success', message: "✏️ Medication Updated Successfully"});
    } else {
      onAddMedication({ ...medicationData, id: Date.now().toString(), takenToday: false });
      setFeedback({type: 'success', message: "✅ Medication Added Successfully"});
    }
    
    handleCloseForm();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDeleteClick = (id: string) => {
    setMedicationIdToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (medicationIdToDelete) {
      onDeleteMedication(medicationIdToDelete);
      setFeedback({type: 'success', message: "🗑️ Medication Deleted Successfully"});
      setIsDeleteConfirmOpen(false);
      setMedicationIdToDelete(null);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const sortedMedications = [...medications].sort((a,b) => {
    if (a.takenToday === b.takenToday) {
      return a.time.localeCompare(b.time); 
    }
    return a.takenToday ? 1 : -1; 
  });

  return (
    <div className="p-4 md:p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-2xl mx-auto animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-primary">Medication Schedule</h2>
        <button
          onClick={showForm ? handleCloseForm : handleOpenFormForAdd}
          className={`${showForm 
            ? 'bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700' 
            : 'bg-primary hover:bg-primary-dark'} 
            text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 ease-in-out flex items-center`}
          aria-expanded={showForm}
        >
          <PlusCircleIcon className={`h-5 w-5 mr-1 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} /> 
          {showForm ? (editingMedication ? 'Cancel Edit' : 'Cancel Add') : 'Add New'}
        </button>
      </div>

      {feedback && (
         <div className="my-4">
          <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 bg-neutral_bg dark:bg-dark_neutral_bg rounded-lg shadow animate-fadeIn">
          <h3 className="text-lg font-medium text-text_default dark:text-dark_text_default">{editingMedication ? 'Edit Medication' : 'Add New Medication'}</h3>
          <div>
            <label htmlFor="medName" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Name*</label>
            <input type="text" id="medName" name="medName" value={name} onChange={e => setName(e.target.value)} required 
                   className="mt-1 w-full p-2 border border-neutral_border dark:border-dark_neutral_border rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default" />
          </div>
          <div>
            <label htmlFor="dosage" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Dosage* (e.g., 1 tablet, 10mg)</label>
            <input type="text" id="dosage" name="dosage" value={dosage} onChange={e => setDosage(e.target.value)} required 
                   className="mt-1 w-full p-2 border border-neutral_border dark:border-dark_neutral_border rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default" />
          </div>
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Frequency* (e.g., Once a day)</label>
            <input type="text" id="frequency" name="frequency" value={frequency} onChange={e => setFrequency(e.target.value)} required 
                   className="mt-1 w-full p-2 border border-neutral_border dark:border-dark_neutral_border rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default" />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Time*</label>
            <input type="time" id="time" name="time" value={time} onChange={e => setTime(e.target.value)} required 
                   className="mt-1 w-full p-2 border border-neutral_border dark:border-dark_neutral_border rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default" />
          </div>
           <div>
            <label htmlFor="medNotes" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Notes (Optional)</label>
            <textarea id="medNotes" name="medNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} 
                      className="mt-1 w-full p-2 border border-neutral_border dark:border-dark_neutral_border rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default" placeholder="e.g., Take with food"></textarea>
          </div>
          <button type="submit" className="w-full bg-accent hover:bg-accent-dark text-text_on_accent font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
            {editingMedication ? 'Update Medication' : 'Add Medication'}
          </button>
        </form>
      )}

      {medications.length > 0 ? (
        <ul className="space-y-4">
          {sortedMedications.map(med => (
            <MedicationItem 
                key={med.id} 
                medication={med} 
                onToggleTaken={onToggleTaken}
                onEdit={handleOpenFormForEdit}
                onDelete={handleDeleteClick}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center text-text_muted dark:text-dark_text_muted py-8">No medications added yet. Click "Add New" to get started.</p>
      )}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Medication"
        message="Are you sure you want to delete this medication? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default MedicationManager;