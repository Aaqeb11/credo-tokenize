process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextResponse } from "next/server";

const CTVL_URL = process.env.CTVL_URL;

export async function GET() {
  try {
    const res = await fetch(`${CTVL_URL}/tokenize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });

    if (res.status < 500) {
      return NextResponse.json({ status: "online" });
    }
    return NextResponse.json({ status: "degraded" });
  } catch {
    return NextResponse.json({ status: "offline" });
  }
}
