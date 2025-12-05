
import React from 'react';
import { Download, Mail, FileText } from 'lucide-react';
import { TestRecord } from '../types';
import { createExportContent, generateReportSummary } from '../utils/simulation';

interface ExportPanelProps {
  records: TestRecord[];
  profileName: string;
  config: any;
  theme: 'o2' | 'nordic';
}

const ExportPanel: React.FC<ExportPanelProps> = ({ records, profileName, config, theme }) => {
  const summary = generateReportSummary(records, profileName);
  const exportContent = createExportContent(records, { ...config, profileName }, summary);

  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `O2N_Diagnostika_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Výsledek měření O2N - ${config.profileName}`);
    const body = encodeURIComponent(`Dobrý den,\n\nv příloze zasílám diagnostický log.\n\nSouhrn:\n${summary}\n\n(Prosím přiložte stažený .txt soubor)`);
    window.location.href = `mailto:ppix50@gmail.com?subject=${subject}&body=${body}`;
  };

  const borderColor = theme === 'o2' ? 'border-o2' : 'border-nordic';
  const iconColor = theme === 'o2' ? 'text-o2' : 'text-nordic';
  const buttonBg = theme === 'o2' ? 'bg-o2 hover:bg-o2-dark' : 'bg-nordic hover:bg-nordic-dim';
  const shadowColor = theme === 'o2' ? 'shadow-o2/20' : 'shadow-nordic/20';

  return (
    <div className={`w-full glass-panel p-6 rounded-xl border-l-4 ${borderColor} mt-6 bg-gradient-to-r from-white/5 to-transparent`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className={`${iconColor} font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-wide`}>
            <FileText size={16}/> Diagnostický Závěr
          </h4>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">
            {summary}
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Závěr byl vygenerován automaticky na základě {records.length} měření.
          </p>
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-auto min-w-[200px]">
          <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase py-3 px-6 rounded-lg transition-colors border border-slate-700"
          >
            <Download size={14} /> Stáhnout TXT
          </button>
          <button 
            onClick={handleEmail}
            className={`flex items-center justify-center gap-2 ${buttonBg} text-white text-xs font-bold uppercase py-3 px-6 rounded-lg transition-colors shadow-lg ${shadowColor}`}
          >
            <Mail size={14} /> Odeslat e-mailem
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
