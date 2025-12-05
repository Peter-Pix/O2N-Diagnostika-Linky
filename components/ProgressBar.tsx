
import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label: string;
  sublabel?: string;
  isLongTerm?: boolean;
  theme: 'o2' | 'nordic';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, sublabel, isLongTerm, theme }) => {
  // Clamp progress between 0 and 100
  const validProgress = Math.min(100, Math.max(0, progress));
  
  const primaryColor = theme === 'o2' ? 'text-o2' : 'text-nordic';
  const primaryBg = theme === 'o2' ? 'bg-o2' : 'bg-nordic';
  const gradient = theme === 'o2' 
    ? 'from-o2-dark via-o2 to-o2-light' 
    : 'from-nordic-dim via-nordic to-lime-400';

  return (
    <div className="w-full glass-panel p-4 rounded-xl border border-slate-800 mb-6 relative overflow-hidden group">
      {/* Glossy sheen effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
           <div className={`text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2 ${primaryColor}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${primaryBg}`}></span>
              {label}
           </div>
           {sublabel && <div className="text-xs text-slate-400 font-mono">{sublabel}</div>}
        </div>
        <div className="text-2xl font-mono font-bold text-white">
          {validProgress.toFixed(1)}<span className="text-sm text-slate-500 ml-1">%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
        {/* Fill */}
        <div 
          className={`h-full bg-gradient-to-r ${gradient} transition-all duration-300 ease-out relative`}
          style={{ width: `${validProgress}%` }}
        >
            {/* Shimmer animation on the bar itself */}
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-[pulse-fast_1s_infinite]"></div>
        </div>

        {/* Reliability Markers for Long Term */}
        {isLongTerm && (
          <>
            {/* 30% Marker */}
            <div className="absolute top-0 bottom-0 w-px bg-slate-500/50 z-20" style={{ left: '30%' }}></div>
            <div className="absolute -top-1 text-[8px] text-slate-500 font-bold z-20" style={{ left: '30%', transform: 'translateX(-50%)' }}>MIN</div>
            
            {/* 50% Marker */}
            <div className="absolute top-0 bottom-0 w-px bg-slate-500/50 z-20" style={{ left: '50%' }}></div>
            <div className={`absolute -top-1 text-[8px] font-bold z-20 ${primaryColor}`} style={{ left: '50%', transform: 'translateX(-50%)' }}>OPTIMUM</div>
          </>
        )}
      </div>

      {/* Helper text for markers */}
      {isLongTerm && (
        <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-medium">
          <span className="pl-[30%] translate-x-[-50%]">Min. spolehlivost</span>
          <span className={`pl-[20%] translate-x-[-50%] ${primaryColor}`}>Doporučeno</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
