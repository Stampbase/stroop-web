import type { AvailabilityResult, ReservationResult } from "@/lib/registry/types";
import { normalizeUsername, stroopUrl } from "@/lib/usernames";

/**
 * Browser-side access to the registry. UI components call these two functions
 * and never reach for `fetch` themselves, so the transport can move to a
 * direct contract call without touching a component.
 */

export async function checkUsernameAvailability(
  username: string,
  signal?: AbortSignal,
): Promise<AvailabilityResult> {
  const name = normalizeUsername(username);
  const response = await fetch(
    `/api/username/availability?username=${encodeURIComponent(name)}`,
    { signal, headers: { accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(`Availability check failed (${response.status})`);
  }

  return (await response.json()) as AvailabilityResult;
}

export async function reserveUsername(
  username: string,
): Promise<ReservationResult> {
  const name = normalizeUsername(username);
  const response = await fetch("/api/username/reserve", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: name }),
  });

  if (response.status >= 500) {
    throw new Error(`Reservation failed (${response.status})`);
  }

  const result = (await response.json().catch(() => null)) as
    | ReservationResult
    | { error: string }
    | null;

  if (!result || !("username" in result)) {
    return {
      username: name,
      reserved: false,
      url: stroopUrl(name),
      reason: "That didn't go through. Try again.",
    };
  }

  return result;
}
