import { NextResponse } from "next/server";

import { registry } from "@/lib/registry/mock-registry";

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username") ?? "";
  const result = await registry.checkAvailability(username);

  return NextResponse.json(result, {
    headers: { "cache-control": "no-store" },
  });
}
