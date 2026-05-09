"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Search, 
  Dna, 
  Globe, 
  Layers, 
  ChevronRight, 
  Zap, 
  Info,
  Archive,
  BarChart3
} from "lucide-react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="h-screen w-full flex bg-[#02040a] relative overflow-hidden">
      <div className="nebula-bg" />
      <div className="mesh-grid" />

      {/* LEFT SIDEBAR - Archive Metrics */}
      <aside className="w-80 border-r border-white/5 bg-black/20 backdrop-blur-3xl p-8 hidden xl:flex flex-col gap-12 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Globe className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white/90">OBSIDIAN</h1>
            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-[0.2em]">Archive Retrieval</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">System Status</h3>
            <div className="space-y-3">
              {[
                { icon: Shield, label: "Encryption", val: "Active", color: "text-emerald-400" },
                { icon: Dna, label: "Neural Link", val: "Synced", color: "text-violet-400" },
                { icon: Zap, label: "Latency", val: "14ms", color: "text-cyan-400" }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 opacity-40" />
                    <span className="text-xs text-white/60">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Archive Stats</h3>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold font-heading text-white">4,185</span>
                <span className="text-[10px] text-white/40 mb-1">TOTAL PAGES</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: "78%" }}
                  className="h-full bg-violet-500" 
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT INTERFACE */}
      <section className="flex-grow flex flex-col relative z-10 max-w-5xl mx-auto xl:mx-0">
        <header className="p-8 flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/80">Active Inquiry Stream</h2>
            </div>
            <p className="text-xs text-white/40">Secure Uplink: Department of War // 2026 Release v1.0.4</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Info className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto px-8 space-y-10 hide-scrollbar pb-32"
        >
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/20 blur-[100px] rounded-full" />
                  <Archive className="w-20 h-20 text-violet-500 relative z-10" />
                </div>
                <div className="space-y-4 max-w-lg">
                  <h2 className="text-4xl font-bold font-heading text-white">Begin your inquiry.</h2>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Search through thousands of redacted documents, incident reports, and sightings using our semantic intelligence layer.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {["September 2023 Incident", "LiDAR Anomalies", "FBI Redactions", "Metallic Spheres"].map(suggest => (
                    <button 
                      key={suggest}
                      onClick={() => handleInputChange({ target: { value: suggest } } as any)}
                      className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-semibold hover:bg-violet-500 hover:border-violet-500 transition-all duration-300"
                    >
                      {suggest}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`group relative max-w-[85%] sm:max-w-[70%] p-6 rounded-3xl ${
                    m.role === "user" 
                      ? "bg-violet-600 text-white shadow-2xl shadow-violet-600/20" 
                      : "premium-glass"
                  }`}>
                    <div className={`text-[9px] font-bold uppercase tracking-widest mb-3 opacity-40 ${
                      m.role === "user" ? "text-white" : "text-violet-400"
                    }`}>
                      {m.role === "user" ? "Primary Inquirer" : "Archive Retrieval Unit"}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    {m.role !== "user" && (
                       <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] text-white/20 font-bold uppercase tracking-tighter">Source Verification: Confirmed</span>
                          <BarChart3 className="w-3 h-3 text-violet-500/50" />
                       </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          {isLoading && (
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 w-fit">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Scanning Repository...</span>
            </div>
          )}
        </div>

        {/* INPUT PANEL */}
        <div className="p-8 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/90 to-transparent">
          <form 
            onSubmit={handleSubmit}
            className="premium-glass flex items-center p-3 pl-6 gap-4 rounded-2xl focus-within:border-violet-500/50 transition-all duration-500 shadow-3xl"
          >
            <Layers className="w-5 h-5 text-violet-500/50" />
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Query the Obsidian archive..."
              className="flex-grow bg-transparent border-none outline-none text-sm py-2 text-white placeholder:text-white/20"
            />
            <button 
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="bg-violet-600 text-white p-4 rounded-xl hover:bg-violet-500 disabled:opacity-20 transition-all flex items-center gap-2 group"
            >
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Transmit</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </section>

      {/* RIGHT PANEL - Dossier Preview (Optional/Decorative) */}
      <aside className="w-80 border-l border-white/5 bg-black/20 backdrop-blur-3xl p-8 hidden 2xl:flex flex-col gap-8 z-10">
        <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Metadata Insight</h3>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-crosshair">
               <div className="w-full h-24 bg-white/5 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 opacity-20" />
               </div>
               <div className="h-2 w-2/3 bg-white/10 rounded" />
               <div className="h-2 w-1/2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
