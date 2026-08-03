import { NextResponse } from 'next/server';
import { adminAddMenuItem, adminUpdateMenuItem, adminDeleteMenuItem } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('Authorization');
    if (auth !== 'admin') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    
    const { action, restaurantId, itemId, data } = await request.json();
    if (!action || !restaurantId) {
      return NextResponse.json({ error: "Missing action or restaurantId" }, { status: 400 });
    }
    
    if (action === 'ADD') {
      const newItem = adminAddMenuItem(restaurantId, data);
      return NextResponse.json(newItem);
    } else if (action === 'EDIT') {
      if (itemId === undefined) {
        return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
      }
      const updatedItem = adminUpdateMenuItem(restaurantId, itemId, data);
      return NextResponse.json(updatedItem);
    } else if (action === 'DELETE') {
      if (itemId === undefined) {
        return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
      }
      const success = adminDeleteMenuItem(restaurantId, itemId);
      return NextResponse.json({ success });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
