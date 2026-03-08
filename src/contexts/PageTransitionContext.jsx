import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PageTransitionContext = createContext(null);

export const usePageTransition = () => {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) throw new Error('usePageTransition must be inside PageTransitionProvider');
  return ctx;
};

/* ─── Overlay styles injected once ─── */
const OVERLAY_CSS = `
  @keyframes ptCurtainIn {
    0%   { transform: scaleX(0); transform-origin: left; }
    100% { transform: scaleX(1); transform-origin: left; }
  }
  @keyframes ptCurtainOut {
    0%   { transform: scaleX(1); transform-origin: right; }
    100% { transform: scaleX(0); transform-origin: right; }
  }
  @keyframes ptLogoFadeIn {
    0%   { opacity: 0; transform: translateY(12px) scale(0.94); }
    100% { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes ptLogoFadeOut {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes ptShine {
    from { left: -80%; }
    to   { left: 130%; }
  }

  .pt-overlay {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    pointer-events: all;
    overflow: hidden;
  }

  /* Curtain panel */
  .pt-curtain {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
  }
  .pt-curtain.entering {
    animation: ptCurtainIn 0.42s cubic-bezier(0.76, 0, 0.24, 1) forwards;
  }
  .pt-curtain.leaving {
    animation: ptCurtainOut 0.38s cubic-bezier(0.76, 0, 0.24, 1) forwards;
  }

  /* Shine sweep over curtain */
  .pt-curtain::after {
    content: '';
    position: absolute; top: 0; left: -80%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    transform: skewX(-15deg);
    animation: ptShine 0.8s ease-out 0.2s forwards;
  }

  /* Center logo / content */
  .pt-center {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center; gap: 1rem;
  }
  .pt-logo-box {
    width: 3.5rem; height: 3.5rem; border-radius: 1rem;
    background: linear-gradient(135deg, #2563EB, #1D4ED8);
    box-shadow: 0 0 40px rgba(37,99,235,0.5), 0 0 0 1px rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
  }
  .pt-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em;
    color: rgba(248,250,252,0.9);
  }
  .pt-logo-text span {
    background: linear-gradient(135deg,#60A5FA,#93C5FD);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .pt-dest-label {
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(248,250,252,0.35);
    animation: ptLogoFadeIn 0.3s 0.25s ease-out both;
  }
  .pt-center.show {
    animation: ptLogoFadeIn 0.35s 0.15s cubic-bezier(0.16,1,0.3,1) both;
  }
  .pt-center.hide {
    animation: ptLogoFadeOut 0.2s ease-in forwards;
  }

  /* Blue accent bar at top */
  .pt-progress {
    position: absolute; top: 0; left: 0; height: 3px;
    background: linear-gradient(90deg,#2563EB,#60A5FA,#2563EB);
    background-size: 200% 100%;
    animation: ptProgressBar 0.8s ease-out 0.1s both;
  }
  @keyframes ptProgressBar {
    0%   { width: 0; }
    60%  { width: 70%; }
    100% { width: 100%; }
  }
`;

let cssInjected = false;
const injectCSS = () => {
  if (cssInjected) return;
  const el = document.createElement('style');
  el.id = 'pt-styles';
  el.textContent = OVERLAY_CSS;
  document.head.appendChild(el);
  cssInjected = true;
};

/* ─── Provider ─── */
export const PageTransitionProvider = ({ children }) => {
  injectCSS();
  const navigate = useNavigate();
  const [state, setState] = useState(null); // null | { phase: 'entering'|'visible'|'leaving', label }
  const timerRef = useRef([]);

  const clearTimers = () => { timerRef.current.forEach(clearTimeout); timerRef.current = []; };

  const navigateTo = useCallback((to, label = '') => {
    clearTimers();

    // Phase 1: curtain sweeps IN
    setState({ phase: 'entering', label });

    const t1 = setTimeout(() => {
      // Phase 2: curtain fully visible → navigate
      setState({ phase: 'visible', label });
      navigate(to);

      const t2 = setTimeout(() => {
        // Phase 3: curtain sweeps OUT
        setState({ phase: 'leaving', label });

        const t3 = setTimeout(() => {
          setState(null);
        }, 420);
        timerRef.current.push(t3);
      }, 180);
      timerRef.current.push(t2);
    }, 440);
    timerRef.current.push(t1);
  }, [navigate]);

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      {children}
      {state && <TransitionOverlay phase={state.phase} label={state.label} />}
    </PageTransitionContext.Provider>
  );
};

/* ─── Overlay UI ─── */
const HammerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 5L19 9M5.68 19.32a2.4 2.4 0 003.39 0l9.26-9.26a2.4 2.4 0 000-3.39L16.34 4.68a2.4 2.4 0 00-3.39 0L3.68 13.93a2.4 2.4 0 000 3.39l2 2z"/>
  </svg>
);

const TransitionOverlay = ({ phase, label }) => (
  <div className="pt-overlay">
    <div className={`pt-curtain ${phase === 'leaving' ? 'leaving' : 'entering'}`} />
    <div className="pt-progress" />
    <div className={`pt-center ${phase === 'leaving' ? 'hide' : 'show'}`}>
      <div className="pt-logo-box"><HammerIcon /></div>
      <div className="pt-logo-text">Đấu Giá <span>Realtime</span></div>
      {label && <div className="pt-dest-label">{label}</div>}
    </div>
  </div>
);

export default PageTransitionProvider;
