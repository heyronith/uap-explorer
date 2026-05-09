"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-200/95">{children}</p>,
  h1: ({ children }) => (
    <h1 className="font-sans mb-3 mt-4 border-b border-violet-500/30 pb-2 text-xl font-semibold tracking-tight text-slate-100 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-sans mb-2 mt-4 text-lg font-semibold tracking-tight text-slate-100 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-sans mb-2 mt-3 text-base font-semibold tracking-tight text-teal-300">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 marker:text-teal-400">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 marker:text-teal-400">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="text-slate-400 italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 rounded-r-2xl border-l-4 border-teal-500/60 bg-teal-950/40 py-2 pl-4 pr-3 text-slate-300">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-violet-500/20" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-violet-300 underline decoration-violet-500/50 underline-offset-2 hover:text-teal-300 hover:decoration-teal-500/50"
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const inline = !className;
    if (inline) {
      return (
        <code
          className="rounded-lg border border-violet-500/30 bg-violet-950/60 px-1.5 py-0.5 font-mono text-[14px] text-violet-200"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-2xl border border-violet-500/25 bg-[#0d0d14] p-4 font-mono text-[14px] leading-relaxed text-slate-200 sm:text-[15px]">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto rounded-2xl border border-violet-500/20">
      <table className="w-full min-w-[280px] border-collapse text-left text-[14px] sm:text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-violet-950/50 font-sans text-xs font-semibold text-violet-200">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-violet-500/25 px-3 py-2 font-semibold text-slate-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-700/60 px-3 py-2 text-slate-300">{children}</td>
  ),
  tr: ({ children }) => <tr className="hover:bg-violet-950/30">{children}</tr>,
};

export function AssistantMarkdown({ content }: { content: string }) {
  if (!content.trim()) {
    return null;
  }
  return (
    <div className="explorer-md max-w-none break-words text-[17px] sm:text-[18px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
