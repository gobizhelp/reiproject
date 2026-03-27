import { NextResponse } from 'next/server';
import { getSystemBuyBoxFields } from '@/lib/buy-box-system-template';

export async function GET() {
  const fields = await getSystemBuyBoxFields();
  return NextResponse.json({ fields });
}
