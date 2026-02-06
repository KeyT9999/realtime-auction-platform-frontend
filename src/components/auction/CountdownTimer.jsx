import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CountdownTimer = ({ startTime, endTime, status }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
  });
  const [progress, setProgress] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const totalDuration = end - start;
      const remaining = end - now;

      // Calculate progress (0-100)
      const progressPercent = ((totalDuration - remaining) / totalDuration) * 100;
      setProgress(Math.min(Math.max(progressPercent, 0), 100));

      if (remaining <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
        });
        setIsWarning(false);
        setIsCritical(false);
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalMs: remaining,
      });

      // Set warning states
      const totalHours = remaining / (1000 * 60 * 60);
      setIsCritical(totalHours < 1/12); // < 5 minutes
      setIsWarning(totalHours < 1 && totalHours >= 1/12); // < 1 hour but >= 5 minutes
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const hasStarted = new Date() >= new Date(startTime);
  const hasEnded = timeLeft.totalMs <= 0 || status === 3 || status === 4;

  if (!hasStarted) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <p className="text-sm text-blue-600 mb-2">Đấu giá chưa bắt đầu</p>
          <p className="text-lg font-semibold text-blue-800">
            Bắt đầu: {new Date(startTime).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    );
  }

  if (hasEnded) {
    return (
      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">⏰</div>
          <p className="text-2xl font-bold text-gray-700">Đã kết thúc</p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(endTime).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>
    );
  }

  const getBackgroundColor = () => {
    if (isCritical) return 'bg-red-100 border-red-500';
    if (isWarning) return 'bg-orange-50 border-orange-400';
    return 'bg-green-50 border-green-400';
  };

  const getTextColor = () => {
    if (isCritical) return 'text-red-700';
    if (isWarning) return 'text-orange-700';
    return 'text-green-700';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isWarning) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className={`border-2 rounded-lg p-6 transition-colors duration-300 ${getBackgroundColor()}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <p className={`text-sm font-medium ${getTextColor()} mb-1`}>
          {isCritical ? '🔥 SẮP KẾT THÚC!' : isWarning ? '⚠️ Còn ít thời gian' : '⏱️ Thời gian còn lại'}
        </p>
      </div>

      {/* Countdown Display */}
      <div className={`flex justify-center items-center gap-2 mb-4 ${isCritical ? 'animate-pulse' : ''}`}>
        {timeLeft.days > 0 && (
          <>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getTextColor()}`}>
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className={`text-xs ${getTextColor()} opacity-70`}>ngày</div>
            </div>
            <div className={`text-3xl font-bold ${getTextColor()}`}>:</div>
          </>
        )}
        
        <div className="text-center">
          <div className={`text-4xl font-bold ${getTextColor()}`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className={`text-xs ${getTextColor()} opacity-70`}>giờ</div>
        </div>
        
        <div className={`text-3xl font-bold ${getTextColor()}`}>:</div>
        
        <div className="text-center">
          <div className={`text-4xl font-bold ${getTextColor()}`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className={`text-xs ${getTextColor()} opacity-70`}>phút</div>
        </div>
        
        <div className={`text-3xl font-bold ${getTextColor()}`}>:</div>
        
        <div className="text-center">
          <div className={`text-4xl font-bold ${getTextColor()}`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className={`text-xs ${getTextColor()} opacity-70`}>giây</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Bắt đầu</span>
          <span>{progress.toFixed(1)}% đã qua</span>
          <span>Kết thúc</span>
        </div>
      </div>

      {/* End Time Display */}
      <div className="text-center">
        <p className={`text-xs ${getTextColor()} opacity-70`}>
          Kết thúc: {new Date(endTime).toLocaleString('vi-VN')}
        </p>
      </div>

      {/* Warning Message */}
      {isCritical && (
        <div className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md text-center font-semibold animate-pulse">
          ⚡ Đặt giá ngay trước khi kết thúc!
        </div>
      )}
    </div>
  );
};

CountdownTimer.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
};

export default CountdownTimer;
