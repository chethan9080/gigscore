import { motion } from "framer-motion";
import type { ScoreResult } from "@/lib/scoreCalculator";

const factors = [
  { key: "orders" as const, label: "Orders", icon: "📦" },
  { key: "rating" as const, label: "Rating", icon: "⭐" },
  { key: "tenure" as const, label: "Tenure", icon: "📅" },
  { key: "income" as const, label: "Income", icon: "💰" },
  { key: "upi" as const, label: "UPI Txns", icon: "📱" },
];

export default function ScoreBreakdown({ breakdown }: { breakdown: ScoreResult["breakdown"] }) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Score Breakdown</h3>
      <div className="space-y-3">
        {factors.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {f.icon} {f.label}
              </span>
              <span className="font-mono text-foreground">{breakdown[f.key].toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${breakdown[f.key]}%` }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
