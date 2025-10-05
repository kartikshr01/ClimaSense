import React, { useState, useContext } from 'react';
import { LocationDateInput } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import { getAddressFromCoordinates } from '../services/locationService';
import { CurrentLocationIcon } from './Icons';

interface InputFormProps {
  onSubmit: (data: LocationDateInput) => void;
  isLoading: boolean;
}

const getTodayDateString = () => {
    const today = new Date();
    // Format to YYYY-MM-DD for the date input
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const { language } = useContext(LanguageContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && date) {
      onSubmit({ location, date });
    }
  };

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const address = await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
        setLocation(address);
      } catch (error) {
          alert(t('error.locationPermission', language));
          console.error(error);
      } finally {
        setIsFetchingLocation(false);
      }
    }, (error) => {
      alert(t('error.locationPermission', language));
      console.error(error);
      setIsFetchingLocation(false);
    });
  };

  const isButtonDisabled = isLoading || !location.trim() || !date;

  return (
    <form onSubmit={handleSubmit} className="bg-[#faedcd]/40 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-lg border border-white/30 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
            {t('form.locationLabel', language)}
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('form.locationPlaceholder', language)}
              className="w-full pl-4 pr-12 py-2 bg-white/60 border border-slate-300/50 rounded-lg text-base focus:ring-2 focus:ring-[#a2d2ff] focus:border-[#a2d2ff] transition-all duration-300 shadow-inner"
              required
              aria-label="Location"
            />
             <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isFetchingLocation}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-[#a2d2ff] disabled:text-slate-400 disabled:cursor-wait rounded-full transition-colors duration-200"
              title={t('form.currentLocation', language)}
              aria-label={t('form.currentLocation', language)}
            >
              {isFetchingLocation ? (
                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CurrentLocationIcon />
              )}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
            {t('form.dateLabel', language)}
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-white/60 border border-slate-300/50 rounded-lg text-base focus:ring-2 focus:ring-[#a2d2ff] focus:border-[#a2d2ff] transition-all duration-300 shadow-inner"
            required
            aria-label="Date"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full mt-4 px-4 py-3 text-slate-800 bg-gradient-to-r from-[#ffc8dd] to-[#cdb4db] rounded-lg font-semibold hover:from-[#f9b4d1] hover:to-[#c4a9d3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cdb4db] disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] disabled:scale-100 shadow-md hover:shadow-lg"
        >
            {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('form.buttonLoading', language)}</span>
                </>
            ) : t('form.buttonSubmit', language)}
        </button>
      </div>
    </form>
  );
};