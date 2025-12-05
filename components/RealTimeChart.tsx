
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { SpeedDataPoint, TestPhase } from '../types';

interface RealTimeChartProps {
  data: SpeedDataPoint[];
  phase: TestPhase;
  theme: 'o2' | 'nordic';
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ data, phase, theme }) => {
  const getStrokeColor = () => {
    switch(phase) {
        case TestPhase.UPLOAD: return '#a855f7'; // purple-500
        case TestPhase.PING: return theme === 'o2' ? '#005CFF' : '#84BD00'; 
        default: return theme === 'o2' ? '#005CFF' : '#84BD00'; // Main chart color follows theme
    }
  };

  const formatTime = (time: number) => {
    return new Date(time).toLocaleTimeString('cs-CZ', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="w-full h-64 mt-4 glass-panel rounded-xl p-4 transition-opacity duration-500 border border-slate-800">
      <div className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest flex justify-between">
        <span>Průběh rychlosti</span>
        <span>{phase === TestPhase.IDLE ? 'Neaktivní' : 'Live'}</span>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getStrokeColor()} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={getStrokeColor()} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatTime}
            type="number" 
            domain={['dataMin', 'dataMax']} 
            tick={{fill: '#64748b', fontSize: 10}}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            hide={false} 
            tick={{fill: '#64748b', fontSize: 10}} 
            axisLine={false} 
            tickLine={false}
            width={35}
            mirror
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
             itemStyle={{ color: getStrokeColor() }}
             labelFormatter={(label) => formatTime(label)}
             formatter={(value: number) => [value.toFixed(1) + ' Mb/s', 'Rychlost']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={getStrokeColor()} 
            strokeWidth={2}
            fill="url(#colorSpeed)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeChart;
