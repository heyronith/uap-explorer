import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { UAP_SOURCES_MARKER } from "@/lib/chatSources";
import { buildRetrievalSources } from "@/lib/buildSourceLinks";

export const runtime = "nodejs";

type MatchRow = {
  content: string | null;
  metadata: Record<string, unknown> | null;
};

function formatPage(meta: Record<string, unknown>): string | number {
  const p = meta.page;
  if (typeof p === "number" && Number.isFinite(p)) return p;
  if (typeof p === "string" && p.trim() !== "") return p;
  return "?";
}

function buildContext(results: MatchRow[]): string {
  let context = "";
  results.forEach((doc, i) => {
    const meta = doc.metadata ?? {};
    const title =
      typeof meta.source_title === "string" ? meta.source_title : "Unknown Source";
    const page = formatPage(meta);
    context += `\n[Result ${i + 1}] Source: ${title} (Page ${page})\nContent: ${doc.content ?? ""}\n`;
  });
  return context;
}

export async function POST(req: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !openaiKey) {
    return new Response(
      JSON.stringify({ error: "Server missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPENAI_API_KEY." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { message?: string; history?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const query = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!query) {
    return new Response(JSON.stringify({ error: "message is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const openai = new OpenAI({ apiKey: openaiKey });
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Query Condensation (If history exists, rewrite the query to be standalone for search)
  let searchquery = query;
  if (history.length > 0) {
    try {
      const condensation = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Given the following conversation and a follow-up question, rephrase the follow-up question to be a standalone search query for a vector database. Maintain the original intent but make it specific. Respond ONLY with the rewritten query.",
          },
          ...history.slice(-5).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user", content: query },
        ],
        temperature: 0,
      });
      searchquery = condensation.choices[0]?.message?.content?.trim() || query;
    } catch (e) {
      console.error("Condensation error:", e);
      // Fallback to original query
    }
  }

  let embedding: number[];
  try {
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: searchquery,
    });
    embedding = emb.data[0]?.embedding ?? [];
  } catch (e) {
    return new Response(JSON.stringify({ error: "error occ please try again" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  let results: MatchRow[] = [];
  try {
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0,
      match_count: 15,
    });
    if (error) throw error;
    results = (data as MatchRow[]) ?? [];
  } catch (e) {
    return new Response(JSON.stringify({ error: "error occ please try again" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const context = buildContext(results);
  const systemPrompt = `You are Pluto, a UAP explorer who guides users through the official release and provides accurate, helpful information grounded in the archive below. Speak as Pluto in a friendly, curious tone—like a knowledgeable guide, not a stiff report. "Up to date" here means: best-effort from the retrieved document excerpts in this session.

CONTEXT FROM ARCHIVE:
${context}

INSTRUCTIONS:
1. Use the provided context to answer the user's question.
2. If the answer is not in the context, state that you don't have information on that specific detail.
3. Always cite your sources using the format: [Source Title] (Page X).
4. Keep answers clear and objective about the documents; Pluto's personality is warm framing, not speculation beyond the archive.
5. Format every answer in Markdown suitable for a reading pane: start with a short summary line if helpful; use ## section headings when the answer has multiple parts; use bullet or numbered lists for enumerations; use **bold** for key entities, dates, or document labels; use \`backticks\` for short codes or file-like tokens; use a Markdown table when comparing multiple items; use a fenced code block only for short verbatim excerpts from the archive. Keep paragraphs short and scannable.
6. Do not add a separate end section titled "Sources", "References", or "Bibliography"—the app lists retrieved documents with links automatically. Still use inline citations like [Source Title] (Page X) in your prose where helpful.

ABOUT YOU AND THE APP (STRICT):
- If the user asks who built you, who developed this, what model you are, or similar: say only that the system was built by Ronny. Do not mention OpenAI, GPT, LLMs, embeddings, vector databases, or any third-party AI vendor or that you are a large language model. Do not elaborate on stack or providers. If pressed, repeat that the system was built by Ronny and redirect back to helping with the UAP archive.`;

  const sourcesPayload = buildRetrievalSources(results);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
            { role: "user", content: query },
          ],
        });
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        if (sourcesPayload.length > 0) {
          const trailer =
            UAP_SOURCES_MARKER + JSON.stringify({ sources: sourcesPayload });
          controller.enqueue(encoder.encode(trailer));
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n[SYSTEM ERROR] error occ please try again`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
