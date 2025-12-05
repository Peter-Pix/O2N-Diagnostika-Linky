import React, { useRef, useEffect } from 'react';
import { TestRecord } from '../types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface TestLogProps {
  records: TestRecord[];
}

const TestLog: React.FC<TestLogProps> = ({ records }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-lg bg-slate-900/50">
        <span className="text-slate-600 text-xs font-mono uppercase">Žádná data k zobrazení.</span>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Historie Měření</h3>
        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">{records.length} ZÁZNAMŮ</span>
      </div>
      
      <div className="glass-panel rounded-lg overflow-hidden border border-slate-800">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-2 p-3 bg-slate-900/50 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
          <div className="col-span-1">Čas</div>
          <div className="text-right">Ping</div>
          <div className="text-right">Download</div>
          <div className="text-right">Upload</div>
          <div className="text-center">Stav</div>
        </div>

        {/* Scrollable List */}
        <div className="max-h-60 overflow-y-auto custom-scrollbar">
          {records.map((record) => (
            <div key={record.id} className="grid grid-cols-5 gap-2 p-2 text-sm border-b border-slate-800 hover:bg-slate-800/30 transition-colors items-center">
              <div className="col-span-1 font-mono text-slate-400 text-xs">
                {record.timestamp.toLocaleTimeString('cs-CZ')}
              </div>
              <div className="text-right font-mono text-slate-300">{record.ping.toFixed(0)} ms</div>
              <div className="text-right font-mono text-nordic">{record.download.toFixed(1)}</div>
              <div className="text-right font-mono text-purple-400">{record.upload.toFixed(1)}</div>
              <div className="flex justify-center">
                {record.status === 'OK' && <CheckCircle size={14} className="text-nordic" />}
                {record.status === 'WARNING' && <Clock size={14} className="text-yellow-500" />}
                {record.status === 'ERROR' && <AlertCircle size={14} className="text-red-500" />}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
};

export default TestLog;