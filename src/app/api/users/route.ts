process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createUserSchema } from "@/db/schema";
import { generateAccountNumber } from "@/lib/utils";

const CTVL_URL = process.env.CTVL_URL;
const CTVL_USER = process.env.CTVL_USERNAME;
const CTVL_PASS = process.env.CTVL_PASSWORD;
const TOKEN_GROUP = process.env.CTVL_TOKEN_GROUP;
const TOKEN_TEMPLATE = process.env.CTVL_TOKEN_TEMPLATE;

const tokenizeCard = async (cardNumber: string) => {
  const credentials = Buffer.from(`${CTVL_USER}:${CTVL_PASS}`).toString(
    "base64",
  );

  const res = await fetch(`${CTVL_URL}/tokenize`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokengroup: TOKEN_GROUP,
      data: cardNumber,
      tokentemplate: TOKEN_TEMPLATE,
    }),
  });

  const data = JSON.parse(await res.text());
  if (data.status !== "Succeed")
    throw new Error(data.reason || "Tokenization failed");
  return data.token;
};

// Detokenize function
const detokenizeCard = async (token: string) => {
  const credentials = Buffer.from(`${CTVL_USER}:${CTVL_PASS}`).toString(
    "base64",
  );

  const res = await fetch(`${CTVL_URL}/detokenize`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokengroup: TOKEN_GROUP,
      token,
      tokentemplate: TOKEN_TEMPLATE,
    }),
  });

  const data = JSON.parse(await res.text());
  if (data.status !== "Succeed")
    throw new Error(data.reason || "Detokenization failed");
  return data.data;
};

// GET: Fetch by accountNumber
export async function GET(req: NextRequest) {
  const accountNumber = req.nextUrl.searchParams.get("accountNumber");

  const user = await db
    .select()
    .from(users)
    .where(eq(users.accountNumber, accountNumber!))
    .limit(1);

  if (!user[0]) return NextResponse.json(null);

  try {
    const rawCard = await detokenizeCard(user[0].cardNumber);

    return NextResponse.json({
      ...user[0],
      cardNumber: rawCard,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Detokenization failed" },
      { status: 400 },
    );
  }
}

// POST: Create new user
export async function POST(req: NextRequest) {
  console.log("POST /api/users - body received");
  const body = await req.json();
  console.log("Parsed body:", body);
  const validated = createUserSchema.parse(body);
  console.log("Validation:", validated);

  try {
    const token = await tokenizeCard(validated.cardNumber);
    console.log("✅ Token received:", token);

    const [newUser] = await db
      .insert(users)
      .values({
        ...validated,
        cardNumber: token,
        accountNumber: generateAccountNumber(),
      })
      .returning();

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
