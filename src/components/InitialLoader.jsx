import { useEffect, useMemo, useState } from 'react';
import './InitialLoader.css';

const loaderSteps = [
  'Calibrating orbital mirrors…',
  'Synching bio-harmonic beacons…',
  'Mapping ocean sanctuaries…',
  'Routing hypercity channels…',
  'Finalizing TerraVision handshake…',
];

const InitialLoader = ({ active }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = useMemo(() => loaderSteps.length, []);
  const progressFraction = useMemo(() => {
    if (totalSteps === 0) {
      return 0;
    }
    return Math.min((stepIndex + 1) / totalSteps, 1);
  }, [stepIndex, totalSteps]);

  useEffect(() => {
    if (!active || typeof window === 'undefined') {
      return undefined;
    }
    setStepIndex(0);
    const interval = window.setInterval(() => {
      setStepIndex((previous) => {
        if (previous >= totalSteps - 1) {
          return totalSteps - 1;
        }
        return previous + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [active, totalSteps]);

  return (
    <div className={`initial-loader${active ? ' is-visible' : ''}`}> 
      <div className="initial-loader__glow" aria-hidden />
      <div className="initial-loader__content" role="status" aria-live="polite">
        <span className="initial-loader__eyebrow">TerraVision</span>
        <h1 className="fade-in-text">Gateway boot sequence</h1>
        <p className="slide-up-text">{loaderSteps[stepIndex]}</p>
        <div className="initial-loader__meter" aria-hidden>
          <span
            className="initial-loader__meter-fill"
            style={{ width: `${progressFraction * 100}%` }}
          />
        </div>
        <div className="initial-loader__progress" aria-hidden>
          {loaderSteps.map((_, index) => (
            <span
              key={index}
              className={`initial-loader__progress-dot${index <= stepIndex ? ' is-active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InitialLoader;