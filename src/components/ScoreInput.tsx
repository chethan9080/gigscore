import { useState } from "react";
import { motion } from "framer-motion";
import type { GigProfile } from "@/lib/scoreCalculator";
import { sampleProfiles } from "@/lib/scoreCalculator";

interface Props {
  onCalculate: (profile: GigProfile) => void;
}

const fields = [
  { key: "orders", label: "Total Orders", placeholder: "e.g. 1500", icon: "📦" },
  { key: "rating", label: "Platform Rating", placeholder: "e.g. 4.5", icon: "⭐", step: "0.1", max: "5" },
  { key: "tenure", label: "Tenure (months)", placeholder: "e.g. 18", icon: "📅" },
  { key: "income", label: "Monthly Income (₹)", placeholder: "e.g. 35000", icon: "💰" },
  { key: "upiTransactions", label: "UPI Transactions/mo", placeholder: "e.g. 100", icon: "📱" },
] as const;

export default function ScoreInput({ onCalculate }: Props) {
  const [form, setForm] = useState({
    name: "",
    platform: "",
    orders: "",
    rating: "",
    tenure: "",
    income: "",
    upiTransactions: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      name: form.name || "User",
      platform: form.platform || "Gig Platform",
      orders: Number(form.orders) || 0,
      rating: Number(form.rating) || 0,
      tenure: Number(form.tenure) || 0,
      income: Number(form.income) || 0,
      upiTransactions: Number(form.upiTransactions) || 0,
    });
  };

  const loadSample = (profile: GigProfile) => {
    setForm({
      name: profile.name,
      platform: profile.platform,
      orders: String(profile.orders),
      rating: String(profile.rating),
      tenure: String(profile.tenure),
      income: String(profile.income),
      upiTransactions: String(profile.upiTransactions),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Quick Load Sample</h3>
        <div className="flex flex-wrap gap-2">
          {sampleProfiles.map((p) => (
            <button
              key={p.name}
              onClick={() => loadSample(p)}
              className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">👤 Name</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">🏢 Platform</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              placeholder="e.g. Swiggy, Uber"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                {f.icon} {f.label}
              </label>
              <input
                type="number"
                step={(f as any).step || "1"}
                max={(f as any).max}
                min="0"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition font-mono"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all duration-200 glow-primary"
        >
          Calculate GigScore →
        </button>
      </form>
    </motion.div>
  );
}
