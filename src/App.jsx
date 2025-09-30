import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import AuroraBackground from './components/AuroraBackground.jsx';
import PassportForm from './components/PassportForm.jsx';
import PassportCard from './components/PassportCard.jsx';
import InitialLoader from './components/InitialLoader.jsx';
import './App.css';

const StoryPrelude = lazy(() => import('./components/StoryPrelude.jsx'));
const FutureJourney = lazy(() => import('./components/FutureJourney.jsx'));

const COOKIE_NAME = 'terravision_passport_v1';
const LOADER_STORAGE_KEY = 'terravision_intro_seen_v1';

const readPassportCookie = () => {
  if (typeof document === 'undefined') {
    return null;
  }
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) {
    return null;
  }
  try {
    const value = decodeURIComponent(cookie.split('=')[1]);
    return JSON.parse(value);
  } catch (error) {
    console.warn('Unable to parse passport cookie', error);
    return null;
  }
};

const writePassportCookie = (payload) => {
  const expiresInSeconds = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; max-age=${expiresInSeconds}; path=/`;
};

const missions = [
  {
    key: 'solar-architect',
    title: 'Solar Architect',
    brief:
      'Lead the latticework of orbital mirrors that redirect sunlight to revive polar ecosystems and keep cities powered overnight.',
  },
  {
    key: 'ocean-guardian',
    title: 'Ocean Guardian',
    brief: 'Coordinate global reef sanctuaries and steward migrating species back to thriving habitats.',
  },
  {
    key: 'bio-harmonics',
    title: 'Bio Harmonics Engineer',
    brief: 'Compose living materials that flex with climate patterns and regenerate biodiversity in urban cores.',
  },
  {
    key: 'climate-weaver',
    title: 'Climate Weaver',
    brief: 'Sync quantum climate models with community action to hold warming under 1.1°C forever.',
  },
];

const App = () => {
  const [stage, setStage] = useState('form');
  const [profile, setProfile] = useState(null);
  const [mission, setMission] = useState(missions[0]);
  const [passportLocked, setPassportLocked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState('');
  const [shouldRenderLoader, setShouldRenderLoader] = useState(false);
  const [showIntroLoader, setShowIntroLoader] = useState(false);
  const [stageTransitionKey, setStageTransitionKey] = useState(0);
  const feedbackTimer = useRef(null);
  const downloadTargetRef = useRef(null);
  const loaderTimerRef = useRef(null);
  const loaderExitTimerRef = useRef(null);
  const stageFirstRenderRef = useRef(true);

  useEffect(() => {
    const stored = readPassportCookie();
    if (stored && stored.profile) {
      const missionMatch = missions.find((item) => item.key === stored.missionKey) ?? missions[0];
      setProfile(stored.profile);
      setMission(missionMatch);
      setStage('passport');
      setPassportLocked(true);
    }

    return () => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    try {
      const introSeen = window.localStorage.getItem(LOADER_STORAGE_KEY);
      if (!introSeen) {
        setShouldRenderLoader(true);
        window.requestAnimationFrame(() => setShowIntroLoader(true));
        loaderTimerRef.current = window.setTimeout(() => {
          try {
            window.localStorage.setItem(LOADER_STORAGE_KEY, 'true');
          } catch (error) {
            console.warn('Unable to persist intro loader state', error);
          }
          setShowIntroLoader(false);
        }, 3200);
      }
    } catch (error) {
      console.warn('Intro loader initialization skipped', error);
    }

    return () => {
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldRenderLoader || showIntroLoader) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    loaderExitTimerRef.current = window.setTimeout(() => {
      setShouldRenderLoader(false);
      loaderExitTimerRef.current = null;
    }, 600);

    return () => {
      if (loaderExitTimerRef.current) {
        clearTimeout(loaderExitTimerRef.current);
        loaderExitTimerRef.current = null;
      }
    };
  }, [shouldRenderLoader, showIntroLoader]);

  useEffect(() => {
    if (stageFirstRenderRef.current) {
      stageFirstRenderRef.current = false;
      return;
    }
    setStageTransitionKey((value) => value + 1);
  }, [stage]);

  useEffect(() => () => {
    if (loaderTimerRef.current) {
      clearTimeout(loaderTimerRef.current);
    }
    if (loaderExitTimerRef.current) {
      clearTimeout(loaderExitTimerRef.current);
    }
  }, []);

  const handlePassportRequest = useCallback(({ name, dob }) => {
    if (passportLocked) {
      return;
    }

    const [year, month, day] = dob.split('-').map(Number);
    const birthYear = year;
    const ageIn2050 = 2050 - birthYear;

    const sanitizedName = name.trim().toUpperCase();
    const deterministicSeed = sanitizedName.charCodeAt(0) + month * 13 + day * 7 + ageIn2050 * 5;
    const selectedMission = missions[deterministicSeed % missions.length];

    const passportId = `${sanitizedName.slice(0, 2)}-${birthYear % 100}${String(month).padStart(2, '0')}${
      String(day).padStart(2, '0'
    )}-${(deterministicSeed % 9999).toString().padStart(4, '0')}`;

    const displayDob = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${birthYear}`;

    const profilePayload = {
      name: sanitizedName,
      dob: displayDob,
      ageIn2050,
      birthYear,
      passportId,
      sourceDob: dob,
    };

    writePassportCookie({
      profile: profilePayload,
      missionKey: selectedMission.key,
    });

    setProfile(profilePayload);
    setMission(selectedMission);
    setPassportLocked(true);
    setStage('passport');
  }, [passportLocked]);

  const handleDownloadPassport = useCallback(async () => {
    if (!downloadTargetRef.current || !profile) {
      return;
    }

    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }

    setIsDownloading(true);
    setDownloadFeedback('');

    try {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5);
      const dataUrl = await toPng(downloadTargetRef.current, {
        cacheBust: true,
        pixelRatio: pixelRatio < 2 ? 2 : pixelRatio,
        backgroundColor: '#06102a',
      });

      const link = document.createElement('a');
      link.download = `${profile.passportId}-TerraVision-passport.png`;
      link.href = dataUrl;
      link.click();
      setDownloadFeedback('Passport saved to your downloads.');
    } catch (error) {
      console.error('Unable to export passport', error);
      setDownloadFeedback('Export failed. Please try again.');
    } finally {
      setIsDownloading(false);
      feedbackTimer.current = setTimeout(() => setDownloadFeedback(''), 4500);
    }
  }, [profile]);

  const bodyContent = useMemo(() => {
    if (stage === 'passport' && profile) {
      return (
        <PassportCard
          profile={profile}
          mission={mission}
          onLaunch={() => setStage('story')}
          launchLabel="Begin Prelude"
          onDownload={handleDownloadPassport}
          isDownloading={isDownloading}
          downloadFeedback={downloadFeedback}
        />
      );
    }

    if (stage === 'story' && profile) {
      return (
        <Suspense fallback={<div className="journey-loading">Synchronizing TerraVision narrative…</div>}>
          <StoryPrelude
            profile={profile}
            mission={mission}
            onContinue={() => setStage('journey')}
            onDownload={handleDownloadPassport}
            isDownloading={isDownloading}
            downloadFeedback={downloadFeedback}
          />
        </Suspense>
      );
    }

    if (stage === 'journey' && profile) {
      return (
        <Suspense fallback={<div className="journey-loading">Calibrating TerraVision engines…</div>}>
          <FutureJourney profile={profile} />
        </Suspense>
      );
    }

    return <PassportForm onSubmit={handlePassportRequest} locked={passportLocked} />;
  }, [stage, profile, mission, handleDownloadPassport, isDownloading, downloadFeedback, handlePassportRequest, passportLocked]);

  const navItems = useMemo(
    () => [
      { key: 'form', label: 'Request', requiresProfile: false },
      { key: 'passport', label: 'Passport', requiresProfile: true },
      { key: 'story', label: 'Prelude', requiresProfile: true },
      { key: 'journey', label: 'Journey', requiresProfile: true },
    ],
    []
  );

  const canAccessStage = useCallback(
    (targetStage) => {
      if (targetStage === 'form') {
        return !passportLocked;
      }
      if (!profile) {
        return false;
      }
      return true;
    },
    [profile, passportLocked]
  );

  const handleNavSelect = useCallback(
    (targetStage) => {
      if (targetStage === stage) {
        return;
      }
      if (!canAccessStage(targetStage)) {
        return;
      }
      setStage(targetStage);
    },
    [stage, canAccessStage]
  );

  const shellClasses = ['app-shell'];
  if (shouldRenderLoader) {
    shellClasses.push('is-loader-active');
  }

  return (
    <div className={shellClasses.join(' ')}>
      <AuroraBackground />
      {shouldRenderLoader ? <InitialLoader active={showIntroLoader} /> : null}
      <header className="app-nav">
        <div className="app-nav__brand">
          <strong>TerraVision</strong>
          <span>Gateway 2050</span>
        </div>
        <nav className="app-nav__menu" aria-label="Main">
          <ul>
            {navItems.map((item) => {
              const disabled = !canAccessStage(item.key);
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    className={`nav-link${stage === item.key ? ' is-active' : ''}`}
                    onClick={() => handleNavSelect(item.key)}
                    disabled={disabled}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="app-nav__actions">
          {profile ? (
            <button
              type="button"
              className="header-download"
              onClick={handleDownloadPassport}
              disabled={isDownloading}
            >
              {isDownloading ? 'Preparing Passport…' : 'Download Passport'}
            </button>
          ) : null}
          {profile && downloadFeedback ? (
            <span className="header-feedback">{downloadFeedback}</span>
          ) : null}
        </div>
      </header>

      <main className={`content-stage stage-${stage}`}>
        <section key={stageTransitionKey} className={`stage-panel stage-panel-${stage}`}>
          {bodyContent}
        </section>
      </main>

      {profile ? (
        <div className="passport-download-surface" aria-hidden>
          <PassportCard
            ref={downloadTargetRef}
            profile={profile}
            mission={mission}
            onLaunch={() => {}}
            onDownload={() => {}}
            isDownloading={false}
            downloadFeedback=""
            hideActions
          />
        </div>
      ) : null}
    </div>
  );
};

export default App;
