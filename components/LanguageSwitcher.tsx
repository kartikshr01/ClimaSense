import React, { useContext, useState, useRef, useEffect } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { ChevronDownIcon, CheckIcon } from './Icons';
import { t } from '../lib/i18n';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useContext(LanguageContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: t('language.english', 'en') },
        { code: 'hi', name: t('language.hindi', 'hi') }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (langCode: 'en' | 'hi') => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    const selectedLanguageName = languages.find(l => l.code === language)?.name;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-32 px-4 py-2 bg-white/40 rounded-lg border border-white/50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#cdb4db] transition-all duration-200"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span>{selectedLanguageName}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDownIcon />
                </span>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-32 bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/50 z-10 overflow-hidden"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code as 'en' | 'hi')}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-[#cdb4db]/50 flex items-center justify-between transition-colors duration-150"
                                role="menuitem"
                            >
                                <span>{lang.name}</span>
                                {language === lang.code && <CheckIcon />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};