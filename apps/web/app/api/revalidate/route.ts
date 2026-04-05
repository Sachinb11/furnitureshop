import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.NEXT_REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }
  const path = req.nextUrl.searchParams.get('path');
  const tag = req.nextUrl.searchParams.get('tag');
  try {
    if (path) { revalidatePath(path); return NextResponse.json({ revalidated: true, path }); }
    if (tag) { revalidateTag(tag); return NextResponse.json({ revalidated: true, tag }); }
    return NextResponse.json({ message: 'Provide path or tag' }, { status: 400 });
  } catch {
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 });
  }
}
