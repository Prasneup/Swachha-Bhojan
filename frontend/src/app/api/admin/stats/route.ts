import { NextResponse } from 'next/server';
import { adminGetSalesStats } from '../../../../lib/db';

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('Authorization');
    if (auth !== 'admin') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    
    const stats = adminGetSalesStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
