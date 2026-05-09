import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const agency = searchParams.get("agency");
  const classification = searchParams.get("classification");

  if (!year) {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let query = supabase
      .from("documents")
      .select("content, metadata")
      .eq("metadata->>extracted_year", parseInt(year!))
      .limit(10);

    if (agency && agency !== "ALL") {
      query = query.eq("metadata->>agency", agency);
    }
    if (classification && classification !== "ALL") {
      query = query.eq("metadata->>classification", classification);
    }

    const { data, error } = await query;
    if (error) throw error;

    const results = (data || []).map(doc => ({
      content: doc.content,
      title: doc.metadata?.source_title || "Unknown Document",
      page: doc.metadata?.page || "?",
      classification: doc.metadata?.classification || "UNKNOWN",
      agency: doc.metadata?.agency || "UNKNOWN"
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Dossier API Error:", error);
    return NextResponse.json({ error: "error occ please try again" }, { status: 500 });
  }
}
