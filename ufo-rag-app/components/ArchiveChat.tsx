"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { AssistantMarkdown } from "@/components/AssistantMarkdown";
import { BrandImage } from "@/components/BrandImage";
import { ResponseSources } from "@/components/ResponseSources";
import { splitAssistantStreamPayload } from "@/lib/chatSources";
import { BUY_ME_A_COFFEE_URL } from "@/lib/site";

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

/** Readable line length for prose; still wide on large screens */
const threadMax = "max-w-[min(100%,72rem)]";

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 18-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ArchiveChat() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoQueried = useRef(false);

  const STORAGE_KEY = "uap-explorer-chat-history";

  const clearSession = useCallback(() => {
    if (confirm("Reset current intelligence session?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      hasAutoQueried.current = false;
    }
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  // Sync history to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-trigger "Deep Inquiry" from Timeline
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !hasAutoQueried.current && !busy) {
      hasAutoQueried.current = true;
      void send(q);
    }
  }, [searchParams, busy]);

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

  const showStarters = messages.length === 0;

  return (
    <div className="fun-shell flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden">
      <header className="flex w-full shrink-0 items-center justify-between gap-2 border-b border-violet-500/15 bg-void/50 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-sm sm:gap-4 sm:px-6 sm:py-3 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <BrandImage
            src="/brand/ufo-mascot.png"
            alt=""
            width={96}
            height={96}
            className="h-9 w-9 shrink-0 object-contain ring-1 ring-violet-500/30 sm:h-10 sm:w-10"
            fallback={null}
          />
          <h1 className="min-w-0 truncate font-sans text-lg font-bold tracking-tight text-slate-100 sm:text-2xl md:text-3xl">
            UAP Explorer
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/timeline"
            className="rounded-xl border border-violet-500/30 bg-violet-950/20 px-2.5 py-2 shadow-inner transition-colors hover:bg-violet-900/40 sm:px-3.5 sm:py-2"
          >
            <span className="block font-sans text-xs font-semibold leading-tight text-slate-200 sm:text-sm">
              Timeline
            </span>
            <span className="mt-0.5 hidden text-[10px] leading-tight text-violet-500/70 sm:block sm:text-xs">
              Archive timeline
            </span>
          </Link>
          <button
            type="button"
            onClick={clearSession}
            title="Reset Intelligence Session"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden />
          </button>
          <a
            href={BUY_ME_A_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ffdd00] shadow-md shadow-black/30 transition hover:brightness-110"
            aria-label="Buy me a coffee — support on Ko-fi"
          >
            <img
              src="/brand/kofi-bean.gif"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
          </a>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={listScrollRef}
          className="friendly-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 lg:px-10"
        >
          {showStarters && (
            <div
              className={`mx-auto flex min-h-0 flex-col items-center justify-center gap-4 pb-6 pt-2 text-center sm:min-h-[min(48dvh,380px)] sm:gap-6 sm:pb-8 sm:pt-4 ${threadMax}`}
            >
              <div className="relative mx-auto h-28 w-28 sm:h-40 sm:w-40">
                <Image
                  src="/brand/ufo-mascot.png"
                  alt="Cute alien in a UFO"
                  width={320}
                  height={320}
                  className="h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
                  sizes="(max-width: 640px) 7rem, 10rem"
                  priority
                />
              </div>
              <div className="max-w-lg px-0.5 text-sm leading-relaxed text-slate-400 sm:px-0">
                <p className="font-sans text-base font-semibold text-slate-100 sm:text-lg md:text-xl">
                  What should we look for today?
                </p>
                <p className="mt-1.5 text-[13px] leading-snug sm:mt-2 sm:text-sm sm:leading-relaxed">
                  Ask Pluto anything, or tap a starter. Answers cite the release when the archive has
                  enough context.
                </p>
              </div>
              <div className="flex w-full max-w-xl flex-col gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-2.5">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void send(question)}
                    disabled={busy}
                    className="min-h-[3rem] w-full rounded-2xl border border-violet-500/35 bg-violet-950/40 px-4 py-3 text-left text-[14px] font-medium leading-snug text-violet-200 transition active:scale-[0.99] hover:border-violet-400/55 hover:bg-violet-900/55 disabled:pointer-events-none disabled:opacity-45 sm:min-h-0 sm:w-auto sm:max-w-[min(100%,28rem)] sm:rounded-full sm:px-5 sm:py-3.5 sm:text-[15px] sm:leading-relaxed md:text-base"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className={`mx-auto flex w-full flex-col gap-4 sm:gap-5 ${threadMax}`}>
            {messages.map((m) => (
              <li
                key={m.id}
                className={
                  m.role === "user"
                    ? "flex w-full justify-end"
                    : "flex w-full items-start justify-start gap-3"
                }
              >
                {m.role === "assistant" && (
                  <BrandImage
                    src="/brand/pluto-avatar.png"
                    alt=""
                    width={160}
                    height={160}
                    className="mt-1 h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-violet-500/35"
                    fallback={
                      <div
                        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-900/85 text-sm font-bold text-teal-200 ring-1 ring-violet-500/35"
                        aria-hidden
                      >
                        P
                      </div>
                    }
                  />
                )}
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[min(100%,42rem)] rounded-2xl rounded-br-md bg-violet-600 px-4 py-3.5 text-white shadow-md shadow-violet-950/40 sm:px-5 sm:py-4"
                      : `min-w-0 flex-1 rounded-2xl rounded-bl-md border border-violet-500/15 bg-panel/70 px-4 py-3.5 text-slate-200 shadow-sm sm:px-6 sm:py-4`
                  }
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`font-sans text-[11px] font-semibold uppercase tracking-wide ${m.role === "user" ? "text-violet-100/90" : "text-teal-400"
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
                    <div className="whitespace-pre-wrap break-words text-[17px] leading-relaxed sm:text-[18px]">
                      {m.content}
                    </div>
                  ) : (
                    <div className="text-[17px] leading-relaxed sm:text-[18px]">
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
          <div className="shrink-0 border-t border-orange-500/30 bg-orange-950/35 px-4 py-2 text-center text-sm text-orange-200 sm:px-6">
            {error}
          </div>
        )}

        <div className="relative z-10 shrink-0 border-t border-white/[0.06] bg-gradient-to-t from-[#07070c] via-[#0c0c12]/98 to-[#101018]/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-6 lg:px-10">
          <div className={`mx-auto w-full ${threadMax}`}>
            <div className="group flex flex-row items-end gap-2 rounded-[1.125rem] border border-white/[0.08] bg-slate-950/50 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.25)] transition-[border-color,box-shadow] focus-within:border-violet-500/30 focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_0_1px_rgba(139,92,246,0.2),0_8px_32px_rgba(0,0,0,0.35)] sm:gap-2.5 sm:rounded-2xl sm:p-2">
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextarea();
                }}
                onKeyDown={onKeyDown}
                placeholder="Ask Pluto anything…"
                autoComplete="off"
                className="min-h-[48px] max-h-[200px] w-full flex-1 resize-none bg-transparent px-3 py-3 text-[16px] leading-relaxed text-slate-100 placeholder:text-slate-500/65 outline-none selection:bg-violet-500/30 sm:min-h-[52px] sm:px-4 sm:py-3.5 sm:text-[17px]"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="mb-0.5 flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-teal-600 px-4 font-sans text-sm font-semibold tracking-wide text-white shadow-md shadow-violet-950/50 transition hover:brightness-110 hover:shadow-lg hover:shadow-violet-900/35 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 disabled:shadow-none sm:h-12 sm:px-5"
              >
                <SendIcon className="h-4 w-4 shrink-0 opacity-95 sm:h-[1.05rem] sm:w-[1.05rem]" />
                <span className="max-sm:sr-only">Ask</span>
              </button>
            </div>
          </div>
          <p className={`mx-auto mt-2.5 text-center text-[11px] text-slate-500/90 sm:text-xs ${threadMax}`}>
            Follow <a href="https://x.com/ronith_sharmila" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors font-bold">@ronith_sharmila</a>
          </p>
        </div>
      </main>
    </div>
  );
}
