import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { getApplicants, subscribeStore, type ScoredApplicant } from "@/lib/scoreStore";

// ── Seed data shown before any real score is calculated ──────────────────────

const SEED: ScoredApplicant[] = [
  { name: "Rahul M.",  platform: "Swiggy",   score: 742, probability: 0.74, tips: [], explanation: "", status: "approved", amount: "₹75,000", timestamp: 0 },
  { name: "Priya S.",  platform: "Uber",      score: 811, probability: 0.85, tips: [], explanation: "", status: "approved", amount: "₹75,000", timestamp: 0 },
  { name: "Amit K.",   platform: "Freelance", score: 578, probability: 0.46, tips: [], explanation: "", status: "rejected", amount: "Not eligible", timestamp: 0 },
  { name: "Sneha R.",  platform: "Zomato",    score: 663, probability: 0.61, tips: [], explanation: "", status: "pending",  amount: "₹40,000", timestamp: 0 },
  { name: "Vikram D.", platform: "Swiggy",    score: 695, probability: 0.68, tips: [], explanation: "", status: "approved", amount: "₹40,000", timestamp: 0 },
];

const PIE_COLORS = ["hsl(173,80%,50%)", "hsl(260,70%,60%)", "hsl(30,90%,55%)", "hsl(150,70%,50%)", "hsl(200,80%,55%)"];

const tooltipStyle = {
  backgroundColor: "hsl(222,40%,10%)",
  border: "1px solid hsl(222,30%,18%)",
  borderRadius: "8px",
  color: "hsl(210,40%,96%)",
  fontSize: "12px",
};

// ── Derived analytics from applicant list ────────────────────────────────────

function deriveStats(list: ScoredApplicant[]) {
  if (!list.length) return { avg: 0, approvalRate: 0, total: 0, disbursed: 0 };
  const avg = Math.round(list.reduce((s, a) => s + a.score, 0) / list.length);
  const approved = list.filter((a) => a.status === "approved").length;
  const approvalRate = Math.round((approved / list.length) * 100);
  const disbursed = list
    .filter((a) => a.status === "approved")
    .reduce((s, a) => {
      const n = parseInt(a.amount.replace(/[^\d]/g, "")) || 0;
      return s + n;
    }, 0);
  return { avg, approvalRate, total: list.length, disbursed };
}

function derivePlatformSplit(list: ScoredApplicant[]) {
  const map: Record<string, number> = {};
  list.forEach((a) => { map[a.platform] = (map[a.platform] ?? 0) + 1; });
  const total = list.length || 1;
  return Object.entries(map).map(([name, count]) => ({
    name,
    value: Math.round((count / total) * 100),
  }));
}

function deriveScoreTrend(list: ScoredApplicant[]) {
  // Group by index buckets of 5 to simulate time trend
  if (list.length === 0) return [];
  const reversed = [...list].reverse();
  const buckets: { label: string; avg: number }[] = [];
  const size = Math.max(1, Math.ceil(reversed.length / 6));
  for (let i = 0; i < reversed.length; i += size) {
    const chunk = reversed.slice(i, i + size);
    const avg = Math.round(chunk.reduce((s, a) => s + a.score, 0) / chunk.length);
    buckets.push({ label: `#${Math.floor(i / size) + 1}`, avg });
  }
  return buckets;
}

function deriveVolume(list: ScoredApplicant[]) {
  // Split into up to 4 weekly buckets
  if (!list.length) return [];
  const reversed = [...list].reverse();
  const size = Math.max(1, Math.ceil(reversed.length / 4));
  return Array.from({ length: Math.min(4, Math.ceil(reversed.length / size)) }, (_, wi) => {
    const chunk = reversed.slice(wi * size, (wi + 1) * size);
    return {
      week: `W${wi + 1}`,
      approved: chunk.filter((a) => a.status === "approved").length,
      rejected: chunk.filter((a) => a.status === "rejected").length,
      pending:  chunk.filter((a) => a.status === "pending").length,
    };
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, highlight = false, delay = 0 }: {
  icon: string; label: string; value: string; sub: string; highlight?: boolean; delay?: number;
}) {
  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`glass-card p-5 flex items-start gap-4 ${highlight ? "border-primary/40" : ""}`}
    >
      <div className="text-2xl mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <motion.p
          key={value}
          initial={{ scale: 1.15, color: "hsl(173,80%,70%)" }}
          animate={{ scale: 1, color: "hsl(173,80%,50%)" }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold font-mono gradient-text mt-0.5"
        >
          {value}
        </motion.p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-500/15 text-green-400",
    rejected: "bg-red-500/15 text-red-400",
    pending:  "bg-orange-500/15 text-orange-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function ScoreChip({ score }: { score: number }) {
  const color = score >= 750 ? "text-green-400" : score >= 650 ? "text-orange-400" : "text-red-400";
  return <span className={`font-mono font-bold ${color}`}>{score}</span>;
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [applicants, setApplicants] = useState<ScoredApplicant[]>(() => {
    const live = getApplicants();
    return live.length ? live : SEED;
  });

  // Re-render whenever a new score is pushed from the calculator
  useEffect(() => {
    const unsub = subscribeStore(() => {
      const live = getApplicants();
      setApplicants(live.length ? live : SEED);
    });
    return () => { unsub(); };
  }, []);

  const stats    = deriveStats(applicants);
  const platform = derivePlatformSplit(applicants);
  const trend    = deriveScoreTrend(applicants);
  const volume   = deriveVolume(applicants);
  const recent   = applicants.slice(0, 8);

  const hasLive = getApplicants().length > 0;

  const navItems = [
    { key: "overview",  label: "Overview",          icon: "📊", path: null         },
    { key: "apps",      label: "Applications",       icon: "📋", path: null         },
    { key: "gigscore",  label: "GigScore Dashboard", icon: "🎯", path: "/gigscore"  },
    { key: "lenders",   label: "Lenders",            icon: "🏦", path: null         },
    { key: "settings",  label: "Settings",           icon: "⚙️", path: null         },
  ];

  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border/40 bg-card/30 backdrop-blur-xl px-4 py-6 gap-6">
        <button onClick={() => navigate("/")} className="text-left">
          <span className="text-xl font-bold gradient-text">GigScore</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Analytics</p>
        </button>

        <nav className="flex flex-col gap-1">
          {navItems.map((n) => (
            <button
              key={n.key}
              onClick={() => { if (n.path) navigate(n.path); else setActiveNav(n.key); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === n.key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto glass-card p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Model Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            API Online
          </div>
          <p>{applicants.length} applicant{applicants.length !== 1 ? "s" : ""} scored</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/20 backdrop-blur-xl">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Analytics Overview</h1>
            <p className="text-xs text-muted-foreground">
              {hasLive ? `Live • ${applicants.length} scored` : "Showing sample data — score an applicant to see live data"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition"
            >
              ← Back
            </button>
            <button
              onClick={() => navigate("/app")}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition glow-primary"
            >
              🚀 Score Calculator
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Applications tab */}
          {activeNav === "apps" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
              <p className="text-sm font-semibold text-foreground">All Applications</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border/40">
                      <th className="text-left pb-3 font-medium">Applicant</th>
                      <th className="text-left pb-3 font-medium">Platform</th>
                      <th className="text-left pb-3 font-medium">Score</th>
                      <th className="text-left pb-3 font-medium">Max Loan</th>
                      <th className="text-left pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {applicants.map((app, i) => (
                      <motion.tr
                        key={`${app.name}-${app.timestamp}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 font-medium text-foreground">{app.name}</td>
                        <td className="py-3 text-muted-foreground">{app.platform}</td>
                        <td className="py-3"><ScoreChip score={app.score} /></td>
                        <td className="py-3 font-mono text-foreground">{app.amount}</td>
                        <td className="py-3"><StatusBadge status={app.status} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Lenders tab */}
          {activeNav === "lenders" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "HDFC Bank", type: "Bank", minScore: 700, maxLoan: "₹2,00,000", rate: "12.5% p.a.", status: "Active" },
                  { name: "Bajaj Finserv", type: "NBFC", minScore: 650, maxLoan: "₹1,00,000", rate: "14% p.a.", status: "Active" },
                  { name: "KreditBee", type: "Fintech", minScore: 580, maxLoan: "₹50,000", rate: "18% p.a.", status: "Active" },
                  { name: "MoneyTap", type: "Fintech", minScore: 620, maxLoan: "₹75,000", rate: "16% p.a.", status: "Active" },
                  { name: "Axis Bank", type: "Bank", minScore: 720, maxLoan: "₹1,50,000", rate: "13% p.a.", status: "Active" },
                  { name: "PaySense", type: "Fintech", minScore: 600, maxLoan: "₹60,000", rate: "17% p.a.", status: "Active" },
                ].map((lender, i) => (
                  <motion.div
                    key={lender.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">{lender.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400">{lender.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{lender.type}</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Min Score</span><span className="font-mono text-foreground">{lender.minScore}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Max Loan</span><span className="font-mono text-foreground">{lender.maxLoan}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Interest</span><span className="font-mono text-foreground">{lender.rate}</span></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings tab */}
          {activeNav === "settings" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-xl">
              <div className="glass-card p-6 space-y-4">
                <p className="text-sm font-semibold text-foreground">Model Settings</p>
                {[
                  { label: "Auto-approve threshold", value: "700", desc: "Scores above this are auto-approved" },
                  { label: "Max loan cap (₹)", value: "75,000", desc: "Maximum loan amount for trusted workers" },
                  { label: "Score refresh interval", value: "24h", desc: "How often scores are recalculated" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                    <span className="font-mono text-sm text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="glass-card p-6 space-y-3">
                <p className="text-sm font-semibold text-foreground">API Configuration</p>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Backend URL</span>
                  <span className="font-mono text-xs text-foreground bg-secondary px-2 py-1 rounded">http://127.0.0.1:8000</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  API Online
                </div>
              </div>
            </motion.div>
          )}

          {/* Overview tab (default) */}
          {activeNav === "overview" && <>

          {/* Live indicator */}
          <AnimatePresence>
            {hasLive && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-primary"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Dashboard is showing live scored data
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="👥" label="Total Applicants" value={stats.total.toString()}         sub="Scored this session"      delay={0}    />
            <StatCard icon="✅" label="Approval Rate"    value={`${stats.approvalRate}%`}        sub="Score ≥ 700 auto-approved" delay={0.05} />
            <StatCard icon="📈" label="Avg GigScore"     value={stats.avg.toString()}            sub="Range 300–900"            delay={0.1}  highlight />
            <StatCard icon="💰" label="Max Loan Pool"    value={`₹${(stats.disbursed / 100000).toFixed(1)}L`} sub="Eligible applicants" delay={0.15} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Score trend */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5 lg:col-span-2"
            >
              <p className="text-sm font-semibold text-foreground mb-4">Score Trend</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(173,80%,50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(173,80%,50%)" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,18%)" />
                  <XAxis dataKey="label" tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[300, 900]} tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="avg" stroke="hsl(173,80%,50%)" strokeWidth={2} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Platform split */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card p-5"
            >
              <p className="text-sm font-semibold text-foreground mb-4">Platform Split</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={platform} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {platform.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {platform.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {p.name} {p.value}%
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Volume bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <p className="text-sm font-semibold text-foreground mb-4">Application Volume</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={volume} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,18%)" />
                <XAxis dataKey="week" tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="approved" fill="hsl(150,70%,50%)" radius={[4,4,0,0]} />
                <Bar dataKey="rejected" fill="hsl(0,72%,55%)"   radius={[4,4,0,0]} />
                <Bar dataKey="pending"  fill="hsl(30,90%,55%)"  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" />Approved</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"   />Rejected</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400"/>Pending</span>
            </div>
          </motion.div>

          {/* Recent applications table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">Recent Applications</p>
              <button onClick={() => navigate("/app")} className="text-xs text-primary hover:underline">
                Score new →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border/40">
                    <th className="text-left pb-3 font-medium">Applicant</th>
                    <th className="text-left pb-3 font-medium">Platform</th>
                    <th className="text-left pb-3 font-medium">Score</th>
                    <th className="text-left pb-3 font-medium">Max Loan</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <AnimatePresence>
                    {recent.map((app, i) => (
                      <motion.tr
                        key={`${app.name}-${app.timestamp}`}
                        initial={{ opacity: 0, x: -8, backgroundColor: "hsl(173,80%,50%,0.08)" }}
                        animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
                        transition={{ delay: i * 0.04, duration: 0.4 }}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 font-medium text-foreground">{app.name}</td>
                        <td className="py-3 text-muted-foreground">{app.platform}</td>
                        <td className="py-3"><ScoreChip score={app.score} /></td>
                        <td className="py-3 font-mono text-foreground">{app.amount}</td>
                        <td className="py-3"><StatusBadge status={app.status} /></td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          </>}

        </main>
      </div>
    </div>
  );
}
