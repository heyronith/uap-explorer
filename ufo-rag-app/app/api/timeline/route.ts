import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agency = searchParams.get("agency");
  const classification = searchParams.get("classification");

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Build the query
    let query = supabase
      .from("documents")
      .select("metadata");

    // 2. Apply filters if present
    if (agency && agency !== "ALL") {
      query = query.eq("metadata->>agency", agency);
    }
    if (classification && classification !== "ALL") {
      query = query.eq("metadata->>classification", classification);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 3. Aggregate by year in memory (very fast for ~11k records)
    const yearCounts: Record<number, number> = {};
    
    data?.forEach((doc: any) => {
      const year = doc.metadata?.extracted_year;
      if (year && typeof year === "number") {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });

    // 4. Format for the frontend Waveform
    const timeline = Object.entries(yearCounts)
      .map(([year, count]) => ({
        year: parseInt(year),
        count
      }))
      .sort((a, b) => a.year - b.year);

    return NextResponse.json({ timeline }, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate"
      }
    });
  } catch (error: any) {
    console.error("Timeline API Error:", error);
    return NextResponse.json({ error: "error occ please try again" }, { status: 500 });
  }
}
