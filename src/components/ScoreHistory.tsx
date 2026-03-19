import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getApplicants, subscribeStore, type ScoredApplicant } from "@/lib/scoreStore";

export default function ScoreHistory() {
  const [history, setHistory] = useState<ScoredApplicant[]>(() => getApplicants());

  useEffect(() => {
    const unsub = subscribeStore(() => setHistory(getApplicants()));
    return () => unsub();
  }, []);

  const getColorClass = (score: number) =>
    score < 600 ? "text-score-red" : score <= 700 ? "text-score-orange" : "text-score-green";

  if (history.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-muted-foreground">
        No scores yet. Calculate your first GigScore!
      </div>
    );
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">📈 Score History</h3>
      <div className="space-y-3">
        {history.map((entry, i) => (
          <motion.div
            key={entry.timestamp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
          >
            <div>
              <div className={`text-2xl font-bold font-mono ${getColorClass(entry.score)}`}>
                {entry.score}
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.name} • {entry.platform}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleDateString()} •{" "}
                {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-sm font-semibold ${getColorClass(entry.score)}`}>
                {entry.score >= 800 ? "Excellent" : entry.score >= 700 ? "Good" : entry.score >= 600 ? "Fair" : "Poor"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                entry.status === "approved" ? "bg-green-500/15 text-green-400" :
                entry.status === "rejected" ? "bg-red-500/15 text-red-400" :
                "bg-orange-500/15 text-orange-400"
              }`}>
                {entry.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
