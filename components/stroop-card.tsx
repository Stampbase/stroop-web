"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { StroopMark } from "@/components/stroop-mark";
import { stroopUrl } from "@/lib/usernames";

/** How the card is holding itself. */
export type CardPose = "resting" | "settled" | "claimed";

/** Base rotation per pose, in degrees. Kept small — the card reads as a real
 *  object, and real objects on a table are not rotated forty degrees. */
const POSES: Record<CardPose, { x: number; y: number }> = {
  resting: { x: 6, y: 13 },
  settled: { x: 4, y: 8 },
  claimed: { x: 2.5, y: 5 },
};

/** Maximum extra rotation contributed by the pointer. */
const TILT = 4.5;

const SPRING = { stiffness: 130, damping: 22, mass: 0.7 } as const;

/** The milled edge, built from slabs so it rotates with the card in 3D
 *  instead of being a box-shadow pretending to have depth. Depths are
 *  fractions of `--card-thickness`, so the edge stays in proportion from
 *  phone to desktop. */
const SLABS = [
  { t: 0.06, background: "linear-gradient(157deg,#ffffff,#dbe2ea 40%,#a7b0bb)" },
  { t: 0.16, background: "linear-gradient(157deg,#eef2f7,#c2cad5 45%,#8b939e)" },
  { t: 0.3, background: "linear-gradient(157deg,#9aa2ad,#6b7580 50%,#464e58)" },
  { t: 0.45, background: "linear-gradient(157deg,#7c848f,#525a65 50%,#353d46)" },
  { t: 0.6, background: "linear-gradient(157deg,#646c77,#3f4750 50%,#272e36)" },
  { t: 0.75, background: "linear-gradient(157deg,#4f5761,#313841 50%,#1c222a)" },
  { t: 0.88, background: "linear-gradient(157deg,#3d444d,#242b33 50%,#141a20)" },
  { t: 1, background: "linear-gradient(157deg,#2c333b,#1a2027 50%,#0d1216)" },
];

const PLACEHOLDER = "yourname";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface StroopCardProps {
  username: string;
  pose: CardPose;
  /** The name that just came back available, or null. Mounting this layer
   *  is what replays the confirmation light sweep. */
  confirmSweep: string | null;
}

export function StroopCard({ username, pose, confirmSweep }: StroopCardProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pointerEnabled, setPointerEnabled] = useState(false);
  const reducedMotion = useReducedMotion();

  const base = POSES[pose];

  const rotateX = useSpring(base.x, SPRING);
  const rotateY = useSpring(base.y, SPRING);

  const isPlaceholder = username.length === 0;
  const display = isPlaceholder ? PLACEHOLDER : username;

  // Long names shrink so the engraving always fits the glass. The factor keeps
  // the rendered width roughly constant while letting short names run large.
  const nameScale = useMemo(
    () => Math.min(1.35, 8.2 / (display.length + 1)),
    [display.length],
  );

  // Pointer tilt is a desktop affordance only, and never runs when the visitor
  // has asked for reduced motion.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () =>
      setPointerEnabled(finePointer.matches && !reducedMotion.matches);

    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);

    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  // Springs are a JS animation, so the CSS reduced-motion rules do not reach
  // them: cut to the new pose instead of easing into it.
  useEffect(() => {
    if (reducedMotion) {
      rotateX.jump(base.x);
      rotateY.jump(base.y);
    } else {
      rotateX.set(base.x);
      rotateY.set(base.y);
    }
  }, [base.x, base.y, reducedMotion, rotateX, rotateY]);

  useEffect(() => {
    if (!pointerEnabled) return;

    let frame = 0;

    const handleMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const stage = stageRef.current;
        if (!stage) return;

        const rect = stage.getBoundingClientRect();
        const nx = clamp(
          (event.clientX - (rect.left + rect.width / 2)) / rect.width,
          -1,
          1,
        );
        const ny = clamp(
          (event.clientY - (rect.top + rect.height / 2)) / rect.height,
          -1,
          1,
        );

        stage.style.setProperty("--px", (0.5 + nx * 0.6).toFixed(3));
        stage.style.setProperty("--py", (0.5 + ny * 0.6).toFixed(3));

        rotateX.set(base.x - ny * TILT);
        rotateY.set(base.y + nx * TILT);
      });
    };

    window.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pointerEnabled, base.x, base.y, rotateX, rotateY]);

  return (
    <div ref={stageRef} className="card-stage" aria-hidden="true">
      <div className="card-float">
        <motion.div className="card-tilt" style={{ rotateX, rotateY }}>
          <div className="card-body">
            {SLABS.map((slab) => (
              <div
                key={slab.t}
                className="card-slab"
                style={{
                  transform: `translateZ(calc(var(--card-thickness) * -${slab.t}))`,
                  background: slab.background,
                }}
              />
            ))}

            <div className="card-face">
              <div className="card-layer layer-base" />
              <div className="card-layer layer-brush" />
              <div className="card-layer layer-sheen" />
              <OrbitEtch />
              <div className="card-layer layer-cosmic" />
              <div className="card-layer layer-grain" />
              <div className="card-layer layer-sweep" />
              {confirmSweep ? (
                <div
                  key={confirmSweep}
                  className="card-layer layer-confirm-sweep"
                />
              ) : null}
              <div className="card-layer layer-specular" />

              <div className="card-content">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-[1.6cqw] text-[#1c222a]/70">
                    <StroopMark className="h-[3.4cqw] w-[3.4cqw] min-h-3 min-w-3" />
                    <span className="engraved-mark">Stroop.ID</span>
                  </div>
                  <span className="engraved-mark engraved-mark-dim">
                    Genesis / 2026
                  </span>
                </div>

                <div
                  className="glass-band"
                  style={{ marginInline: "-6.4cqw" }}
                >
                  <span
                    className="engraved-name"
                    style={{
                      fontSize: `calc(${nameScale} * 13.4cqw)`,
                      opacity: isPlaceholder ? 0.5 : 1,
                    }}
                  >
                    @{display}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <span className="engraved-mark">Stellar Identity</span>
                  <span
                    className="engraved-mark engraved-mark-url"
                    style={{ opacity: isPlaceholder ? 0.72 : 1 }}
                  >
                    {stroopUrl(display)}
                  </span>
                </div>
              </div>

              <div className="card-layer layer-rim" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="card-shadow" />
    </div>
  );
}

/**
 * An orbital trace etched into the blank. It runs beneath the glass band on
 * purpose — watching the line blur as it passes under the panel is what sells
 * the glass as glass.
 */
function OrbitEtch() {
  return (
    <svg
      className="orbit-etch"
      viewBox="0 0 1586 1000"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* Lit lip, sitting just below the cut. */}
      <g transform="translate(0 1.6)" stroke="rgb(255 255 255 / 0.5)">
        <ellipse
          cx="1140"
          cy="392"
          rx="655"
          ry="252"
          transform="rotate(-21 1140 392)"
          strokeWidth="1.7"
        />
        <ellipse
          cx="1140"
          cy="392"
          rx="392"
          ry="151"
          transform="rotate(-21 1140 392)"
          strokeWidth="1.3"
        />
      </g>
      {/* The groove itself. */}
      <g stroke="rgb(18 24 32 / 0.3)">
        <ellipse
          cx="1140"
          cy="392"
          rx="655"
          ry="252"
          transform="rotate(-21 1140 392)"
          strokeWidth="1.7"
        />
        <ellipse
          cx="1140"
          cy="392"
          rx="392"
          ry="151"
          transform="rotate(-21 1140 392)"
          strokeWidth="1.3"
        />
      </g>
      <circle cx="510" cy="536" r="6.5" fill="rgb(18 24 32 / 0.34)" />
      <circle cx="510" cy="537.6" r="6.5" fill="rgb(255 255 255 / 0.34)" />
    </svg>
  );
}
