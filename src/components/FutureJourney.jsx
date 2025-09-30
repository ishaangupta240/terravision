import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { MathUtils } from 'three';

const AirFleet = ({ color }) => {
  const vehicles = useMemo(
    () => [
      { position: [-0.9, 0.9, 0.8], rotation: [0.3, 1.2, -0.1], scale: 0.28 },
      { position: [0.6, 1.1, -0.4], rotation: [-0.2, -0.9, 0.15], scale: 0.24 },
      { position: [0.1, 0.8, 1.2], rotation: [0.4, 0.3, -0.2], scale: 0.32 },
    ],
    []
  );

  const pods = useMemo(
    () => [
      { position: [-0.4, 1.6, -0.6], scale: 0.18 },
      { position: [0.7, 1.45, 0.3], scale: 0.22 },
      { position: [0.1, 1.3, -1.1], scale: 0.16 },
    ],
    []
  );

  return (
    <group position={[0, 1.6, 0]}> 
      <pointLight position={[0, 0.4, 0]} intensity={1.2} color={color} distance={4} />
      {vehicles.map((vehicle, index) => (
        <Float
          key={`fleet-${index}`}
          speed={1.4 + index * 0.15}
          rotationIntensity={1.2}
          floatIntensity={1.1}
        >
          <group position={vehicle.position} rotation={vehicle.rotation} scale={vehicle.scale}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.08, 1.1, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.75}
                metalness={0.55}
                roughness={0.28}
              />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.13, 24, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.65, 0]}>
              <coneGeometry args={[0.14, 0.35, 20]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.3} roughness={0.35} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]} scale={[1.4, 0.04, 0.4]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} metalness={0.65} roughness={0.22} />
            </mesh>
          </group>
        </Float>
      ))}

      {pods.map((pod, index) => (
        <Float key={`pod-${index}`} speed={1 + index * 0.2} floatIntensity={0.8} rotationIntensity={0.6}>
          <group position={pod.position} scale={pod.scale}>
            <mesh>
              <sphereGeometry args={[0.8, 24, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.7}
                metalness={0.45}
                roughness={0.2}
                transparent
                opacity={0.65}
              />
            </mesh>
            <mesh scale={[0.4, 0.45, 0.4]}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#0d1a3a" metalness={0.2} roughness={0.5} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
};

const HyperCity = ({ color }) => {
  const towers = useMemo(
    () => [
      { position: [-0.6, -1.2, 1], scale: [0.16, 1.6, 0.16], delay: 0.2 },
      { position: [0, -1.3, 1.2], scale: [0.25, 1.9, 0.25], delay: 0.4 },
      { position: [0.6, -1.25, 0.9], scale: [0.18, 1.4, 0.18], delay: 0.3 },
      { position: [0.3, -1.1, 1.6], scale: [0.2, 1.7, 0.2], delay: 0.6 },
      { position: [-0.3, -1.05, 1.5], scale: [0.15, 1.3, 0.15], delay: 0.55 },
      { position: [0.15, -1.4, 0.6], scale: [0.12, 1.1, 0.12], delay: 0.35 },
    ],
    []
  );

  return (
    <group position={[0, -1.25, 1.1]} rotation={[Math.PI / 4, 0.45, 0]}>
      <pointLight position={[0, 1.4, 0]} intensity={1.1} color={color} distance={4} />
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.4, 1.4, 1]}>
        <ringGeometry args={[0.5, 0.9, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.25} />
      </mesh>
      {towers.map((tower, index) => (
        <Float
          key={`tower-${index}`}
          speed={1.1 + index * 0.1}
          rotationIntensity={0.25}
          floatIntensity={0.3}
          floatingRange={[-tower.delay * 0.05, tower.delay * 0.08]}
        >
          <mesh position={tower.position} scale={tower.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color="#0b1638"
              emissive={color}
              emissiveIntensity={0.55 + index * 0.05}
              metalness={0.4}
              roughness={0.35}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const HydroArray = ({ color }) => {
  const turbines = useMemo(
    () => [
      { position: [1.15, -0.6, 0.6], scale: [0.18, 0.9, 0.18], rotation: [0, Math.PI / 4, 0] },
      { position: [1.3, -0.5, -0.2], scale: [0.22, 1.1, 0.22], rotation: [0, Math.PI / 2.5, 0] },
      { position: [0.9, -0.55, -0.7], scale: [0.16, 0.8, 0.16], rotation: [0, -Math.PI / 5, 0] },
    ],
    []
  );

  const swimmers = useMemo(
    () => [
      { position: [1.45, 0.1, 0.2], scale: 0.32, direction: 1 },
      { position: [1.1, 0.25, -0.6], scale: 0.24, direction: -1 },
      { position: [0.85, -0.1, 0.9], scale: 0.28, direction: 1 },
    ],
    []
  );

  return (
    <group position={[1.05, -0.3, 0]} rotation={[Math.PI / 6, Math.PI / 3, 0]}>
      <pointLight position={[0, 0.6, 0]} intensity={1.2} color={color} distance={4.5} />
      {turbines.map((turbine, index) => (
        <group key={`turbine-${index}`} position={turbine.position} rotation={turbine.rotation}>
          <mesh scale={[turbine.scale[0], turbine.scale[1], turbine.scale[2]]}>
            <cylinderGeometry args={[0.2, 0.25, 1, 24]} />
            <meshStandardMaterial color="#0a1e3a" metalness={0.45} roughness={0.4} />
          </mesh>
          <Float speed={1.5} rotationIntensity={1} floatIntensity={1.4}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.15, 0.6, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.45} />
            </mesh>
          </Float>
        </group>
      ))}

      {swimmers.map((creature, index) => (
        <Float
          key={`swimmer-${index}`}
          speed={1.2 + index * 0.1}
          rotationIntensity={0.8}
          floatIntensity={0.9}
          floatingRange={[-0.15, 0.18]}
        >
          <group position={creature.position} scale={creature.scale}>
            <mesh rotation={[0, creature.direction * Math.PI / 4, 0]}>
              <sphereGeometry args={[0.8, 20, 20]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
                roughness={0.25}
              />
            </mesh>
            <mesh position={[creature.direction * 0.8, 0, 0]} rotation={[0, creature.direction * Math.PI / 3, 0]}>
              <coneGeometry args={[0.35, 0.7, 16]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.3} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
};
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { journeyPhases } from '../data/journeyStops.js';
import './FutureJourney.css';

const Earth = ({ activePhase, environment }) => {
  const earthRef = useRef(null);
  const shellRef = useRef(null);
  const groupRef = useRef(null);
  const haloConfigs = useMemo(
    () => ({
      air: { rotation: [Math.PI / 2.4, 0.2, 0.6], radius: 1.25, thickness: 0.06 },
      land: { rotation: [Math.PI / 3.1, -0.6, 0.1], radius: 1.1, thickness: 0.08 },
      sea: { rotation: [Math.PI / 1.8, 0.4, -0.3], radius: 1.3, thickness: 0.07 },
      underground: { rotation: [Math.PI - 0.3, 0.3, 0], radius: 0.95, thickness: 0.06 },
    }),
    []
  );

  const orientationTargets = useMemo(
    () => ({
      air: [MathUtils.degToRad(-12), MathUtils.degToRad(32), MathUtils.degToRad(4)],
      land: [MathUtils.degToRad(-6), MathUtils.degToRad(-42), MathUtils.degToRad(-2)],
      sea: [MathUtils.degToRad(18), MathUtils.degToRad(118), MathUtils.degToRad(6)],
    }),
    []
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = orientationTargets[environment] ?? orientationTargets.land;
    groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, target[0], delta * 1.2);
    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, target[1], delta * 1.2);
    groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, target[2], delta * 1.2);
  });

  useEffect(() => {
    if (earthRef.current?.material?.emissive) {
      earthRef.current.material.emissive.set(activePhase.color);
    }
    if (shellRef.current?.material?.color) {
      shellRef.current.material.color.set(activePhase.color);
    }
  }, [activePhase]);

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.35} />
      <directionalLight intensity={1.3} position={[4, 5, 2]} color={activePhase.color} />
      <spotLight position={[-3, -4, -2]} angle={0.6} penumbra={0.5} intensity={0.8} color="#8bb7ff" />

      <mesh ref={earthRef} scale={1.55}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshStandardMaterial
          color="#0d2f5f"
          metalness={0.2}
          roughness={0.35}
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh ref={shellRef} scale={1.72}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color={activePhase.color}
          transparent
          opacity={0.18}
          shininess={80}
          emissiveIntensity={0.4}
        />
      </mesh>

      {Object.entries(haloConfigs).map(([phaseId, config]) => (
        <mesh key={phaseId} rotation={config.rotation} visible={phaseId === activePhase.id}>
          <torusGeometry args={[config.radius, config.thickness, 32, 128]} />
          <meshBasicMaterial color={activePhase.color} transparent opacity={0.55} />
        </mesh>
      ))}

      {environment === 'air' ? <AirFleet color={activePhase.color} /> : null}
      {environment === 'land' ? <HyperCity color={activePhase.color} /> : null}
      {environment === 'sea' ? <HydroArray color={activePhase.color} /> : null}
    </group>
  );
};

const usePhaseObserver = (phaseId, onFocus) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          onFocus(phaseId);
        }
      },
      { threshold: 0.55, rootMargin: '-15% 0px -30% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [phaseId, onFocus]);

  return ref;
};

const PhasePanel = ({ phase, onFocus, active }) => {
  const cardRef = usePhaseObserver(phase.id, onFocus);
  return (
    <article
      ref={cardRef}
      className={`phase-card${active ? ' is-active' : ''}`}
      style={{ '--phase-color': phase.color }}
    >
      <div className="phase-badge">
        <span>{phase.label}</span>
      </div>
      <h2>{phase.headline}</h2>
      <p>{phase.summary}</p>
      <ul>
        {phase.milestones.map((milestone) => (
          <li key={milestone}>{milestone}</li>
        ))}
      </ul>
    </article>
  );
};

const FutureJourney = ({ profile }) => {
  const [activePhaseId, setActivePhaseId] = useState(journeyPhases[0].id);
  const earthColumnRef = useRef(null);
  const handleFocus = useCallback((phaseId) => {
    setActivePhaseId((prev) => (prev === phaseId ? prev : phaseId));
  }, []);

  const activePhase = useMemo(
    () => journeyPhases.find((phase) => phase.id === activePhaseId) ?? journeyPhases[0],
    [activePhaseId]
  );

  const environment = useMemo(() => {
    if (activePhase.id === 'air') return 'air';
    if (activePhase.id === 'sea') return 'sea';
    return 'land';
  }, [activePhase.id]);

  const annotationLookup = useMemo(
    () => ({
      air: [
        {
          id: 'skyway',
          title: 'Skyway 12',
          detail: 'Autonomous flyer convoys glide between cloud hubs, stitching megacities into the stratosphere.',
          anchor: 'north',
        },
        {
          id: 'pods',
          title: 'Aurora Pods',
          detail: 'Citizen shuttles orbit in carbon-neutral rings, descending only when air quality hits optimum.',
          anchor: 'east',
        },
        {
          id: 'control',
          title: 'Atmos Control',
          detail: 'Climate beacons align jet streams to keep flight paths safe for space pods and sky gardens alike.',
          anchor: 'southwest',
        },
      ],
      land: [
        {
          id: 'spire',
          title: 'Hyper City Core',
          detail: 'Bio-reactive towers reroute sunlight, power, and water to millions within seconds.',
          anchor: 'north',
        },
        {
          id: 'transit',
          title: 'TerraDecks',
          detail: 'Floating plazas host agro-forests and mass transit spirals that grow with the city.',
          anchor: 'east',
        },
        {
          id: 'commons',
          title: 'Commons Grid',
          detail: 'Street-level habitats braid markets, schools, and maker bays into regenerative loops.',
          anchor: 'southwest',
        },
      ],
      sea: [
        {
          id: 'reef',
          title: 'Reef Conservatory',
          detail: 'Coral drones weave new reefs nightly while marine biomes glow with thriving life.',
          anchor: 'north',
        },
        {
          id: 'hydro',
          title: 'Hydro Arrays',
          detail: 'Tidal turbines harvest clean energy without disturbing migratory whales or kelp forests.',
          anchor: 'east',
        },
        {
          id: 'swarm',
          title: 'Ocean Swarm',
          detail: 'Guardian pods shepherd diverse aquatic species across climate-safe superhighways.',
          anchor: 'southwest',
        },
      ],
    }),
    []
  );

  const activeAnnotations = annotationLookup[environment] ?? annotationLookup.land;

  useEffect(() => {
    const node = earthColumnRef.current;
    if (!node) {
      return undefined;
    }

    const handlePointer = (event) => {
      const bounds = node.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      node.style.setProperty('--tilt-y', `${deltaX / 45}deg`);
      node.style.setProperty('--tilt-x', `${-deltaY / 40}deg`);
    };

    const handleLeave = () => {
      node.style.setProperty('--tilt-y', '0deg');
      node.style.setProperty('--tilt-x', '0deg');
    };

    node.addEventListener('pointermove', handlePointer);
    node.addEventListener('pointerleave', handleLeave);
    return () => {
      node.removeEventListener('pointermove', handlePointer);
      node.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return (
    <section className="earth-journey">
      <div ref={earthColumnRef} className="earth-column">
        <div className="earth-canvas-wrap">
          <Suspense fallback={<div className="earth-loading">Initializing terra-projection…</div>}>
            <Canvas
              className="earth-canvas"
              camera={{ position: [0, 0, 4] }}
              dpr={[1, 1.6]}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
              <Earth activePhase={activePhase} environment={environment} />
              <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
          </Suspense>
          <div className="earth-annotations">
            {activeAnnotations.map((annotation) => (
              <div key={annotation.id} className={`earth-annotation anchor-${annotation.anchor}`}>
                <span>{annotation.title}</span>
                <p>{annotation.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="earth-caption" style={{ '--phase-color': activePhase.color }}>
          <span>{activePhase.label}</span>
          <strong>{activePhase.headline}</strong>
        </div>
      </div>

      <div className="phases-column">
        <header className="phases-intro">
          <h1>Welcome to 2050, {profile.name}.</h1>
          <p>
            Track TerraVision's planetary upgrades across sky, land, oceans, and beneath the surface. Your stewardship
            over the next {2050 - profile.birthYear} years syncs with each phase to keep Earth thriving.
          </p>
        </header>

        <div className="phases-stack">
          {journeyPhases.map((phase) => (
            <PhasePanel
              key={phase.id}
              phase={phase}
              onFocus={handleFocus}
              active={phase.id === activePhase.id}
            />
          ))}
        </div>

        <footer className="phases-outro">
          <h3>Mission Continues</h3>
          <p>
            Your passport stays active when you pledge one micro-action this week. Share your commitment with Mission
            Control to unlock the next TerraVision briefing.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default FutureJourney;
