
import React from 'react';
import { ServerOption, TestConfig } from '../types';
import { Settings, MapPin, CheckCircle, Globe } from 'lucide-react';

interface SettingsPanelProps {
  servers: ServerOption[];
  config: TestConfig;
  onConfigChange: (newConfig: TestConfig) => void;
  disabled: boolean;
  theme: 'o2' | 'nordic';
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ servers, config, onConfigChange, disabled, theme }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleServer = (serverId: string) => {
    if (disabled) return;
    onConfigChange({ ...config, serverId });
    setIsOpen(false);
  };

  const currentServer = servers.find(s => s.id === config.serverId) || servers[0];
  const activeColor = theme === 'o2' ? 'text-o2' : 'text-nordic';

  return (
    <div className="w-full mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Settings size={14} /> Konfigurace Testu
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Server Selection Dropdown Trigger */}
        <div className="relative">
          <button 
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`w-full glass-panel p-4 rounded-lg flex items-center justify-between text-left transition-colors border border-slate-800 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-slate-800 rounded-lg ${activeColor}`}>
                {currentServer.id === 'auto' ? <Globe size={18}/> : <MapPin size={18} />}
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cílový Server</div>
                <div className="text-slate-200 font-medium">{currentServer.name}</div>
              </div>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-400">{currentServer.location}</div>
                {currentServer.distance > 0 && <div className="text-[10px] text-slate-600">{currentServer.distance} km</div>}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-30 overflow-hidden max-h-60 overflow-y-auto">
              {servers.map(server => (
                <button
                  key={server.id}
                  onClick={() => toggleServer(server.id)}
                  className="w-full p-3 text-left hover:bg-slate-800 flex items-center justify-between border-b border-slate-800 last:border-0 group"
                >
                  <div>
                      <span className="block text-sm text-slate-300 group-hover:text-white transition-colors">{server.name}</span>
                      <span className="text-xs text-slate-500">{server.location}</span>
                  </div>
                  {config.serverId === server.id && <CheckCircle size={14} className={activeColor} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
