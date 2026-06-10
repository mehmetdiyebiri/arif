import React, { useState, useEffect, useCallback } from 'react';
import { PlayCircle, Clock } from 'lucide-react';

export const BurdonTest = ({ config, studentGuidanceAnswers, setStudentGuidanceAnswers, submitGuidanceForm }: any) => {
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [finished, setFinished] = useState(false);

    // Initialize state from studentGuidanceAnswers if exists, else it's empty
    
    useEffect(() => {
        let timer: any;
        if (started && !finished && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setFinished(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [started, finished, timeLeft]);

    const handleStart = () => {
        setStarted(true);
    };

    const toggleLetter = (bIdx: number, rowIdx: number, colIdx: number, char: string) => {
        if (!started || finished) return;
        const key = `b${bIdx}_r${rowIdx}_c${colIdx}`;
        
        setStudentGuidanceAnswers((prev: any) => {
            const newState = { ...prev };
            if (newState[key]) {
                delete newState[key]; // Toggle off
            } else {
                newState[key] = char; // Toggle on
            }
            return newState;
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const targetLetters = ['a', 'b', 'd', 'g'];

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
            {!started && !finished && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                    <button 
                        onClick={handleStart}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-2xl text-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-xl"
                    >
                        <PlayCircle size={32} />
                        TESTE BAŞLA (5 DK)
                    </button>
                    <p className="mt-4 text-gray-600 font-bold max-w-md text-center">
                        Süre 5 dakikadır. Başla butonuna bastığınızda süre başlayacaktır. Aşağıdaki bloklarda bulunan bütün a, b, d ve g harflerinin üzerine tıklayarak işaretleyiniz.
                    </p>
                </div>
            )}
            
            {(started || finished) && (
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 sticky top-0 bg-white z-0 pt-2">
                    <div className="flex items-center gap-3">
                        <Clock size={24} className={timeLeft < 60 ? "text-red-500 animate-pulse" : "text-blue-500"} />
                        <span className={`text-2xl font-black font-mono ${timeLeft < 60 ? "text-red-500" : "text-gray-800"}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    {finished && (
                        <div className="text-red-500 font-black text-xl animate-pulse">SÜRE DOLDU!</div>
                    )}
                    <button
                        onClick={() => submitGuidanceForm(config.id)}
                        disabled={!finished && timeLeft > 0}
                        className={`font-bold px-6 py-3 rounded-2xl transition-all ${(!finished && timeLeft > 0) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-xl hover:scale-105'}`}
                    >
                        Sınavı Bitir ve Gönder
                    </button>
                </div>
            )}

            <div className="space-y-12">
                {config.blocks.map((block: string[], bIdx: number) => (
                    <div key={bIdx} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-200 shadow-sm relative">
                        <div className="absolute -left-2 top-10 border border-gray-200 bg-white text-gray-400 font-black text-xs px-2 py-1 rounded-full">{bIdx + 1}. BÖLÜM</div>
                        <div className="flex flex-col gap-4 font-mono text-center overflow-x-auto text-[18px]">
                            {block.map((row: string, rowIdx: number) => {
                                const letters = row.split(' ').filter(c => c.trim().length > 0);
                                return (
                                    <div key={rowIdx} className="flex justify-center gap-[0.4rem] min-w-max px-4">
                                        {letters.map((char: string, colIdx: number) => {
                                            const key = `b${bIdx}_r${rowIdx}_c${colIdx}`;
                                            const isSelected = !!studentGuidanceAnswers[key];
                                            const isTarget = targetLetters.includes(char.toLowerCase());
                                            
                                            // Optional visual feedback after finishing
                                            let bgClass = "hover:bg-gray-200 cursor-pointer";
                                            let textClass = "text-gray-800";
                                            
                                            if (isSelected) {
                                                bgClass = "bg-blue-500 hover:bg-blue-600 cursor-pointer text-white";
                                                textClass = "text-white";
                                            }

                                            // If finished, show the omissions/commissions maybe? But student doesn't need to see results before submit, 
                                            // usually they just can't click anymore.
                                            if (finished) {
                                                bgClass = "cursor-not-allowed " + (isSelected ? "bg-blue-500" : "");
                                                textClass = isSelected ? "text-white" : "text-gray-400";
                                            }
                                            
                                            return (
                                                <button
                                                    key={colIdx}
                                                    onClick={() => toggleLetter(bIdx, rowIdx, colIdx, char)}
                                                    disabled={finished || !started}
                                                    className={`w-6 h-8 flex items-center justify-center rounded transition-colors select-none font-medium ${bgClass} ${textClass}`}
                                                >
                                                    {char}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
