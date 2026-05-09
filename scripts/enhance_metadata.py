import os
import re
import json
from supabase import create_client
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

# Supabase Setup
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Regex Patterns
YEAR_PATTERN = r"\b(19[4-9]\d|20[0-2]\d)\b"
CLASSIFICATION_KEYWORDS = ["TOP SECRET", "SECRET", "CONFIDENTIAL", "DECLASSIFIED", "RESTRICTED", "UNCLASSIFIED"]
AGENCIES = {
    "FBI": r"\b(FBI|Federal Bureau of Investigation)\b",
    "CIA": r"\b(CIA|Central Intelligence Agency)\b",
    "USAF": r"\b(USAF|Air Force|Blue Book|Project Blue Book|Grudge|Sign)\b",
    "DOW": r"\b(DOW|Department of War|D.O.W.)\b",
    "NASA": r"\b(NASA)\b",
    "NAVY": r"\b(NAVY|ONI|Office of Naval Intelligence)\b"
}

def extract_features(content, source_title):
    features = {}
    
    # 1. Extract Year (Take the first one found as primary event date)
    years = re.findall(YEAR_PATTERN, content)
    if years:
        features["extracted_year"] = int(years[0])
    
    # 2. Extract Classification
    content_upper = content.upper()
    found_class = [c for c in CLASSIFICATION_KEYWORDS if c in content_upper]
    if found_class:
        features["classification"] = found_class[0]
    else:
        features["classification"] = "UNKNOWN"

    # 3. Extract Agency (Check title first, then content)
    found_agency = "UNKNOWN"
    combined_text = (source_title + " " + content).upper()
    for agency, pattern in AGENCIES.items():
        if re.search(pattern, combined_text, re.IGNORECASE):
            found_agency = agency
            break
    features["agency"] = found_agency
    
    return features

def enhance():
    print("Starting Metadata Enhancement Pass...")
    
    # Fetch all records (In batches of 1000)
    limit = 1000
    offset = 0
    
    while True:
        print(f"Processing batch: {offset} to {offset + limit}...")
        res = supabase.table("documents").select("id, content, metadata").range(offset, offset + limit).execute()
        
        if not res.data:
            break
            
        for row in tqdm(res.data):
            doc_id = row["id"]
            content = row["content"] or ""
            current_metadata = row["metadata"] or {}
            
            # Skip if already enhanced (optional check)
            if "enhanced" in current_metadata:
                continue
                
            features = extract_features(content, current_metadata.get("source_title", ""))
            
            # Merge new features into metadata
            new_metadata = {**current_metadata, **features, "enhanced": True}
            
            # Update row
            supabase.table("documents").update({"metadata": new_metadata}).eq("id", doc_id).execute()
            
        offset += len(res.data)
        if len(res.data) < limit:
            break

    print("Success: 11,000+ chunks are now structured for the timeline.")

if __name__ == "__main__":
    enhance()
