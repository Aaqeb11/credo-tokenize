import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createUserSchema } from "@/db/schema";

// GET: Fetch by accountNumber (your current flow)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const accountNumber = searchParams.get("accountNumber");

    if (!accountNumber || accountNumber.length !== 3) {
      return NextResponse.json(
        { error: "Valid 3-digit account number required" },
        { status: 400 },
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.accountNumber, accountNumber))
      .limit(1);

    return NextResponse.json(user[0] || null);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST: Create new user (generates accountNumber)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createUserSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.message },
        { status: 400 },
      );
    }

    // Insert → DB auto-generates accountNumber!
    const [newUser] = await db
      .insert(users)
      .values({
        ...validated.data,
      })
      .returning();

    return NextResponse.json(
      {
        message: "User created successfully",
        user: newUser, // Includes generated accountNumber: "047"
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === "23505") {
      // Postgres unique violation
      return NextResponse.json(
        { error: "Account number collision (rare). Try again." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
