import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SLATimerProps {
  label: string;
  dueDate?: string | undefined;
  isCompleted?: boolean;
  completedAt?: string | undefined;
  type: 'response' | 'resolution';
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isOverdue: boolean;
}

const SLATimer: React.FC<SLATimerProps> = ({ 
  label, 
  dueDate, 
  isCompleted = false, 
  completedAt, 
  type, 
  className = '' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  const calculateTimeRemaining = (): TimeRemaining | null => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    const isOverdue = diffMs < 0;
    const absMs = Math.abs(diffMs);
    
    const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
    
    return {
      days,
      hours,
      minutes,
      seconds,
      totalMs: diffMs,
      isOverdue
    };
  };

  useEffect(() => {
    if (!dueDate || isCompleted) return;

    const timer = setInterval(() => {
      const time = calculateTimeRemaining();
      setTimeRemaining(time);
    }, 1000);

    // Initial calculation
    const time = calculateTimeRemaining();
    setTimeRemaining(time);

    return () => clearInterval(timer);
  }, [dueDate, isCompleted]);

  const formatTime = (time: TimeRemaining): string => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else if (time.minutes > 0) {
      return `${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.seconds}s`;
    }
  };

  const getBreachStatus = () => {
    if (!completedAt || !dueDate) return null;
    
    const completed = new Date(completedAt);
    const due = new Date(dueDate);
    const diffMs = completed.getTime() - due.getTime();
    
    if (diffMs <= 0) {
      const earlyMs = Math.abs(diffMs);
      const earlyMinutes = Math.floor(earlyMs / (1000 * 60));
      const earlyHours = Math.floor(earlyMinutes / 60);
      
      if (earlyHours > 0) {
        return { withinSLA: true, text: `Completed ${earlyHours}h ${earlyMinutes % 60}m early` };
      } else {
        return { withinSLA: true, text: `Completed ${earlyMinutes}m early` };
      }
    } else {
      const lateMs = diffMs;
      const lateMinutes = Math.floor(lateMs / (1000 * 60));
      const lateHours = Math.floor(lateMinutes / 60);
      
      if (lateHours > 0) {
        return { withinSLA: false, text: `SLA breached by ${lateHours}h ${lateMinutes % 60}m` };
      } else {
        return { withinSLA: false, text: `SLA breached by ${lateMinutes}m` };
      }
    }
  };

  if (!dueDate) {
    return (
      <div className={`inline-flex items-center px-3 py-2 rounded-xl font-semibold bg-gray-100 text-gray-600 ${className}`}>
        <Clock className="h-4 w-4 mr-2" />
        No SLA set
      </div>
    );
  }

  if (isCompleted && completedAt) {
    const breachStatus = getBreachStatus();
    if (!breachStatus) return null;
    
    return (
      <div className={`inline-flex items-center px-3 py-2 rounded-xl font-semibold ${
        breachStatus.withinSLA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      } ${className}`}>
        {breachStatus.withinSLA ? 
          <CheckCircle className="h-4 w-4 mr-2" /> : 
          <XCircle className="h-4 w-4 mr-2" />
        }
        {breachStatus.text}
      </div>
    );
  }

  if (!timeRemaining) return null;

  const getPriorityColor = () => {
    if (timeRemaining.isOverdue) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (timeRemaining.totalMs < 5 * 60 * 1000) { // Less than 5 minutes
      return 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse';
    } else if (timeRemaining.totalMs < 15 * 60 * 1000) { // Less than 15 minutes
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return type === 'response' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getIcon = () => {
    if (timeRemaining.isOverdue) {
      return <AlertTriangle className="h-4 w-4 mr-2 animate-bounce" />;
    } else if (timeRemaining.totalMs < 5 * 60 * 1000) {
      return <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" />;
    } else {
      return <Clock className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-xl font-semibold border-2 transition-all duration-300 ${getPriorityColor()} ${className}`}>
      {getIcon()}
      <div>
        <span className="block text-xs font-normal opacity-80">{label}</span>
        <span className="block">
          {timeRemaining.isOverdue ? 'Overdue by ' : ''}{formatTime(timeRemaining)}
          {!timeRemaining.isOverdue && ' remaining'}
        </span>
      </div>
    </div>
  );
};

export default SLATimer;