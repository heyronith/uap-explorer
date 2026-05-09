import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import create_client
import httpx

# Fix for macOS LibreSSL issue with HTTP/2 (if needed for the client)
orig_init = httpx.Client.__init__
def new_init(self, *args, **kwargs):
    kwargs['http1'] = True
    kwargs['http2'] = False
    orig_init(self, *args, **kwargs)
httpx.Client.__init__ = new_init

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def main():
    if not all([SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY]):
        print("Error: Missing environment variables.")
        return

    # 1. Initialize Supabase Client
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    # 2. Initialize Embeddings and Vector Store
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = SupabaseVectorStore(
        client=supabase,
        embedding=embeddings,
        table_name="documents",
        query_name="match_documents",
    )

    # 3. Initialize LLM
    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    print("\n--- UFO INTELLIGENCE ARCHIVE: TERMINAL ACCESS ---")
    print("Ready for query. Type 'exit' to quit.\n")

    while True:
        query = input("Query: ")
        if query.lower() in ["exit", "quit"]:
            break

        print("\nSearching the archives...")
        
        # 4. Perform Similarity Search (Direct RPC call for stability)
        try:
            query_embedding = embeddings.embed_query(query)
            rpc_response = supabase.rpc("match_documents", {
                "query_embedding": query_embedding,
                "match_threshold": 0.0, # Broaden search for maximum discovery
                "match_count": 15
            }).execute()
            
            results = rpc_response.data
            
            # 5. Construct Context
            context = ""
            for i, doc in enumerate(results):
                # 'metadata' is stored in the 'metadata' column
                meta = doc.get('metadata', {})
                title = meta.get('source_title', 'Unknown Source')
                page = meta.get('page', '?')
                context += f"\n[Result {i+1}] Source: {title} (Page {page})\nContent: {doc.get('content', '')}\n"

            # 6. Generate Answer
            system_prompt = f"""You are the "UFO Intelligence Archive" AI assistant. 
Your goal is to answer questions based ONLY on the provided official Department of War UFO release documents.

CONTEXT FROM ARCHIVE:
{context}

INSTRUCTIONS:
1. Use the provided context to answer the user's question.
2. If the answer is not in the context, state that you don't have information on that specific detail.
3. Always cite your sources using the format: [Source Title] (Page X).
4. Maintain a professional, objective tone."""

            response = llm.invoke([
                ("system", system_prompt),
                ("human", query)
            ])

            print("\n--- RESPONSE ---\n")
            print(response.content)
            print("\n----------------\n")
            
        except Exception as e:
            print(f"Error during search/generation: {e}")

if __name__ == "__main__":
    main()
