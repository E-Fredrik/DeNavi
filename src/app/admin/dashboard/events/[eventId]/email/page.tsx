"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Edit3, LayoutTemplate, Type, Palette, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function EmailBuilderPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Builder state
  const [bgColor, setBgColor] = useState("#f9fafb");
  const [cardColor, setCardColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#111827");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [title, setTitle] = useState("You're Invited!");
  const [bodyText, setBodyText] = useState("We would be honored to have you at our special event. Please present the QR code below at the check-in desk.");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
        
        // Parse existing template if it exists
        if (data.emailTemplate) {
          try {
            // We store the config as a JSON string inside a data-config attribute or just directly save the config as JSON and render on backend.
            // Wait, the prompt says "customizable HTML emails". We can store a JSON of the config and generate the HTML on the fly when sending.
            // To make it easy, let's store the config in the DB.
            const config = JSON.parse(data.emailTemplate);
            if (config.bgColor) setBgColor(config.bgColor);
            if (config.cardColor) setCardColor(config.cardColor);
            if (config.textColor) setTextColor(config.textColor);
            if (config.accentColor) setAccentColor(config.accentColor);
            if (config.title) setTitle(config.title);
            if (config.bodyText) setBodyText(config.bodyText);
            if (config.textAlign) setTextAlign(config.textAlign);
          } catch(e) {
            // It might be raw HTML if previously set, ignore for now
          }
        }
      }
    } catch { } finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleSave = async () => {
    setSaving(true);
    const config = { bgColor, cardColor, textColor, accentColor, title, bodyText, textAlign };
    
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailTemplate: JSON.stringify(config) }),
      });
      if (res.ok) {
        alert("Template saved successfully!");
      }
    } catch(err) {
      console.error(err);
      alert("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;
  if (!event) return <div className="p-10">Event not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 min-h-[calc(100vh-64px)] flex flex-col">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <Link href={`/admin/dashboard/events/${eventId}`} className="inline-flex items-center gap-2 mb-2 hover:opacity-70 text-zinc-500 transition-opacity">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Event</span>
          </Link>
          <h1 className="text-zinc-900 dark:text-white font-semibold text-3xl tracking-tight">Email Invitation Builder</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Template"}
        </button>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Sidebar Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-xl shadow-zinc-200/20 dark:shadow-black/20">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2"><Palette className="w-5 h-5 text-indigo-500"/> Colors</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Background</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Card Color</label>
                <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Text Color</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Accent Color</label>
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
              </div>
            </div>
          </div>

          <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-xl shadow-zinc-200/20 dark:shadow-black/20">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6 flex items-center gap-2"><Type className="w-5 h-5 text-indigo-500"/> Typography</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Headline</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Body Text</label>
                <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Alignment</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
                  {["left", "center", "right"].map((align) => (
                    <button key={align} onClick={() => setTextAlign(align as any)} className={`flex-1 py-1.5 text-sm font-medium capitalize rounded-lg transition-colors ${textAlign === align ? "bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Preview */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-zinc-100 dark:bg-zinc-950 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col relative shadow-inner">
          <div className="absolute top-4 left-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-zinc-500 border border-zinc-200 dark:border-zinc-800 z-10 flex items-center gap-1.5">
            <LayoutTemplate className="w-3 h-3" /> LIVE PREVIEW
          </div>
          
          <div className="flex-1 flex items-center justify-center p-8 lg:p-12" style={{ backgroundColor: bgColor }}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-all duration-300" style={{ backgroundColor: cardColor, textAlign: textAlign as any }}>
              {/* Header Image Placeholder */}
              <div className="h-32 w-full flex items-center justify-center text-white font-bold tracking-widest uppercase" style={{ backgroundColor: accentColor }}>
                {event.name}
              </div>
              
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>{title}</h2>
                <p className="text-sm leading-relaxed opacity-90 mb-8" style={{ color: textColor }}>
                  Hi {"{Guest Name}"}, <br/><br/>
                  {bodyText}
                </p>
                
                {/* QR Code Placeholder */}
                <div className="mx-auto w-48 h-48 bg-white border-4 border-zinc-100 rounded-xl flex flex-col items-center justify-center relative shadow-sm" style={{ borderColor: accentColor }}>
                  <QrCode className="w-24 h-24 text-zinc-300 mb-2" />
                  <span className="text-[10px] text-zinc-400 font-medium tracking-widest uppercase">QR Placeholder</span>
                </div>
                
                <p className="mt-6 text-xs font-medium opacity-60" style={{ color: textColor }}>
                  Scan to check in securely at the venue.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
