process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";

const CTVL_URL = process.env.CTVL_URL;

export async function GET() {
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ status: "unauthenticated" });
  }

  try {
    const res = await fetch(`${CTVL_URL}/tokenize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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
