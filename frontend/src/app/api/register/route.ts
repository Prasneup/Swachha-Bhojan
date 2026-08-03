import { NextResponse } from 'next/server';
import { registerUser, isRateLimited } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    // 19. Rate Limit registration endpoint to prevent scripted abuse
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(`reg-${ip}`, 5, 60000)) {
      return NextResponse.json({ error: "Too many registration attempts. Please wait a minute." }, { status: 429 });
    }

    const { name, phone, address } = await request.json();

    if (!name || !phone || !address) {
      return NextResponse.json({ error: "Name, phone number, and address are required" }, { status: 400 });
    }

    // 19. Rate limit by phone number too
    if (isRateLimited(`reg-${phone}`, 5, 60000)) {
      return NextResponse.json({ error: "Too many attempts for this phone number." }, { status: 429 });
    }

    // Registers user with Rs. 0 balance (automatic welcome bonus removed)
    const user = registerUser(name, phone, address);
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
