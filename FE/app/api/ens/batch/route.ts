import { publicClient } from "@/lib/ens";
import { NextResponse } from "next/server";
import { normalize } from "viem/ens";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { names } = body as { names: string[] };

    if (!names || !Array.isArray(names)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const uniqueNames = Array.from(new Set(names));

    if (uniqueNames.length > 50) {
      return NextResponse.json(
        { error: "Too many names (max 50)" },
        { status: 400 }
      );
    }

    // Chunking function to prevent overwhelming the RPC provider
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
      );
    };

    const results: { name: string; avatar: string | null }[] = [];
    const chunks = chunkArray(uniqueNames, 5); // Process 5 at a time

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (name) => {
          try {
            const avatar = await publicClient.getEnsAvatar({
              name: normalize(name),
            });
            return { name, avatar };
          } catch (e) {
            console.error(`Failed to fetch avatar for ${name}`, e);
            return { name, avatar: null };
          }
        })
      );
      results.push(...chunkResults);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Batch ENS fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
