import './AuroraBackground.css';

const AuroraBackground = () => {
  const layers = [185, 225, 320];

  return (
    <div className="aurora-wrapper" aria-hidden>
      {layers.map((hue) => (
        <div key={hue} className="aurora-layer" style={{ '--hue': hue }} />
      ))}
      <div className="stars" />
      <div className="grid" />
    </div>
  );
};

export default AuroraBackground;
