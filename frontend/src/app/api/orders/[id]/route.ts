import { NextResponse } from 'next/server';
import { getOrderById, getUser } from '../../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // 4. Authorization check: Read phone number from header
    const phone = request.headers.get('Authorization');
    if (!phone) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = getUser(phone);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 401 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // 4. Authorization check: Confirm that a logged-in user can only view their own orders
    if (order.customer.phone !== phone) {
      return NextResponse.json({ error: "Access denied. You can only view your own orders." }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
