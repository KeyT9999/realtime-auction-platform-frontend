import { createContext, useContext, useState, useEffect } from 'react';

const TimerContext = createContext(Date.now());

export const useNow = () => useContext(TimerContext);

export const TimerProvider = ({ children, intervalMs = 1000 }) => {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return (
    <TimerContext.Provider value={now}>
      {children}
    </TimerContext.Provider>
  );
};
