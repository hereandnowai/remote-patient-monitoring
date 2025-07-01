
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { VitalSign, BloodPressureReading } from '../types';
import { VitalType } from '../types';
import Alert from './Alert';
import VitalDetailModal from './VitalDetailModal';
import ConfirmationModal from './ConfirmationModal';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ArrowPathIcon, PencilSquareIcon, TrashIcon, ListBulletIcon } from '@heroicons/react/24/solid';

interface VitalHistoryPageProps {
  vitalSigns: VitalSign[];
  onEditVital: (vital: VitalSign) => void;
  onDeleteVital: (id: string) => void;
}

const formatDate = (date: Date) => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (date: Date) => new Date(date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

const VitalHistoryPage: React.FC<VitalHistoryPageProps> = ({ vitalSigns, onEditVital, onDeleteVital }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    type: 'all' as VitalType | 'all',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vitalToEdit, setVitalToEdit] = useState<VitalSign | null>(null);
  const [vitalIdToDelete, setVitalIdToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const typeFromQuery = queryParams.get('type') as VitalType | null;
    const idFromQuery = queryParams.get('id');

    if (typeFromQuery && Object.values(VitalType).includes(typeFromQuery)) {
      setFilters(prev => ({ ...prev, type: typeFromQuery }));
    }
    if (idFromQuery) {
        const vital = vitalSigns.find(v => v.id === idFromQuery);
        if (vital) {
            setVitalToEdit(vital);
            setIsModalOpen(true);
            navigate(location.pathname + (typeFromQuery ? `?type=${encodeURIComponent(typeFromQuery)}`: ''), { replace: true });
        }
    }
  }, [location.search, vitalSigns, navigate]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({ type: 'all', startDate: '', endDate: '', searchTerm: '' });
  };
  
  const filteredVitals = useMemo(() => {
    return vitalSigns
      .filter(vital => {
        const vitalTimestamp = new Date(vital.timestamp);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        if (startDate) startDate.setHours(0,0,0,0); 
        if (endDate) endDate.setHours(23,59,59,999); 

        return (
          (filters.type === 'all' || vital.type === filters.type) &&
          (!startDate || vitalTimestamp >= startDate) &&
          (!endDate || vitalTimestamp <= endDate) &&
          (filters.searchTerm === '' ||
            vital.notes?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            vital.type.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            (typeof vital.value === 'number' && String(vital.value).includes(filters.searchTerm)) ||
            (typeof vital.value === 'object' && 
              ((vital.value as BloodPressureReading).systolic + "/" + (vital.value as BloodPressureReading).diastolic).includes(filters.searchTerm)
            )
          )
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [vitalSigns, filters]);

  const openEditModal = (vital: VitalSign) => {
    setVitalToEdit(vital);
    setIsModalOpen(true);
    setFeedback(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setVitalToEdit(null);
  };

  const handleSaveVital = (editedVital: VitalSign) => {
    onEditVital(editedVital);
    setFeedback({ type: 'success', message: '✏ Vital Record Updated' }); 
    closeModal();
    setTimeout(() => setFeedback(null), 3000);
  };

  const openDeleteConfirm = (id: string) => {
    if (isModalOpen && vitalToEdit?.id === id) {
        closeModal();
    }
    setVitalIdToDelete(id);
    setIsDeleteConfirmOpen(true);
    setFeedback(null);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setVitalIdToDelete(null);
  };

  const handleDeleteVital = () => {
    if (vitalIdToDelete) {
      onDeleteVital(vitalIdToDelete);
      setFeedback({ type: 'success', message: '🗑 Vital Record Deleted' }); 
      closeDeleteConfirm();
      setTimeout(() => setFeedback(null), 3000);
    }
  };
  
  const getVitalDisplayValue = (vital: VitalSign) => {
    if (vital.type === VitalType.BloodPressure) {
      const bp = vital.value as BloodPressureReading;
      return `${bp.systolic}/${bp.diastolic} ${vital.unit}`;
    }
    return `${vital.value} ${vital.unit}`;
  };

  return (
    <div className="p-4 md:p-6 bg-neutral_card_bg dark:bg-dark_neutral_card_bg rounded-xl shadow-xl max-w-4xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary flex items-center">
            <ListBulletIcon className="h-8 w-8 mr-2"/> Vital Signs History
        </h2>
        <button 
            onClick={() => setShowFilters(!showFilters)}
            className="mt-3 sm:mt-0 text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary font-semibold py-2 px-4 rounded-lg border border-primary dark:border-primary-light hover:bg-primary-light dark:hover:bg-primary-dark/30 transition duration-200 flex items-center"
            aria-expanded={showFilters}
            aria-controls="filter-section"
        >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {feedback && (
        <div className="my-4">
          <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
        </div>
      )}

      {showFilters && (
        <div id="filter-section" className="mb-6 p-4 bg-neutral_bg dark:bg-dark_neutral_bg rounded-lg shadow space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Vital Type</label>
                    <select id="type" name="type" value={filters.type} onChange={handleFilterChange} 
                            className="mt-1 w-full p-2.5 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default">
                        <option value="all">All Types</option>
                        {Object.values(VitalType).map(vt => <option key={vt} value={vt}>{vt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} 
                           className="mt-1 w-full p-2 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default"
                           style={{ colorScheme: 'light dark' }}/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} 
                           className="mt-1 w-full p-2 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default"
                           style={{ colorScheme: 'light dark' }}/>
                </div>
                <div className="lg:col-span-1">
                    <label htmlFor="searchTerm" className="block text-sm font-medium text-text_muted dark:text-dark_text_muted">Search</label>
                    <div className="relative">
                        <input type="search" id="searchTerm" name="searchTerm" placeholder="Search notes, type, value..." value={filters.searchTerm} onChange={handleFilterChange} 
                               className="mt-1 w-full p-2 pl-10 border border-neutral_border dark:border-dark_neutral_border rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white dark:bg-slate-700 text-text_default dark:text-dark_text_default placeholder-text_muted dark:placeholder-dark_text_muted"/>
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>
             <div className="flex justify-end pt-3">
                 <button onClick={resetFilters} className="text-sm text-text_muted dark:text-dark_text_muted hover:text-primary dark:hover:text-primary-light font-medium py-2 px-4 rounded-lg flex items-center">
                    <ArrowPathIcon className="h-4 w-4 mr-1"/> Reset Filters
                </button>
            </div>
        </div>
      )}

      {vitalSigns.length === 0 ? (
         <div className="text-center py-12">
            <ListBulletIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
            <p className="text-xl text-text_muted dark:text-dark_text_muted">No vital signs logged yet.</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Use the "Log Vitals" tab to add your first record.</p>
        </div>
      ) : filteredVitals.length === 0 ? (
        <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
            <p className="text-xl text-text_muted dark:text-dark_text_muted">No records match your filters.</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search criteria or resetting filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-neutral_border dark:border-dark_neutral_border">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark_neutral_border">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text_muted dark:text-dark_text_muted uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text_muted dark:text-dark_text_muted uppercase tracking-wider">Type</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text_muted dark:text-dark_text_muted uppercase tracking-wider">Reading</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text_muted dark:text-dark_text_muted uppercase tracking-wider hidden md:table-cell">Notes</th>
                <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-text_muted dark:text-dark_text_muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark_neutral_card_bg divide-y divide-gray-200 dark:divide-dark_neutral_border">
              {filteredVitals.map(vital => (
                <tr key={vital.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors" tabIndex={0} onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') openEditModal(vital)}}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-text_default dark:text-dark_text_default">{formatDate(vital.timestamp)}</div>
                    <div className="text-xs text-text_muted dark:text-dark_text_muted">{formatTime(vital.timestamp)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text_default dark:text-dark_text_default">{vital.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-text_default dark:text-dark_text_default">{getVitalDisplayValue(vital)}</td>
                  <td className="px-4 py-3 text-sm text-text_muted dark:text-dark_text_muted hidden md:table-cell max-w-xs truncate" title={vital.notes || ''}>{vital.notes || '-'}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <button onClick={() => openEditModal(vital)} className="text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary p-1.5 rounded-md hover:bg-primary-light dark:hover:bg-primary-dark/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`Edit ${vital.type} record from ${formatDate(vital.timestamp)}`}>
                      <PencilSquareIcon className="h-5 w-5"/>
                    </button>
                    <button onClick={() => openDeleteConfirm(vital.id)} className="text-status_red hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors ml-2 focus:outline-none focus:ring-2 focus:ring-status_red" aria-label={`Delete ${vital.type} record from ${formatDate(vital.timestamp)}`}>
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VitalDetailModal
        vital={vitalToEdit}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveVital}
        onDelete={(id) => { openDeleteConfirm(id);}} 
      />
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDeleteVital}
        title="Delete Vital Record"
        message="Are you sure you want to delete this vital record? This action cannot be undone."
        confirmButtonText="Delete"
      />
    </div>
  );
};

export default VitalHistoryPage;