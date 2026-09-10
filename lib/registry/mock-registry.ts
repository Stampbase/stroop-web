import { stroopUrl, validateUsername } from "@/lib/usernames";
import type {
  AvailabilityResult,
  IdentityRegistry,
  ReservationProof,
  ReservationResult,
} from "@/lib/registry/types";

/**
 * Names that read as already-spoken-for, so the demo has some friction.
 * Replaced wholesale by registry state once the contract is live.
 */
const CLAIMED = new Set([
  "bastian",
  "alex",
  "satoshi",
  "jed",
  "lumen",
  "nova",
  "orbit",
  "vega",
  "atlas",
  "pilot",
  "ripple",
  "anchor",
]);

/** Reservations made during this server process, so re-checks stay consistent. */
const sessionReservations = new Map<string, string>();

/** Deterministic 32-bit hash — same name always gets the same verdict. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Short names are the ones people fight over, so most of them are gone.
 * Everything else is spoken for at a stable ~20% rate.
 */
function looksClaimed(username: string): boolean {
  if (CLAIMED.has(username)) return true;
  if (username.length <= 3) return hash(username) % 100 < 85;
  if (username.length === 4) return hash(username) % 100 < 55;
  return hash(username) % 100 < 20;
}

/** Simulated network latency, so loading states are real rather than theoretical. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MockIdentityRegistry implements IdentityRegistry {
  async checkAvailability(username: string): Promise<AvailabilityResult> {
    const validation = validateUsername(username);

    if (!validation.ok) {
      return {
        username: username.trim().toLowerCase(),
        status: validation.problem === "reserved" ? "reserved" : "invalid",
        message: validation.message,
      };
    }

    await delay(180 + (hash(validation.username) % 220));

    const name = validation.username;
    if (sessionReservations.has(name) || looksClaimed(name)) {
      return {
        username: name,
        status: "taken",
        message: `@${name} is already claimed.`,
      };
    }

    return { username: name, status: "available" };
  }

  async reserve(
    username: string,
    proof: ReservationProof,
  ): Promise<ReservationResult> {
    const validation = validateUsername(username);

    if (!validation.ok) {
      return {
        username: username.trim().toLowerCase(),
        reserved: false,
        url: stroopUrl(username.trim().toLowerCase()),
        reason: validation.message,
      };
    }

    const name = validation.username;

    // Where a Passport token or Stellar signature will be verified.
    void proof;

    await delay(420);

    if (sessionReservations.has(name) || looksClaimed(name)) {
      return {
        username: name,
        reserved: false,
        url: stroopUrl(name),
        reason: `@${name} is already claimed.`,
      };
    }

    const reservedAt = new Date().toISOString();
    sessionReservations.set(name, reservedAt);

    return { username: name, reserved: true, reservedAt, url: stroopUrl(name) };
  }
}

/**
 * The single registry instance the API routes talk to. Swapping in the real
 * Soroban-backed registry is a one-line change here.
 */
export const registry: IdentityRegistry = new MockIdentityRegistry();
