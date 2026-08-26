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

/**
 * Calls the PingGateway-fronted CTVL API.
 *
 * The gateway can reject a request before it ever reaches CTVL:
 *   401 - no token, or signature/scope validation failed
 *   403 - AM policy denied (empty body)
 *   404 - no route matched the path
 * Those responses have no JSON body, so the response must be read as text
 * and the status checked before parsing.
 */
const callCtvl = async (path: string, payload: Record<string, unknown>) => {
  const token = await getToken();
  if (!token) throw new Error("Unauthorized: no access token in session");

  const url = `${CTVL_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();

  if (!res.ok) {
    console.error(`[ctvl] ${path} -> ${res.status}`, raw || "(empty body)");
    if (res.status === 401) {
      throw new Error("Access token rejected by the gateway");
    }
    if (res.status === 403) {
      throw new Error("Not authorized for this operation");
    }
    throw new Error(`Gateway returned ${res.status}`);
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error(`[ctvl] ${path} -> unparseable body`, raw);
    throw new Error("Malformed response from CTVL");
  }

  if (data.status !== "Succeed") {
    throw new Error(data.reason || `CTVL rejected the ${path} request`);
  }

  return data;
};

const tokenizeCard = async (cardNumber: string) => {
  const data = await callCtvl("/tokenize", {
    tokengroup: TOKEN_GROUP,
    data: cardNumber,
    tokentemplate: TOKEN_TEMPLATE,
  });
  return data.token;
};

const detokenizeCard = async (cardToken: string) => {
  const data = await callCtvl("/detokenize", {
    tokengroup: TOKEN_GROUP,
    token: cardToken,
    tokentemplate: TOKEN_TEMPLATE,
  });
  return data.data;
};

// GET: Fetch by accountNumber
export async function GET(req: NextRequest) {
  const token = await getToken();
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accountNumber = req.nextUrl.searchParams.get("accountNumber");
  if (!accountNumber) {
    return NextResponse.json(
      { error: "accountNumber is required" },
      { status: 400 },
    );
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.accountNumber, accountNumber))
    .limit(1);

  if (!user[0]) return NextResponse.json(null);

  try {
    const rawCard = await detokenizeCard(user[0].cardNumber);

    return NextResponse.json({
      ...user[0],
      cardNumber: rawCard,
    });
  } catch (error: any) {
    console.error("[GET /api/users]", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Create new user
export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const validated = createUserSchema.parse(body);
    const cardToken = await tokenizeCard(validated.cardNumber);

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

    const pgError = error.cause ?? error;

    if (pgError.code === "23505") {
      const constraintName = pgError.constraint;
      console.log("[POST] Constraint hit:", constraintName);

      if (constraintName === "users_card_number_unique") {
        return NextResponse.json(
          { error: "This card number is already registered" },
          { status: 409 },
        );
      }
      if (constraintName === "users_account_number_unique") {
        return NextResponse.json(
          { error: "Account number conflict, please try again" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "A record with this value already exists" },
        { status: 409 },
      );
    }

    console.error("[POST /api/users]", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
