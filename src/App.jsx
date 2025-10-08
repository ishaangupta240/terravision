import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import AuroraBackground from './components/AuroraBackground.jsx';
import PassportForm from './components/PassportForm.jsx';
import PassportCard from './components/PassportCard.jsx';
import InitialLoader from './components/InitialLoader.jsx';
import './App.css';
import Footer from './components/Footer.jsx';
import useAmbientSound from './hooks/useAmbientSound.js';
import { readJourneyCookie } from './utils/journeyStorage.js';

const StoryPrelude = lazy(() => import('./components/StoryPrelude.jsx'));
const FutureJourney = lazy(() => import('./components/FutureJourney.jsx'));

const COOKIE_NAME = 'terravision_passport_v1';

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

const PASSPORT_TRANSITION_MESSAGES = [
  'Connecting to TerraVision main server…',
  'Assigning planetary stewardship mission…',
  'Generating orbital passport credentials…',
];

const JOURNEY_TRANSITION_MESSAGES = [
  'Stabilizing immersive timeline coordinates…',
  'Linking to TerraVision voyage core…',
  'Engaging interplanetary journey systems…',
];

const TRANSITION_TYPING_INTERVAL = 26;
const TRANSITION_MESSAGE_PAUSE = 540;
const TRANSITION_COMPLETION_EXTRA = 700;

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
  const [ambientOn, toggleAmbient, setAmbientEnabled] = useAmbientSound();
  const [navMode, setNavMode] = useState('start');
  const [transition, setTransition] = useState(null);
  const [transitionStep, setTransitionStep] = useState(0);
  const [transitionTyped, setTransitionTyped] = useState([]);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const feedbackTimer = useRef(null);
  const downloadTargetRef = useRef(null);
  const loaderTimerRef = useRef(null);
  const loaderExitTimerRef = useRef(null);
  const stageFirstRenderRef = useRef(true);
  const transitionTimersRef = useRef([]);
  const typingTimerRef = useRef(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountButtonRef = useRef(null);
  const accountMenuRef = useRef(null);
  const accountMenuIdRef = useRef(`account-menu-${Math.random().toString(36).slice(2, 8)}`);
  const mobileNavToggleRef = useRef(null);

  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current && typeof window !== 'undefined') {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  const clearTransitionTimers = useCallback(() => {
    if (transitionTimersRef.current.length === 0) {
      clearTypingTimer();
      return;
    }
    if (typeof window !== 'undefined') {
      transitionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    }
    transitionTimersRef.current = [];
    clearTypingTimer();
  }, [clearTypingTimer]);

  const finalizeTransition = useCallback(() => {
    clearTransitionTimers();
    setTransition((currentTransition) => {
      if (!currentTransition) {
        return null;
      }
      setStage(currentTransition.nextStage);
      if (typeof currentTransition.onComplete === 'function') {
        currentTransition.onComplete();
      }
      return null;
    });
    setTransitionStep(0);
    setTransitionTyped([]);
  }, [clearTransitionTimers]);

  const beginTransition = useCallback(
    (config) => {
      if (!config || stage === 'transition') {
        return;
      }
      clearTransitionTimers();
      const payload = {
        ...config,
        originStage: config.originStage ?? stage,
        messages: config.messages ?? [],
      };
      setTransitionTyped(new Array(payload.messages.length).fill(''));
      setTransition(payload);
      setTransitionStep(0);
      setStage('transition');
    },
    [stage, clearTransitionTimers]
  );

  useEffect(() => {
    clearTransitionTimers();
    if (!transition) {
      return undefined;
    }

    setTransitionStep(0);

    if (typeof window === 'undefined') {
      finalizeTransition();
      return undefined;
    }

    let accumulatedDelay = 0;

    transition.messages.forEach((message, index, array) => {
      if (index === 0) {
        return;
      }
      const previousMessage = array[index - 1] ?? '';
      const previousDuration = previousMessage.length * TRANSITION_TYPING_INTERVAL + TRANSITION_MESSAGE_PAUSE;
      accumulatedDelay += previousDuration;
      const timerId = window.setTimeout(() => {
        setTransitionStep(index);
      }, accumulatedDelay);
      transitionTimersRef.current.push(timerId);
    });

    const lastMessage = transition.messages.at(-1) ?? '';
    const completionDelay =
      accumulatedDelay +
      lastMessage.length * TRANSITION_TYPING_INTERVAL +
      TRANSITION_MESSAGE_PAUSE +
      TRANSITION_COMPLETION_EXTRA;

    const completionTimer = window.setTimeout(() => {
      finalizeTransition();
    }, completionDelay);
    transitionTimersRef.current.push(completionTimer);

    return () => {
      clearTransitionTimers();
    };
  }, [transition, finalizeTransition, clearTransitionTimers]);

  useEffect(() => {
    if (!transition) {
      setTransitionTyped([]);
      clearTypingTimer();
      return undefined;
    }

    const messages = transition.messages;
    if (!messages.length) {
      return undefined;
    }

    const currentIndex = Math.min(transitionStep, messages.length - 1);

    setTransitionTyped(
      messages.map((message, index) => {
        if (index < currentIndex) {
          return message;
        }
        return '';
      })
    );

    const targetMessage = messages[currentIndex] ?? '';
    if (!targetMessage) {
      clearTypingTimer();
      return undefined;
    }

    if (typeof window === 'undefined') {
      setTransitionTyped((prev) => {
        const next = [...prev];
        next[currentIndex] = targetMessage;
        return next;
      });
      return undefined;
    }

    let charIndex = 0;
    clearTypingTimer();
    typingTimerRef.current = window.setInterval(() => {
      charIndex += 1;
      setTransitionTyped((prev) => {
        const next = [...prev];
        next[currentIndex] = targetMessage.slice(0, charIndex);
        return next;
      });
      if (charIndex >= targetMessage.length) {
        clearTypingTimer();
      }
    }, TRANSITION_TYPING_INTERVAL);

    return () => {
      clearTypingTimer();
    };
  }, [transition, transitionStep, clearTypingTimer]);

  useEffect(() => {
    const stored = readPassportCookie();
    if (stored && stored.profile) {
      const missionMatch = missions.find((item) => item.key === stored.missionKey) ?? missions[0];
      setProfile(stored.profile);
      setMission(missionMatch);
      setStage('passport');
      setPassportLocked(true);
      setNavMode('full');
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

    setShouldRenderLoader(true);
    window.requestAnimationFrame(() => setShowIntroLoader(true));

    loaderTimerRef.current = window.setTimeout(() => {
      setShowIntroLoader(false);
    }, 3200);

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

  useEffect(
    () => () => {
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
      }
      if (loaderExitTimerRef.current) {
        clearTimeout(loaderExitTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const storedJourney = readJourneyCookie();
    if (storedJourney?.ambientOn) {
      setAmbientEnabled(true);
    }
  }, [setAmbientEnabled]);

  useEffect(() => {
    if (!profile) {
      setIsAccountMenuOpen(false);
    }
  }, [profile]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [stage]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      setIsAccountMenuOpen(false);
    }
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      if (typeof document !== 'undefined') {
        document.body.style.removeProperty('overflow');
      }
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 860) {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    let previousOverflow;
    if (typeof document !== 'undefined') {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      if (typeof document !== 'undefined') {
        if (previousOverflow) {
          document.body.style.overflow = previousOverflow;
        } else {
          document.body.style.removeProperty('overflow');
        }
      }
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      const button = accountButtonRef.current;
      const menu = accountMenuRef.current;
      if (button && menu && !button.contains(event.target) && !menu.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('pointerdown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isAccountMenuOpen]);

  const handlePassportRequest = useCallback(
    ({ name, dob }) => {
      if (passportLocked) {
        return;
      }

      const [year, month, day] = dob.split('-').map(Number);
      const birthYear = year;
      const ageIn2050 = 2050 - birthYear;

      const sanitizedName = name.trim().toUpperCase();
      const deterministicSeed = sanitizedName.charCodeAt(0) + month * 13 + day * 7 + ageIn2050 * 5;
      const selectedMission = missions[deterministicSeed % missions.length];

      const passportId = `${sanitizedName.slice(0, 2)}-${birthYear % 100}${String(month).padStart(2, '0')}${String(
        day
      ).padStart(2, '0')}-${(deterministicSeed % 9999).toString().padStart(4, '0')}`;

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
      beginTransition({
        id: 'passport-sequence',
        originStage: 'form',
        lead: 'Initializing TerraVision Passport Sequence',
        messages: PASSPORT_TRANSITION_MESSAGES,
        nextStage: 'passport',
        onComplete: () => setNavMode('full'),
      });
    },
    [passportLocked, beginTransition]
  );

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

  const handleJourneyAdvance = useCallback(() => {
    beginTransition({
      id: 'journey-sequence',
      originStage: 'story',
      lead: 'Synchronizing Future Journey Systems',
      messages: JOURNEY_TRANSITION_MESSAGES,
      nextStage: 'journey',
    });
  }, [beginTransition]);

  const bodyContent = useMemo(() => {
    if (stage === 'transition' && transition) {
      const visibleMessages = transition.messages.slice(0, transitionStep + 1);
      return (
        <div className="transition-panel">
          {transition.lead ? <div className="transition-lead">{transition.lead}</div> : null}
          <div className="transition-feed">
            {visibleMessages.map((message, index) => {
              const isCurrent = index === visibleMessages.length - 1;
              const typedValue = index < transitionStep ? message : transitionTyped[index] ?? '';
              const displayText = index < transitionStep ? message : typedValue;
              const isComplete = index < transitionStep || displayText.length >= message.length;
              return (
                <span
                  key={`${transition.id}-${index}`}
                  className={`transition-feed__row${isCurrent ? ' is-current' : ''}${isComplete ? ' is-complete' : ''}`}
                >
                  <span className="transition-feed__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="transition-feed__text">{displayText}</span>
                </span>
              );
            })}
          </div>
        </div>
      );
    }

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
            onContinue={handleJourneyAdvance}
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
          <FutureJourney profile={profile} ambientOn={ambientOn} onAmbientSet={setAmbientEnabled} />
        </Suspense>
      );
    }

    return <PassportForm onSubmit={handlePassportRequest} locked={passportLocked} />;
  }, [
    stage,
    profile,
    mission,
  transition,
  transitionStep,
  transitionTyped,
    handleJourneyAdvance,
    handleDownloadPassport,
    isDownloading,
    downloadFeedback,
    handlePassportRequest,
    passportLocked,
    ambientOn,
    setAmbientEnabled,
  ]);

  const navItems = useMemo(() => {
    if (navMode === 'start') {
      return [{ key: 'form', label: 'Start' }];
    }
    return [
      { key: 'passport', label: 'Passport' },
      { key: 'story', label: 'Prelude' },
      { key: 'journey', label: 'Journey' },
    ];
  }, [navMode]);

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
      if (stage === 'transition') {
        return;
      }
      if (targetStage === stage) {
        return;
      }
      if (!canAccessStage(targetStage)) {
        return;
      }
      setMobileNavOpen(false);
      setIsAccountMenuOpen(false);
      if (targetStage === 'journey' && stage !== 'journey') {
        beginTransition({
          id: 'journey-sequence',
          originStage: stage,
          lead: 'Synchronizing Future Journey Systems',
          messages: JOURNEY_TRANSITION_MESSAGES,
          nextStage: 'journey',
        });
        return;
      }
      setStage(targetStage);
    },
    [stage, canAccessStage, beginTransition, setMobileNavOpen]
  );

  const activeNavStage = stage === 'transition' && transition ? transition.originStage : stage;
  const isTransitioning = stage === 'transition';

  const shellClasses = ['app-shell'];
  if (shouldRenderLoader) {
    shellClasses.push('is-loader-active');
  }

  const navClasses = ['app-nav'];
  if (isMobileNavOpen) {
    navClasses.push('is-mobile-open');
  }

  return (
    <div className={shellClasses.join(' ')}>
      <AuroraBackground />
      {shouldRenderLoader ? <InitialLoader active={showIntroLoader} /> : null}
      <header className={navClasses.join(' ')}>
        <div className="app-nav__row app-nav__row--primary">
          <div className="app-nav__brand">
            <strong>TerraVision</strong>
            <span>Gateway 2050</span>
          </div>
          <button
            type="button"
            className="app-nav__toggle"
            aria-controls="app-nav-drawer"
            aria-expanded={isMobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
            ref={mobileNavToggleRef}
          >
            <span className="visually-hidden">Toggle navigation</span>
            <span aria-hidden className="app-nav__toggle-icon">
              {isMobileNavOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </svg>
              )}
            </span>
            <span className="app-nav__toggle-label" aria-hidden>
              Menu
            </span>
          </button>
          <div className="app-nav__cluster" id="app-nav-drawer">
            <nav className="app-nav__menu" aria-label="Main">
            <ul>
              {navItems.map((item) => {
                const disabled = isTransitioning || !canAccessStage(item.key);
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={`nav-link${activeNavStage === item.key ? ' is-active' : ''}`}
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
              <button
                type="button"
                className={`audio-toggle${ambientOn ? ' is-active' : ''}`}
                onClick={toggleAmbient}
              >
                {ambientOn ? 'Soundscape · On' : 'Soundscape · Off'}
              </button>
              {navMode === 'full' && profile ? (
                <div className="app-nav__account" aria-label="Traveler account">
                  <button
                    type="button"
                    className="account-toggle"
                    aria-haspopup="true"
                    aria-expanded={isAccountMenuOpen}
                    aria-controls={accountMenuIdRef.current}
                    onClick={() => setIsAccountMenuOpen((open) => !open)}
                    ref={accountButtonRef}
                  >
                    <span className="account-icon" aria-hidden>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                        <path d="M4 20a8 8 0 0 1 16 0" />
                      </svg>
                    </span>
                    <span className="account-chevron" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                    <span className="visually-hidden">Account menu</span>
                  </button>
                  <div
                    className={`account-menu${isAccountMenuOpen ? ' is-open' : ''}`}
                    id={accountMenuIdRef.current}
                    ref={accountMenuRef}
                    role="menu"
                  >
                    <div className="account-menu__header">
                      <span className="account-menu__name">{profile.name ?? 'Envoy'}</span>
                      <span className="account-menu__id">Passport ID: {profile.passportId}</span>
                    </div>
                    <div className="account-menu__meta">
                      <span>Age in 2050: {profile.ageIn2050 ?? '—'}</span>
                    </div>
                    <div className="account-menu__actions">
                      <button
                        type="button"
                        className="header-download"
                        onClick={handleDownloadPassport}
                        disabled={isDownloading}
                      >
                        {isDownloading ? 'Preparing Passport…' : 'Download Passport'}
                      </button>
                      {downloadFeedback ? <span className="header-feedback">{downloadFeedback}</span> : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <div
        className={`app-nav__scrim${isMobileNavOpen ? ' is-active' : ''}`}
        role="presentation"
        onClick={() => setMobileNavOpen(false)}
      />

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
      <Footer />
    </div>
  );
};

export default App;