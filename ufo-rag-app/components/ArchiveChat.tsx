"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AssistantMarkdown } from "@/components/AssistantMarkdown";
import { ResponseSources } from "@/components/ResponseSources";
import { splitAssistantStreamPayload } from "@/lib/chatSources";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
};

const suggestedQuestions = [
  "Give me a surprising archive highlight.",
  "What do the pages say about unusual flight movement?",
  "Find pilot or radar mentions.",
  "Summarize a weird case with citations.",
];

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ArchiveChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollMessagesToEnd = useCallback(() => {
    const el = listScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollMessagesToEnd();
  }, [messages, scrollMessagesToEnd]);

  const adjustTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 52), 200)}px`;
  }, []);

  useEffect(() => {
    adjustTextarea();
  }, [input, adjustTextarea]);

  const send = async (suggestedQuestion?: string) => {
    const text = (suggestedQuestion ?? input).trim();
    if (!text || busy) return;

    setError(null);
    setInput("");
    setBusy(true);
    requestAnimationFrame(() => adjustTextarea());

    const userMsg: ChatMessage = { id: id(), role: "user", content: text };
    const asstId = id();
    setMessages((m) => [
      ...m,
      userMsg,
      { id: asstId, role: "assistant", content: "", streaming: true },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg =
          typeof errJson.error === "string" ? errJson.error : `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setMessages((m) =>
          m.map((msg) =>
            msg.id === asstId ? { ...msg, content: buffer, streaming: true } : msg,
          ),
        );
      }

      setMessages((m) =>
        m.map((msg) => (msg.id === asstId ? { ...msg, streaming: false } : msg)),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setMessages((m) => m.filter((msg) => msg.id !== asstId));
    } finally {
      setBusy(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="fun-shell relative flex min-h-dvh flex-col px-3 py-4 sm:px-6 sm:py-6">
      <header className="mx-auto mb-4 flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="ufo-badge flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-violet-600/30 text-2xl shadow-lg shadow-violet-900/50 ring-1 ring-violet-500/40">
            UFO
          </div>
          <div>
            <h1 className="font-sans text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
              UAP Explorer
            </h1>
          </div>
        </div>
        <div
          className="rounded-2xl border border-slate-600/60 bg-hull/80 px-4 py-3 text-left shadow-inner"
          aria-label="Timeline of events placeholder"
        >
          <p className="font-sans text-sm font-semibold text-slate-200">Timeline of events</p>
          <p className="mt-0.5 text-xs text-slate-500">Placeholder — coming soon</p>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <div className="fun-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem]">
          <div
            ref={listScrollRef}
            className="friendly-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-7"
          >
            {messages.length === 0 && (
              <div className="flex min-h-[min(48dvh,390px)] flex-col items-center justify-center gap-5 px-4 text-center">
                <div className="relative">
                  <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-teal-600/50 via-violet-600/50 to-amber-500/40 shadow-xl shadow-violet-900/40" />
                  <div className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-amber-500/60 shadow-md" />
                  <div className="absolute -bottom-2 -left-3 h-7 w-7 rounded-full bg-teal-500/50 shadow-md" />
                </div>
                <div className="max-w-xl text-sm leading-relaxed text-slate-400">
                  <p className="font-sans text-xl font-semibold text-slate-100">
                    What should we look for today?
                  </p>
                  <p className="mt-2">
                    Ask Pluto anything, or tap a starter below. Answers cite the release when the
                    archive has enough context.
                  </p>
                </div>
              </div>
            )}

            <ul className="mx-auto flex max-w-4xl flex-col gap-5">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[min(100%,46rem)] rounded-[1.5rem] rounded-br-md bg-violet-600 px-5 py-4 text-white shadow-lg shadow-violet-950/50"
                        : "w-full max-w-[min(100%,48rem)] rounded-[1.5rem] rounded-bl-md border border-violet-500/20 bg-panel/90 px-5 py-4 text-slate-200 shadow-md shadow-black/20"
                    }
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`font-sans text-xs font-semibold ${
                          m.role === "user" ? "text-violet-100" : "text-teal-400"
                        }`}
                      >
                        {m.role === "user" ? "You" : "Pluto"}
                      </span>
                      {m.role === "assistant" && m.streaming && (
                        <span className="inline-flex gap-1" aria-hidden>
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-400 [animation-delay:300ms]" />
                        </span>
                      )}
                    </div>
                    {m.role === "user" ? (
                      <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                        {m.content}
                      </div>
                    ) : (
                      <div className="text-[15px] leading-relaxed">
                        {(() => {
                          const { body, sources } = splitAssistantStreamPayload(m.content);
                          const showBody = body.trim().length > 0;
                          return (
                            <>
                              {showBody ? (
                                <AssistantMarkdown content={body} />
                              ) : m.streaming ? null : (
                                <span className="text-slate-500">...</span>
                              )}
                              {sources && sources.length > 0 && (
                                <ResponseSources items={sources} />
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="shrink-0 border-t border-orange-500/30 bg-orange-950/40 px-4 py-2.5 text-center text-sm text-orange-300">
              {error}
            </div>
          )}

          <div className="shrink-0 border-t border-violet-500/15 bg-hull/90 px-4 py-4 sm:px-6">
            <div className="mx-auto mb-3 flex max-w-4xl flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void send(question)}
                  disabled={busy}
                  className="rounded-full border border-violet-500/30 bg-violet-950/50 px-3 py-2 text-left text-xs font-medium leading-relaxed text-violet-200 transition hover:-translate-y-0.5 hover:border-violet-400/50 hover:bg-violet-900/60 disabled:pointer-events-none disabled:opacity-45"
                >
                  {question}
                </button>
              ))}
            </div>
            <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextarea();
                }}
                onKeyDown={onKeyDown}
                placeholder="Ask Pluto…"
                autoComplete="off"
                className="min-h-[56px] w-full resize-y rounded-3xl border border-slate-600/60 bg-void/80 px-5 py-4 text-[15px] text-slate-100 placeholder:text-slate-500 shadow-inner outline-none transition focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/15"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                className="h-[56px] shrink-0 rounded-3xl bg-teal-600 px-8 font-sans text-sm font-bold text-white shadow-lg shadow-teal-900/40 transition hover:-translate-y-0.5 hover:bg-teal-500 disabled:pointer-events-none disabled:translate-y-0 disabled:bg-slate-700 disabled:shadow-none"
              >
                Ask
              </button>
            </div>
            <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-slate-500">
              Enter sends. Shift+Enter adds a new line.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
