"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Filter, 
  Shield, 
  Globe, 
  Search,
  FileText,
  X,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface TimelinePoint {
  year: number;
  count: number;
}

interface DossierItem {
  content: string;
  title: string;
  page: string | number;
  classification: string;
  agency: string;
}

export default function TimelinePage() {
  const [data, setData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [dossiers, setDossiers] = useState<DossierItem[]>([]);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [agency, setAgency] = useState("ALL");
  const [classification, setClassification] = useState("ALL");

  // Fetch Timeline Data
  useEffect(() => {
    async function fetchTimeline() {
      setLoading(true);
      try {
        const res = await fetch(`/api/timeline?agency=${agency}&classification=${classification}`);
        const json = await res.json();
        setData(json.timeline || []);
      } catch (err) {
        console.error("Failed to fetch timeline:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, [agency, classification]);

  // Fetch Dossiers for Selected Year
  useEffect(() => {
    if (!selectedYear) return;
    async function fetchDossiers() {
      setDossierLoading(true);
      try {
        const res = await fetch(`/api/timeline/dossier?year=${selectedYear}&agency=${agency}`);
        const json = await res.json();
        setDossiers(json.results || []);
      } catch (err) {
        console.error("Failed to fetch dossiers:", err);
      } finally {
        setDossierLoading(false);
      }
    }
    fetchDossiers();
  }, [selectedYear, agency]);

  const maxCount = Math.max(...data.map(p => p.count), 1);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#02040a] text-starlight">
      <div className="nebula-bg" />
      <div className="mesh-grid" />

      {/* HEADER */}
      <header className="z-20 flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="group flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/50 transition-colors hover:text-violet-400 sm:text-xs sm:tracking-widest">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Explorer
          </Link>
          <div className="h-7 w-px bg-white/10 sm:h-8" />
          <div className="space-y-1">
            <h1 className="font-heading text-lg font-bold sm:text-xl">TIMELINE</h1>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/35 sm:text-[10px] sm:tracking-[0.2em]">
              Archive Density Analysis // 1947 - 2023
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="premium-glass flex flex-wrap items-center gap-2 rounded-2xl px-3 py-3 sm:gap-4 sm:px-5 sm:py-3">
          <Filter className="w-4 h-4 text-violet-500" />
          <select 
            value={agency} 
            onChange={(e) => setAgency(e.target.value)}
            className="min-h-11 rounded-lg bg-transparent px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 outline-none transition-colors hover:text-white focus:ring-0 sm:text-xs sm:tracking-widest"
          >
            <option value="ALL">All Agencies</option>
            <option value="FBI">FBI</option>
            <option value="USAF">US Air Force</option>
            <option value="CIA">CIA</option>
            <option value="DOW">Dept of War</option>
          </select>
          <div className="h-4 w-px bg-white/10" />
          <select 
            value={classification} 
            onChange={(e) => setClassification(e.target.value)}
            className="min-h-11 rounded-lg bg-transparent px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 outline-none transition-colors hover:text-white focus:ring-0 sm:text-xs sm:tracking-widest"
          >
            <option value="ALL">All Clearances</option>
            <option value="TOP SECRET">Top Secret</option>
            <option value="SECRET">Secret</option>
            <option value="CONFIDENTIAL">Confidential</option>
            <option value="DECLASSIFIED">Declassified</option>
          </select>
        </div>
      </header>

      {/* WAVEFORM AREA */}
      <section className="relative z-10 flex flex-grow flex-col justify-center px-4 pb-6 sm:px-6 sm:pb-8 lg:px-10">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            <p className="text-xs uppercase tracking-widest text-white/20">Scanning Archive Waves...</p>
          </div>
        ) : (
          <div className="group/wave flex h-64 w-full items-end gap-1 sm:h-80 lg:h-96">
            {data.map((point) => (
              <motion.div
                key={point.year}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                onClick={() => setSelectedYear(point.year)}
                className={`group/bar relative min-w-[3px] flex-1 cursor-pointer sm:min-w-[4px]`}
                style={{ height: `${(point.count / maxCount) * 100}%` }}
              >
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  selectedYear === point.year 
                    ? "bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]" 
                    : "bg-white/10 group-hover/bar:bg-violet-400 group-hover/bar:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                }`} />
                
                {/* TOOLTIP */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-30">
                  <div className="premium-glass whitespace-nowrap rounded-lg px-3 py-1.5 text-center">
                    <div className="text-[10px] font-bold leading-none text-violet-400">{point.year}</div>
                    <div className="mt-1 text-[12px] font-bold text-white sm:text-[14px]">{point.count} Reports</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* TIME LABELS */}
        <div className="mt-6 flex justify-between border-t border-white/5 px-1 pt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/30 sm:mt-8 sm:px-2 sm:pt-4 sm:text-[10px] sm:tracking-[0.3em]">
          <span>1947 Phase 0</span>
          <span className="hidden sm:inline">Timeline Horizon</span>
          <span>2023 Present</span>
        </div>
      </section>

      {/* DOSSIER SIDE PANEL */}
      <AnimatePresence>
        {selectedYear && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 flex h-[76dvh] flex-col rounded-t-2xl border-t border-white/10 bg-[#07070c]/98 px-4 pb-4 pt-4 shadow-[0_-18px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[min(92vw,500px)] sm:rounded-none sm:border-l sm:border-t-0 sm:px-6 sm:py-6 sm:shadow-[-20px_0_60px_rgba(0,0,0,0.8)] lg:px-8"
          >
            <div className="mb-5 flex items-start justify-between sm:mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <h2 className="font-heading text-xl font-bold sm:text-2xl">{selectedYear} INCIDENTS</h2>
                </div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-white/35 sm:text-xs sm:tracking-widest">Year Cluster Dossier</p>
              </div>
              <button 
                onClick={() => setSelectedYear(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="hide-scrollbar flex-grow space-y-4 overflow-y-auto pr-2 sm:space-y-6 sm:pr-4">
              {dossierLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest">Decrypting Files...</span>
                </div>
              ) : dossiers.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[11px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-widest">No matching records found</p>
                </div>
              ) : (
                dossiers.map((doc, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-violet-500/30 sm:space-y-4 sm:p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {doc.classification !== 'UNKNOWN' && (
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            doc.classification === 'TOP SECRET' ? 'bg-red-500/20 text-red-400' :
                            doc.classification === 'SECRET' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {doc.classification}
                          </span>
                        )}
                        <h4 className="text-[13px] font-bold leading-tight text-white/85 sm:text-xs">{doc.title}</h4>
                      </div>
                      {doc.agency !== 'UNKNOWN' && (
                        <span className="text-[11px] font-bold uppercase text-violet-400 sm:text-[10px]">{doc.agency}</span>
                      )}
                    </div>
                    <p className="font-mono text-[12px] italic leading-relaxed text-white/55 sm:text-xs">
                      "...{doc.content.substring(0, 300)}..."
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-[11px] uppercase tracking-[0.12em] text-white/30 sm:text-[10px] sm:tracking-widest">Page {doc.page}</span>
                      <Link 
                        href={`/?q=${encodeURIComponent(`Tell me about the ${selectedYear} incident from ${doc.title}: ${doc.content.substring(0, 100)}`)}`}
                        className="flex min-h-11 items-center gap-1 text-[11px] font-bold uppercase tracking-[0.08em] text-violet-400 transition-colors hover:text-violet-300 sm:min-h-0 sm:text-[10px] sm:tracking-widest"
                      >
                        Deep Inquiry <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </main>
  );
}
