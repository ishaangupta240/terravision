# Portal to 2050 — TerraVision Gateway

An immersive single-page experience that onboards visitors into a speculative 2050 where TerraVision has achieved its sustainable development goals. Users authenticate with their name and date of birth to receive a personalized "passport to the future" before travelling through calm, data-rich mission checkpoints.

## Features

- 🎟️ **Future Passport Generator** — Capture visitor details and issue a unique, cookie-protected mission assignment.
- � **Persistent Credentials** — Once issued, the passport is locked in browser storage so it can’t be regenerated accidentally.
- 🖨️ **Anytime Passport Export** — Download a high-resolution PNG (with QR verification) from the card or global header.
- 🌍 **Earth Command Hub** — A WebGL earth anchors air, land, sea, and underground upgrades with a steady, interaction-friendly camera.
- � **Phase-Gated Mission Briefings** — Scroll each planetary layer to review the 2050 sustainability milestones without motion distractions.
- ♿ **Inclusive Interactions** — Keyboard-friendly controls, accessible colour contrast, and focus states.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm 9 or later

### Install dependencies

```powershell
npm install
```

### Run the development server

```powershell
npm run dev
```

Your terminal will display a local URL (defaults to `http://localhost:5173`). Open it in your browser to explore the portal.

### Build for production

```powershell
npm run build
```

### Preview the production build

```powershell
npm run preview
```

## Project Structure

```
.
├─ index.html            # Vite entry point
├─ src
│  ├─ App.jsx            # Core experience logic
│  ├─ App.css            # Page-level styling
│  ├─ index.css          # Global resets and fonts
│  ├─ main.jsx           # React bootstrap
│  ├─ components
│  │  ├─ AuroraBackground.jsx/.css
│  │  ├─ PassportForm.jsx/.css
│  │  ├─ PassportCard.jsx/.css
│  │  └─ FutureJourney.jsx/.css
│  └─ data
│     └─ journeyStops.js # Planetary phase content (air, land, sea, underground)
├─ package.json          # Scripts and dependencies
└─ vite.config.js        # Build configuration
```

## Accessibility & Customisation

- All interactive elements are keyboard navigable and have focus indicators.
- Adjust the mission copy or planetary phase content in `src/data/journeyStops.js`.
- Colours and gradients live in the component-specific CSS files for quick theming.

Reimagine, remix, and extend the journey to match your organisation’s sustainability narrative.
