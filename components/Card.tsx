import React from 'react';

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactElement<{ className?: string }>;
  color: 'primary' | 'accent' | 'red';
}

const colorClasses = {
    primary: {
        border: 'border-primary',
        iconBg: 'text-primary/10',
    },
    accent: {
        border: 'border-accent',
        iconBg: 'text-accent/10',
    },
    red: {
        border: 'border-red-500',
        iconBg: 'text-red-500/10',
    }
}

export const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  const classes = colorClasses[color];

  return (
    <div className={`relative bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden border-l-4 ${classes.border}`}>
        <div className="relative z-10">
            <p className={`text-sm font-semibold uppercase text-neutral-500 tracking-wider`}>{title}</p>
            <p className="text-4xl font-bold text-neutral-800 mt-2">{value}</p>
        </div>
        <div className={`absolute -right-4 -bottom-4 ${classes.iconBg}`}>
             {React.cloneElement(icon, { className: 'w-24 h-24' })}
        </div>
    </div>
  );
};