/** Appended after streamed assistant text by /api/chat */
export const UAP_SOURCES_MARKER = "\n\n<!--UAP_EXPLORER_SOURCES_JSON-->\n";

export type RetrievedSource = {
  order: number;
  source_title: string;
  page: string | number;
  /** Opens official release URL, with PDF page fragment when applicable */
  source_url: string;
};

export type SourcesPayload = {
  sources: RetrievedSource[];
};

export function splitAssistantStreamPayload(raw: string): {
  body: string;
  sources: RetrievedSource[] | undefined;
} {
  const idx = raw.indexOf(UAP_SOURCES_MARKER);
  if (idx === -1) {
    return { body: raw, sources: undefined };
  }
  const body = raw.slice(0, idx);
  const jsonPart = raw.slice(idx + UAP_SOURCES_MARKER.length).trim();
  if (!jsonPart) {
    return { body, sources: undefined };
  }
  try {
    const data = JSON.parse(jsonPart) as SourcesPayload;
    if (data?.sources && Array.isArray(data.sources)) {
      return { body, sources: data.sources };
    }
  } catch {
    // Incomplete JSON while streaming — show body only up to marker start
    return { body, sources: undefined };
  }
  return { body, sources: undefined };
}
