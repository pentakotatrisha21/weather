
import React from 'react';

interface WeatherCardProps {
  label: string;
  value: string;
  icon: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ label, value, icon }) => {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 hover:bg-white/10 transition-colors">
      <i className={`${icon} text-2xl text-blue-400`}></i>
      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
};

export default WeatherCard;
