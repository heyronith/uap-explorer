import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { streamText, Message } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // 1. Initialize Supabase and Embeddings
  const supabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
  });

  // 2. Search for relevant context
  const results = await vectorStore.similaritySearch(lastMessage, 5);
  const context = results.map(res => {
    const meta = res.metadata;
    return `[Source: ${meta.source_title}, Page: ${meta.page}, URL: ${meta.source_url}]\nContent: ${res.page_content}`;
  }).join("\n\n---\n\n");

  // 3. Construct the prompt
  const systemPrompt = `You are the "UFO Intelligence Archive" AI assistant. 
Your goal is to answer questions based ONLY on the provided official Department of War UFO release documents.

CONTEXT FROM ARCHIVE:
${context}

INSTRUCTIONS:
1. Use the provided context to answer the user's question.
2. If the answer is not in the context, state that you don't have information on that specific detail in the current release.
3. Always cite your sources at the end of your answer using the format: [Source Title] (Page X).
4. Maintain a professional, objective, and slightly "classified" tone.
5. Do not speculate beyond what is written in the documents.`;

  // 4. Stream the response
  const result = await streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
