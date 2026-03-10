import { createContext, useContext, useState, useEffect } from 'react';

const CountdownContext = createContext(null);

export function CountdownProvider({ children }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CountdownContext.Provider value={{ now }}>
      {children}
    </CountdownContext.Provider>
  );
}

export function useCountdown() {
  const ctx = useContext(CountdownContext);
  if (!ctx) {
    return { now: Date.now() };
  }
  return ctx;
}
