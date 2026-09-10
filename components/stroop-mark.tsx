import { cn } from "@/lib/utils";

/**
 * The Stroop.ID mark: a stroopwafel — the round wafer and the lattice pressed
 * into it.
 *
 * Construction, on a single module u = 1.8 in a 24-unit box:
 *
 *   lattice stroke      1u      (1.8)
 *   every cell          2u      (3.6)   — centre cell and outer bands alike
 *   wafer inner radius  4u      (7.2)
 *   ring stroke         1.25u   (2.25)  — a stated 5:4 against the lattice
 *   wafer outer radius  5.25u   (9.45)
 *   lattice rotation    45°
 *
 * Two consequences worth knowing before editing any number here:
 *
 * 1. The lattice is struck as chords of the ring's centreline (r = 8.325) and
 *    the ring is painted *over* it. So each line terminates exactly on the arc
 *    — the curve does the clipping. Shortening these paths to "fit" reintroduces
 *    the ragged wedge gaps this construction exists to remove, and a <clipPath>
 *    would need a document-unique id, awkward for a mark rendered in both a
 *    server and a client component.
 *
 * 2. The chord half-length is exactly 7.875 (8.325² − 2.7² = 7.875²), which is
 *    why every coordinate below is exact rather than rounded.
 *
 * The lattice runs at 45° on purpose. Orthogonal, it reads as a wireframe globe
 * or a window; on the diagonal it can only be a waffle.
 */
export function StroopMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <g transform="rotate(45 12 12)">
        <path
          d="M9.3 4.125V19.875M14.7 4.125V19.875M4.125 9.3H19.875M4.125 14.7H19.875"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </g>
      <circle cx="12" cy="12" r="8.325" stroke="currentColor" strokeWidth="2.25" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 text-ink">
      <StroopMark className="h-[19px] w-[19px]" />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        Stroop.ID
      </span>
    </div>
  );
}
