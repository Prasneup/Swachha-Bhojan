import { NextResponse } from 'next/server';
import { getRestaurants } from '../../../lib/db';

export async function GET() {
  return NextResponse.json(getRestaurants());
}
