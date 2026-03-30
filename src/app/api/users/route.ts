process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createUserSchema } from "@/db/schema";
import { generateAccountNumber } from "@/lib/utils";
import { getToken } from "@/lib/auth";
import { ZodError } from "zod/v4";

const CTVL_URL = process.env.CTVL_URL;
const TOKEN_GROUP = process.env.CTVL_TOKEN_GROUP;
const TOKEN_TEMPLATE = process.env.CTVL_TOKEN_TEMPLATE;

const tokenizeCard = async (cardNumber: string) => {
  const token = await getToken();
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${CTVL_URL}/tokenize`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
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

const detokenizeCard = async (cardToken: string) => {
  const token = await getToken();
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${CTVL_URL}/detokenize`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tokengroup: TOKEN_GROUP,
      token: cardToken,
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
  const token = await getToken();
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const token = await getToken();
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  console.log("POST /api/users - body received");
  const body = await req.json();
  console.log("Parsed body:", body);
  const validated = createUserSchema.parse(body);
  console.log("Validation:", validated);

  try {
    const cardToken = await tokenizeCard(validated.cardNumber);
    console.log("✅ Token received:", cardToken);

    const [newUser] = await db
      .insert(users)
      .values({
        ...validated,
        cardNumber: cardToken,
        accountNumber: generateAccountNumber(),
      })
      .returning();

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    // Postgres unique constraint violation
    if (error.code === "23505") {
      if (error.constraint_name === "users_card_number_unique") {
        return NextResponse.json(
          { error: "This card number is already registered" },
          { status: 409 },
        );
      }
      if (error.constraint_name === "users_account_number_unique") {
        return NextResponse.json(
          { error: "Account number conflict, please try again" },
          { status: 409 },
        );
      }
      // Fallback for any other unique constraint
      return NextResponse.json(
        { error: "A record with this value already exists" },
        { status: 409 },
      );
    }

    // Tokenization or other known errors
    console.error("❌ POST error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
