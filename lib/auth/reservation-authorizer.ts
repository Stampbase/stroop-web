import type { ReservationProof } from "@/lib/registry/types";

/**
 * Produces the evidence that accompanies a reservation.
 *
 * The prototype reserves without authentication. When Passport or wallet
 * signing lands, this is the only place that changes: return a `passport` or
 * `stellar-signature` proof and the route handler will start enforcing it.
 */
export async function authorizeReservation(
  username: string,
): Promise<ReservationProof> {
  void username;
  return { kind: "none" };
}
