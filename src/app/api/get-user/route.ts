import { NextResponse } from 'next/server';

import { DEMO_USER_DATA } from '../../demoData';

export async function GET() {
  return NextResponse.json({ userData: DEMO_USER_DATA });
}
