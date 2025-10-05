import React, { useState, useCallback, useContext } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Welcome } from './components/Welcome';
import { ComfortData, LocationDateInput } from './types';
import { getComfortPrediction, getWeatherForLocationAndDate } from './services/geminiService';
import { WarningIcon } from './components/Icons';
import { LanguageContext } from './contexts/LanguageContext';
import { t } from './lib/i18n';
import { LandingAnimation } from './components/LandingAnimation';

const App: React.FC = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [comfortData, setComfortData] = useState<ComfortData | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(LanguageContext);

  const handleAnimationComplete = useCallback(() => {
    setAnimationComplete(true);
  }, []);

  const handlePrediction = useCallback(async (locationInput: LocationDateInput) => {
    setError(null);
    setComfortData(null);

    try {
      setLoadingMessage(t('loading.weather', language, { location: locationInput.location }));
      const weatherInput = await getWeatherForLocationAndDate(locationInput);

      setLoadingMessage(t('loading.comfort', language));
      const data = await getComfortPrediction(weatherInput, locationInput, language);
      setComfortData(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('error.unknown', language);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoadingMessage(null);
    }
  }, [language]);

  const isLoading = loadingMessage !== null;

  if (!animationComplete) {
    return <LandingAnimation onAnimationComplete={handleAnimationComplete} />;
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 font-sans grid grid-cols-1 lg:grid-cols-2 lg:gap-12 animate-fade-in">
      {/* Left Column: Inputs */}
      <div className="flex flex-col">
        <Header />
        <main className="mt-8">
            <InputForm onSubmit={handlePrediction} isLoading={isLoading} />
        </main>
      </div>

      {/* Right Column: Results */}
      <div className="mt-8 lg:mt-0 flex flex-col justify-center">
        {isLoading && (
          <div className="animate-fade-in flex flex-col justify-center items-center p-12 text-center h-full">
            <div className="w-12 h-12 border-4 border-[#a2d2ff] border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 mt-4 text-lg text-slate-700">{loadingMessage}</p>
          </div>
        )}
        {error && (
            <div className="animate-fade-in bg-red-100/60 backdrop-blur-md border border-red-300/50 text-red-900 p-6 rounded-2xl relative shadow-lg" role="alert">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 text-red-500">
                    <WarningIcon />
                </div>
                <div>
                    <strong className="font-bold block text-lg">
                      {t('error.title', language)}
                    </strong>
                    <span className="block mt-1 text-red-800">{error}</span>
                </div>
            </div>
          </div>
        )}
        {comfortData && !isLoading && <ResultsDisplay data={comfortData} />}
        {!comfortData && !isLoading && !error && <Welcome />}
      </div>
    </div>
  );
};

export default App;