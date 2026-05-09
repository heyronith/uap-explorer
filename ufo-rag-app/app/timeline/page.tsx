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
    <main className="h-screen w-full bg-[#02040a] flex flex-col relative overflow-hidden text-starlight">
      <div className="nebula-bg" />
      <div className="mesh-grid" />

      {/* HEADER */}
      <header className="p-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-violet-400 transition-colors">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Explorer
          </Link>
          <div className="h-8 w-px bg-white/10" />
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-heading">TIMELINE</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Archive Density Analysis // 1947 - 2023</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-4 premium-glass px-6 py-3 rounded-2xl">
          <Filter className="w-4 h-4 text-violet-500" />
          <select 
            value={agency} 
            onChange={(e) => setAgency(e.target.value)}
            className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none border-none focus:ring-0 text-white/60 hover:text-white transition-colors"
          >
            <option value="ALL">All Agencies</option>
            <option value="FBI">FBI</option>
            <option value="USAF">US Air Force</option>
            <option value="CIA">CIA</option>
            <option value="DOW">Dept of War</option>
          </select>
          <div className="w-px h-4 bg-white/10" />
          <select 
            value={classification} 
            onChange={(e) => setClassification(e.target.value)}
            className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none border-none focus:ring-0 text-white/60 hover:text-white transition-colors"
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
      <section className="flex-grow flex flex-col justify-center px-12 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            <p className="text-xs uppercase tracking-widest text-white/20">Scanning Archive Waves...</p>
          </div>
        ) : (
          <div className="w-full h-96 flex items-end gap-1 group/wave">
            {data.map((point) => (
              <motion.div
                key={point.year}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                onClick={() => setSelectedYear(point.year)}
                className={`flex-1 min-w-[4px] relative cursor-pointer group/bar`}
                style={{ height: `${(point.count / maxCount) * 100}%` }}
              >
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                  selectedYear === point.year 
                    ? "bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)]" 
                    : "bg-white/10 group-hover/bar:bg-violet-400 group-hover/bar:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                }`} />
                
                {/* TOOLTIP */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-30">
                  <div className="premium-glass px-3 py-1.5 rounded-lg whitespace-nowrap text-center">
                    <div className="text-[10px] font-bold text-violet-400 leading-none">{point.year}</div>
                    <div className="text-[14px] font-bold text-white mt-1">{point.count} Reports</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* TIME LABELS */}
        <div className="mt-8 flex justify-between px-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] border-t border-white/5 pt-4">
          <span>1947 Phase 0</span>
          <span>Timeline Horizon</span>
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
            className="fixed inset-y-0 right-0 w-[500px] bg-[#07070c]/98 backdrop-blur-3xl border-l border-white/10 z-40 p-8 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <h2 className="text-2xl font-bold font-heading">{selectedYear} INCIDENTS</h2>
                </div>
                <p className="text-xs text-white/30 uppercase tracking-widest">Year Cluster Dossier</p>
              </div>
              <button 
                onClick={() => setSelectedYear(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-6 pr-4 hide-scrollbar">
              {dossierLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest">Decrypting Files...</span>
                </div>
              ) : dossiers.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs uppercase tracking-widest">No matching records found</p>
                </div>
              ) : (
                dossiers.map((doc, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 hover:border-violet-500/30 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {doc.classification !== 'UNKNOWN' && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            doc.classification === 'TOP SECRET' ? 'bg-red-500/20 text-red-400' :
                            doc.classification === 'SECRET' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {doc.classification}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white/80 leading-tight">{doc.title}</h4>
                      </div>
                      {doc.agency !== 'UNKNOWN' && (
                        <span className="text-[10px] font-bold text-violet-400 uppercase">{doc.agency}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed font-mono italic">
                      "...{doc.content.substring(0, 300)}..."
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-[9px] text-white/20 uppercase tracking-widest">Page {doc.page}</span>
                      <Link 
                        href={`/?q=${encodeURIComponent(`Tell me about the ${selectedYear} incident from ${doc.title}: ${doc.content.substring(0, 100)}`)}`}
                        className="text-[9px] text-violet-400 uppercase font-bold flex items-center gap-1 hover:text-violet-300 transition-colors"
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
