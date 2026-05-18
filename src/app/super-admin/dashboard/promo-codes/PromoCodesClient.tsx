"use client";

import { useState } from "react";
import { createPromoCode, togglePromoCode, deletePromoCode } from "./actions";
import { Button } from "@/components/ui/button";

export default function PromoCodesClient({ initialCodes }: { initialCodes: any[] }) {
  const [code, setCode] = useState("");
  const [rewardAmount, setRewardAmount] = useState(10);
  const [usageLimit, setUsageLimit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createPromoCode({
      code,
      rewardAmount,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiryDate: expiryDate ? expiryDate : null,
    });
    setCode("");
    setRewardAmount(10);
    setUsageLimit("");
    setExpiryDate("");
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="p-6 rounded-xl border border-[#867bba]/30 bg-[#f1e5ed] dark:bg-[#18203c]">
        <h2 className="text-lg font-bold text-[#0c123b] dark:text-[#e8eeff] mb-4">Create New Code</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-[#3c58a7] dark:text-[#b3c2ff]">Code String</label>
            <input
              required
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] outline-none text-[#0c123b] dark:text-[#e8eeff]"
              placeholder="e.g. SAVE50"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[#3c58a7] dark:text-[#b3c2ff]">Reward Amount (Tokens)</label>
            <input
              required
              type="number"
              min={1}
              value={rewardAmount}
              onChange={e => setRewardAmount(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] outline-none text-[#0c123b] dark:text-[#e8eeff]"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[#3c58a7] dark:text-[#b3c2ff]">Usage Limit (Optional)</label>
            <input
              type="number"
              min={1}
              value={usageLimit}
              onChange={e => setUsageLimit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] outline-none text-[#0c123b] dark:text-[#e8eeff]"
              placeholder="Leave blank for unlimited"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[#3c58a7] dark:text-[#b3c2ff]">Expiry Date (Optional)</label>
            <input
              type="datetime-local"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] outline-none text-[#0c123b] dark:text-[#e8eeff]"
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <Button type="submit" disabled={loading} className="bg-[#2d3895] text-white hover:brightness-110">
              {loading ? "Creating..." : "Create Promo Code"}
            </Button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-[#867bba]/30 bg-[#fbeed4] dark:bg-[#111a34]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f1e5ed] dark:bg-[#18203c] border-b border-[#867bba]/30">
            <tr>
              <th className="px-4 py-3 font-medium text-[#3c58a7] dark:text-[#b3c2ff]">Code</th>
              <th className="px-4 py-3 font-medium text-[#3c58a7] dark:text-[#b3c2ff]">Reward</th>
              <th className="px-4 py-3 font-medium text-[#3c58a7] dark:text-[#b3c2ff]">Uses / Limit</th>
              <th className="px-4 py-3 font-medium text-[#3c58a7] dark:text-[#b3c2ff]">Expires</th>
              <th className="px-4 py-3 font-medium text-[#3c58a7] dark:text-[#b3c2ff]">Status</th>
              <th className="px-4 py-3 text-right font-medium text-[#3c58a7] dark:text-[#b3c2ff]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#867bba]/30">
            {initialCodes.map(pc => (
              <tr key={pc.id} className="text-[#0c123b] dark:text-[#e8eeff]">
                <td className="px-4 py-3 font-semibold">{pc.code}</td>
                <td className="px-4 py-3">{pc.rewardAmount} Tokens</td>
                <td className="px-4 py-3">{pc.timesUsed} / {pc.usageLimit || "∞"}</td>
                <td className="px-4 py-3">{pc.expiryDate ? new Date(pc.expiryDate).toLocaleDateString() : "Never"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pc.isActive ? "bg-green-500/20 text-green-700 dark:text-green-400" : "bg-red-500/20 text-red-700 dark:text-red-400"}`}>
                    {pc.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => togglePromoCode(pc.id, !pc.isActive)}>
                    Toggle
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => deletePromoCode(pc.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {initialCodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#867bba]">No promo codes found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}