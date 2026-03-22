import React, { useEffect, useRef } from "react";

// Config for each bee: scale, speed, vertical zone, phase offset, direction, trail size
const BEE_CONFIGS = [
  { scale: 1.0,  speed: 0.00208, yFraction: 0.25, phase: 0.0,  dirX: 1,  swayAmp: 90, curveAmp: 110, trailSize: 6 },
  { scale: 0.70, speed: 0.00280, yFraction: 0.65, phase: 0.35, dirX: -1, swayAmp: 75, curveAmp:  85, trailSize: 5 },
  { scale: 0.55, speed: 0.00350, yFraction: 0.38, phase: 0.60, dirX: 1,  swayAmp: 60, curveAmp:  70, trailSize: 4 },
  { scale: 0.85, speed: 0.00240, yFraction: 0.82, phase: 0.80, dirX: -1, swayAmp: 85, curveAmp: 100, trailSize: 5 },
];

interface SingleBeeProps {
  scale: number;
  speed: number;
  yFraction: number;
  phase: number;
  dirX: number; // 1 for right, -1 for left
  swayAmp: number;
  curveAmp: number;
  trailSize: number;
  isMobile: boolean;
}

function SingleBee({ scale, speed, yFraction, phase, dirX, swayAmp, curveAmp, trailSize, isMobile }: SingleBeeProps) {
  const beeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bee = beeRef.current;
    if (!bee) return;

    const mobileScale = isMobile ? 0.67 : 1;
    const w = Math.round(120 * scale * mobileScale);
    const h = Math.round(90 * scale * mobileScale);
    bee.style.width = `${w}px`;
    bee.style.height = `${h}px`;

    let t = phase;
    let animId: number;
    let hidden = false;

    const onVisibility = () => { hidden = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const createTrail = (x: number, y: number) => {
      const dot = document.createElement("div");
      dot.style.cssText = `
        position:fixed;width:${trailSize}px;height:${trailSize}px;
        background:#FFB800;border-radius:50%;pointer-events:none;
        z-index:998;left:${x}px;top:${y}px;
        animation:beeTrailFade 0.8s ease-out forwards;
      `;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 800);
    };

    let trailCount = 0;

    const fly = () => {
      animId = requestAnimationFrame(fly);
      if (hidden) return;

      t += speed;

      const progress = t % 1;
      
      // Calculate X based on direction
      let x;
      if (dirX === 1) {
        // Move Left -> Right
        x = progress * (window.innerWidth + 240) - 120;
      } else {
        // Move Right -> Left
        x = (1 - progress) * (window.innerWidth + 240) - 120;
      }

      const baseY = window.innerHeight * yFraction;
      const sway = Math.sin(t * 5 + phase * 10) * swayAmp;
      const curve = Math.sin(t * 2.2 + phase * 5) * curveAmp;
      const y = baseY + sway + curve;

      const tiltY = Math.sin(t * 5) * 12 * dirX;
      const tiltX = Math.cos(t * 2.2) * 6;
      
      // Flip the SVG if moving left
      const flip = dirX === -1 ? "scaleX(-1)" : "scaleX(1)";

      bee.style.transform = `translate(${x}px, ${y}px) rotate(${tiltY}deg) rotateX(${tiltX}deg) ${flip}`;

      trailCount++;
      if (trailCount % 15 === 0) {
        // Trail follows the "stinger" end
        const trailX = dirX === 1 ? x + w * 0.35 : x + w * 0.65;
        createTrail(trailX, y + h * 0.33);
      }
    };

    fly();

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isMobile]);

  const w = Math.round(120 * scale);
  const h = Math.round(90 * scale);

  return (
    <div
      ref={beeRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
        pointerEvents: "none",
        willChange: "transform",
        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.2))",
        width: `${w}px`,
        height: `${h}px`,
      }}
    >
      <svg viewBox="0 0 120 90" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* Wings */}
        <ellipse className="bee-wing-top" cx="58" cy="22" rx="30" ry="16"
          fill="rgba(220,235,255,0.7)" stroke="#aac" strokeWidth="1" />
        <ellipse className="bee-wing-bottom" cx="80" cy="24" rx="24" ry="13"
          fill="rgba(220,235,255,0.6)" stroke="#aac" strokeWidth="1" />

        {/* Chubby body */}
        <ellipse cx="65" cy="52" rx="38" ry="28" fill="#FFB800" />
        <ellipse cx="65" cy="52" rx="38" ry="28"
          fill="none" stroke="#3D2000" strokeWidth="5" strokeDasharray="10 9" />

        {/* Big round head */}
        <circle cx="26" cy="48" r="22" fill="#FFB800" />
        <circle cx="26" cy="48" r="22" fill="none" stroke="#3D2000" strokeWidth="2" />

        {/* Left eye */}
        <circle cx="19" cy="43" r="7" fill="white" />
        <circle cx="20" cy="44" r="4" fill="#1a1a1a" />
        <circle cx="22" cy="42" r="1.5" fill="white" />

        {/* Right eye */}
        <circle cx="33" cy="43" r="7" fill="white" />
        <circle cx="34" cy="44" r="4" fill="#1a1a1a" />
        <circle cx="36" cy="42" r="1.5" fill="white" />

        {/* Rosy cheeks */}
        <circle cx="14" cy="52" r="6" fill="#FF9999" opacity="0.5" />
        <circle cx="38" cy="52" r="6" fill="#FF9999" opacity="0.5" />

        {/* Happy smile */}
        <path d="M14 54 Q26 64 38 54" fill="none"
          stroke="#3D2000" strokeWidth="2.5" strokeLinecap="round" />

        {/* Stinger */}
        <polygon points="103,48 103,56 112,52" fill="#3D2000" />

        {/* Heart antennae left */}
        <g className="bee-antenna-left">
          <line x1="18" y1="27" x2="10" y2="10" stroke="#3D2000" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M7 7 C7 4, 10 4, 10 7 C10 4, 13 4, 13 7 Q13 10, 10 13 Q7 10, 7 7Z" fill="#FF6B6B" />
        </g>

        {/* Heart antennae right */}
        <g className="bee-antenna-right">
          <line x1="30" y1="26" x2="25" y2="8" stroke="#3D2000" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 5 C22 2, 25 2, 25 5 C25 2, 28 2, 28 5 Q28 8, 25 11 Q22 8, 22 5Z" fill="#FF6B6B" />
        </g>

        {/* Sparkles */}
        <text x="88" y="20" fontSize="12">✨</text>
        <text x="100" y="35" fontSize="8">⭐</text>
      </svg>
    </div>
  );
}

export function FlyingBee() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Respect reduced motion — show first bee static only
  if (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return (
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, pointerEvents: "none", width: 80, height: 60 }}>
        <svg viewBox="0 0 120 90" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="65" cy="52" rx="38" ry="28" fill="#FFB800" />
          <circle cx="26" cy="48" r="22" fill="#FFB800" />
          <circle cx="19" cy="43" r="7" fill="white" /><circle cx="20" cy="44" r="4" fill="#1a1a1a" />
          <circle cx="33" cy="43" r="7" fill="white" /><circle cx="34" cy="44" r="4" fill="#1a1a1a" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes wingFlap {
          0%, 100% { transform: scaleY(1) rotate(-5deg); }
          50%       { transform: scaleY(0.25) rotate(6deg); }
        }
        @keyframes antennaWobble {
          0%, 100% { transform: rotate(-6deg); }
          50%       { transform: rotate(6deg); }
        }
        @keyframes beeTrailFade {
          0%   { opacity: 0.5; transform: scale(1); }
          100% { opacity: 0;   transform: scale(0); }
        }
        .bee-wing-top {
          animation: wingFlap 0.12s ease-in-out infinite;
          transform-origin: 50% 100%;
        }
        .bee-wing-bottom {
          animation: wingFlap 0.12s ease-in-out infinite 0.06s;
          transform-origin: 50% 100%;
        }
        .bee-antenna-left {
          animation: antennaWobble 0.5s ease-in-out infinite;
          transform-origin: 18px 27px;
        }
        .bee-antenna-right {
          animation: antennaWobble 0.5s ease-in-out infinite 0.25s;
          transform-origin: 30px 26px;
        }
      `}</style>
      {BEE_CONFIGS.map((cfg, i) => (
        <SingleBee key={i} {...cfg} isMobile={isMobile} />
      ))}
    </>
  );
}
