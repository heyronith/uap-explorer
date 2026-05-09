import os
import yaml
import glob
import requests
from tqdm import tqdm
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

load_dotenv()

# Configuration
DATA_DIR = "data-repo/converted"
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def parse_markdown_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            try:
                metadata = yaml.safe_load(parts[1])
                body = parts[2].strip()
                return metadata, body
            except yaml.YAMLError:
                pass
    return {}, content

def manual_upsert(batch, embeddings, url, key):
    # 1. Generate embeddings
    texts = [d.page_content for d in batch]
    vectors = embeddings.embed_documents(texts)
    
    # 2. Prepare payload
    payload = []
    for i, doc in enumerate(batch):
        payload.append({
            "content": doc.page_content,
            "metadata": doc.metadata,
            "embedding": vectors[i]
        })
    
    # 3. POST to Supabase REST API via 'requests' (stable SSL)
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    # Supabase REST endpoint for 'documents' table
    endpoint = f"{url}/rest/v1/documents"
    
    response = requests.post(endpoint, json=payload, headers=headers)
    response.raise_for_status()

def ingest():
    if not all([SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY]):
        print("Error: Missing environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY)")
        return

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        separators=["\n\n", "\n", " ", ""]
    )
    
    md_files = glob.glob(os.path.join(DATA_DIR, "**/*.md"), recursive=True)
    print(f"Found {len(md_files)} markdown files.")
    
    all_documents = []
    for file_path in tqdm(md_files, desc="Parsing files"):
        metadata, body = parse_markdown_file(file_path)
        metadata['file_path'] = file_path
        
        chunks = text_splitter.split_text(body)
        for chunk in chunks:
            all_documents.append(Document(
                page_content=chunk,
                metadata=metadata
            ))
            
    print(f"Created {len(all_documents)} document chunks.")
    
    print("Upserting to Supabase via requests...")
    batch_size = 50
    for i in range(0, len(all_documents), batch_size):
        batch = all_documents[i:i + batch_size]
        max_retries = 3
        for attempt in range(max_retries):
            try:
                manual_upsert(batch, embeddings, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
                if (i // batch_size) % 10 == 0:
                    print(f"Processed {i + len(batch)} / {len(all_documents)} chunks...")
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"Error in batch {i} (attempt {attempt+1}): {e}. Retrying in 1s...")
                    import time
                    time.sleep(1)
                else:
                    print(f"Failed batch {i} after {max_retries} attempts: {e}")
            
    print("Ingestion complete.")

if __name__ == "__main__":
    ingest()
