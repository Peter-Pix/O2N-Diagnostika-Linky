
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import SpeedGauge from './components/SpeedGauge';
import RealTimeChart from './components/RealTimeChart';
import StatsGrid from './components/StatsGrid';
import SettingsPanel from './components/SettingsPanel';
import ProfileSelector from './components/ProfileSelector';
import TestLog from './components/TestLog';
import ExportPanel from './components/ExportPanel';
import ProgressBar from './components/ProgressBar';
import { TestPhase, TestResults, SpeedDataPoint, TestConfig, ServerOption, TestProfile, TestRecord } from './types';
import { simulateSpeed, generateMockServers, getProfiles, evaluateQuickTest } from './utils/simulation';
import { Play, RotateCcw, Activity, Clock, ShieldCheck, Power, Info, Server, CheckCircle2 } from 'lucide-react';

const SERVERS = generateMockServers();
const ALL_PROFILES = getProfiles();

const INITIAL_RESULTS: TestResults = {
  ping: 0,
  jitter: 0,
  download: 0,
  upload: 0,
  loss: 0
};

// Simulation Constants
const PING_DURATION = 2000;
const DOWNLOAD_DURATION = 5000;
const UPLOAD_DURATION = 5000;
const INSTANT_TOTAL_DURATION = PING_DURATION + DOWNLOAD_DURATION + UPLOAD_DURATION; // Approx 12s
const TICK_RATE = 50; // ms

function App() {
  // Theme selection: 'o2' or 'nordic'
  const [theme, setTheme] = useState<'o2' | 'nordic'>('o2');

  // Mode selection: 'INSTANT' or 'LONG_TERM'
  const [appMode, setAppMode] = useState<'INSTANT' | 'LONG_TERM'>('INSTANT');
  
  // Test State
  const [phase, setPhase] = useState<TestPhase>(TestPhase.IDLE);
  const [results, setResults] = useState<TestResults>(INITIAL_RESULTS);
  const [chartData, setChartData] = useState<SpeedDataPoint[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  
  // Progress State
  const [progress, setProgress] = useState(0);

  // Configuration
  const [config, setConfig] = useState<TestConfig>({
    serverId: SERVERS[0].id,
    profileId: 'quick-general', // Default to a quick profile
    measureDownload: true,
    measureUpload: true,
    measureLatency: true,
    customDuration: 60, // min
    customInterval: 15 // min
  });

  // Long Term State
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // seconds
  const [nextTestIn, setNextTestIn] = useState<number>(0); // seconds
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(0); // For progress calc

  const stateRef = useRef({
    phase: TestPhase.IDLE,
    phaseStartTime: 0,
    testStartTime: 0, // For instant progress
    isRunning: false
  });

  // Sync state to ref
  useEffect(() => {
    stateRef.current.phase = phase;
  }, [phase]);

  // Filter profiles based on active mode
  const activeProfiles = useMemo(() => {
     return appMode === 'INSTANT' 
        ? ALL_PROFILES.filter(p => p.mode === 'QUICK')
        : ALL_PROFILES.filter(p => p.mode === 'LONG_TERM');
  }, [appMode]);

  // Handle Mode Switching and Profile Reset
  const handleModeChange = (mode: 'INSTANT' | 'LONG_TERM') => {
      if (phase !== TestPhase.IDLE && phase !== TestPhase.COMPLETE) return; // Prevent switch while running
      
      setAppMode(mode);
      // Reset profile to the first available in the new mode
      const defaultProfile = ALL_PROFILES.find(p => p.mode === (mode === 'INSTANT' ? 'QUICK' : 'LONG_TERM'));
      if (defaultProfile) {
          setConfig(prev => ({
              ...prev,
              profileId: defaultProfile.id,
              customDuration: defaultProfile.durationMinutes,
              customInterval: defaultProfile.intervalMinutes
          }));
      }
      setPhase(TestPhase.IDLE);
      setResults(INITIAL_RESULTS);
      setProgress(0);
  };

  // Handle Profile Selection updates
  useEffect(() => {
    const profile = ALL_PROFILES.find(p => p.id === config.profileId);
    if (profile && profile.type !== 'MANUAL') {
       setConfig(prev => ({
         ...prev,
         customDuration: profile.durationMinutes,
         customInterval: profile.intervalMinutes
       }));
    }
  }, [config.profileId]);

  const startTest = useCallback(() => {
    setPhase(TestPhase.PING);
    setResults(INITIAL_RESULTS);
    setChartData([]);
    setCurrentSpeed(0);
    setProgress(0);
    
    if (appMode === 'LONG_TERM') {
      setTestRecords([]);
      // Set total duration
      const durationSec = (config.customDuration || 60) * 60;
      setTimeRemaining(durationSec);
      setTotalDurationSeconds(durationSec);
      setNextTestIn(0); // Start immediately
    }

    stateRef.current = {
      phase: TestPhase.PING,
      phaseStartTime: Date.now(),
      testStartTime: Date.now(),
      isRunning: true
    };
  }, [appMode, config]);

  const stopTest = useCallback(() => {
    setPhase(TestPhase.IDLE);
    setCurrentSpeed(0);
    stateRef.current.isRunning = false;
  }, []);

  const saveRecord = (res: TestResults) => {
    const status = res.ping > 100 || res.download < 5 || res.loss > 2 ? 'WARNING' : 'OK'; 
    const newRecord: TestRecord = {
      id: Date.now(),
      timestamp: new Date(),
      ping: res.ping,
      download: res.download,
      upload: res.upload,
      status: status
    };
    setTestRecords(prev => [...prev, newRecord]);
  };

  // Toggle Theme Easter Egg
  const toggleTheme = () => {
    setTheme(prev => prev === 'o2' ? 'nordic' : 'o2');
  };

  // Main Loop
  useEffect(() => {
    if (phase === TestPhase.IDLE && !stateRef.current.isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const currentPhase = stateRef.current.phase;
      
      // --- PROGRESS CALCULATION ---
      if (appMode === 'LONG_TERM') {
        if (totalDurationSeconds > 0) {
            const elapsed = totalDurationSeconds - timeRemaining;
            const p = (elapsed / totalDurationSeconds) * 100;
            setProgress(Math.min(99.9, p)); // Keep it under 100 until finished
        }
      } else {
        // Instant Mode Progress
        const testElapsed = now - stateRef.current.testStartTime;
        const p = (testElapsed / INSTANT_TOTAL_DURATION) * 100;
        setProgress(Math.min(100, p));
      }

      // Update Timers for Long Term
      if (appMode === 'LONG_TERM' && stateRef.current.isRunning) {
         if (timeRemaining > 0) setTimeRemaining(t => Math.max(0, t - (TICK_RATE/1000)));
         else {
            // End of total duration
            setPhase(TestPhase.COMPLETE);
            stateRef.current.isRunning = false;
            setProgress(100);
            return;
         }

         // Handle Waiting Phase for Intervals
         if (currentPhase === TestPhase.WAITING) {
             setNextTestIn(t => Math.max(0, t - (TICK_RATE/1000)));
             if (nextTestIn <= 0) {
                 // Start next cycle
                 setPhase(TestPhase.PING);
                 setResults(INITIAL_RESULTS);
                 stateRef.current.phaseStartTime = now;
             }
             return; // Skip simulation logic while waiting
         }
      }

      const phaseElapsed = now - stateRef.current.phaseStartTime;

      // --- SIMULATION LOGIC ---

      if (currentPhase === TestPhase.PING) {
        // PING PHASE
        // More realistic ping for mobile/broadband: 25-45ms
        const currentPing = 25 + Math.random() * 20; 
        const currentJitter = Math.random() * 8;
        const currentLoss = Math.random() > 0.98 ? Math.random() * 1 : 0; 
        
        setResults(prev => ({ ...prev, ping: currentPing, jitter: currentJitter, loss: currentLoss }));

        if (phaseElapsed > PING_DURATION) {
          setPhase(TestPhase.DOWNLOAD);
          stateRef.current.phaseStartTime = now;
        }
      }
      else if (currentPhase === TestPhase.DOWNLOAD) {
        // DOWNLOAD PHASE
        // Realistic target speeds based on user feedback (approx 50Mbps default)
        let targetSpeed = 55; // Default for LTE/VDSL
        if (config.profileId.includes('streaming')) targetSpeed = 150; // Higher for 5G/Optics simulation
        else if (config.profileId.includes('gamer')) targetSpeed = 60;
        else if (config.profileId.includes('quick-general')) targetSpeed = 48; // Matches observed 50.11

        const speed = simulateSpeed(phaseElapsed, targetSpeed, DOWNLOAD_DURATION);
        setCurrentSpeed(speed);
        setResults(prev => ({ ...prev, download: speed }));
        
        setChartData(prev => {
          const newData = [...prev, { time: now, value: speed }];
          if (newData.length > 80) newData.shift();
          return newData;
        });

        if (phaseElapsed > DOWNLOAD_DURATION) {
          setPhase(TestPhase.UPLOAD);
          stateRef.current.phaseStartTime = now;
        }
      }
      else if (currentPhase === TestPhase.UPLOAD) {
        // UPLOAD PHASE
        // Realistic upload (approx 30Mbps default)
        let targetSpeed = 32; // Matches observed 33.02
        if (config.profileId.includes('office')) targetSpeed = 40; 
        else if (config.profileId.includes('streaming')) targetSpeed = 50;

        const speed = simulateSpeed(phaseElapsed, targetSpeed, UPLOAD_DURATION);
        setCurrentSpeed(speed);
        setResults(prev => ({ ...prev, upload: speed }));
        
        setChartData(prev => {
          const newData = [...prev, { time: now, value: speed }];
          if (newData.length > 80) newData.shift();
          return newData;
        });

        if (phaseElapsed > UPLOAD_DURATION) {
          // End of cycle
          if (appMode === 'LONG_TERM') {
             saveRecord({ ...results, upload: speed }); 

             // Decide next step
             const intervalMin = config.customInterval || 1; // Default to 1 min if 0/undefined to avoid loop
             if (intervalMin > 0) {
                setPhase(TestPhase.WAITING);
                setNextTestIn(intervalMin * 60); // Convert minutes to seconds
                setCurrentSpeed(0);
             } else {
                // Continuous (if interval is 0, though UI usually sets min 1 or implies nonstop)
                setPhase(TestPhase.PING);
                stateRef.current.phaseStartTime = now;
             }
          } else {
             setPhase(TestPhase.COMPLETE);
             stateRef.current.isRunning = false;
             setCurrentSpeed(0);
             setProgress(100);
          }
        }
      }

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [phase, config, appMode, timeRemaining, nextTestIn, results, totalDurationSeconds]); 

  // Helper to format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const primaryColor = theme === 'o2' ? 'text-o2' : 'text-nordic';
  const primaryBg = theme === 'o2' ? 'bg-o2 shadow-o2/20' : 'bg-nordic shadow-nordic/20';
  const primaryBorder = theme === 'o2' ? 'border-o2' : 'border-nordic';

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-950 text-slate-100 font-sans selection:bg-o2/30">
      
      {/* Professional Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
             {/* Logo with Easter Egg Theme Switcher */}
             <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 group transition-transform active:scale-95"
                title="Toggle Theme"
             >
                <span className={`text-xl font-bold tracking-tighter text-white group-hover:scale-110 transition-transform duration-300 ${theme === 'nordic' ? 'text-nordic' : ''}`}>
                  {theme === 'nordic' ? 'Nordic' : <>O<sub className="text-xs">2</sub>N</>}
                </span>
                <span className="h-6 w-px bg-slate-700 mx-2"></span>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Diagnostika</span>
             </button>
           </div>
           
           <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
             <button 
               onClick={() => handleModeChange('INSTANT')}
               className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wide ${appMode === 'INSTANT' ? `${primaryBg} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
             >
               Rychlý Test
             </button>
             <button 
               onClick={() => handleModeChange('LONG_TERM')}
               className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wide ${appMode === 'LONG_TERM' ? `${primaryBg} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
             >
               Dlouhodobý Monitoring
             </button>
           </div>
        </div>
      </header>

      <main className="w-full max-w-7xl px-6 py-8 flex flex-col gap-6">
        
        {/* Status Bar for Long Term */}
        {appMode === 'LONG_TERM' && (phase !== TestPhase.IDLE || testRecords.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4">
            <div className={`glass-panel p-4 rounded-lg flex items-center justify-between border-l-2 ${primaryBorder} bg-gradient-to-r from-white/5 to-transparent`}>
               <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Zbývající Čas</div>
               <div className="text-xl font-mono font-bold text-white">{formatTime(timeRemaining)}</div>
            </div>
            <div className="glass-panel p-4 rounded-lg flex items-center justify-between border-l-2 border-indigo-500 bg-gradient-to-r from-indigo-500/10 to-transparent">
               <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Příští měření</div>
               <div className="text-xl font-mono font-bold text-indigo-300">
                  {phase === TestPhase.WAITING ? formatTime(nextTestIn) : 'PROBÍHÁ'}
               </div>
            </div>
            <div className="glass-panel p-4 rounded-lg flex items-center justify-between border-l-2 border-slate-500 bg-gradient-to-r from-slate-500/10 to-transparent">
               <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Záznamů</div>
               <div className="text-xl font-mono font-bold text-slate-200">{testRecords.length}</div>
            </div>
          </div>
        )}

        {/* Global Progress Bar - Visible when running or complete */}
        {(phase !== TestPhase.IDLE || progress > 0) && (
           <ProgressBar 
              progress={progress} 
              label={appMode === 'LONG_TERM' ? 'Postup Monitoringu' : 'Průběh Testu'} 
              sublabel={appMode === 'LONG_TERM' ? `${formatTime(totalDurationSeconds - timeRemaining)} uplynulo` : undefined}
              isLongTerm={appMode === 'LONG_TERM'}
              theme={theme}
           />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Controls & Config */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
             <div className="glass-panel p-6 rounded-xl border border-slate-800">
                <ProfileSelector 
                  profiles={activeProfiles} 
                  selectedProfileId={config.profileId} 
                  onSelect={(id) => setConfig(prev => ({...prev, profileId: id}))}
                  disabled={phase !== TestPhase.IDLE && phase !== TestPhase.COMPLETE}
                  customDuration={config.customDuration || 0}
                  customInterval={config.customInterval || 0}
                  onCustomChange={(f, v) => setConfig(prev => ({...prev, [f === 'duration' ? 'customDuration' : 'customInterval']: v}))}
                  theme={theme}
                />

                <div className="mt-6 pt-6 border-t border-slate-800">
                  <SettingsPanel 
                     servers={SERVERS} 
                     config={config} 
                     onConfigChange={setConfig} 
                     disabled={phase !== TestPhase.IDLE && phase !== TestPhase.COMPLETE}
                     theme={theme}
                  />
                </div>
             </div>
             
             {/* Simple Info Box */}
             <div className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/30">
                <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-tight">
                  <Info size={12} className="mt-0.5 flex-shrink-0" />
                  <p>
                    {appMode === 'LONG_TERM' 
                      ? 'Pro dlouhodobý monitoring nechte prohlížeč otevřený. Systém zabrání uspání zařízení.' 
                      : 'Rychlý test změří latenci, jitter, download a upload a porovná je s vybraným scénářem.'}
                  </p>
                </div>
             </div>
          </div>

          {/* RIGHT: Visuals & Data */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Live Visualizer */}
            <div className="glass-panel p-8 rounded-xl border border-slate-800 relative overflow-hidden">
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
               
               <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
                 <div className={`w-2 h-2 rounded-full ${phase === TestPhase.IDLE ? 'bg-slate-700' : `${theme === 'o2' ? 'bg-o2' : 'bg-nordic'} animate-pulse`}`}></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                   {phase === TestPhase.WAITING ? 'Čekání na interval' : phase === TestPhase.IDLE ? 'Připraveno' : 'Měření probíhá'}
                 </span>
               </div>

               <div className="flex flex-col xl:flex-row items-center gap-12 mt-8 relative z-10">
                  <div className="flex-shrink-0">
                    <SpeedGauge 
                        speed={currentSpeed} 
                        phase={phase === TestPhase.WAITING ? TestPhase.IDLE : phase} 
                        onStart={startTest}
                        onStop={stopTest}
                        theme={theme}
                    />
                  </div>
                  <div className="flex-1 w-full min-h-[250px]">
                    <RealTimeChart data={chartData} phase={phase} theme={theme} />
                  </div>
               </div>

               <StatsGrid results={results} phase={phase} theme={theme} />
            </div>

            {/* QUICK TEST SUMMARY */}
            {appMode === 'INSTANT' && phase === TestPhase.COMPLETE && (
                <div className={`glass-panel p-6 rounded-xl border-l-4 ${primaryBorder} animate-in fade-in zoom-in-95 duration-500`}>
                    <h4 className={`text-sm font-bold uppercase mb-2 flex items-center gap-2 ${primaryColor}`}>
                        <CheckCircle2 size={18} /> Vyhodnocení testu
                    </h4>
                    <p className="text-lg text-slate-200 font-medium leading-relaxed">
                        {evaluateQuickTest(results, config.profileId)}
                    </p>
                </div>
            )}

            {/* Long Term Log */}
            {appMode === 'LONG_TERM' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TestLog records={testRecords} />
                {(phase === TestPhase.COMPLETE || testRecords.length > 0) && (
                   <ExportPanel 
                     records={testRecords} 
                     profileName={ALL_PROFILES.find(p => p.id === config.profileId)?.name || 'Vlastní'} 
                     config={{
                       serverName: SERVERS.find(s => s.id === config.serverId)?.name,
                       duration: config.customDuration,
                       interval: config.customInterval
                     }}
                     theme={theme}
                   />
                )}
              </div>
            )}
            
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
