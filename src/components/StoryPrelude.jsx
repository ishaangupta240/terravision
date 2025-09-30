import { useEffect, useMemo, useRef } from 'react';
import './StoryPrelude.css';

const StoryPrelude = ({
  profile,
  mission,
  onContinue,
  onDownload,
  isDownloading,
  downloadFeedback,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const bounds = node.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;
      node.style.setProperty('--tilt-x', `${(relativeY - 0.5) * -18}deg`);
      node.style.setProperty('--tilt-y', `${(relativeX - 0.5) * 18}deg`);
      node.style.setProperty('--glow-x', `${relativeX * 100}%`);
      node.style.setProperty('--glow-y', `${relativeY * 100}%`);
    };

    const handlePointerLeave = () => {
      node.style.setProperty('--tilt-x', '0deg');
      node.style.setProperty('--tilt-y', '0deg');
      node.style.setProperty('--glow-x', '50%');
      node.style.setProperty('--glow-y', '50%');
    };

    node.addEventListener('pointermove', handlePointerMove);
    node.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  const headline = useMemo(() => `Agent ${profile.name}`, [profile.name]);
  const subline = useMemo(() => `${mission.title} · Clearance TerraVision`, [mission.title]);

  const timeline = useMemo(
    () => [
      {
        label: '2050: Activation',
        detail: `At ${profile.ageIn2050} years old, you are drafted into the ${mission.title} cohort.`,
      },
      {
        label: '2055: First Accord',
        detail: 'You sequence cross-planet climate accords, knitting orbital and ocean defenses into one lattice.',
      },
      {
        label: '2060: Living Grid',
        detail: 'Your network balances solar mirrors, tidal farms, and bio-harmonic cities across four hemispheres.',
      },
    ],
    [mission.title, profile.ageIn2050]
  );

  return (
    <article ref={containerRef} className="story-prelude" aria-labelledby="story-prelude-heading">
      <div className="story-prelude__halo" aria-hidden />
      <div className="story-prelude__card">
        <header className="story-prelude__header">
          <p className="story-prelude__eyebrow">Prelude Transmission</p>
          <h1 id="story-prelude-heading">{headline}</h1>
          <p className="story-prelude__subline">{subline}</p>
        </header>

        <section className="story-prelude__grid">
          <div className="story-prelude__mission">
            <h2>Why you?</h2>
            <p>
              TerraVision records indicate consistent resilience since <strong>{profile.birthYear}</strong> and a
              proclivity for systems thinking under pressure. Your passport ID <strong>{profile.passportId}</strong> now
              authorizes orbital access lanes throughout the Solace Network.
            </p>
            <p>
              Mission brief: <em>{mission.brief}</em>
            </p>
          </div>

          <div className="story-prelude__timeline" aria-label="Mission milestones">
            {timeline.map((entry) => (
              <div key={entry.label} className="story-prelude__timeline-stop">
                <span className="story-prelude__timeline-label">{entry.label}</span>
                <p>{entry.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="story-prelude__actions">
          <button type="button" className="story-prelude__continue" onClick={onContinue}>
            Enter TerraVision Journey
          </button>
          <div className="story-prelude__download">
            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="story-prelude__download-btn"
            >
              {isDownloading ? 'Preparing Passport…' : 'Download Passport'}
            </button>
            {downloadFeedback ? <span>{downloadFeedback}</span> : null}
          </div>
        </footer>
      </div>
    </article>
  );
};

export default StoryPrelude;
