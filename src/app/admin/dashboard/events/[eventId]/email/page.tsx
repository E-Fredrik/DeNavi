"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, Send,
  Monitor, Smartphone, Calendar, TestTube, Folder, Check, Eye
} from "lucide-react";
import { BlockToolbar } from "@/components/email-builder/BlockToolbar";
import { SmartTagsPanel } from "@/components/email-builder/SmartTagsPanel";

type BlockType = "text" | "image" | "qrcode" | "divider" | "button";
type ViewMode = "desktop" | "mobile";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  url?: string;
  align?: "left" | "center" | "right";
  buttonText?: string;
  buttonLink?: string;
}

const DEFAULT_BLOCKS: Block[] = [
  {
    id: "1",
    type: "image",
    content: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
    align: "center",
  },
  {
    id: "2",
    type: "text",
    content: `<div style="text-align: center;"><h1 style="font-size: 32px; font-weight: bold; color: #1a1a1a; margin-bottom: 16px;">You're Invited! 🎉</h1><p style="font-size: 16px; color: #666; line-height: 1.6;">Join us for an unforgettable evening of celebration. We can't wait to see you there!</p></div>`,
    align: "center",
  },
  {
    id: "3",
    type: "qrcode",
    content: "QR_CODE_PLACEHOLDER",
    align: "center",
  },
];

export default function EmailBuilderPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendMode, setSendMode] = useState<"immediate" | "scheduled">("immediate");
  const [scheduleDate, setScheduleDate] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: type === "text" ? "<p>Enter your text here...</p>" : 
               type === "image" ? "https://placehold.co/600x300/e2e8f0/475569?text=Upload+Image" :
               type === "qrcode" ? "QR_CODE_PLACEHOLDER" :
               type === "button" ? "Click Here" : "",
      align: "center",
      buttonText: type === "button" ? "RSVP Now" : undefined,
      buttonLink: type === "button" ? "{{RSVP_Link}}" : undefined,
    };
    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
    showToast("Block added successfully", true);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
    showToast("Block removed", true);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + direction]] = [newBlocks[index + direction], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const generateEmailHTML = () => {
    const blockHtml = blocks.map((b) => {
      const alignStyle = `text-align: ${b.align};`;
      
      if (b.type === "text") {
        return `<div style="${alignStyle} padding: 20px 0;">${b.content}</div>`;
      }
      
      if (b.type === "image") {
        return `<div style="${alignStyle} padding: 20px 0;"><img src="${b.content}" style="max-width: 100%; height: auto; border-radius: 8px;" alt="Email Image" /></div>`;
      }
      
      if (b.type === "qrcode") {
        return `<div style="${alignStyle} padding: 30px 0;"><img src="{{QR_CODE_URL}}" style="width: 200px; height: 200px; border: 4px solid #f3f4f6; border-radius: 12px; padding: 10px; background: white;" alt="Your QR Code" /></div>`;
      }
      
      if (b.type === "button") {
        return `<div style="${alignStyle} padding: 30px 0;"><a href="${b.buttonLink}" style="display: inline-block; background: linear-gradient(135deg, var(--dash-accent) 0%, var(--dash-accent-light) 100%); color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);">${b.buttonText}</a></div>`;
      }
      
      if (b.type === "divider") {
        return `<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;" />`;
      }
      
      return "";
    }).join("");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Invitation</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${blockHtml}
    <div style="text-align: center; padding: 30px 0; border-top: 1px solid #e5e7eb; margin-top: 40px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Powered by DeNavi Event Management</p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    try {
      const html = generateEmailHTML();
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailTemplate: html }),
      });
      
      if (res.ok) {
        showToast("Template saved successfully!", true);
      } else {
        showToast("Failed to save template", false);
      }
    } catch (err) {
      showToast("Error saving template", false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      showToast("Please enter an email address", false);
      return;
    }
    setLoading(true);
    try {
      // Simulate test email send
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast(`Test email sent to ${testEmail}!`, true);
    } catch (err) {
      showToast("Failed to send test email", false);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvites = async () => {
    setLoading(true);
    try {
      const html = generateEmailHTML();
      // Add API call to send invites
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast("Email invitations are being sent!", true);
      setTimeout(() => router.push(`/admin/dashboard/events/${eventId}`), 2000);
    } catch (err) {
      showToast("Failed to send invitations", false);
    } finally {
      setLoading(false);
    }
  };

  const insertSmartTag = (tag: string) => {
    const activeBlock = blocks.find((b) => b.id === activeBlockId);
    if (activeBlock && activeBlock.type === "text") {
      updateBlock(activeBlockId!, { content: activeBlock.content + " " + tag });
      showToast(`Tag ${tag} inserted`, true);
    } else {
      showToast("Select a text block first", false);
    }
  };

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  return (
    <div className="flex flex-col h-screen bg-dash-bg">
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md"
            style={{
              background: toast.ok
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            <div className="flex items-center gap-3 font-semibold">
              {toast.ok ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-6 lg:px-10 border-b border-dash-border bg-dash-surface/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl hover:bg-dash-surface-hover transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-dash-text-sub group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-dash-text tracking-tight">
              Email Invitation Builder
            </h1>
            <p className="text-sm text-dash-text-muted">
              Create stunning email invitations with drag-and-drop simplicity
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-dash-surface-alt">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "desktop"
                  ? "bg-dash-surface-hover text-dash-accent-light shadow-sm"
                  : "text-dash-text-muted hover:text-dash-text"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "mobile"
                  ? "bg-dash-surface-hover text-dash-accent-light shadow-sm"
                  : "text-dash-text-muted hover:text-dash-text"
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSaveTemplate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-[var(--dash-accent)] to-[var(--dash-accent-light)] text-white shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Template"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Block Toolbox */}
        <aside className="w-72 flex-shrink-0 border-r border-dash-border bg-dash-surface/50 backdrop-blur-sm p-6 overflow-y-auto">
          <BlockToolbar onAddBlock={addBlock} />
          
          <div className="my-6 border-t border-dash-border"></div>
          
          <SmartTagsPanel onInsertTag={insertSmartTag} />
        </aside>

        {/* Center - Email Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div
            className={`mx-auto bg-dash-surface min-h-[800px] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              viewMode === "desktop" ? "max-w-2xl" : "max-w-md"
            }`}
            style={{ width: viewMode === "desktop" ? "600px" : "375px" }}
          >
            <div className="p-10">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  onClick={() => setActiveBlockId(block.id)}
                  className={`group relative p-4 mb-3 rounded-xl transition-all cursor-pointer border-2 ${
                    activeBlockId === block.id
                      ? "border-dash-accent-light bg-dash-surface-alt shadow-lg"
                      : "border-transparent hover:border-dash-border hover:bg-dash-surface-hover"
                  }`}
                >
                  {/* Block Controls */}
                  <div
                    className={`absolute top-2 right-2 flex gap-1 transition-opacity ${
                      activeBlockId === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(index, -1);
                      }}
                      className="p-1.5 bg-dash-surface rounded-lg shadow-md border border-dash-border hover:bg-dash-surface-hover"
                    >
                      <ChevronUp className="w-4 h-4 text-dash-text-muted" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(index, 1);
                      }}
                      className="p-1.5 bg-dash-surface rounded-lg shadow-md border border-dash-border hover:bg-dash-surface-hover"
                    >
                      <ChevronDown className="w-4 h-4 text-dash-text-muted" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className="p-1.5 bg-dash-surface rounded-lg shadow-md border border-dash-border hover:bg-red-900/20 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Block Content */}
                  <div style={{ textAlign: block.align }}>
                    {block.type === "text" && (
                      <div dangerouslySetInnerHTML={{ __html: block.content }} className="prose dark:prose-invert max-w-none" />
                    )}
                    {block.type === "image" && (
                      <img src={block.content} alt="" className="max-w-full rounded-lg inline-block shadow-md" />
                    )}
                    {block.type === "qrcode" && (
                      <div className="inline-block p-4 bg-dash-surface rounded-xl border-4 border-dash-border shadow-lg">
                        <div className="w-40 h-40 bg-gradient-to-br from-[var(--dash-surface-alt)] to-[var(--dash-surface-hover)] rounded-lg flex items-center justify-center text-dash-text-muted font-mono text-xs">
                          QR CODE
                        </div>
                      </div>
                    )}
                    {block.type === "button" && (
                      <span className="inline-block bg-gradient-to-r from-[var(--dash-accent)] to-[var(--dash-accent-light)] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                        {block.buttonText}
                      </span>
                    )}
                    {block.type === "divider" && (
                      <hr className="border-t-2 border-dash-border my-6" />
                    )}
                  </div>
                </div>
              ))}

              {blocks.length === 0 && (
                <div className="py-32 text-center text-dash-text-muted dark:text-gray-600">
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No blocks added yet</p>
                  <p className="text-sm mt-2">Click a block type on the left to start building</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Block Settings & Send Options */}
        <aside className="w-80 flex-shrink-0 border-l border-dash-border bg-dash-surface/50 backdrop-blur-sm p-6 overflow-y-auto space-y-6">
          
          {/* Block Settings */}
          {activeBlock && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-dash-surface border border-dash-border shadow-sm"
            >
              <h3 className="text-dash-text font-bold text-sm uppercase tracking-wide mb-4">
                Block Settings
              </h3>

              {activeBlock.type === "text" && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-dash-text-muted mb-2">
                    Content
                  </label>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full min-h-[150px] p-3 text-sm rounded-lg border-2 border-dash-border bg-dash-bg text-dash-text outline-none focus:border-dash-accent-light prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: activeBlock.content }}
                    onBlur={(e) => updateBlock(activeBlock.id, { content: e.currentTarget.innerHTML })}
                  />
                </div>
              )}

              {activeBlock.type === "image" && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-dash-text-muted mb-2">
                    Image URL or Upload
                  </label>
                  <input
                    type="text"
                    value={activeBlock.content}
                    onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-3 text-sm rounded-lg border-2 border-dash-border bg-dash-bg text-dash-text outline-none focus:border-dash-accent-light"
                  />
                  <div className="mt-3 p-3 bg-dash-surface-alt rounded-lg border border-dash-border">
                    <img src={activeBlock.content} alt="Preview" className="max-h-32 object-contain mx-auto rounded" />
                  </div>
                </div>
              )}

              {activeBlock.type === "button" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-dash-text-muted mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={activeBlock.buttonText}
                      onChange={(e) => updateBlock(activeBlock.id, { buttonText: e.target.value })}
                      className="w-full p-3 text-sm rounded-lg border-2 border-dash-border bg-dash-bg text-dash-text outline-none focus:border-dash-accent-light"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dash-text-muted mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={activeBlock.buttonLink}
                      onChange={(e) => updateBlock(activeBlock.id, { buttonLink: e.target.value })}
                      placeholder="{{RSVP_Link}} or https://..."
                      className="w-full p-3 text-sm rounded-lg border-2 border-dash-border bg-dash-bg text-dash-text outline-none focus:border-dash-accent-light"
                    />
                  </div>
                </div>
              )}

              {activeBlock.type === "qrcode" && (
                <div className="p-4 rounded-lg bg-dash-surface-alt border border-dash-border">
                  <p className="text-sm text-dash-text-sub leading-relaxed">
                    This QR code will be dynamically generated for each guest with their unique check-in code when emails are sent.
                  </p>
                </div>
              )}

              {activeBlock.type !== "divider" && (
                <div className="mt-4 pt-4 border-t border-dash-border">
                  <label className="block text-xs font-medium text-dash-text-muted mb-3">
                    Alignment
                  </label>
                  <div className="flex gap-2">
                    {["left", "center", "right"].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateBlock(activeBlock.id, { align: align as any })}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase transition-all ${
                          activeBlock.align === align
                            ? "bg-dash-accent text-dash-on-accent shadow-md"
                            : "bg-dash-surface-alt text-dash-text-muted hover:bg-dash-surface-hover"
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Test Email */}
          <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <h3 className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm uppercase tracking-wide mb-3">
              <TestTube className="w-4 h-4" />
              Send Test Email
            </h3>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-3 text-sm rounded-lg border-2 border-amber-200 dark:border-amber-900 bg-dash-bg text-dash-text outline-none focus:border-amber-500 mb-3"
            />
            <button
              onClick={handleSendTest}
              disabled={loading || !testEmail.trim()}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Send Test
            </button>
          </div>

          {/* Send Options */}
          <div className="p-5 rounded-xl dash-card-alt border-dash-border">
            <h3 className="flex items-center gap-2 text-dash-text font-bold text-sm uppercase tracking-wide mb-4">
              <Send className="w-4 h-4" />
              Send Invitations
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSendMode("immediate")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase transition-all ${
                    sendMode === "immediate"
                      ? "bg-dash-accent text-dash-on-accent shadow-md"
                      : "bg-dash-bg text-dash-text-muted border border-dash-border"
                  }`}
                >
                  Immediate
                </button>
                <button
                  onClick={() => setSendMode("scheduled")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase transition-all ${
                    sendMode === "scheduled"
                      ? "bg-dash-accent text-dash-on-accent shadow-md"
                      : "bg-dash-bg text-dash-text-muted border border-dash-border"
                  }`}
                >
                  Schedule
                </button>
              </div>

              {sendMode === "scheduled" && (
                <div>
                  <label className="block text-xs font-medium text-dash-text-muted mb-2">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-3 text-sm rounded-lg border-2 border-dash-border bg-dash-bg text-dash-text outline-none focus:border-dash-accent-light"
                  />
                </div>
              )}

              <button
                onClick={handleSendInvites}
                disabled={loading || (sendMode === "scheduled" && !scheduleDate)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--dash-accent)] to-[var(--dash-accent-light)] text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {sendMode === "immediate" ? "Send Now" : "Schedule Send"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
