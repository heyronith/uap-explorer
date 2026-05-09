# 🛸 UAP Explorer

This project started with a simple question: *What is actually in the records?*

We've all seen the headlines and the blurry videos, but the real history is buried in thousands of pages of declassified government documents. I built **UAP Explorer** because I wanted to take those 11,000+ pages of history and turn them into something anyone could explore. 

It’s a space for the curious—for those of us who look at the sky and wonder what’s really out there.

---

### ✨ What’s inside?

*   **Chat with the Archive:** I've trained an AI assistant, **Pluto**, on the actual text of declassified files from the FBI, CIA, NASA, and the Air Force. You can ask Pluto anything, and it will find the specific documents to back up its answers.
*   **The Timeline:** A visual "Pulse" of reports from 1947 to 2023. You can see exactly when sightings spiked in history and filter them by the agency that handled the report.
*   **Real Data:** This isn't based on rumors. The portal is powered by over **11,000 chunks of raw data** from official government archives.

### ⚙️ The Engine (Backend Infra)

To make 11,000 pages of text searchable, I built a custom **RAG (Retrieval-Augmented Generation)** pipeline:

*   **Vector Intelligence:** All documents are processed into high-dimensional vectors and stored in **Supabase (pgvector)**. This allows the AI to find information based on *meaning* rather than just keywords.
*   **Automated Audit:** I wrote a custom metadata enhancement engine that retroactively scanned every document chunk to tag it with its **Origin Agency** (FBI, USAF, etc.), **Classification Level**, and **Year**.
*   **The Pipeline:** Raw markdown files are split into intelligent chunks using **LangChain**, embedded via **OpenAI**, and indexed for lightning-fast retrieval.
*   **Hybrid Search:** The system combines semantic vector search with structured metadata filtering, which is how the Timeline can re-render instantly based on your selections.


### 🌌 Stay Curious
If you find something surprising in the archive, or if you just love the project, let me know!

*   [**Follow me on X @ronith_sharmila**](https://x.com/ronith_sharmila)
*   [**Support the mission on Ko-fi**](https://ko-fi.com/ronith_sharmila)

---
*Keep looking up. Stay Curious*
