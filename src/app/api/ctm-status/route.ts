process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextResponse } from "next/server";

const CTVL_URL = process.env.CTVL_URL;
const CTVL_PING_USERNAME = process.env.CTVL_PING_USERNAME;
const CTVL_PING_PASSWORD = process.env.CTVL_PING_PASSWORD;

export async function GET() {
  try {
    const credentials = Buffer.from(
      `${CTVL_PING_USERNAME}:${CTVL_PING_PASSWORD}`,
    ).toString("base64");

    const res = await fetch(`${CTVL_URL}/tokenize`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
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
