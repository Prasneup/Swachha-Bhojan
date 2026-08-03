import { NextResponse } from 'next/server';
import { adminUpdateOrderStatus } from '../../../../../lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = request.headers.get('Authorization');
    if (auth !== 'admin') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    
    const { id } = await params;
    const orderId = parseInt(id);
    
    const { status, reason } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }
    
    const updatedOrder = adminUpdateOrderStatus(orderId, status, reason);
    return NextResponse.json(updatedOrder);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
