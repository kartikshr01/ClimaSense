import React, { useContext } from 'react';
import { CompassIcon } from './Icons';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';

export const Welcome: React.FC = () => {
    const { language } = useContext(LanguageContext);

    return (
        <div className="text-center p-8 bg-[#faedcd]/40 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 animate-fade-in h-full flex flex-col justify-center">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 text-[#a2d2ff]">
                    <CompassIcon />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{t('welcome.title', language)}</h2>
            <p className="mt-4 text-slate-600">
                {t('welcome.line1', language)}
            </p>
            <p className="mt-2 text-slate-600">
                {t('welcome.line2', language)}
            </p>
        </div>
    );
};