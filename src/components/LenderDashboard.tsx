import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateScore, sampleProfiles, getExplanation } from "@/lib/scoreCalculator";

interface Application {
  name: string;
  platform: string;
  score: number;
  grade: string;
  color: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
}

const initialApps: Application[] = sampleProfiles.map((p) => {
  const result = calculateScore(p);
  return {
    name: p.name,
    platform: p.platform,
    score: result.score,
    grade: result.grade,
    color: result.color,
    amount: Math.round((result.score / 900) * 50000 + 10000),
    status: "pending",
  };
});

export default function LenderDashboard() {
  const [apps, setApps] = useState<Application[]>(initialApps);

  const updateStatus = (idx: number, status: "approved" | "rejected") => {
    setApps((prev) => prev.map((a, i) => (i === idx ? { ...a, status } : a)));
  };

  const statusBadge = (status: Application["status"]) => {
    const classes = {
      pending: "bg-score-orange/20 text-score-orange",
      approved: "bg-score-green/20 text-score-green",
      rejected: "bg-score-red/20 text-score-red",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${classes[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">🏦 Lender Dashboard</h3>
        <span className="text-sm text-muted-foreground">{apps.length} applications</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {apps.map((app, i) => {
            const colorClass =
              app.color === "red"
                ? "text-score-red"
                : app.color === "orange"
                ? "text-score-orange"
                : "text-score-green";
            return (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{app.name}</div>
                  <div className="text-xs text-muted-foreground">{app.platform} • ₹{app.amount.toLocaleString()} requested</div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className={`font-mono font-bold ${colorClass}`}>{app.score}</div>
                  {statusBadge(app.status)}
                  {app.status === "pending" && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateStatus(i, "approved")}
                        className="px-3 py-1 text-xs rounded-md bg-score-green/20 text-score-green hover:bg-score-green/30 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(i, "rejected")}
                        className="px-3 py-1 text-xs rounded-md bg-score-red/20 text-score-red hover:bg-score-red/30 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
