/**
 * Username rules for Stroop IDs.
 *
 * This module is intentionally dependency-free and runs unchanged on the client
 * (for instant feedback while typing) and on the server (as the authority).
 * The client never gets to decide whether a name is valid — it only previews it.
 */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 24;

/** Characters a Stroop ID may contain. */
const ALLOWED = /^[a-z0-9_-]+$/;
const EDGE_PUNCTUATION = /^[-_]|[-_]$/;
const HAS_LETTER = /[a-z]/;

/**
 * Names held back for the protocol, the network, and routes on stroop.id.
 * Extend this on the server side once the real registry exists.
 */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  // Stroop surface area
  "stroop",
  "stroopy",
  "stampbase",
  "passport",
  // Stellar / network
  "stellar",
  "soroban",
  "horizon",
  "lumens",
  "xlm",
  "sdf",
  // System routes
  "admin",
  "root",
  "api",
  "docs",
  "www",
  "mail",
  "help",
  "support",
  "about",
  "legal",
  "status",
  "security",
  "login",
  "signup",
  "settings",
  "id",
  "me",
]);

export type UsernameProblem =
  | "empty"
  | "too-short"
  | "too-long"
  | "charset"
  | "edge-punctuation"
  | "no-letter"
  | "reserved";

export type UsernameValidation =
  | { ok: true; username: string }
  | { ok: false; problem: UsernameProblem; message: string };

/**
 * Fold anything a person might paste into canonical form: lowercase, no
 * leading "@", no whitespace. Does not remove disallowed characters — use
 * {@link sanitizeUsernameInput} for the live input field.
 */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

/**
 * Normalize *and* drop characters that could never be part of an ID, so the
 * input field never displays a character the registry would reject.
 */
export function sanitizeUsernameInput(raw: string): string {
  return normalizeUsername(raw)
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, USERNAME_MAX);
}

export function validateUsername(raw: string): UsernameValidation {
  const username = normalizeUsername(raw);

  if (username.length === 0) {
    return { ok: false, problem: "empty", message: "Pick a name to claim." };
  }
  if (username.length < USERNAME_MIN) {
    return {
      ok: false,
      problem: "too-short",
      message: `Names are at least ${USERNAME_MIN} characters.`,
    };
  }
  if (username.length > USERNAME_MAX) {
    return {
      ok: false,
      problem: "too-long",
      message: `Names are at most ${USERNAME_MAX} characters.`,
    };
  }
  if (!ALLOWED.test(username)) {
    return {
      ok: false,
      problem: "charset",
      message: "Use lowercase letters, numbers, hyphens, or underscores.",
    };
  }
  if (EDGE_PUNCTUATION.test(username)) {
    return {
      ok: false,
      problem: "edge-punctuation",
      message: "Names can't start or end with a hyphen or underscore.",
    };
  }
  if (!HAS_LETTER.test(username)) {
    return {
      ok: false,
      problem: "no-letter",
      message: "Names need at least one letter.",
    };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return {
      ok: false,
      problem: "reserved",
      message: `@${username} is reserved by the network.`,
    };
  }

  return { ok: true, username };
}

/** Canonical public URL for a Stroop ID. */
export function stroopUrl(username: string): string {
  return `stroop.id/${username}`;
}
