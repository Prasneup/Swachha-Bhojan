import { NextResponse } from 'next/server';
import { addAddress, getUser } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const phone = request.headers.get('Authorization');
    if (!phone) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = getUser(phone);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const { label, address } = await request.json();
    if (!label || !address) {
      return NextResponse.json({ error: "Address label and address text are required." }, { status: 400 });
    }

    const updatedUser = addAddress(phone, label, address);
    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
