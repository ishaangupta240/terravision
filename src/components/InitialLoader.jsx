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

  useEffect(() => {
    if (!active || typeof window === 'undefined') {
      return undefined;
    }
    setStepIndex(0);
    const interval = window.setInterval(() => {
      setStepIndex((previous) => (previous + 1) % totalSteps);
    }, 880);
    return () => window.clearInterval(interval);
  }, [active, totalSteps]);

  return (
    <div className={`initial-loader${active ? ' is-visible' : ''}`}> 
      <div className="initial-loader__glow" aria-hidden />
      <div className="initial-loader__content" role="status" aria-live="polite">
        <span className="initial-loader__eyebrow">TerraVision</span>
        <h1>Gateway boot sequence</h1>
        <p>{loaderSteps[stepIndex]}</p>
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
