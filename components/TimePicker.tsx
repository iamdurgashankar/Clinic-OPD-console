
import React, { useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  required?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className, required }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Try to open the picker programmatically for better desktop UX
    // Do NOT prevent default behavior to ensure mobile compatibility
    try {
      const target = e.target as HTMLInputElement;
      if (typeof target.showPicker === 'function') {
         target.showPicker();
      }
    } catch (error) {
      // Fallback to native behavior
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "Select Time";
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="relative w-full group cursor-pointer">
      {/* Custom Visual Layer */}
      <div 
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all group-hover:border-teal-400 group-hover:bg-white group-focus-within:border-teal-500 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-teal-500/10 ${className}`}
      >
        <span className={`font-medium ${value ? "text-slate-800" : "text-slate-400"}`}>
          {value ? formatTime(value) : "Select Time"}
        </span>
        <Clock size={18} className="text-teal-600 transition-transform group-hover:scale-110" />
      </div>
      
      {/* Hidden Native Input covering the entire area */}
      <input
        ref={inputRef}
        type="time"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={handleClick}
        className="absolute inset-0 z-10 h-full w-full opacity-0 cursor-pointer"
        aria-label="Select Time"
      />
    </div>
  );
};
