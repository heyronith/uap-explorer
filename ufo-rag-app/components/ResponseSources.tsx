import type { RetrievedSource } from "@/lib/chatSources";

export function ResponseSources({ items }: { items: RetrievedSource[] }) {
  if (!items.length) return null;

  return (
    <div className="mt-5 border-t border-violet-500/25 pt-4">
      <h4 className="font-sans text-xs font-semibold uppercase tracking-wide text-teal-400/95">
        Sources
      </h4>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-[15px] marker:text-violet-400 sm:text-base">
        {items.map((s) => (
          <li key={`${s.order}-${s.source_url}`} className="leading-snug text-slate-300">
            <a
              href={s.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-300 underline decoration-violet-500/45 underline-offset-2 hover:text-teal-300 hover:decoration-teal-500/50"
            >
              {s.source_title}
            </a>
            <span className="text-slate-500"> · Page {String(s.page)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[11px] text-slate-500">
        Opens the official release file. PDFs jump to the cited page when your browser supports it.
      </p>
    </div>
  );
}
