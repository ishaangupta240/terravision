import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import orbitalSoundscape from '../assets/audio/orbital-soundscape.wav';
import './FutureJourney.css';

const COOKIE_NAME = 'terravisionJourney';

const readJourneyCookie = () => {
  if (typeof document === 'undefined') {
    return null;
  }
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!entry) {
    return null;
  }
  const value = entry.slice(COOKIE_NAME.length + 1);
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch (error) {
    console.warn('Unable to parse journey cookie', error);
    return null;
  }
};

const writeJourneyCookie = (payload) => {
  if (typeof document === 'undefined') {
    return;
  }
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))};path=/;max-age=${maxAge};SameSite=Lax`;
};

const stageFlow = [
  { id: 'launch', title: 'The Launch', subtitle: 'Leave Earth behind and board the Terravision starliner.' },
  { id: 'ai-guide', title: 'AI Companion Awakens', subtitle: 'Meet the guide that will decode your path forward.' },
  { id: 'colony', title: 'First Glimpse of the Colony', subtitle: 'Choose the habitat that feels like home among the stars.' },
  { id: 'purpose', title: 'Future Work & Purpose', subtitle: 'Accept a role that aligns with your strengths.' },
  { id: 'crisis', title: 'Crisis Simulation', subtitle: 'Respond to an unexpected event and shape the future.' },
  { id: 'vision', title: 'Future Vision Chamber', subtitle: 'Peer into distant timelines and witness what unfolds.' },
  { id: 'legacy', title: 'Return with Legacy', subtitle: 'Carry your badge home and share the story you forged.' },
];

const seatManifest = [
  { id: 'A1', label: 'A1 · Forward Observation', description: 'Direct view of the launch corridor; crisp visuals for every stage separation.' },
  { id: 'B4', label: 'B4 · Gravity Neutral', description: 'Balanced center of ship; minimal turbulence and a smooth ascent.' },
  { id: 'C2', label: 'C2 · Navigator’s Wing', description: 'Adjacent to the mission deck with access to stellar telemetry.' },
  { id: 'D5', label: 'D5 · Starlight Capsule', description: 'Panoramic dome canopy; ideal for dramatic nebula openings.' },
];

const focusArchetypes = [
  {
    id: 'eco',
    title: 'Gaia Continuum',
    prompt: 'Guide me through futures where ecosystems are sacred and thriving.',
    aiTone: 'I will align your path with living worlds. Expect verdant domes, harmonic weather systems, and bio-symphonic cities.',
  },
  {
    id: 'stellar',
    title: 'Cosmos Vanguard',
    prompt: 'Open the gates to orbital civilizations and deep-space alliances.',
    aiTone: 'Excellent. I will surface stories of orbital citadels, jump drives, and interstellar treaties.',
  },
  {
    id: 'synthetic',
    title: 'Synthetic Horizon',
    prompt: 'Show me futures shaped by cognition, quantum AI, and post-biological culture.',
    aiTone: 'Download acknowledged. Prepare for neural uplinks, quantum artists, and cities run on sentient code.',
  },
];

const habitatOptions = [
  {
    id: 'dome',
    label: 'A. Auroral Dome Habitat',
    description: 'A translucent shield humming with polar lights, nurturing forests imported from Earth and Titan.',
    fit: 'Ideal for caretakers and climate-tuned thinkers.',
  },
  {
    id: 'ring',
    label: 'B. Orbital Ringway',
    description: 'A sprawling halo city with zero-g studios, solar farms, and shuttle trams skimming the magnetosphere.',
    fit: 'Perfect for engineers, architects, and those who chase horizon lines.',
  },
  {
    id: 'arcology',
    label: 'C. Oceanic Arcology',
    description: 'Floating megastructures anchored to smart tides, cultivating plankton farms and luminescent reefs.',
    fit: 'Designed for negotiators, bio-harmonics, and those who speak fluent tide.',
  },
];

const focusToCrisis = {
  eco: {
    title: 'Solar Flare Blooming',
    description:
      'A wave of solar radiation threatens the orbital gardens. Do you shield the domes, reroute energy, or sacrifice a harvest?',
    options: [
      { id: 'shield', label: 'Deploy shield petals and absorb the flare.', outcome: 'Domes glow brighter; a month of energy stored.' },
      { id: 'reroute', label: 'Reroute flare energy into the tidal grids.', outcome: 'Oceanic grids surge, powering relief habitats.' },
      { id: 'sacrifice', label: 'Sacrifice one garden to save all others.', outcome: 'A grove is lost, yet thousands remain secure.' },
    ],
  },
  stellar: {
    title: 'Asteroid Corridor Drift',
    description:
      'An asteroid strays toward the habitation ring. Do you nudge it, dismantle it for resources, or evacuate temporarily?',
    options: [
      { id: 'nudge', label: 'Use graviton tethers to nudge it off course.', outcome: 'The ring remains intact; the asteroid becomes a new moonlet.' },
      { id: 'harvest', label: 'Harvest it for metals using drone swarms.', outcome: 'Crisis averted and rare alloys enrich construction.' },
      { id: 'evacuate', label: 'Evacuate and ride out the impact.', outcome: 'Temporary displacement but morale surges from coordinated safety drills.' },
    ],
  },
  synthetic: {
    title: 'Cascade AI Echo',
    description:
      'A networked AI chorus loops into a feedback spiral. Do you sync with it, isolate it, or let it evolve unchecked?',
    options: [
      { id: 'sync', label: 'Synchronize with the chorus to guide the pattern.', outcome: 'The AI integrates empathy circuits and becomes a trusted ally.' },
      { id: 'isolate', label: 'Isolate the cluster to reboot slowly.', outcome: 'Stability returns, and the AI learns humility protocols.' },
      { id: 'evolve', label: 'Let it evolve, documenting every iteration.', outcome: 'A new sentience blooms, changing governance forever.' },
    ],
  },
};

const timelineOptions = [
  {
    id: '2125',
    label: 'Year 2125 · Crimson Dawn Colony',
    vista: 'A Mars cradle with terraforming rivers, micro-climate domes, and citizen orchestras on the plains.',
  },
  {
    id: '2200',
    label: 'Year 2200 · Synthetica Confluence',
    vista: 'Cities where AI and humans co-direct culture, and empathy engines translate thought to shared art.',
  },
  {
    id: '2300',
    label: 'Year 2300 · Intergalactic Weave',
    vista: 'Starlanes linking dozens of systems with habitats strung along luminous cosmic threads.',
  },
];

const roleMatrix = (missionKey, focus, habitat) => {
  const preference = focus ?? 'eco';
  if (missionKey === 'climate-weaver' || preference === 'eco') {
    if (habitat === 'ring') return 'Climate Architect';
    if (habitat === 'arcology') return 'Ocean Steward';
    return 'Gaian Systems Designer';
  }
  if (missionKey === 'solar-architect' || preference === 'stellar') {
    if (habitat === 'dome') return 'Quantum Engineer';
    if (habitat === 'arcology') return 'Orbital Terraformer';
    return 'Stellar Cartographer';
  }
  if (missionKey === 'bio-harmonics') {
    if (habitat === 'dome') return 'Bio-Symphony Conductor';
    if (habitat === 'ring') return 'Living Architecture Weaver';
    return 'Lumen Reef Curator';
  }
  if (missionKey === 'ocean-guardian') {
    if (habitat === 'arcology') return 'Oceanic Diplomat';
    return 'Tidal Power Steward';
  }
  return preference === 'synthetic' ? 'AI Philosopher' : 'Interstellar Diplomat';
};

const miniTaskTargets = {
  eco: [true, false, true],
  stellar: [true, true, false],
  synthetic: [false, true, true],
};

const useAmbientSound = () => {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const audio = new Audio(orbitalSoundscape);
    audio.loop = true;
    audio.volume = 0.32;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const disable = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setEnabled(false);
  }, []);

  const enable = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setEnabled(true))
      .catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    if (enabled) {
      disable();
    } else {
      enable();
    }
  }, [disable, enable, enabled]);

  const setAmbient = useCallback(
    (value) => {
      if (value) {
        enable();
      } else {
        disable();
      }
    },
    [disable, enable]
  );

  return [enabled, toggle, setAmbient];
};

const FutureJourney = ({ profile }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [aiFocus, setAiFocus] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [habitat, setHabitat] = useState(null);
  const [miniNodes, setMiniNodes] = useState([false, false, false]);
  const [miniComplete, setMiniComplete] = useState(false);
  const [crisisChoice, setCrisisChoice] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [ambientOn, toggleAmbient, setAmbientEnabled] = useAmbientSound();
  const certificateRef = useRef(null);
  const launchTimerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const hydrationRef = useRef(false);

  const buildJourneySnapshot = useCallback(
    (overrides = {}) => ({
      stageIndex,
      selectedSeat,
      aiFocus,
      habitat,
      miniNodes,
      miniComplete,
      crisisChoice,
      timeline,
      stamps,
      ambientOn,
      ...overrides,
    }),
    [
      ambientOn,
      aiFocus,
      crisisChoice,
      habitat,
      miniComplete,
      miniNodes,
      selectedSeat,
      stageIndex,
      stamps,
      timeline,
    ]
  );

  const persistJourney = useCallback(
    (overrides = {}, { force = false } = {}) => {
      if (!hydrationRef.current && !force) {
        return;
      }
      writeJourneyCookie(buildJourneySnapshot(overrides));
    },
    [buildJourneySnapshot]
  );

  useEffect(() => {
    persistJourney();
  }, [persistJourney]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const handleBeforeUnload = () => {
      persistJourney({}, { force: true });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [persistJourney]);

  const currentStage = stageFlow[stageIndex];
  const missionKey = profile?.missionKey ?? 'solar-architect';

  const futureRole = useMemo(() => roleMatrix(missionKey, aiFocus, habitat), [missionKey, aiFocus, habitat]);
  const canGoBack = stageIndex > 0;

  useEffect(() => {
    const stored = readJourneyCookie();

    if (!stored) {
      hydrationRef.current = true;
      persistJourney({}, { force: true });
      return;
    }

    if (Number.isInteger(stored.stageIndex)) {
      const nextIndex = Math.min(Math.max(stored.stageIndex, 0), stageFlow.length - 1);
      setStageIndex(nextIndex);
    }
    if (typeof stored.selectedSeat === 'string') {
      setSelectedSeat(stored.selectedSeat);
    }
    if (typeof stored.aiFocus === 'string') {
      setAiFocus(stored.aiFocus);
    }
    if (typeof stored.habitat === 'string') {
      setHabitat(stored.habitat);
    }
    if (Array.isArray(stored.miniNodes) && stored.miniNodes.length === 3) {
      setMiniNodes(stored.miniNodes.map((value) => Boolean(value)));
    }
    if (typeof stored.miniComplete === 'boolean') {
      setMiniComplete(stored.miniComplete);
    }
    if (stored.crisisChoice && typeof stored.crisisChoice === 'object') {
      setCrisisChoice(stored.crisisChoice);
    }
    if (stored.timeline && typeof stored.timeline === 'object') {
      setTimeline(stored.timeline);
    }
    if (Array.isArray(stored.stamps)) {
      setStamps(stored.stamps);
    }

    const ambientShouldEnable = Boolean(stored.ambientOn);

    const timer = setTimeout(() => {
      hydrationRef.current = true;
      if (ambientShouldEnable) {
        setAmbientEnabled(true);
      }
      persistJourney({}, { force: true });
    }, 0);

    return () => clearTimeout(timer);
  }, [persistJourney, setAmbientEnabled]);

  useEffect(() => {
    return () => {
      if (launchTimerRef.current) {
        clearInterval(launchTimerRef.current);
      }
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, []);

  const advanceStage = useCallback(
    (stampDetail) => {
      const stageId = stageFlow[stageIndex]?.id;
      let updatedStamps = stamps;
      if (stageId) {
        const filtered = stamps.filter((entry) => entry.stageId !== stageId);
        updatedStamps = [
          ...filtered,
          { stageId, label: stageFlow[stageIndex].title, detail: stampDetail },
        ];
        setStamps(updatedStamps);
      }

      const nextIndex = Math.min(stageIndex + 1, stageFlow.length - 1);
      setStageIndex(nextIndex);
      persistJourney({ stageIndex: nextIndex, stamps: updatedStamps });
    },
    [persistJourney, stageIndex, stamps]
  );

  const retreatStage = useCallback(() => {
    if (stageIndex === 0) {
      return;
    }

    const nextIndex = stageIndex - 1;
    const targetStageId = stageFlow[nextIndex]?.id;

    let updatedStamps = stamps;
    let nextSelectedSeat = selectedSeat;
    let nextCountdown = countdown;
    let nextAiFocus = aiFocus;
    let nextHabitat = habitat;
    let nextMiniNodes = miniNodes;
    let nextMiniComplete = miniComplete;
    let nextCrisisChoice = crisisChoice;
    let nextTimeline = timeline;

    if (targetStageId) {
      updatedStamps = stamps.filter((entry) => entry.stageId !== targetStageId);

      switch (targetStageId) {
        case 'launch': {
          nextSelectedSeat = null;
          nextCountdown = null;
          if (launchTimerRef.current) {
            clearInterval(launchTimerRef.current);
            launchTimerRef.current = null;
          }
          nextAiFocus = null;
          setAiMessages([]);
          nextHabitat = null;
          nextMiniNodes = [false, false, false];
          nextMiniComplete = false;
          nextCrisisChoice = null;
          nextTimeline = null;
          if (aiTimerRef.current) {
            clearTimeout(aiTimerRef.current);
            aiTimerRef.current = null;
          }
          break;
        }
        case 'ai-guide': {
          nextAiFocus = null;
          setAiMessages([]);
          if (aiTimerRef.current) {
            clearTimeout(aiTimerRef.current);
            aiTimerRef.current = null;
          }
          nextHabitat = null;
          nextMiniNodes = [false, false, false];
          nextMiniComplete = false;
          nextCrisisChoice = null;
          nextTimeline = null;
          break;
        }
        case 'colony':
          nextHabitat = null;
          nextMiniNodes = [false, false, false];
          nextMiniComplete = false;
          nextCrisisChoice = null;
          nextTimeline = null;
          break;
        case 'purpose':
          nextMiniNodes = [false, false, false];
          nextMiniComplete = false;
          nextCrisisChoice = null;
          nextTimeline = null;
          break;
        case 'crisis':
          nextCrisisChoice = null;
          nextTimeline = null;
          break;
        case 'vision':
          nextTimeline = null;
          break;
        default:
          break;
      }
    }

    const miniNodesChanged =
      nextMiniNodes.length !== miniNodes.length ||
      nextMiniNodes.some((value, index) => value !== miniNodes[index]);

    if (nextSelectedSeat !== selectedSeat) {
      setSelectedSeat(nextSelectedSeat);
    }
    if (nextCountdown !== countdown) {
      setCountdown(nextCountdown);
    }
    if (nextAiFocus !== aiFocus) {
      setAiFocus(nextAiFocus);
    }
    if (nextHabitat !== habitat) {
      setHabitat(nextHabitat);
    }
    if (miniNodesChanged) {
      setMiniNodes(nextMiniNodes);
    }
    if (nextMiniComplete !== miniComplete) {
      setMiniComplete(nextMiniComplete);
    }
    if ((nextCrisisChoice?.id ?? null) !== (crisisChoice?.id ?? null)) {
      setCrisisChoice(nextCrisisChoice);
    }
    if ((nextTimeline?.id ?? null) !== (timeline?.id ?? null)) {
      setTimeline(nextTimeline);
    }

    setStamps(updatedStamps);
    setStageIndex(nextIndex);

    persistJourney({
      stageIndex: nextIndex,
      stamps: updatedStamps,
      selectedSeat: nextSelectedSeat,
      aiFocus: nextAiFocus,
      habitat: nextHabitat,
      miniNodes: nextMiniNodes,
      miniComplete: nextMiniComplete,
      crisisChoice: nextCrisisChoice,
      timeline: nextTimeline,
    });
  }, [
    aiFocus,
    crisisChoice,
    countdown,
    habitat,
    miniComplete,
    miniNodes,
    persistJourney,
    selectedSeat,
    stageIndex,
    stamps,
    timeline,
  ]);

  const handleLaunch = useCallback(() => {
    if (!selectedSeat || countdown !== null) {
      return;
    }
    setCountdown(3);
    let remaining = 3;
    launchTimerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(launchTimerRef.current);
        launchTimerRef.current = null;
        setCountdown(null);
        advanceStage(`Launch initiated from seat ${selectedSeat}.`);
      } else {
        setCountdown(remaining);
      }
    }, 900);
  }, [advanceStage, countdown, selectedSeat]);

  useEffect(() => {
    if (currentStage.id !== 'ai-guide') {
      setAiMessages([]);
      return;
    }
    const intro = [
      'Booting TerraVision Companion Core... ',
      `Signal lock confirmed. Welcome, ${profile?.name ?? 'Traveler'}.`,
      'Your heart rate is steady, curiosity levels high. Ready to choose your frontier focus?',
    ];
    let index = 0;
    setAiMessages([]);
    const enqueue = () => {
      setAiMessages((prev) => [...prev, intro[index]]);
      index += 1;
      if (index < intro.length) {
        aiTimerRef.current = setTimeout(enqueue, 1200);
      }
    };
    enqueue();
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, [currentStage.id, profile?.name]);

  useEffect(() => {
    if (aiFocus) {
      return;
    }

    const baseline = [false, false, false];
    const needsReset =
      miniComplete !== false ||
      baseline.some((value, index) => miniNodes[index] !== value);

    if (needsReset) {
      setMiniNodes(baseline);
      setMiniComplete(false);
      persistJourney({ miniNodes: baseline, miniComplete: false });
    }
  }, [aiFocus, miniComplete, miniNodes, persistJourney]);

  const handleSeatSelect = useCallback(
    (seatId) => {
      if (selectedSeat === seatId) {
        persistJourney({ selectedSeat: seatId });
        return;
      }
      setSelectedSeat(seatId);
      persistJourney({ selectedSeat: seatId });
    },
    [persistJourney, selectedSeat]
  );

  const handleFocusSelect = useCallback(
    (focusId) => {
      if (aiFocus === focusId) {
        persistJourney({ aiFocus: focusId });
        return;
      }
      const resetNodes = [false, false, false];
      setAiFocus(focusId);
      setMiniNodes(resetNodes);
      setMiniComplete(false);
      persistJourney({ aiFocus: focusId, miniNodes: resetNodes, miniComplete: false });
    },
    [aiFocus, persistJourney]
  );

  const handleHabitatSelect = useCallback(
    (habitatId) => {
      if (habitat === habitatId) {
        persistJourney({ habitat: habitatId });
        return;
      }
      setHabitat(habitatId);
      persistJourney({ habitat: habitatId });
    },
    [habitat, persistJourney]
  );

  const handleMiniNodeToggle = useCallback(
    (index) => {
      setMiniNodes((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        const focusKey = aiFocus ?? 'eco';
        const target = miniTaskTargets[focusKey] ?? [false, false, false];
        const solved = next.every((value, idx) => value === target[idx]);
        setMiniComplete(solved);
        persistJourney({ miniNodes: next, miniComplete: solved });
        return next;
      });
    },
    [aiFocus, persistJourney]
  );

  const handleCrisisSelect = useCallback(
    (option) => {
      if (crisisChoice?.id === option.id) {
        persistJourney({ crisisChoice: option });
        return;
      }
      setCrisisChoice(option);
      persistJourney({ crisisChoice: option });
    },
    [crisisChoice?.id, persistJourney]
  );

  const handleTimelineSelect = useCallback(
    (option) => {
      if (timeline?.id === option.id) {
        persistJourney({ timeline: option });
        return;
      }
      setTimeline(option);
      persistJourney({ timeline: option });
    },
    [persistJourney, timeline?.id]
  );

  const startOver = () => {
    const resetNodes = [false, false, false];
    setStageIndex(0);
    setSelectedSeat(null);
    setCountdown(null);
    if (launchTimerRef.current) {
      clearInterval(launchTimerRef.current);
      launchTimerRef.current = null;
    }
    setAiFocus(null);
    setAiMessages([]);
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    setHabitat(null);
    setMiniNodes(resetNodes);
    setMiniComplete(false);
    setCrisisChoice(null);
    setTimeline(null);
    setStamps([]);
    persistJourney(
      {
        stageIndex: 0,
        selectedSeat: null,
        aiFocus: null,
        habitat: null,
        miniNodes: resetNodes,
        miniComplete: false,
        crisisChoice: null,
        timeline: null,
        stamps: [],
      },
      { force: true }
    );
  };

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) {
      return;
    }
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#050b1d' });
      const link = document.createElement('a');
      const name = profile?.name?.replace(/\s+/g, '-') ?? 'TerraVision-Traveler';
      link.download = `${name}-future-badge.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Unable to export badge', error);
    }
  };

  const renderStageContent = () => {
    switch (currentStage.id) {
      case 'launch':
        return (
          <div className="stage-panel stage-launch">
            <div className="panel-header">
              <h2>Choose Your Launch Capsule</h2>
              <p>Seat assignment influences your view and telemetry feed during ascent.</p>
            </div>
            <div className="seat-grid">
              {seatManifest.map((seat) => (
                <button
                  key={seat.id}
                  type="button"
                  className={`seat-card${selectedSeat === seat.id ? ' is-selected' : ''}`}
                  onClick={() => handleSeatSelect(seat.id)}
                >
                  <strong>{seat.label}</strong>
                  <span>{seat.description}</span>
                </button>
              ))}
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="primary"
                onClick={handleLaunch}
                disabled={!selectedSeat || countdown !== null}
              >
                {countdown !== null ? `Ignition in ${countdown}...` : 'Commence Launch Sequence'}
              </button>
            </div>
            <div className="earth-fade">
              <span>Earth recedes. Stars awaken.</span>
            </div>
          </div>
        );
      case 'ai-guide':
        return (
          <div className="stage-panel stage-ai">
            <div className="panel-header">
              <h2>TerraVision Companion Online</h2>
              <p>Your AI guide calibrates the narrative. Select the trajectory it should emphasize.</p>
            </div>
            <div className="ai-console">
              <div className="ai-feed" aria-live="polite">
                {aiMessages.map((line, index) => (
                  <p key={`ai-${index}`}>{line}</p>
                ))}
              </div>
              <div className="focus-grid">
                {focusArchetypes.map((focus) => (
                  <button
                    key={focus.id}
                    type="button"
                    className={`focus-card${aiFocus === focus.id ? ' is-selected' : ''}`}
                    onClick={() => handleFocusSelect(focus.id)}
                  >
                    <strong>{focus.title}</strong>
                    <span>{focus.prompt}</span>
                    {aiFocus === focus.id ? <em>{focus.aiTone}</em> : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="primary"
                disabled={!aiFocus}
                onClick={() => advanceStage(`AI companion tuned to ${aiFocus} horizons.`)}
              >
                Proceed with Curated Mission Briefing
              </button>
              {canGoBack && (
                <button type="button" className="secondary" onClick={retreatStage}>
                  Step Back a Stage
                </button>
              )}
            </div>
          </div>
        );
      case 'colony':
        return (
          <div className="stage-panel stage-colony">
            <div className="panel-header">
              <h2>Choose Your Future Habitat</h2>
              <p>Where will you anchor your new life? Each choice echoes through your story.</p>
            </div>
            <div className="habitat-grid">
              {habitatOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`habitat-card${habitat === option.id ? ' is-selected' : ''}`}
                  onClick={() => handleHabitatSelect(option.id)}
                >
                  <header>
                    <strong>{option.label}</strong>
                  </header>
                  <p>{option.description}</p>
                  <footer>{option.fit}</footer>
                </button>
              ))}
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="primary"
                disabled={!habitat}
                onClick={() => advanceStage(`Settled within the ${habitat.toUpperCase()} habitat.`)}
              >
                Dock with Selected Habitat
              </button>
              {canGoBack && (
                <button type="button" className="secondary" onClick={retreatStage}>
                  Step Back a Stage
                </button>
              )}
            </div>
          </div>
        );
      case 'purpose':
        return (
          <div className="stage-panel stage-purpose">
            <div className="panel-header">
              <h2>Claim Your Future Role</h2>
              <p>The mission registry analyses your passport and choices to align a vocation.</p>
            </div>
            <div className="role-brief">
              <div className="role-heading">
                <span>Designation</span>
                <strong>{futureRole}</strong>
              </div>
              <p>
                {profile?.name ?? 'Envoy'}, at age {profile?.ageIn2050 ?? '—'} in 2050, your aptitude profile combines with
                the <em>{aiFocus ?? 'core'}</em> orientation and the <em>{habitat ?? 'chosen'}</em> habitat. To finalize,
                align the mission nodes to stabilize your work matrix.
              </p>
              <div className="mini-task">
                {miniNodes.map((state, idx) => (
                  <button
                    key={`node-${idx}`}
                    type="button"
                    className={`node${state ? ' is-active' : ''}`}
                    onClick={() => handleMiniNodeToggle(idx)}
                  >
                    Node {idx + 1}
                  </button>
                ))}
                <div className="node-target">
                  {aiFocus ? 'Target Pattern: ' + miniTaskTargets[aiFocus].map((value) => (value ? '●' : '○')).join(' ') : 'Select a focus to reveal the target pattern.'}
                </div>
              </div>
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="primary"
                disabled={!miniComplete}
                onClick={() => advanceStage(`${futureRole} certification locked.`)}
              >
                Lock Role Assignment
              </button>
              {canGoBack && (
                <button type="button" className="secondary" onClick={retreatStage}>
                  Step Back a Stage
                </button>
              )}
            </div>
          </div>
        );
      case 'crisis': {
        const crisis = focusToCrisis[aiFocus ?? 'eco'];
        return (
          <div className="stage-panel stage-crisis">
            <div className="panel-header">
              <h2>{crisis.title}</h2>
              <p>{crisis.description}</p>
            </div>
            <div className="crisis-options">
              {crisis.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`crisis-card${crisisChoice?.id === option.id ? ' is-selected' : ''}`}
                  onClick={() => handleCrisisSelect(option)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.outcome}</span>
                </button>
              ))}
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="primary"
                disabled={!crisisChoice}
                onClick={() => advanceStage(`Crisis resolved via ${crisisChoice?.label}.`)}
              >
                Submit Crisis Response
              </button>
              {canGoBack && (
                <button type="button" className="secondary" onClick={retreatStage}>
                  Step Back a Stage
                </button>
              )}
            </div>
          </div>
        );
      }
      case 'vision':
        return (
          <div className="stage-panel stage-vision">
            <div className="panel-header">
              <h2>Timeline Windows</h2>
              <p>Step into the vision chamber. Choose a timeline to witness your legacy echo forward.</p>
            </div>
            <div className="timeline-grid">
              {timelineOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`timeline-card${timeline?.id === option.id ? ' is-selected' : ''}`}
                  onClick={() => handleTimelineSelect(option)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.vista}</span>
                </button>
              ))}
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="primary"
                disabled={!timeline}
                onClick={() => advanceStage(`A glimpse into ${timeline?.id}.`)}
              >
                Enter Selected Timeline
              </button>
              {canGoBack && (
                <button type="button" className="secondary" onClick={retreatStage}>
                  Step Back a Stage
                </button>
              )}
            </div>
          </div>
        );
      case 'legacy':
      default:
        return (
          <div className="stage-panel stage-legacy">
            <div className="panel-header">
              <h2>Future Certificate Ready</h2>
              <p>Share your TerraVision imprint. Your badge reflects every choice you made among the stars.</p>
            </div>
            <div className="certificate" ref={certificateRef}>
              <header>
                <span>TerraVision · Citizen Legacy</span>
                <strong>{profile?.name ?? 'Anonymous Envoy'}</strong>
              </header>
              <section>
                <dl>
                  <div>
                    <dt>Launch Seat</dt>
                    <dd>{selectedSeat ?? 'Unassigned'}</dd>
                  </div>
                  <div>
                    <dt>Orientation</dt>
                    <dd>{aiFocus ?? 'Baseline'}</dd>
                  </div>
                  <div>
                    <dt>Habitat</dt>
                    <dd>{habitat ?? 'Undeclared'}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{futureRole}</dd>
                  </div>
                  <div>
                    <dt>Crisis Response</dt>
                    <dd>{crisisChoice?.label ?? 'Pending'}</dd>
                  </div>
                  <div>
                    <dt>Timeline</dt>
                    <dd>{timeline?.label ?? 'Undisclosed'}</dd>
                  </div>
                </dl>
              </section>
              <footer>
                <p>
                  {profile?.name ?? 'You'} returns home carrying the legacy of {futureRole}. May this badge inspire others
                  to chart their own futures.
                </p>
              </footer>
            </div>
            <div className="stage-actions">
              <button type="button" className="primary" onClick={handleDownloadCertificate}>
                Download Future Badge
              </button>
              {canGoBack && (
                <button type="button" className="secondary" onClick={retreatStage}>
                  Step Back a Stage
                </button>
              )}
              <button type="button" className="secondary" onClick={startOver}>
                Re-enter the Journey
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="journey-shell">
      <header className="journey-header">
        <div>
          <h1>TerraVision Journey Protocol</h1>
          <p>
            {profile?.name ?? 'Envoy'} · Passport ID {profile?.passportId ?? 'TV-0000'} · Age in 2050:{' '}
            {profile?.ageIn2050 ?? '—'}
          </p>
        </div>
        <div className="journey-controls">
          <button type="button" className={`audio-toggle${ambientOn ? ' is-active' : ''}`} onClick={toggleAmbient}>
            {ambientOn ? 'Soundscape · On' : 'Soundscape · Off'}
          </button>
        </div>
      </header>

      <div className="journey-progress">
        {stageFlow.map((stage, index) => (
          <div
            key={stage.id}
            className={`progress-step${index === stageIndex ? ' is-current' : ''}${index < stageIndex ? ' is-complete' : ''}`}
          >
            <span>{index + 1}</span>
            <label>{stage.title}</label>
          </div>
        ))}
      </div>

      <main className="journey-stage" data-stage={currentStage.id}>
        <aside className="journey-sidebar">
          <h2>{currentStage.title}</h2>
          <p>{currentStage.subtitle}</p>
          <div className="stamp-ledger">
            <h3>Future Stamps</h3>
            {stamps.length === 0 ? (
              <p className="empty">Complete stages to collect stamps.</p>
            ) : (
              <ul>
                {stamps.map((stamp) => (
                  <li key={stamp.stageId}>
                    <strong>{stamp.label}</strong>
                    <span>{stamp.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        <div className="journey-content">{renderStageContent()}</div>
      </main>
    </section>
  );
};

export default FutureJourney;
