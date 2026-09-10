import Link from "next/link";

import { CosmicBackground } from "@/components/cosmic-background";
import { Wordmark } from "@/components/stroop-mark";
import { UsernameReservation } from "@/components/username-reservation";

export default function Page() {
  return (
    <>
      <CosmicBackground />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-6 pb-[clamp(2rem,5vh,3.5rem)] pt-[clamp(1.5rem,3.5vh,2.25rem)]">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex rounded-md"
            aria-label="Stroop.ID home"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="flex items-center gap-0.5">
            <Link href="/docs" className="nav-link">
              Docs
            </Link>
            <Link href="/stroopy" className="nav-link">
              Stroopy
            </Link>
          </nav>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-0 py-[clamp(1.5rem,4vh,3rem)] text-center">
          <UsernameReservation />
        </main>
      </div>
    </>
  );
}
