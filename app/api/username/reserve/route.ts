import { NextResponse } from "next/server";

import { authorizeReservation } from "@/lib/auth/reservation-authorizer";
import { registry } from "@/lib/registry/mock-registry";

export async function POST(request: Request) {
  let username = "";

  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "username" in body) {
      username = String((body as { username: unknown }).username ?? "");
    }
  } catch {
    return NextResponse.json(
      { error: "Expected a JSON body containing a username." },
      { status: 400 },
    );
  }

  const proof = await authorizeReservation(username);
  const result = await registry.reserve(username, proof);

  return NextResponse.json(result, {
    status: result.reserved ? 201 : 409,
    headers: { "cache-control": "no-store" },
  });
}
