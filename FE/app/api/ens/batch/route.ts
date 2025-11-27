import { publicClient } from '@/lib/ens';
import { NextResponse } from 'next/server';
import { normalize } from 'viem/ens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { names } = body as { names: string[] };

    if (!names || !Array.isArray(names)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const uniqueNames = Array.from(new Set(names));

    if (uniqueNames.length > 50) {
      return NextResponse.json({ error: 'Too many names (max 50)' }, { status: 400 });
    }

    const results = await Promise.all(
      uniqueNames.map(async (name) => {
        try {
          const avatar = await publicClient.getEnsAvatar({ name: normalize(name) });
          return { name, avatar };
        } catch (e) {
          console.error(`Failed to fetch avatar for ${name}`, e);
          return { name, avatar: null };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Batch ENS fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

