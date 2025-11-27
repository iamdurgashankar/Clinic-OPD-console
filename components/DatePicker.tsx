import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className, required }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    // Explicitly trigger the picker when container is clicked
    if (inputRef.current) {
      try {
        inputRef.current.showPicker();
      } catch (e) {
        // Fallback for older browsers
        inputRef.current.focus();
        inputRef.current.click();
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Select Date";
    // Parse manually to avoid timezone shifting issues (UTC vs Local)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="relative w-full group cursor-pointer" 
      onClick={handleContainerClick}
    >
      {/* Custom Visual Layer */}
      <div 
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all group-hover:border-teal-400 group-hover:bg-white group-focus-within:border-teal-500 group-focus-within:bg-white group-focus-within:ring-4 group-focus-within:ring-teal-500/10 ${className}`}
      >
        <span className={`font-medium ${value ? "text-slate-800" : "text-slate-400"}`}>
          {value ? formatDate(value) : "Select Date"}
        </span>
        <Calendar size={18} className="text-teal-600 transition-transform group-hover:scale-110" />
      </div>
      
      {/* Hidden Native Input */}
      <input
        ref={inputRef}
        type="date"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 z-10 h-full w-full opacity-0 cursor-pointer"
        aria-label="Select Date"
        onClick={(e) => {
          // Stop bubbling to prevent double triggering if parent handles click
          e.stopPropagation();
        }}
      />
    </div>
  );
};