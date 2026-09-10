/**
 * Deep space, rendered once on the server.
 *
 * Deterministic star placement keeps the markup identical between server and
 * client, so this stays a static server component with no hydration cost.
 */

/** mulberry32 — small, fast, and stable across runtimes. */
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  tint: string;
}

function generateStars(seed: number, count: number, maxRadius: number): Star[] {
  const random = seededRandom(seed);
  const stars: Star[] = [];

  for (let i = 0; i < count; i += 1) {
    const roll = random();
    stars.push({
      cx: Math.round(random() * 10000) / 100,
      cy: Math.round(random() * 10000) / 100,
      r: Math.round((0.35 + random() * maxRadius) * 100) / 100,
      opacity: Math.round((0.22 + random() * 0.62) * 100) / 100,
      // A handful of stars pick up the cold blue of the rest of the palette.
      tint: roll > 0.9 ? "#9ec4ff" : roll > 0.82 ? "#ffe6cf" : "#ffffff",
    });
  }

  return stars;
}

const FAR_STARS = generateStars(20260129, 260, 0.46);
const NEAR_STARS = generateStars(77400211, 62, 1.05);

function StarLayer({ stars, className }: { stars: Star[]; className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {stars.map((star, index) => (
        <circle
          key={index}
          cx={star.cx}
          cy={star.cy}
          r={star.r / 10}
          fill={star.tint}
          opacity={star.opacity}
        />
      ))}
    </svg>
  );
}

export function CosmicBackground() {
  return (
    <div className="cosmos" aria-hidden="true">
      <StarLayer stars={FAR_STARS} className="starfield starfield-far" />
      <StarLayer stars={NEAR_STARS} className="starfield starfield-near" />
      <div className="cosmos-glow" />
      <div className="cosmos-vignette" />
    </div>
  );
}
