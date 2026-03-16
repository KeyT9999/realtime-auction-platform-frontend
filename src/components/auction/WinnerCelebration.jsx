import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const WinnerCelebration = ({ show, onClose, amount }) => {
  const [visible, setVisible] = useState(false);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Pre-generate confetti and sparkle positions using useMemo
  const confettiPieces = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      colorIndex: Math.floor(Math.random() * 5),
      rotation: Math.random() * 360,
      key: i
    }));
  }, []);

  const sparkles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      fontSize: Math.random() * 20 + 10,
      delay: Math.random() * 2,
      duration: 1 + Math.random(),
      key: i
    }));
  }, []);

  if (!show) return null;

  const colors = ['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Confetti Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces.map((piece) => (
          <div
            key={piece.key}
            className="absolute animate-confetti"
            style={{
              left: `${piece.left}%`,
              top: '-10%',
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          >
            <div
              className={`w-2 h-2 ${colors[piece.colorIndex]}`}
              style={{
                transform: `rotate(${piece.rotation}deg)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Celebration Card */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-300 ${
          visible ? 'scale-100 translate-y-0' : 'scale-0 translate-y-10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trophy Animation */}
        <div className="text-8xl mb-4 animate-bounce">
          🏆
        </div>

        {/* Congratulations Text */}
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-2 animate-pulse">
          Chúc mừng!
        </h2>
        
        <p className="text-xl font-semibold text-gray-800 mb-4">
          Bạn đã thắng đấu giá!
        </p>

        {/* Amount */}
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Giá thắng</p>
          <p className="text-3xl font-bold text-green-600">
            {amount?.toLocaleString('vi-VN')} ₫
          </p>
        </div>

        {/* Celebration Emojis */}
        <div className="flex justify-center gap-2 text-3xl mb-6">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎉</span>
          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎊</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🥳</span>
          <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🎈</span>
        </div>

        {/* Info Message */}
        <p className="text-sm text-gray-600 mb-6">
          Chúng tôi sẽ liên hệ với bạn để hoàn tất giao dịch
        </p>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Đóng
        </button>
      </div>

      {/* Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((sparkle) => (
          <div
            key={`sparkle-${sparkle.key}`}
            className="absolute text-yellow-400 animate-pulse"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              fontSize: `${sparkle.fontSize}px`,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
};

WinnerCelebration.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  amount: PropTypes.number,
};

export default WinnerCelebration;
