import { NextResponse } from 'next/server';
import { getOrders, getUser } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    // 4. Authorization check: Read phone number from header
    const phone = request.headers.get('Authorization');
    if (!phone) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = getUser(phone);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const orders = getOrders(phone);
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
