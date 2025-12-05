
import React from 'react';
import { TestPhase } from '../types';
import { Play, Square, RotateCcw } from 'lucide-react';

interface SpeedGaugeProps {
  speed: number;
  phase: TestPhase;
  maxSpeed?: number;
  onStart?: () => void;
  onStop?: () => void;
  theme: 'o2' | 'nordic';
}

const SpeedGauge: React.FC<SpeedGaugeProps> = ({ speed, phase, maxSpeed = 1000, onStart, onStop, theme }) => {
  // Normalize speed for the gauge
  const normalizedSpeed = Math.min(speed, maxSpeed);
  const percentage = (normalizedSpeed / maxSpeed) * 100;
  
  // SVG Config
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isInteractive = phase === TestPhase.IDLE || phase === TestPhase.COMPLETE;
  const isRunning = phase !== TestPhase.IDLE && phase !== TestPhase.COMPLETE;

  const getLabel = () => {
    switch (phase) {
      case TestPhase.PING: return 'ODEZVA';
      case TestPhase.DOWNLOAD: return 'STAH. (DOWNLOAD)';
      case TestPhase.UPLOAD: return 'NAHR. (UPLOAD)';
      case TestPhase.COMPLETE: return 'HOTOVO';
      default: return 'SPUSTIT';
    }
  };

  const getColor = () => {
      if (theme === 'nordic') {
        switch(phase) {
            case TestPhase.UPLOAD: return 'text-purple-400 stroke-purple-400';
            case TestPhase.DOWNLOAD: return 'text-nordic stroke-nordic';
            case TestPhase.PING: return 'text-nordic-dim stroke-nordic-dim';
            default: return 'text-nordic stroke-nordic';
        }
      } else {
        // O2 Theme
        switch(phase) {
            case TestPhase.UPLOAD: return 'text-purple-400 stroke-purple-400';
            case TestPhase.DOWNLOAD: return 'text-o2 stroke-o2';
            case TestPhase.PING: return 'text-o2-light stroke-o2-light';
            default: return 'text-o2 stroke-o2';
        }
      }
  };

  const themeColorClass = getColor();
  const primaryColor = theme === 'o2' ? 'text-o2' : 'text-nordic';
  const primaryStroke = theme === 'o2' ? 'stroke-o2' : 'stroke-nordic';
  const buttonBgHover = theme === 'o2' ? 'group-hover:bg-o2/10' : 'group-hover:bg-nordic/10';

  return (
    <div className="relative flex items-center justify-center w-80 h-80 mx-auto group">
      {/* Background Circle */}
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 pointer-events-none"
      >
        <circle
          className="stroke-slate-800"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <circle
          className={`${themeColorClass} transition-all duration-300 ease-out`}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      
      {/* Center Content / Button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        
        {/* Interactive Start/Stop Button Layer */}
        {isInteractive ? (
            <button 
                onClick={onStart}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${buttonBgHover} focus:outline-none`}
            >
                {phase === TestPhase.COMPLETE ? (
                    <RotateCcw size={48} className={`${primaryColor} mb-2 transition-transform group-hover:rotate-180 duration-700`} />
                ) : (
                    <Play size={56} className={`${primaryColor} ml-2 mb-2 transition-transform group-hover:scale-110 duration-300`} />
                )}
                <span className={`text-xs font-bold tracking-widest uppercase ${primaryColor}`}>
                    {phase === TestPhase.COMPLETE ? 'Restart' : 'Spustit'}
                </span>
            </button>
        ) : (
             <button 
                onClick={onStop}
                className="flex flex-col items-center justify-center group/stop cursor-pointer w-40 h-40 rounded-full hover:bg-red-500/5 transition-all"
             >
                <div className={`text-6xl font-mono font-bold tracking-tighter ${themeColorClass} ${phase === TestPhase.DOWNLOAD ? 'neon-text-green' : 'neon-text'} transition-colors duration-300 group-hover/stop:opacity-20`}>
                    {speed.toFixed(0)}
                </div>
                <div className="text-sm text-slate-500 font-bold mt-2 tracking-widest uppercase group-hover/stop:opacity-20">
                    Mb/s
                </div>
                
                {/* Stop Overlay */}
                <div className="absolute inset-0 flex-col items-center justify-center hidden group-hover/stop:flex text-red-500">
                    <Square size={32} fill="currentColor" />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Zastavit</span>
                </div>
            </button>
        )}
        
        {/* Label (Only visible when running or not hovering start) */}
        {!isInteractive && (
             <div className={`text-xs mt-4 font-semibold tracking-wider ${themeColorClass} opacity-80 uppercase absolute bottom-20 pointer-events-none`}>
                {getLabel()}
            </div>
        )}
      </div>

      {/* Decorative Rotating Ring */}
      {isRunning && (
        <div className="absolute inset-0 border border-dashed border-slate-600/30 rounded-full animate-spin-slow w-full h-full pointer-events-none"></div>
      )}
    </div>
  );
};

export default SpeedGauge;
