
import React from 'react';
import { TestProfile, ConnectionType } from '../types';
import { Network, Wifi, Zap, Settings, Radio, Gamepad2, Tv, Video, Globe } from 'lucide-react';

interface ProfileSelectorProps {
  profiles: TestProfile[];
  selectedProfileId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
  customDuration: number;
  customInterval: number;
  onCustomChange: (field: 'duration' | 'interval', value: number) => void;
  theme: 'o2' | 'nordic';
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ 
  profiles, 
  selectedProfileId, 
  onSelect, 
  disabled,
  customDuration,
  customInterval,
  onCustomChange,
  theme
}) => {
  
  const getIcon = (profileId: string, type: ConnectionType) => {
    // Specific icons based on ID for better UX
    if (profileId.includes('gamer')) return <Gamepad2 size={18} />;
    if (profileId.includes('streaming')) return <Tv size={18} />;
    if (profileId.includes('office')) return <Video size={18} />;
    if (profileId.includes('general')) return <Globe size={18} />;

    // Fallback to technical icons
    switch(type) {
      case 'OPTICS': return <Zap size={18} />;
      case 'WIFI': return <Wifi size={18} />;
      case '5G': return <Radio size={18} />;
      case 'DSL': return <Network size={18} />;
      default: return <Settings size={18} />;
    }
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const activeBg = theme === 'o2' ? 'bg-o2/10 border-o2' : 'bg-nordic/10 border-nordic';
  const activeIconBg = theme === 'o2' ? 'bg-o2' : 'bg-nordic';
  const activeShadow = theme === 'o2' ? 'shadow-[0_0_15px_rgba(0,92,255,0.1)]' : 'shadow-[0_0_15px_rgba(132,189,0,0.1)]';
  const focusRing = theme === 'o2' ? 'focus:border-o2 focus:ring-o2' : 'focus:border-nordic focus:ring-nordic';

  return (
    <div className="w-full">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
        <Settings size={14} /> Vyberte Scénář
      </h3>
      
      <div className="grid grid-cols-1 gap-2 mb-4">
        {profiles.map(profile => (
          <button
            key={profile.id}
            onClick={() => !disabled && onSelect(profile.id)}
            disabled={disabled}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left group
              ${selectedProfileId === profile.id 
                ? `${activeBg} ${activeShadow}` 
                : 'bg-slate-800/40 border-transparent hover:bg-slate-800 hover:border-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`p-2 rounded-lg transition-colors ${selectedProfileId === profile.id ? `${activeIconBg} text-white` : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
              {getIcon(profile.id, profile.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-bold text-sm truncate ${selectedProfileId === profile.id ? 'text-white' : 'text-slate-300'}`}>
                  {profile.name}
                </span>
                {profile.mode === 'LONG_TERM' && profile.type !== 'MANUAL' && (
                  <span className="text-[9px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded flex-shrink-0">
                    {profile.intervalMinutes}m INT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{profile.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Manual Configuration Panel */}
      {selectedProfile?.type === 'MANUAL' && (
        <div className="glass-panel p-4 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <h4 className={`text-xs font-bold uppercase mb-3 ${theme === 'o2' ? 'text-o2' : 'text-nordic'}`}>Servisní Nastavení</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Trvání (min)</label>
              <input 
                type="number" 
                value={customDuration}
                onChange={(e) => onCustomChange('duration', parseInt(e.target.value) || 0)}
                disabled={disabled}
                className={`w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:ring-1 ${focusRing}`}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Interval (min, 0=Nonstop)</label>
              <input 
                type="number" 
                value={customInterval}
                onChange={(e) => onCustomChange('interval', parseInt(e.target.value) || 0)}
                disabled={disabled}
                className={`w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:ring-1 ${focusRing}`}
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 italic">
            Pozn: Interval 0 spustí kontinuální zátěžový test.
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
