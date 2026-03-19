import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GigWorker {
  id: number;
  name: string;
  role: string;
  location: string;
  score: number;
  platform: string;
  avatar: string;
  lat: number;
  lng: number;
}

interface Activity {
  id: number;
  worker: string;
  job: string;
  time: string;
  status: "completed" | "in-progress" | "cancelled";
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const WORKERS: GigWorker[] = [
  { id: 1,  name: "Rahul Mehta",     role: "Delivery Rider",   location: "Mumbai, MH",      score: 812, platform: "Swiggy",     avatar: "RM", lat: 19.076,  lng: 72.877  },
  { id: 2,  name: "Priya Sharma",    role: "Freelance Dev",    location: "Bangalore, KA",   score: 754, platform: "Upwork",     avatar: "PS", lat: 12.971,  lng: 77.594  },
  { id: 3,  name: "Amit Kumar",      role: "Cab Driver",       location: "Delhi, DL",       score: 578, platform: "Uber",       avatar: "AK", lat: 28.613,  lng: 77.209  },
  { id: 4,  name: "Sneha Reddy",     role: "Food Delivery",    location: "Hyderabad, TS",   score: 663, platform: "Zomato",     avatar: "SR", lat: 17.385,  lng: 78.486  },
  { id: 5,  name: "Vikram Desai",    role: "Delivery Rider",   location: "Pune, MH",        score: 695, platform: "Swiggy",     avatar: "VD", lat: 18.520,  lng: 73.856  },
  { id: 6,  name: "Ananya Iyer",     role: "Graphic Designer", location: "Chennai, TN",     score: 841, platform: "Fiverr",     avatar: "AI", lat: 13.082,  lng: 80.270  },
  { id: 7,  name: "Rohan Gupta",     role: "Cab Driver",       location: "Kolkata, WB",     score: 620, platform: "Ola",        avatar: "RG", lat: 22.572,  lng: 88.363  },
  { id: 8,  name: "Meera Nair",      role: "Content Writer",   location: "Kochi, KL",       score: 789, platform: "Freelancer", avatar: "MN", lat: 9.931,   lng: 76.267  },
  { id: 9,  name: "Arjun Singh",     role: "Delivery Rider",   location: "Jaipur, RJ",      score: 710, platform: "Swiggy",     avatar: "AS", lat: 26.912,  lng: 75.787  },
  { id: 10, name: "Kavya Menon",     role: "Tutor",            location: "Ahmedabad, GJ",   score: 648, platform: "UrbanPro",   avatar: "KM", lat: 23.022,  lng: 72.571  },
  { id: 11, name: "Deepak Rao",      role: "Cab Driver",       location: "Chandigarh, PB",  score: 733, platform: "Uber",       avatar: "DR", lat: 30.733,  lng: 76.779  },
  { id: 12, name: "Nisha Patel",     role: "Food Delivery",    location: "Surat, GJ",       score: 591, platform: "Zomato",     avatar: "NP", lat: 21.170,  lng: 72.831  },
  { id: 13, name: "Suresh Babu",     role: "Delivery Rider",   location: "Coimbatore, TN",  score: 769, platform: "Swiggy",     avatar: "SB", lat: 11.016,  lng: 76.955  },
  { id: 14, name: "Pooja Verma",     role: "Freelance Writer", location: "Lucknow, UP",     score: 802, platform: "Upwork",     avatar: "PV", lat: 26.846,  lng: 80.946  },
  { id: 15, name: "Kiran Reddy",     role: "Cab Driver",       location: "Visakhapatnam",   score: 637, platform: "Ola",        avatar: "KR", lat: 17.686,  lng: 83.218  },
];

const ACTIVITIES: Activity[] = [
  { id: 1, worker: "Rahul Mehta",   job: "Swiggy delivery — Bandra to Andheri",   time: "2 min ago",  status: "completed"   },
  { id: 2, worker: "Priya Sharma",  job: "React dashboard project — Upwork",       time: "18 min ago", status: "in-progress" },
  { id: 3, worker: "Amit Kumar",    job: "Uber ride — Connaught Place to Noida",   time: "34 min ago", status: "completed"   },
  { id: 4, worker: "Sneha Reddy",   job: "Zomato delivery — Jubilee Hills",        time: "1 hr ago",   status: "cancelled"   },
  { id: 5, worker: "Vikram Desai",  job: "Swiggy delivery — Koregaon Park",        time: "2 hr ago",   status: "completed"   },
  { id: 6, worker: "Ananya Iyer",   job: "Logo design — Fiverr client",            time: "3 hr ago",   status: "completed"   },
  { id: 7, worker: "Rohan Gupta",   job: "Ola ride — Park Street to Airport",      time: "5 hr ago",   status: "in-progress" },
];

const tooltipStyle = {
  backgroundColor: "hsl(222,40%,10%)",
  border: "1px solid hsl(222,30%,18%)",
  borderRadius: "8px",
  color: "hsl(210,40%,96%)",
  fontSize: "12px",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreLabel(score: number) {
  if (score >= 750) return { label: "Trusted",     color: "text-green-400",  bg: "bg-green-500/15",  hex: "#22c55e" };
  if (score >= 650) return { label: "Medium Risk", color: "text-orange-400", bg: "bg-orange-500/15", hex: "#f97316" };
  return               { label: "High Risk",   color: "text-red-400",    bg: "bg-red-500/15",    hex: "#ef4444" };
}

function activityColor(status: Activity["status"]) {
  if (status === "completed")   return { dot: "bg-green-400", text: "text-green-400" };
  if (status === "in-progress") return { dot: "bg-blue-400",  text: "text-blue-400"  };
  return                               { dot: "bg-red-400",   text: "text-red-400"   };
}

function avgScore(workers: GigWorker[]) {
  return Math.round(workers.reduce((s, w) => s + w.score, 0) / workers.length);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const { label, color, bg } = scoreLabel(score);
  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono font-bold text-sm ${color}`}>{score}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${color}`}>{label}</span>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
      {initials}
    </div>
  );
}

function OverallScoreChart({ score }: { score: number }) {
  const pct = ((score - 300) / 600) * 100;
  const { label, color } = scoreLabel(score);
  const data = [{ value: pct }, { value: 100 - pct }];
  const COLORS = ["hsl(173,80%,50%)", "hsl(222,30%,18%)"];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={68}
              startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono gradient-text">{score}</span>
          <span className="text-xs text-muted-foreground">/ 900</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${color}`}>{label}</span>
      <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Trusted ≥750</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />Medium 650–749</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />High &lt;650</span>
      </div>
    </div>
  );
}

function RiskDistributionChart({ workers }: { workers: GigWorker[] }) {
  const data = [
    { name: "Trusted",     value: workers.filter(w => w.score >= 750).length,                    color: "hsl(150,70%,50%)" },
    { name: "Medium Risk", value: workers.filter(w => w.score >= 650 && w.score < 750).length,   color: "hsl(30,90%,55%)"  },
    { name: "High Risk",   value: workers.filter(w => w.score < 650).length,                     color: "hsl(0,72%,55%)"   },
  ].filter(d => d.value > 0);
  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5">
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-mono font-semibold text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Worker Map (SVG India placeholder) ───────────────────────────────────────

// Approximate lat/lng → SVG coords for India bounding box
// lat: 8–37, lng: 68–97  →  mapped to 0–400 x 0–480
function latLngToXY(lat: number, lng: number): [number, number] {
  const x = ((lng - 68) / (97 - 68)) * 400;
  const y = ((37 - lat) / (37 - 8)) * 480;
  return [x, y];
}

function WorkerMap({ workers, filter }: { workers: GigWorker[]; filter: string }) {
  const [tooltip, setTooltip] = useState<{ worker: GigWorker; x: number; y: number } | null>(null);
  const filtered = filter === "all"
    ? workers
    : workers.filter(w => scoreLabel(w.score).label.toLowerCase().replace(" ", "-") === filter);

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden border border-border/30 relative bg-[hsl(222,40%,6%)]">
      <svg viewBox="0 0 400 480" className="w-full h-full opacity-20 absolute inset-0 pointer-events-none">
        {/* Simple India outline approximation */}
        <path d="M180,20 L220,18 L260,30 L290,60 L310,100 L320,140 L315,180 L300,210 L310,240 L290,270 L270,300 L250,340 L230,370 L210,400 L200,430 L190,400 L170,370 L150,340 L130,300 L110,270 L90,240 L100,210 L85,180 L80,140 L90,100 L110,60 L140,30 Z" fill="none" stroke="hsl(215,30%,40%)" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 400 480" className="w-full h-full absolute inset-0">
        {filtered.map(w => {
          const { hex, label } = scoreLabel(w.score);
          const [x, y] = latLngToXY(w.lat, w.lng);
          return (
            <g key={w.id}
              onMouseEnter={(e) => setTooltip({ worker: w, x, y })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r={10} fill={hex} fillOpacity={0.2} />
              <circle cx={x} cy={y} r={6} fill={hex} fillOpacity={0.85} stroke={hex} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
      {tooltip && (() => {
        const { worker: w, x, y } = tooltip;
        const { hex, label } = scoreLabel(w.score);
        const pct = x / 400;
        const left = pct > 0.7 ? "auto" : `${(x / 400) * 100}%`;
        const right = pct > 0.7 ? `${((400 - x) / 400) * 100}%` : "auto";
        return (
          <div className="absolute z-10 pointer-events-none"
            style={{ top: `${(y / 480) * 100}%`, left, right, transform: "translate(-50%, -110%)" }}>
            <div className="bg-[hsl(222,40%,10%)] border border-border/40 rounded-lg p-2 min-w-[160px] shadow-xl text-sm">
              <p className="font-bold text-foreground">{w.name}</p>
              <p className="text-muted-foreground text-xs">{w.role} · {w.location}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono font-bold text-base" style={{ color: hex }}>{w.score}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: hex, background: hex + "22" }}>{label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">📱 {w.platform}</p>
            </div>
          </div>
        );
      })()}
      <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-black/40 px-2 py-1 rounded">
        India · {filtered.length} workers
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = "workers" | "analytics" | "activity" | "map";

export default function GigScoreDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("workers");
  const [search, setSearch] = useState("");
  const [mapFilter, setMapFilter] = useState("all");
  const [activeNav, setActiveNav] = useState("gigscore");

  const filtered = WORKERS.filter(
    w => w.name.toLowerCase().includes(search.toLowerCase()) ||
         w.role.toLowerCase().includes(search.toLowerCase()) ||
         w.location.toLowerCase().includes(search.toLowerCase())
  );

  const overall = avgScore(WORKERS);

  const navItems = [
    { key: "overview",  label: "Overview",          icon: "📊", path: "/dashboard" },
    { key: "apps",      label: "Applications",       icon: "📋", path: "/dashboard" },
    { key: "gigscore",  label: "GigScore Dashboard", icon: "🎯", path: "/gigscore"  },
    { key: "lenders",   label: "Lenders",            icon: "🏦", path: "/dashboard" },
    { key: "settings",  label: "Settings",           icon: "⚙️", path: "/dashboard" },
  ];

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "workers",   label: "Workers",   icon: "👥" },
    { key: "analytics", label: "Analytics", icon: "📈" },
    { key: "activity",  label: "Activity",  icon: "⚡" },
    { key: "map",       label: "Live Map",  icon: "🗺️" },
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
              onClick={() => { setActiveNav(n.key); if (n.key !== "gigscore") navigate(n.path); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === n.key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto glass-card p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Model Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            API Online
          </div>
          <p>{WORKERS.length} workers tracked</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/20 backdrop-blur-xl">
          <div>
            <h1 className="text-lg font-semibold text-foreground">GigScore Dashboard</h1>
            <p className="text-xs text-muted-foreground">Gig worker profiles, scores &amp; live map</p>
          </div>
          <button
            onClick={() => navigate("/app")}
            className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition glow-primary"
          >
            🚀 Score Calculator
          </button>
        </header>

        {/* Tab bar */}
        <div className="flex gap-2 px-6 pt-4 pb-0 border-b border-border/40">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                tab === t.key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* WORKERS TAB */}
          {tab === "workers" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
              <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <p className="text-sm font-semibold text-foreground">Gig Worker List ({filtered.length})</p>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, role, location…"
                  className="px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-64"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border/40">
                      <th className="text-left pb-3 font-medium">Worker</th>
                      <th className="text-left pb-3 font-medium">Role</th>
                      <th className="text-left pb-3 font-medium">Location</th>
                      <th className="text-left pb-3 font-medium">Platform</th>
                      <th className="text-left pb-3 font-medium">GigScore</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((w, i) => (
                      <motion.tr key={w.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={w.avatar} />
                            <span className="font-medium text-foreground">{w.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">{w.role}</td>
                        <td className="py-3 text-muted-foreground">{w.location}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-muted-foreground">{w.platform}</span>
                        </td>
                        <td className="py-3"><ScoreBadge score={w.score} /></td>
                      </motion.tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">No workers match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="glass-card p-5 flex flex-col items-center gap-2">
                <p className="text-sm font-semibold text-foreground self-start">Overall GigScore</p>
                <OverallScoreChart score={overall} />
              </div>
              <div className="glass-card p-5">
                <p className="text-sm font-semibold text-foreground mb-3">Risk Distribution</p>
                <RiskDistributionChart workers={WORKERS} />
              </div>
              <div className="glass-card p-5 flex flex-col gap-4">
                <p className="text-sm font-semibold text-foreground">Quick Stats</p>
                {[
                  { icon: "👥", label: "Total Workers",  value: WORKERS.length },
                  { icon: "✅", label: "Trusted",        value: WORKERS.filter(w => w.score >= 750).length },
                  { icon: "⚠️", label: "Medium Risk",    value: WORKERS.filter(w => w.score >= 650 && w.score < 750).length },
                  { icon: "🔴", label: "High Risk",      value: WORKERS.filter(w => w.score < 650).length },
                  { icon: "📈", label: "Avg Score",      value: overall },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground"><span>{s.icon}</span>{s.label}</span>
                    <span className="font-mono font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ACTIVITY TAB */}
          {tab === "activity" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 max-w-2xl">
              <p className="text-sm font-semibold text-foreground mb-5">Recent Activity</p>
              <div className="flex flex-col">
                {ACTIVITIES.map((a, i) => {
                  const c = activityColor(a.status);
                  return (
                    <div key={a.id} className="flex gap-3 relative">
                      {i < ACTIVITIES.length - 1 && (
                        <div className="absolute left-[6px] top-5 bottom-0 w-px bg-border/40" />
                      )}
                      <div className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1 ${c.dot} ring-2 ring-background`} />
                      <div className="pb-5 flex-1 min-w-0">
                        <p className="text-sm text-foreground font-medium">{a.job}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{a.worker}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-xs text-muted-foreground">{a.time}</span>
                          <span className={`text-xs font-semibold capitalize ${c.text}`}>{a.status.replace("-", " ")}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* MAP TAB */}
          {tab === "map" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm font-semibold text-foreground">Live Worker Map — India</p>
                <div className="flex gap-2">
                  {[
                    { key: "all",         label: "All Workers" },
                    { key: "trusted",     label: "✅ Trusted"     },
                    { key: "medium-risk", label: "⚠️ Medium Risk" },
                    { key: "high-risk",   label: "🔴 High Risk"   },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setMapFilter(f.key)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                        mapFilter === f.key
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <WorkerMap workers={WORKERS} filter={mapFilter} />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400" />Trusted (≥750)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400" />Medium Risk (650–749)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" />High Risk (&lt;650)</span>
                <span className="text-muted-foreground/60 ml-auto">Click any pin for details</span>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}
