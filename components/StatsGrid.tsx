
import React from 'react';
import { TestResults, TestPhase } from '../types';
import { ArrowDown, ArrowUp, Activity, Zap, AlertTriangle } from 'lucide-react';

interface StatsGridProps {
  results: TestResults;
  phase: TestPhase;
  theme: 'o2' | 'nordic';
}

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  unit: string; 
  icon: React.ReactNode; 
  active?: boolean;
  color?: string;
  borderColor?: string;
}> = ({ label, value, unit, icon, active, color = "text-slate-200", borderColor = "border-transparent" }) => (
  <div className={`glass-panel p-4 rounded-xl flex flex-col items-start transition-all duration-300 border-l-4 ${active ? `bg-slate-800/60 ${borderColor}` : 'border-transparent'}`}>
    <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
      {icon}
      {label}
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-mono font-bold ${active ? color : 'text-slate-100'}`}>
        {value === 0 && !active ? '-' : value}
      </span>
      <span className="text-xs text-slate-500 font-semibold">{unit}</span>
    </div>
  </div>
);

const StatsGrid: React.FC<StatsGridProps> = ({ results, phase, theme }) => {
  const primaryColor = theme === 'o2' ? 'text-o2' : 'text-nordic';
  const primaryBorder = theme === 'o2' ? 'border-o2' : 'border-nordic';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full mt-6">
      <StatCard 
        label="Ping" 
        value={results.ping.toFixed(0)} 
        unit="ms" 
        icon={<Activity size={14} />} 
        active={phase === TestPhase.PING || phase === TestPhase.COMPLETE}
        color={primaryColor}
        borderColor={primaryBorder}
      />
      <StatCard 
        label="Jitter" 
        value={results.jitter.toFixed(0)} 
        unit="ms" 
        icon={<Zap size={14} />} 
        active={phase === TestPhase.PING || phase === TestPhase.COMPLETE}
        color={primaryColor}
        borderColor={primaryBorder}
      />
       <StatCard 
        label="Ztráta (Loss)" 
        value={results.loss.toFixed(1)} 
        unit="%" 
        icon={<AlertTriangle size={14} />} 
        active={phase === TestPhase.PING || phase === TestPhase.COMPLETE}
        color={results.loss > 0 ? "text-red-500" : primaryColor}
        borderColor={results.loss > 0 ? "border-red-500" : primaryBorder}
      />
      <StatCard 
        label="Stahování" 
        value={results.download.toFixed(1)} 
        unit="Mb/s" 
        icon={<ArrowDown size={14} />} 
        active={phase === TestPhase.DOWNLOAD || phase === TestPhase.COMPLETE}
        color={theme === 'o2' ? "text-nordic" : "text-nordic"} // Download is usually green/nordic in most contexts or keep theme consistency? Let's use Nordic green for download universally as it means 'Go/Good'
        borderColor="border-nordic"
      />
      <StatCard 
        label="Nahrávání" 
        value={results.upload.toFixed(1)} 
        unit="Mb/s" 
        icon={<ArrowUp size={14} />} 
        active={phase === TestPhase.UPLOAD || phase === TestPhase.COMPLETE}
        color="text-purple-400"
        borderColor="border-purple-400"
      />
    </div>
  );
};

export default StatsGrid;
