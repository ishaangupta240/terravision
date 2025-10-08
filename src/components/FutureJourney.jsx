import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import './FutureJourney.css';
import { readJourneyCookie, writeJourneyCookie } from '../utils/journeyStorage.js';
import useJourneySoundscape from '../hooks/useJourneySoundscape.js';

const stageFlow = [
  { id: 'launch', title: 'The Launch', subtitle: 'Leave Earth behind and board the Terravision starliner.' },
  { id: 'ai-guide', title: 'AI Companion Awakens', subtitle: 'Meet the guide that will decode your path forward.' },
  { id: 'colony', title: 'First Glimpse of the Colony', subtitle: 'Choose the habitat that feels like home among the stars.' },
  { id: 'purpose', title: 'Future Work & Purpose', subtitle: 'Accept a role that aligns with your strengths.' },
  { id: 'crisis', title: 'Crisis Simulation', subtitle: 'Respond to an unexpected event and shape the future.' },
  { id: 'vision', title: 'Future Vision Chamber', subtitle: 'Peer into distant timelines and witness what unfolds.' },
  { id: 'legacy', title: 'Return with Legacy', subtitle: 'Carry your badge home and share the story you forged.' },
];

const DEFAULT_NARRATIVE_INTERVAL = 10200;

const determineTimeBand = (hour) => {
  if (hour >= 5 && hour < 12) {
    return 'dawn';
  }
  if (hour >= 12 && hour < 17) {
    return 'day';
  }
  if (hour >= 17 && hour < 21) {
    return 'dusk';
  }
  return 'night';
};

const createIntroNarratives = (now = new Date(), agentName = 'Traveler') => {
  const hour = Number.isFinite(now?.getHours?.()) ? now.getHours() : new Date().getHours();
  const timeBand = determineTimeBand(hour);
  const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' });
  const formattedTime = timeFormatter.format(now);
  const resolvedAgentName = typeof agentName === 'string' && agentName.trim().length > 0 ? agentName.trim() : 'Traveler';

  const narrativesByBand = {
    dawn: [
      {
        text: `Welcome to 2050.`,
        duration: 3400,
      },
      {
        text: `The oceans have boiled into a toxic haze, leaving behind vast, salt-crusted deserts under a sickly sun`,
        duration: 8400,
      },
      {
        text: 'Our world is a graveyard, scarred by cosmic bombardments and stripped bare by solar winds. ',
        duration: 6400,
      },
      {
        text: 'We exist only in the deep-earth shelters, forgotten by the stars.',
        duration: 6400,
      },
      {
        text: `It is precisely ${formattedTime}, and the sky is ours to ignite.`,
        duration: 6400,
      },
      {
        text: `Complete the tasks assigned to you, Agent ${resolvedAgentName}.`,
        duration: 6400,
      },
    ],
    day: [
      {
        text: `Welcome to 2050.`,
        duration: 3400,
      },
      {
        text: 'Unshielded from the relentless solar storms, the surface burns beneath a sky now perpetually alight with deadly radiation.',
        duration: 8400,
      },
      {
        text: "The asteroid swarm of '48 shattered our atmospheric shield, turning daylight into a weapon.",
        duration: 6400,
      },
      {
        text: `It is precisely ${formattedTime}, and the sky is ours to ignite.`,
        duration: 6400,
      },
      {
        text: `Complete the tasks assigned to you, Agent ${resolvedAgentName}.`,
        duration: 6400,
      },
    ],
    dusk: [
      {
        text: `Welcome to 2050.`,
        duration: 3400,
      },
      {
        text: 'The horizon glows not with sunset, but with the impact fires of the daily asteroid rain.',
        duration: 5400,
      },
      {
        text: 'The dead oceans no longer reflect the sky, only absorb the heat of our planet\'s final, feverish moments.',
        duration: 8400,
      },
      {
        text: 'The air itself is a monument to our failure.',
        duration: 4400,
      },
      {
        text: `Current mission clock reads ${formattedTime} hours.`,
        duration: 4400,
      },
      {
        text: `Complete the tasks assigned to you, Agent ${resolvedAgentName}.`,
        duration: 4400,
      },
    ],
    night: [
      {
        text: `Welcome to 2050.`,
        duration: 3400,
      },
      {
        text: 'The blackness is absolute, broken only by the auroras of solar radiation poisoning our upper atmosphere.',
        duration: 6400,
      },
      {
        text: 'The silence of the dead seas is deafening, a constant reminder of a world that drowned in fire and stone. ',
        duration: 3400,
      },
      {
        text: 'There is nothing left to save, only to witness.',
        duration: 3400,
      },
      {
        text: `It is precisely ${formattedTime}, and the sky is ours to ignite.`,
        duration: 3400,
      },
      {
        text: `Complete the tasks assigned to you, Agent ${resolvedAgentName}.`,
        duration: 3400,
      },
    ],
  };

  const selectedBand = narrativesByBand[timeBand] ?? narrativesByBand.dawn;
  return selectedBand.map((entry, index) => ({
    text: entry.text,
    duration: entry.duration ?? DEFAULT_NARRATIVE_INTERVAL,
    className: `intro-text intro-text--${timeBand}-cue-${index + 1}`,
  }));
};

const seatManifest = [
  { id: 'A1', label: 'A1 · Forward Observation', description: 'Direct view of the launch corridor; crisp visuals for every stage separation.' },
  { id: 'B4', label: 'B4 · Gravity Neutral', description: 'Balanced center of ship; minimal turbulence and a smooth ascent.' },
  { id: 'C2', label: 'C2 · Navigator’s Wing', description: 'Adjacent to the mission deck with access to stellar telemetry.' },
  { id: 'D5', label: 'D5 · Starlight Capsule', description: 'Panoramic dome canopy; ideal for dramatic nebula openings.' },
];

const focusArchetypes = [
  {
    id: 'Eco',
    title: 'Gaia Continuum',
    prompt: 'Guide me through futures where ecosystems are sacred and thriving.',
    aiTone: 'I will align your path with living worlds. Expect verdant domes, harmonic weather systems, and bio-symphonic cities.',
  },
  {
    id: 'Stellar',
    title: 'Cosmos Vanguard',
    prompt: 'Open the gates to orbital civilizations and deep-space alliances.',
    aiTone: 'Excellent. I will surface stories of orbital citadels, jump drives, and interstellar treaties.',
  },
  {
    id: 'Synthetic',
    title: 'Synthetic Horizon',
    prompt: 'Show me futures shaped by cognition, quantum AI, and post-biological culture.',
    aiTone: 'Download acknowledged. Prepare for neural uplinks, quantum artists, and cities run on sentient code.',
  },
];

const habitatOptions = [
  {
    id: 'Dome',
    label: 'A. Auroral Dome Habitat',
    description: 'A translucent shield humming with polar lights, nurturing forests imported from Earth and Titan.',
    fit: 'Ideal for caretakers and climate-tuned thinkers.',
  },
  {
    id: 'Ring',
    label: 'B. Orbital Ringway',
    description: 'A sprawling halo city with zero-g studios, solar farms, and shuttle trams skimming the magnetosphere.',
    fit: 'Perfect for engineers, architects, and those who chase horizon lines.',
  },
  {
    id: 'Arcology',
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

const normalizeFocusId = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

const FutureJourney = ({ profile, ambientOn, onAmbientSet }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [introNarrativeIndex, setIntroNarrativeIndex] = useState(0);
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
  const certificateRef = useRef(null);
  const launchTimerRef = useRef(null);
  const aiTimerRef = useRef(null);
  const hydrationRef = useRef(false);
  const previousStageRef = useRef(0);
  const { playIgnition, playSelection, playHover, playStageAdvance, playStepBack } = useJourneySoundscape({
    enabled: ambientOn ?? true,
    masterVolume: 0.45,
  });

  const hoverHandlers = useMemo(
    () => ({
      seat: () => playHover('seat'),
      focus: () => playHover('focus'),
      habitat: () => playHover('habitat'),
      node: () => playHover('node'),
      crisis: () => playHover('crisis'),
      timeline: () => playHover('timeline'),
      stageAction: () => playHover('stage-action'),
    }),
    [playHover]
  );
  const agentIdentifier = (profile?.name ?? '').trim() || 'Traveler';
  const introNarratives = useMemo(() => createIntroNarratives(new Date(), agentIdentifier), [agentIdentifier]);

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
      introDismissed,
      ...overrides,
    }),
    [
      ambientOn,
      aiFocus,
      crisisChoice,
      habitat,
      introDismissed,
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

  const persistJourneyRef = useRef(persistJourney);

  useEffect(() => {
    persistJourneyRef.current = persistJourney;
  }, [persistJourney]);

  useEffect(() => {
    if (!hydrationRef.current) {
      return;
    }
    persistJourneyRef.current({ ambientOn });
  }, [ambientOn]);

  useEffect(() => {
    if (stageIndex !== 0) {
      return;
    }
    if (!introDismissed && introNarratives.length > 0) {
      setIntroNarrativeIndex(0);
    }
  }, [introDismissed, introNarratives, stageIndex]);

  const handleBeginJourney = useCallback(() => {
    setIntroDismissed((prev) => {
      if (prev) {
        return prev;
      }
      persistJourney({ introDismissed: true });
      return true;
    });
  }, [persistJourney]);

  useEffect(() => {
    if (introDismissed || stageIndex !== 0 || introNarratives.length === 0 || typeof window === 'undefined') {
      return undefined;
    }

    const safeIndex = Math.min(Math.max(introNarrativeIndex, 0), introNarratives.length - 1);
    const entry = introNarratives[safeIndex];
    const delaySource = typeof entry === 'string' ? DEFAULT_NARRATIVE_INTERVAL : entry?.duration;
    const delay = Math.max(1000, delaySource ?? DEFAULT_NARRATIVE_INTERVAL);
    const isLastCue = safeIndex >= introNarratives.length - 1;

    const timerId = window.setTimeout(() => {
      if (isLastCue) {
        handleBeginJourney();
      } else {
        setIntroNarrativeIndex((prev) => Math.min(prev + 1, introNarratives.length - 1));
      }
    }, delay);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [handleBeginJourney, introDismissed, introNarrativeIndex, introNarratives, stageIndex]);

  const isIntroActive = stageIndex === 0 && !introDismissed;

  const activeIntroNarrative = useMemo(() => {
    if (introNarratives.length === 0 || stageIndex !== 0) {
      return { text: '', className: 'intro-text' };
    }
    const safeIndex = Math.min(Math.max(introNarrativeIndex, 0), introNarratives.length - 1);
    const entry = introNarratives[safeIndex];
    if (typeof entry === 'string') {
      return { text: entry, className: 'intro-text' };
    }
    return {
      text: entry?.text ?? '',
      className: entry?.className ?? 'intro-text',
    };
  }, [introNarrativeIndex, introNarratives, stageIndex]);

  useEffect(() => {
    const previousStageIndex = previousStageRef.current;
    if (stageIndex === 0 && introDismissed && previousStageIndex !== 0) {
      setIntroDismissed(false);
      setIntroNarrativeIndex(0);
      persistJourney({ introDismissed: false });
    }
    previousStageRef.current = stageIndex;
  }, [stageIndex, introDismissed, persistJourney]);

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
  const stageTransitionDirection = stageIndex >= previousStageRef.current ? 'forward' : 'backward';
  const missionKey = profile?.missionKey ?? 'solar-architect';

  const futureRole = useMemo(() => roleMatrix(missionKey, aiFocus, habitat), [missionKey, aiFocus, habitat]);
  const canGoBack = stageIndex > 0;

  useEffect(() => {
    const stored = readJourneyCookie();

    if (!stored) {
      hydrationRef.current = true;
      persistJourneyRef.current({}, { force: true });
      return;
    }

    let storedStageIndex = 0;
    if (Number.isInteger(stored.stageIndex)) {
      storedStageIndex = Math.min(Math.max(stored.stageIndex, 0), stageFlow.length - 1);
      setStageIndex(storedStageIndex);
    }
    if (typeof stored.selectedSeat === 'string') {
      setSelectedSeat(stored.selectedSeat);
    }
    if (typeof stored.aiFocus === 'string') {
      setAiFocus(normalizeFocusId(stored.aiFocus));
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

    if (storedStageIndex === 0) {
      setIntroDismissed(false);
    } else {
      setIntroDismissed(true);
    }

    const ambientShouldEnable = Boolean(stored.ambientOn);

    const timer = setTimeout(() => {
      hydrationRef.current = true;
      if (ambientShouldEnable && typeof onAmbientSet === 'function') {
        onAmbientSet(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [onAmbientSet]);

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
  playStageAdvance();
      persistJourney({ stageIndex: nextIndex, stamps: updatedStamps });
    },
    [persistJourney, playStageAdvance, stageIndex, stamps]
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
  playStepBack();

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
    playStepBack,
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
    playIgnition();
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
  }, [advanceStage, countdown, playIgnition, selectedSeat]);

  useEffect(() => {
    if (currentStage.id !== 'ai-guide') {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
      setAiMessages((prev) => (prev.length > 0 ? [] : prev));
      return;
    }

    const intro = [
      'Booting TerraVision Companion Core... ',
      `Signal lock confirmed. Welcome, ${profile?.name ?? 'Traveler'}.`,
      'Your heart rate is steady, curiosity levels high. Ready to choose your frontier focus?',
    ];

    let index = 0;
    setAiMessages(() => [intro[index]]);
    index += 1;

    const enqueue = () => {
      setAiMessages((prev) => {
        if (index >= intro.length) {
          return prev;
        }
        const next = [...prev, intro[index]];
        index += 1;
        if (index < intro.length) {
          aiTimerRef.current = setTimeout(enqueue, 1200);
        } else {
          aiTimerRef.current = null;
        }
        return next;
      });
    };

    if (index < intro.length) {
      aiTimerRef.current = setTimeout(enqueue, 1200);
    } else {
      aiTimerRef.current = null;
    }

    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
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
      playSelection();
      setSelectedSeat(seatId);
      persistJourney({ selectedSeat: seatId });
    },
    [persistJourney, playSelection, selectedSeat]
  );

  const handleFocusSelect = useCallback(
    (focusId) => {
      const normalizedFocusId = normalizeFocusId(focusId);
      if (aiFocus === normalizedFocusId) {
        persistJourney({ aiFocus: normalizedFocusId });
        return;
      }
      playSelection();
      const resetNodes = [false, false, false];
      setAiFocus(normalizedFocusId);
      setMiniNodes(resetNodes);
      setMiniComplete(false);
      persistJourney({ aiFocus: normalizedFocusId, miniNodes: resetNodes, miniComplete: false });
    },
    [aiFocus, persistJourney, playSelection]
  );

  const handleHabitatSelect = useCallback(
    (habitatId) => {
      if (habitat === habitatId) {
        persistJourney({ habitat: habitatId });
        return;
      }
      playSelection();
      setHabitat(habitatId);
      persistJourney({ habitat: habitatId });
    },
    [habitat, persistJourney, playSelection]
  );

  const handleMiniNodeToggle = useCallback(
    (index) => {
      playSelection();
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
    [aiFocus, persistJourney, playSelection]
  );

  const handleCrisisSelect = useCallback(
    (option) => {
      if (crisisChoice?.id === option.id) {
        persistJourney({ crisisChoice: option });
        return;
      }
      playSelection();
      setCrisisChoice(option);
      persistJourney({ crisisChoice: option });
    },
    [crisisChoice?.id, persistJourney, playSelection]
  );

  const handleTimelineSelect = useCallback(
    (option) => {
      if (timeline?.id === option.id) {
        persistJourney({ timeline: option });
        return;
      }
      playSelection();
      setTimeline(option);
      persistJourney({ timeline: option });
    },
    [persistJourney, playSelection, timeline?.id]
  );

  const startOver = () => {
    playStageAdvance();
    const resetNodes = [false, false, false];
    setStageIndex(0);
    setIntroDismissed(false);
    setIntroNarrativeIndex(0);
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
        introDismissed: false,
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

  const renderStageContent = (stage) => {
    if (!stage) {
      return null;
    }
    switch (stage.id) {
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
                  onMouseEnter={hoverHandlers.seat}
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
                onMouseEnter={hoverHandlers.stageAction}
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
                {focusArchetypes.map((focus) => {
                  const focusKey = normalizeFocusId(focus.id);
                  const isSelected = aiFocus === focusKey;
                  return (
                  <button
                    key={focus.id}
                    type="button"
                      className={`focus-card${isSelected ? ' is-selected' : ''}`}
                      onMouseEnter={hoverHandlers.focus}
                      onClick={() => handleFocusSelect(focus.id)}
                  >
                    <strong>{focus.title}</strong>
                    <span>{focus.prompt}</span>
                      {isSelected ? <em>{focus.aiTone}</em> : null}
                  </button>
                  );
                })}
              </div>
            </div>
            <div className="stage-actions">
              <button
                type="button"
                className="primary"
                disabled={!aiFocus}
                onMouseEnter={hoverHandlers.stageAction}
                onClick={() => advanceStage(`AI companion tuned to ${aiFocus} horizons.`)}
              >
                Proceed with Curated Mission Briefing
              </button>
              {canGoBack && (
                <button
                  type="button"
                  className="secondary"
                  onMouseEnter={hoverHandlers.stageAction}
                  onClick={retreatStage}
                >
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
                  onMouseEnter={hoverHandlers.habitat}
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
                onMouseEnter={hoverHandlers.stageAction}
                onClick={() => advanceStage(`Settled within the ${habitat.toUpperCase()} habitat.`)}
              >
                Dock with Selected Habitat
              </button>
              {canGoBack && (
                <button
                  type="button"
                  className="secondary"
                  onMouseEnter={hoverHandlers.stageAction}
                  onClick={retreatStage}
                >
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
                    onMouseEnter={hoverHandlers.node}
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
                onMouseEnter={hoverHandlers.stageAction}
                onClick={() => advanceStage(`${futureRole} certification locked.`)}
              >
                Lock Role Assignment
              </button>
              {canGoBack && (
                <button
                  type="button"
                  className="secondary"
                  onMouseEnter={hoverHandlers.stageAction}
                  onClick={retreatStage}
                >
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
                  onMouseEnter={hoverHandlers.crisis}
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
                onMouseEnter={hoverHandlers.stageAction}
                onClick={() => advanceStage(`Crisis resolved via ${crisisChoice?.label}.`)}
              >
                Submit Crisis Response
              </button>
              {canGoBack && (
                <button
                  type="button"
                  className="secondary"
                  onMouseEnter={hoverHandlers.stageAction}
                  onClick={retreatStage}
                >
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
                  onMouseEnter={hoverHandlers.timeline}
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
                onMouseEnter={hoverHandlers.stageAction}
                onClick={() => advanceStage(`A glimpse into ${timeline?.id}.`)}
              >
                Enter Selected Timeline
              </button>
              {canGoBack && (
                <button
                  type="button"
                  className="secondary"
                  onMouseEnter={hoverHandlers.stageAction}
                  onClick={retreatStage}
                >
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
              <button
                type="button"
                className="primary"
                onMouseEnter={hoverHandlers.stageAction}
                onClick={handleDownloadCertificate}
              >
                Download Future Badge
              </button>
              {canGoBack && (
                <button
                  type="button"
                  className="secondary"
                  onMouseEnter={hoverHandlers.stageAction}
                  onClick={retreatStage}
                >
                  Step Back a Stage
                </button>
              )}
              <button
                type="button"
                className="secondary"
                onMouseEnter={hoverHandlers.stageAction}
                onClick={startOver}
              >
                Re-enter the Journey
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="journey-shell">
      {!isIntroActive ? (
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
      ) : null}

      <main
        className={`journey-stage${isIntroActive ? ' is-intro' : ''}`}
        data-stage={isIntroActive ? 'intro' : currentStage.id}
      >
        {isIntroActive ? (
          <div className="journey-intro">
            <div className="intro-panel intro-panel--minimal">
              <header className="intro-header" role="status" aria-live="polite">
                <h2 key={introNarrativeIndex} className={activeIntroNarrative.className}>
                  {activeIntroNarrative.text}
                </h2>
              </header>
            </div>
          </div>
        ) : (
          <>
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
            <div className="journey-content">
              <div
                key={currentStage.id}
                className={`journey-stage-frame journey-stage-frame--${stageTransitionDirection}`}
              >
                {renderStageContent(currentStage)}
              </div>
            </div>
          </>
        )}
      </main>
    </section>
  );
};

export default FutureJourney;
