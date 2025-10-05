import React, { useContext } from 'react';
import { WeatherIcon } from './Icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { language } = useContext(LanguageContext);

  return (
    <header className="text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-4">
          <div className="w-12 h-12 text-[#cdb4db]">
            <WeatherIcon />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
            {t('header.title', language)}
          </h1>
        </div>
        <LanguageSwitcher />
      </div>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl">
        {t('header.subtitle', language)}
      </p>
    </header>
  );
};