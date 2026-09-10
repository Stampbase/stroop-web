"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, LoaderCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ReservationSuccess } from "@/components/reservation-success";
import { StroopCard, type CardPose } from "@/components/stroop-card";
import {
  checkUsernameAvailability,
  reserveUsername,
} from "@/lib/reservation-service";
import type { ReservationResult } from "@/lib/registry/types";
import { sanitizeUsernameInput, validateUsername } from "@/lib/usernames";

/** Long enough that the registry isn't queried on every keystroke, short
 *  enough that the answer still feels immediate. */
const CHECK_DEBOUNCE_MS = 340;

const REGISTRY_UNREACHABLE = "Couldn't reach the registry. Try again.";

/** What the registry last said, and which name it said it about. */
interface RemoteAnswer {
  username: string;
  kind: "available" | "unavailable" | "error";
  message?: string;
}

type Status =
  | { kind: "empty" }
  | { kind: "invalid"; message: string }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "unavailable"; message: string }
  | { kind: "error"; message: string };

export function UsernameReservation() {
  const [username, setUsername] = useState("");
  const [remote, setRemote] = useState<RemoteAnswer | null>(null);
  const [reservation, setReservation] = useState<ReservationResult | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const reducedMotion = useReducedMotion();

  const validation = useMemo(() => validateUsername(username), [username]);

  /**
   * Everything that can be known locally is derived, not stored. Only the
   * registry's answer lives in state, and it counts only while it still
   * describes the name currently in the field.
   */
  const status: Status = useMemo(() => {
    if (username.length === 0) return { kind: "empty" };
    if (!validation.ok) {
      return { kind: "invalid", message: validation.message };
    }
    if (remote?.username === validation.username) {
      if (remote.kind === "available") return { kind: "available" };
      return {
        kind: remote.kind,
        message: remote.message ?? `@${remote.username} is taken.`,
      };
    }
    return { kind: "checking" };
  }, [username, validation, remote]);

  // Ask the registry about the current name, and abandon answers that arrive
  // after the field has moved on.
  useEffect(() => {
    if (reservation || !validation.ok) return;

    const controller = new AbortController();
    const name = validation.username;

    const timer = setTimeout(() => {
      checkUsernameAvailability(name, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          setRemote({
            username: result.username,
            kind: result.status === "available" ? "available" : "unavailable",
            message: result.message,
          });
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setRemote({
            username: name,
            kind: "error",
            message: REGISTRY_UNREACHABLE,
          });
        });
    }, CHECK_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [validation, reservation]);

  const canClaim = validation.ok && status.kind === "available" && !isReserving;

  // Motion's animations are driven in JS, so reduced motion has to be honoured
  // here as well as in the stylesheet.
  const lift = reducedMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 150, damping: 20, mass: 0.7 } as const);
  const swap = (delay: number) =>
    reducedMotion
      ? { duration: 0 }
      : { duration: delay, ease: [0.2, 0.7, 0.3, 1] as const };
  const offset = reducedMotion ? 0 : 14;

  const pose: CardPose = reservation
    ? "claimed"
    : status.kind === "available"
      ? "settled"
      : "resting";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canClaim || !validation.ok) return;

    const name = validation.username;
    setIsReserving(true);

    try {
      const result = await reserveUsername(name);
      if (result.reserved) {
        setReservation(result);
      } else {
        setRemote({
          username: name,
          kind: "unavailable",
          message: result.reason ?? `@${name} is taken.`,
        });
      }
    } catch {
      setRemote({ username: name, kind: "error", message: REGISTRY_UNREACHABLE });
    } finally {
      setIsReserving(false);
    }
  }

  return (
    <>
      <motion.div
        animate={{ y: reservation ? -10 : 0, scale: reservation ? 1.03 : 1 }}
        transition={lift}
        className="flex justify-center"
      >
        <StroopCard
          username={reservation?.username ?? username}
          pose={pose}
          confirmSweep={
            validation.ok && status.kind === "available"
              ? validation.username
              : null
          }
        />
      </motion.div>

      <div className="mt-[clamp(1.5rem,4vh,3rem)] w-full">
        <AnimatePresence mode="wait" initial={false}>
          {reservation ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: offset }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -offset }}
              transition={swap(0.34)}
            >
              <ReservationSuccess reservation={reservation} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: offset }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -offset }}
              transition={swap(0.28)}
              className="flex flex-col items-center"
            >
              <h1 className="headline">
                Claim your identity
                <br />
                on Stellar.
              </h1>

              <p className="mt-5 max-w-[46ch] text-balance text-[0.9375rem] leading-relaxed text-ink-dim sm:text-base">
                One name for every Stellar app, wallet, and payment.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-8 flex w-full max-w-[25rem] flex-col items-center gap-3"
              >
                <label htmlFor="stroop-id" className="sr-only">
                  Your Stroop ID
                </label>

                <div className="field-slot">
                  <span
                    aria-hidden="true"
                    className="text-[1.0625rem] text-ink-faint"
                  >
                    @
                  </span>
                  <input
                    id="stroop-id"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(sanitizeUsernameInput(event.target.value))
                    }
                    placeholder="yourname"
                    className="field-input"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    maxLength={24}
                    aria-describedby="stroop-id-status"
                    aria-invalid={
                      status.kind === "invalid" || status.kind === "unavailable"
                    }
                  />
                  <StatusIcon status={status} />
                </div>

                <button
                  type="submit"
                  className="claim-button w-full"
                  disabled={!canClaim}
                >
                  {isReserving ? (
                    <>
                      <LoaderCircle
                        className="spin mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      Claiming
                    </>
                  ) : username ? (
                    `Claim @${username}`
                  ) : (
                    "Claim your ID"
                  )}
                </button>
              </form>

              <p
                id="stroop-id-status"
                role="status"
                aria-live="polite"
                className="mt-5 min-h-[1.25rem] text-[0.8125rem] text-ink-dim"
              >
                <StatusMessage status={status} username={username} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status.kind === "checking") {
    return (
      <LoaderCircle
        className="spin h-4 w-4 shrink-0 text-ink-faint"
        aria-hidden="true"
      />
    );
  }

  if (status.kind === "available") {
    return <Check className="h-4 w-4 shrink-0 text-stellar" aria-hidden="true" />;
  }

  if (status.kind === "invalid" || status.kind === "unavailable") {
    return <X className="h-4 w-4 shrink-0 text-copper" aria-hidden="true" />;
  }

  return <span className="h-4 w-4 shrink-0" aria-hidden="true" />;
}

function StatusMessage({
  status,
  username,
}: {
  status: Status;
  username: string;
}) {
  switch (status.kind) {
    case "empty":
      return <>3–24 characters. Letters, numbers, hyphens, underscores.</>;
    case "checking":
      return <>Checking the registry…</>;
    case "available":
      return <span className="text-stellar">@{username} is available</span>;
    case "invalid":
    case "unavailable":
    case "error":
      return <span className="text-copper">{status.message}</span>;
  }
}
