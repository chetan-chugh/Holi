import { useState, useRef, useEffect, useCallback } from "react";

const HOLI_COLORS = [
  "#FF3CAC", "#F7971E", "#FFD700", "#00C9FF", "#39FF14",
  "#FF6B6B", "#C471ED", "#12c2e9", "#f64f59", "#43e97b",
  "#fa709a", "#fee140", "#a18cd1", "#84fab0", "#f093fb",
];

function randomColor() {
  return HOLI_COLORS[Math.floor(Math.random() * HOLI_COLORS.length)];
}

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function generateSplatPath(numPoints = 16, baseRadius = 70) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const isSpike = i % 2 === 0;
    const r = isSpike
      ? baseRadius * randomBetween(1.2, 2.0)
      : baseRadius * randomBetween(0.45, 0.8);
    points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  let d = "";
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    const nn = points[(i + 2) % points.length];
    const mx = (next.x + nn.x) / 2;
    const my = (next.y + nn.y) / 2;
    if (i === 0) d += `M ${(curr.x + next.x) / 2} ${(curr.y + next.y) / 2} `;
    d += `Q ${next.x} ${next.y} ${mx} ${my} `;
  }
  d += "Z";
  return d;
}

// Water Balloon component that flies up and then splats
function WaterBalloon({ id, startX, targetX, targetY, color, onSplat }) {
  const [phase, setPhase] = useState("flying"); // "flying" | "splat"
  const [splatVisible, setSplatVisible] = useState(false);

  // Duration of flight
  const flightDuration = useRef(randomBetween(900, 1500)).current;
  const balloonSize = useRef(randomBetween(12, 20)).current;

  useEffect(() => {
    // After flight duration, trigger splat
    const t = setTimeout(() => {
      setPhase("splat");
      requestAnimationFrame(() => setSplatVisible(true));
      // Remove after fade
      setTimeout(() => onSplat(id), 9000);
    }, flightDuration);
    return () => clearTimeout(t);
  }, [flightDuration, id, onSplat]);

  const darkerColor = useRef(randomColor()).current;
  const scale = useRef(randomBetween(0.85, 1.4)).current;
  const splatPath = useRef(generateSplatPath(18, randomBetween(50, 80))).current;
  const baseRadius = randomBetween(50, 80);

  const droplets = useRef(
    Array.from({ length: Math.floor(randomBetween(8, 16)) }, () => ({
      angle: randomBetween(0, Math.PI * 2),
      dist: randomBetween(70, 170),
      r: randomBetween(3, 14),
    }))
  ).current;

  const uid = `b${id}`;

  if (phase === "flying") {
    return (
      <div
        style={{
          position: "fixed",
          left: startX,
          bottom: -60,
          pointerEvents: "none",
          zIndex: 50,
          transform: "translateX(-50%)",
          animation: `balloonFly ${flightDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          "--target-x": `${targetX - startX}px`,
          "--target-y": `calc(-100vh + ${targetY}px + 60px)`,
        }}
      >
        <svg width={16} height={16} viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" fill={color} />
        </svg>
      </div>
    );
  }

  // Splat phase
  return (
    <div
      style={{
        position: "fixed",
        left: targetX,
        top: targetY,
        pointerEvents: "none",
        zIndex: 50,
        transform: "translate(-50%, -50%)",
      }}
    >
      <svg
        width="480"
        height="480"
        viewBox="-240 -240 480 480"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id={`g-${uid}`} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="40%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={darkerColor} stopOpacity="1" />
          </radialGradient>
          <filter id={`f-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor={color} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Satellite droplets */}
        {droplets.map((d, i) => {
          const cx = Math.cos(d.angle) * d.dist * scale;
          const cy = Math.sin(d.angle) * d.dist * scale;
          return (
            <circle
              key={`drop-${i}`}
              cx={cx} cy={cy}
              r={d.r * scale}
              fill={color}
              opacity={splatVisible ? 0.9 : 0}
              style={{
                transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                transitionDelay: `${0.04 + i * 0.03}s`,
                transform: splatVisible ? "scale(1)" : "scale(0)",
                transformOrigin: `${cx}px ${cy}px`,
                animation: splatVisible ? `splatFade 9s 2s ease-in forwards` : "none",
              }}
            />
          );
        })}

        {/* Main splat body */}
        <g
          style={{
            transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
            transform: splatVisible ? `scale(${scale})` : "scale(0)",
            transformOrigin: "0 0",
            opacity: splatVisible ? 1 : 0,
            animation: splatVisible ? `splatFade 9s 2s ease-in forwards` : "none",
          }}
        >
          <path
            d={splatPath}
            fill={`url(#g-${uid})`}
            filter={`url(#f-${uid})`}
          />
          <path
            d={generateSplatPath(12, 28)}
            fill="white"
            opacity="0.2"
          />
          <ellipse
            cx={-15}
            cy={-15}
            rx={20}
            ry={12}
            fill="white"
            opacity="0.35"
            transform="rotate(-30)"
          />
        </g>
      </svg>
    </div>
  );
}

function BackgroundBlobs() {
  const blobs = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      color: HOLI_COLORS[i % HOLI_COLORS.length],
      size: randomBetween(120, 300),
      x: randomBetween(5, 95),
      y: randomBetween(5, 95),
      duration: randomBetween(8, 20),
      delay: randomBetween(0, 12),
    }))
  ).current;

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      {blobs.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: b.color,
            opacity: 0.18,
            filter: "blur(60px)",
            transform: "translate(-50%,-50%)",
            animation: `blobFloat ${b.duration}s ${b.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [balloons, setBalloons] = useState([]);
  const counter = useRef(0);

  const launchBalloon = useCallback(() => {
    const id = counter.current++;
    const startX = randomBetween(60, window.innerWidth - 60);
    const targetX = randomBetween(80, window.innerWidth - 80);
    const targetY = randomBetween(80, window.innerHeight - 80);
    const color = randomColor();
    setBalloons((prev) => [...prev, { id, startX, targetX, targetY, color }]);
  }, []);

  // Also allow manual click
  const handleClick = useCallback((e) => {
    const id = counter.current++;
    setBalloons((prev) => [
      ...prev,
      {
        id,
        startX: randomBetween(60, window.innerWidth - 60),
        targetX: e.clientX,
        targetY: e.clientY,
        color: randomColor(),
      },
    ]);
  }, []);

  const removeBalloon = useCallback((id) => {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Auto-launch balloons on interval
  useEffect(() => {
    // Launch a few immediately
    for (let i = 0; i < 3; i++) {
      setTimeout(() => launchBalloon(), i * 400);
    }
    // Then keep launching
    const interval = setInterval(() => {
      const count = Math.floor(randomBetween(1, 3));
      for (let i = 0; i < count; i++) {
        setTimeout(() => launchBalloon(), i * randomBetween(200, 600));
      }
    }, randomBetween(1200, 2200));
    return () => clearInterval(interval);
  }, [launchBalloon]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { min-height: 100vh; }
        body { background: linear-gradient(135deg, #0d0b1e 0%, #1a1035 50%, #0d0b1e 100%); cursor: crosshair; }

        @keyframes blobFloat {
          from { transform: translate(-50%,-50%) scale(1); }
          to   { transform: translate(-50%,-50%) scale(1.6); }
        }

        @keyframes splatFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes balloonFly {
          0% {
            transform: translateX(-50%) translate(0, 0) rotate(0deg);
          }
          20% {
            transform: translateX(-50%) translate(calc(var(--target-x) * 0.2), calc(var(--target-y) * 0.2)) rotate(-8deg);
          }
          60% {
            transform: translateX(-50%) translate(calc(var(--target-x) * 0.6), calc(var(--target-y) * 0.6)) rotate(6deg);
          }
          85% {
            transform: translateX(-50%) translate(calc(var(--target-x) * 0.9), calc(var(--target-y) * 0.9)) rotate(-4deg);
          }
          100% {
            transform: translateX(-50%) translate(var(--target-x), var(--target-y)) rotate(0deg);
            opacity: 0;
          }
        }

        @keyframes titleWave {
          0%,100% { transform: translateY(0) rotate(-1.5deg); }
          50%     { transform: translateY(-10px) rotate(1.5deg); }
        }

        @keyframes colorShift {
          0%   { filter: hue-rotate(0deg) drop-shadow(0 0 30px rgba(255,100,200,0.5)); }
          50%  { filter: hue-rotate(30deg) drop-shadow(0 0 40px rgba(255,200,100,0.6)); }
          100% { filter: hue-rotate(0deg) drop-shadow(0 0 30px rgba(255,100,200,0.5)); }
        }

        @keyframes hintBounce {
          0%,100% { transform: translateY(0); opacity: 0.6; }
          50%     { transform: translateY(-6px); opacity: 1; }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        onClick={handleClick}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          userSelect: "none",
          overflow: "hidden",
        }}
      >
        <BackgroundBlobs />

        {/* Floating color particles */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: HOLI_COLORS[i % HOLI_COLORS.length],
                animation: `sparkle ${2 + Math.random() * 3}s ${Math.random() * 5}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Pacifico', cursive",
            fontSize: "clamp(3rem, 12vw, 9rem)",
            background: "linear-gradient(120deg, #FF3CAC 0%, #FFD700 25%, #00C9FF 50%, #39FF14 75%, #FF6B6B 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "titleWave 3s ease-in-out infinite, colorShift 5s ease-in-out infinite",
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "0 1rem",
            lineHeight: 1.3,
            textShadow: "none",
            marginBottom: "0.5rem",
            paddingBottom: "40px",
            overflow: "visible",
          }}
        >
          Happy Holi!
        </h1>

        {/* Subtitle */}
        {/* <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            color: "rgba(255,255,255,0.75)",
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            animation: "hintBounce 2s ease-in-out infinite",
            zIndex: 10,
            textAlign: "center",
            marginTop: "1rem",
            padding: "0 1rem",
          }}
        >
          🎨 Click anywhere to splash colors! 🎨
        </p> */}

        {/* Decorative elements around title */}
        <div style={{ position: "absolute", zIndex: 5 }}>
          {HOLI_COLORS.slice(0, 8).map((color, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 180;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: color,
                  opacity: 0.6,
                  filter: "blur(3px)",
                  animation: `sparkle ${3 + i * 0.3}s ${i * 0.2}s ease-in-out infinite`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </div>

        {/* Balloons layer */}
        {balloons.map((b) => (
          <WaterBalloon
            key={b.id}
            id={b.id}
            startX={b.startX}
            targetX={b.targetX}
            targetY={b.targetY}
            color={b.color}
            onSplat={removeBalloon}
          />
        ))}
      </div>
    </>
  );
}