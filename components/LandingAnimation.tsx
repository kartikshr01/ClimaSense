import React, { useEffect, useState } from 'react';

interface LandingAnimationProps {
    onAnimationComplete: () => void;
}

// --- SVG Icons defined locally for this specific animation ---
const SunIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-yellow-300">
        <circle cx="50" cy="50" r="25" fill="currentColor"/>
        <line x1="50" y1="10" x2="50" y2="25" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="50" y1="75" x2="50" y2="90" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="10" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="75" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="21" y1="21" x2="32" y2="32" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="68" y1="68" x2="79" y2="79" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="21" y1="79" x2="32" y2="68" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
        <line x1="68" y1="32" x2="79" y2="21" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
    </svg>
);

const MoonIcon: React.FC = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-300">
        <path d="M 50 10 A 40 40 0 1 0 50 90 A 30 30 0 1 1 50 10 Z" fill="currentColor"/>
    </svg>
);

const CloudIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg viewBox="0 0 100 50" className={`w-full h-full text-white ${className}`}>
        <path d="M 10 50 C -10 50, -10 20, 20 20 C 30 0, 70 0, 80 20 C 110 20, 110 50, 90 50 Z" fill="currentColor"/>
    </svg>
);

const Star: React.FC<{ top: string, left: string, size: number, delay: string }> = ({ top, left, size, delay }) => (
    <div className="absolute rounded-full bg-white" style={{ top, left, width: size, height: size, animation: `twinkle 2s infinite ${delay}` }} />
);

const Raindrop: React.FC<{ left: string, delay: string, duration: string }> = ({ left, delay, duration }) => (
    <div className="absolute top-0 w-0.5 h-4 bg-white/50 rounded-full" style={{ left, animation: `rain-fall ${duration} linear infinite ${delay}` }} />
);

// --- Main Animation Component ---
export const LandingAnimation: React.FC<LandingAnimationProps> = ({ onAnimationComplete }) => {
    const [phase, setPhase] = useState<'day' | 'rain' | 'night' | 'end'>('day');
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const sequence = [
            { phase: 'rain', delay: 2500 },
            { phase: 'night', delay: 5000 },
            { phase: 'end', delay: 7500 },
        ];

        const timers = sequence.map(item =>
            setTimeout(() => setPhase(item.phase as any), item.delay)
        );

        const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 7000); // Start fade out before animation ends

        const completeTimer = setTimeout(() => {
            onAnimationComplete();
        }, 8000); // Total duration

        return () => {
            timers.forEach(clearTimeout);
            clearTimeout(fadeOutTimer);
            clearTimeout(completeTimer);
        };
    }, [onAnimationComplete]);

    const skyColors = {
        day: 'bg-[#bde0fe]',
        rain: 'bg-[#90a4ae]',
        night: 'bg-[#263238]',
        end: 'bg-[#263238]',
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col justify-center items-center bg-gradient-to-br from-[#bde0fe] to-[#ffc8dd] transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/50">
                {/* Sky Background */}
                <div className={`absolute inset-0 transition-colors duration-2000 ${skyColors[phase]}`} />
                
                {/* Celestial Bodies */}
                <div className="absolute inset-0" style={{ animation: 'sun-path 8s ease-in-out forwards' }}>
                    <div className="w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><SunIcon /></div>
                </div>
                 <div className="absolute inset-0" style={{ animation: 'moon-path 8s ease-in-out forwards' }}>
                    <div className="w-14 h-14 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><MoonIcon /></div>
                </div>

                {/* Stars - Appear at night */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === 'night' || phase === 'end' ? 'opacity-100' : 'opacity-0'}`}>
                    <Star top="20%" left="30%" size={3} delay="0s" />
                    <Star top="30%" left="70%" size={2} delay="0.5s" />
                    <Star top="50%" left="20%" size={2} delay="1s" />
                    <Star top="60%" left="80%" size={4} delay="0.2s" />
                    <Star top="80%" left="45%" size={3} delay="0.8s" />
                </div>
                
                {/* Rain - Appears during rain phase */}
                 <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === 'rain' ? 'opacity-100' : 'opacity-0'}`}>
                    {[...Array(20)].map((_, i) => (
                        <Raindrop key={i} left={`${Math.random() * 100}%`} delay={`${Math.random()}s`} duration={`${0.5 + Math.random() * 0.3}s`} />
                    ))}
                </div>

                {/* Clouds */}
                <div className="absolute inset-0">
                    <div className="w-24 h-12 absolute top-[15%]" style={{ animation: 'cloud-drift 8s linear forwards' }}>
                        <CloudIcon className={phase === 'rain' ? 'text-gray-400' : 'text-white'}/>
                    </div>
                     <div className="w-32 h-16 absolute top-[25%]" style={{ animation: 'cloud-drift 8s linear forwards', animationDelay: '2s' }}>
                        <CloudIcon className={phase === 'rain' ? 'text-gray-400' : 'text-white'}/>
                    </div>
                </div>
            </div>
            <p className="mt-8 text-2xl font-semibold text-white/80 transition-opacity duration-500" style={{ opacity: isFadingOut ? 0 : 1 }}>
                ClimaSense
            </p>
        </div>
    );
};