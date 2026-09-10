/**
 * The contract between this landing page and whatever is actually holding
 * Stroop IDs. Today that is an in-memory mock; later it is the Stroop Identity
 * Registry on Soroban. Nothing above this interface should need to change.
 */

export type AvailabilityStatus = "available" | "taken" | "reserved" | "invalid";

export interface AvailabilityResult {
  /** Canonical (normalized) form of the name that was checked. */
  username: string;
  status: AvailabilityStatus;
  /** Human-readable detail, present when the name cannot be claimed. */
  message?: string;
}

/**
 * Evidence that the claimant is entitled to the name.
 *
 * The reservation prototype ships with `none`. The other variants exist so the
 * call sites and route handlers are already shaped for real authentication —
 * adding Passport or a wallet signature means implementing an authorizer, not
 * reworking the flow.
 */
export type ReservationProof =
  | { kind: "none" }
  | { kind: "passport"; token: string }
  | {
      kind: "stellar-signature";
      /** G... account that signed. */
      account: string;
      /** Base64 signature over `payload`. */
      signature: string;
      payload: string;
    };

export interface ReservationResult {
  username: string;
  reserved: boolean;
  /** ISO-8601. Present when `reserved` is true. */
  reservedAt?: string;
  /** Canonical public URL, e.g. `stroop.id/bastian`. */
  url: string;
  /** Why the reservation failed, when it did. */
  reason?: string;
}

export interface IdentityRegistry {
  checkAvailability(username: string): Promise<AvailabilityResult>;
  reserve(username: string, proof: ReservationProof): Promise<ReservationResult>;
}
