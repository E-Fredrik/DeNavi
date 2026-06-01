"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Plus, Type, Image as ImageIcon, Link as LinkIcon, Minus, Trash2, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";

type BlockType = "text" | "image" | "qrcode" | "divider" | "rsvp";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  url?: string;
  align?: "left" | "center" | "right";
}

export default function EmailBuilderPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "image", content: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800", align: "center" },
    { id: "2", type: "text", content: "<h1>You're Invited!</h1><p>Join us for an unforgettable evening. Present your QR code ticket at the entrance.</p>", align: "center" },
    { id: "3", type: "qrcode", content: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Placeholder", align: "center" },
  ]);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === "text" ? "<p>New text block...</p>" : type === "qrcode" ? "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Placeholder" : type === "image" ? "https://placehold.co/600x200/e2e8f0/475569?text=Upload+Image" : type === "rsvp" ? "Pilih Tempat Duduk / RSVP" : "",
      align: "center"
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlock(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    setBlocks(newBlocks);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlock === id) setActiveBlock(null);
  };

  const generateHtml = () => {
    // A simple HTML generator for the email dispatch
    const innerHtml = blocks.map(b => {
      if (b.type === "text") return `<div style="text-align: ${b.align}; padding: 10px 0; color: #1a1a1a;">${b.content}</div>`;
      if (b.type === "image") return `<div style="text-align: ${b.align}; padding: 10px 0;"><img src="${b.content}" style="max-width: 100%; border-radius: 8px;" alt="Email Image" /></div>`;
      if (b.type === "qrcode") return `<div style="text-align: ${b.align}; padding: 20px 0;"><img src="${b.content}" style="width: 150px; height: 150px;" class="guest-qr-code" alt="Your QR Code" /></div>`;
      if (b.type === "rsvp") return `<div style="text-align: ${b.align}; padding: 20px 0;"><a href="{rsvpLink}" style="display: inline-block; background-color: #2d3895; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-family: sans-serif;">${b.content}</a></div>`;
      if (b.type === "divider") return `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />`;
      return "";
    }).join("");

    return `<!DOCTYPE html><html><body style="margin:0;padding:20px;background-color:#f4f4f5;font-family:sans-serif;"><div style="max-width:600px;margin:0 auto;background-color:#ffffff;padding:40px;border-radius:12px;">${innerHtml}</div></body></html>`;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const html = generateHtml();
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailTemplate: html }),
      });
      if (res.ok) {
        alert("Template saved!");
        router.push(`/admin/dashboard/events/${eventId}`);
      } else {
        alert("Failed to save.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8edd6] dark:bg-[#0b1022]" style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4 lg:px-8 border-b border-[#867bba]/30 bg-[#f1e5ed] dark:bg-[#18203c]">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-[#867bba]/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#3c58a7] dark:text-[#b3c2ff]" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0c123b] dark:text-[#e8eeff]">Email Ticket Builder</h1>
            <p className="text-xs text-[#3c58a7] dark:text-[#b3c2ff]">WordPress-style visual editor</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #2d3895 0%, #3c58a7 100%)", color: "#fbeed4" }}>
          {loading ? "Saving..." : <><CheckCircle2 className="w-4 h-4" /> Save Template</>}
        </button>
      </header>

      {/* Editor Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar / Toolbox */}
        <aside className="w-64 flex-shrink-0 border-r border-[#867bba]/30 bg-[#fbeed4]/50 dark:bg-[#111a34]/50 p-4 overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#867bba] mb-4">Add Blocks</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addBlock("text")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#867bba]/40 bg-[#f1e5ed] dark:bg-[#18203c] hover:border-[#2d3895] transition-colors group">
              <Type className="w-6 h-6 text-[#3c58a7] dark:text-[#b3c2ff] group-hover:text-[#2d3895]" />
              <span className="text-xs mt-2 text-[#0c123b] dark:text-[#e8eeff] font-medium">Text</span>
            </button>
            <button onClick={() => addBlock("image")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#867bba]/40 bg-[#f1e5ed] dark:bg-[#18203c] hover:border-[#2d3895] transition-colors group">
              <ImageIcon className="w-6 h-6 text-[#3c58a7] dark:text-[#b3c2ff] group-hover:text-[#2d3895]" />
              <span className="text-xs mt-2 text-[#0c123b] dark:text-[#e8eeff] font-medium">Image</span>
            </button>
            <button onClick={() => addBlock("qrcode")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#867bba]/40 bg-[#f1e5ed] dark:bg-[#18203c] hover:border-[#2d3895] transition-colors group">
              <div className="w-6 h-6 border-2 border-[#3c58a7] dark:border-[#b3c2ff] group-hover:border-[#2d3895] rounded-sm p-0.5 grid grid-cols-2 gap-0.5">
                <div className="bg-[#3c58a7] dark:bg-[#b3c2ff] group-hover:bg-[#2d3895] rounded-sm"></div>
                <div className="bg-[#3c58a7] dark:bg-[#b3c2ff] group-hover:bg-[#2d3895] rounded-sm"></div>
                <div className="bg-[#3c58a7] dark:bg-[#b3c2ff] group-hover:bg-[#2d3895] rounded-sm"></div>
                <div className="bg-transparent"></div>
              </div>
              <span className="text-xs mt-2 text-[#0c123b] dark:text-[#e8eeff] font-medium">QR Code</span>
            </button>
            <button onClick={() => addBlock("divider")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#867bba]/40 bg-[#f1e5ed] dark:bg-[#18203c] hover:border-[#2d3895] transition-colors group">
              <Minus className="w-6 h-6 text-[#3c58a7] dark:text-[#b3c2ff] group-hover:text-[#2d3895]" />
              <span className="text-xs mt-2 text-[#0c123b] dark:text-[#e8eeff] font-medium">Divider</span>
            </button>
            <button onClick={() => addBlock("rsvp")} className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#867bba]/40 bg-[#f1e5ed] dark:bg-[#18203c] hover:border-[#2d3895] transition-colors group col-span-2">
              <LinkIcon className="w-6 h-6 text-[#3c58a7] dark:text-[#b3c2ff] group-hover:text-[#2d3895]" />
              <span className="text-xs mt-2 text-[#0c123b] dark:text-[#e8eeff] font-medium">RSVP Button</span>
            </button>
          </div>

          <AnimatePresence>
            {activeBlock && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-8">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#867bba] mb-4">Block Settings</h2>
                {blocks.map(b => b.id === activeBlock && (
                  <div key={b.id} className="space-y-4">
                    {b.type === "text" && (
                      <div>
                        <label className="block text-xs font-medium text-[#3c58a7] dark:text-[#b3c2ff] mb-1">Text Content</label>
                        <div className="flex gap-1 mb-2">
                           <button onClick={() => document.execCommand('bold')} className="px-2 py-1 bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7] rounded text-xs font-bold hover:bg-[#867bba] hover:text-white">B</button>
                           <button onClick={() => document.execCommand('italic')} className="px-2 py-1 bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7] rounded text-xs italic hover:bg-[#867bba] hover:text-white">I</button>
                           <button onClick={() => document.execCommand('formatBlock', false, 'H1')} className="px-2 py-1 bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7] rounded text-xs font-bold hover:bg-[#867bba] hover:text-white">H1</button>
                           <button onClick={() => document.execCommand('formatBlock', false, 'P')} className="px-2 py-1 bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7] rounded text-xs hover:bg-[#867bba] hover:text-white">P</button>
                        </div>
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          className="w-full min-h-[120px] p-3 text-sm rounded-lg border border-[#867bba]/40 bg-white dark:bg-[#0b1022] text-[#0c123b] dark:text-[#e8eeff] outline-none focus:border-[#2d3895] overflow-y-auto prose dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: b.content }}
                          onBlur={(e) => updateBlock(b.id, { content: e.currentTarget.innerHTML })}
                        />
                      </div>
                    )}
                    {b.type === "image" && (
                      <div>
                        <label className="block text-xs font-medium text-[#3c58a7] dark:text-[#b3c2ff] mb-2">Upload Image</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                               // Simulating file upload since the exact upload implementation might vary
                               const res = await fetch("/api/upload", { method: "POST", body: formData });
                               if (res.ok) {
                                 const data = await res.json();
                                 if (data.url) updateBlock(b.id, { content: data.url });
                               } else {
                                 // Fallback to local blob URL if no backend upload service
                                 const blobUrl = URL.createObjectURL(file);
                                 updateBlock(b.id, { content: blobUrl });
                               }
                            } catch (err) {
                               // Fallback
                               const blobUrl = URL.createObjectURL(file);
                               updateBlock(b.id, { content: blobUrl });
                            }
                          }}
                          className="w-full text-xs text-[#3c58a7] dark:text-[#b3c2ff] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#2d3895] file:text-white hover:file:bg-[#3c58a7] cursor-pointer"
                        />
                        <div className="mt-3 flex items-center justify-center bg-[#f1e5ed] dark:bg-[#18203c] rounded-lg p-2 border border-[#867bba]/20">
                           <img src={b.content} className="max-h-24 object-contain rounded" alt="Preview" />
                        </div>
                      </div>
                    )}
                    {b.type === "qrcode" && (
                      <div className="p-4 rounded-lg bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba]/20 text-center">
                        <p className="text-xs text-[#3c58a7] dark:text-[#b3c2ff]">This QR Code block acts as a dynamic placeholder.</p>
                        <p className="text-xs text-[#3c58a7] dark:text-[#b3c2ff] mt-2">When emails are sent, our system will automatically replace it with each guest's unique check-in QR code.</p>
                      </div>
                    )}
                    {b.type === "rsvp" && (
                      <div>
                        <label className="block text-xs font-medium text-[#3c58a7] dark:text-[#b3c2ff] mb-2">Button Text</label>
                        <input
                          type="text"
                          value={b.content}
                          onChange={(e) => updateBlock(b.id, { content: e.target.value })}
                          className="w-full p-2 text-sm rounded-lg border border-[#867bba]/40 bg-white dark:bg-[#0b1022] text-[#0c123b] dark:text-[#e8eeff] outline-none focus:border-[#2d3895]"
                        />
                        <p className="text-[10px] text-[#867bba] mt-2">
                          The link will automatically direct the guest to their unique RSVP page ({"{rsvpLink}"}).
                        </p>
                      </div>
                    )}
                    
                    {b.type !== "divider" && (
                      <div>
                        <label className="block text-xs font-medium text-[#3c58a7] dark:text-[#b3c2ff] mb-2">Alignment</label>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateBlock(b.id, { align: "left" })} className={`p-2 rounded ${b.align === "left" ? "bg-[#2d3895] text-white" : "bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7]"}`}>Left</button>
                          <button onClick={() => updateBlock(b.id, { align: "center" })} className={`p-2 rounded ${b.align === "center" ? "bg-[#2d3895] text-white" : "bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7]"}`}>Center</button>
                          <button onClick={() => updateBlock(b.id, { align: "right" })} className={`p-2 rounded ${b.align === "right" ? "bg-[#2d3895] text-white" : "bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7]"}`}>Right</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Canvas */}
        <main className="flex-1 p-8 overflow-y-auto bg-zinc-100/50 dark:bg-black/50">
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#18203c] min-h-[800px] rounded-xl shadow-2xl overflow-hidden" style={{ width: "600px" }}>
            <div className="p-10">
              {blocks.map((block, index) => (
                <div 
                  key={block.id} 
                  onClick={() => setActiveBlock(block.id)}
                  className={`group relative p-4 mb-2 rounded-xl transition-all border-2 cursor-pointer ${activeBlock === block.id ? "border-[#2d3895] bg-[#2d3895]/5" : "border-transparent hover:border-[#867bba]/30"}`}
                >
                  {/* Block Actions */}
                  <div className={`absolute top-2 right-2 flex gap-1 transition-opacity ${activeBlock === block.id ? "opacity-100" : "opacity-0"}`}>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }} className="p-1.5 bg-white dark:bg-[#111a34] rounded-md shadow-md border border-[#867bba]/20 hover:text-[#2d3895]"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }} className="p-1.5 bg-white dark:bg-[#111a34] rounded-md shadow-md border border-[#867bba]/20 hover:text-[#2d3895]"><ChevronDown className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 bg-white dark:bg-[#111a34] rounded-md shadow-md border border-[#867bba]/20 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* Render Block Content */}
                  <div style={{ textAlign: block.align }}>
                    {block.type === "text" && <div dangerouslySetInnerHTML={{ __html: block.content }} className="prose dark:prose-invert max-w-none text-[#1a1a1a] dark:text-[#e8eeff]" />}
                    {block.type === "image" && <img src={block.content} alt="" className="max-w-full rounded-lg inline-block" />}
                    {block.type === "qrcode" && <img src={block.content} alt="QR Code" className="w-36 h-36 rounded-lg inline-block border border-gray-200 p-2" />}
                    {block.type === "rsvp" && (
                      <span className="inline-block bg-[#2d3895] text-white px-6 py-3 rounded-lg font-bold">
                        {block.content}
                      </span>
                    )}
                    {block.type === "divider" && <hr className="border-t-2 border-[#e5e7eb] dark:border-[#2a2660] my-4" />}
                  </div>
                </div>
              ))}

              {blocks.length === 0 && (
                <div className="py-20 text-center text-[#867bba]">
                  <p>No blocks added yet.</p>
                  <p className="text-sm mt-2">Click a block on the left to start building your email.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
