import { NextResponse } from 'next/server';
import { placeOrder, getUser, isRateLimited } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (isRateLimited(`chk-${ip}`, 5, 60000)) {
      return NextResponse.json({ error: "Too many checkout requests. Please wait a moment." }, { status: 429 });
    }

    const phone = request.headers.get('Authorization');
    if (!phone) {
      return NextResponse.json({ error: "Unauthorized. Please register or login." }, { status: 401 });
    }

    const user = getUser(phone);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const {
      restaurantId,
      cartItems,
      paymentMethod,
      deliveryAddress,
      deliveryType,
      paymentId,
      cardToken
    } = await request.json();

    if (!restaurantId || !cartItems || !cartItems.length || !paymentMethod || !deliveryAddress || !deliveryType) {
      return NextResponse.json({ error: "Missing required checkout parameters." }, { status: 400 });
    }

    if (paymentMethod === 'CARD' && !cardToken) {
      return NextResponse.json({ error: "Card payment requires a secure checkout token." }, { status: 400 });
    }

    const order = placeOrder(
      phone,
      restaurantId,
      cartItems,
      paymentMethod,
      deliveryAddress,
      deliveryType,
      paymentId
    );

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
