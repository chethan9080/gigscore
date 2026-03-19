import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell,
} from "recharts";
import type { ScoreResult } from "@/lib/scoreCalculator";

interface Props {
  result: ScoreResult;
  explanation: string;
}

const tooltipStyle = {
  backgroundColor: "hsl(222,40%,10%)",
  border: "1px solid hsl(222,30%,18%)",
  borderRadius: "8px",
  color: "hsl(210,40%,96%)",
  fontSize: "12px",
};

function ScoreGauge({ score, color }: { score: number; color: string }) {
  // Count-up from 300 → actual score
  const count = useMotionValue(300);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(300);

  useEffect(() => {
    const controls = animate(count, score, { duration: 1.6, ease: "easeOut" });
    const unsub = rounded.on("change", setDisplay);
    return () => { controls.stop(); unsub(); };
  }, [score]);

  // Glow color driven by live counted value
  const glowColor =
    display >= 700 ? "hsl(150,70%,50%)"
    : display >= 600 ? "hsl(30,90%,55%)"
    : "hsl(0,72%,55%)";

  const glowRgb =
    display >= 700 ? "16,185,129"
    : display >= 600 ? "249,115,22"
    : "239,68,68";

  const colorMap: Record<string, string> = {
    red: "hsl(0,72%,55%)",
    orange: "hsl(30,90%,55%)",
    green: "hsl(150,70%,50%)",
  };
  const hex = colorMap[color] ?? colorMap.green;

  const pct = ((score - 300) / 600) * 100;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ * 0.75;
  const gap = circ - dash;

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing glow ring — outer */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 148, height: 148,
          background: `radial-gradient(circle, rgba(${glowRgb},0.18) 0%, transparent 70%)`,
          boxShadow: `0 0 32px 8px rgba(${glowRgb},0.22)`,
        }}
        animate={{
          boxShadow: [
            `0 0 24px 4px rgba(${glowRgb},0.18)`,
            `0 0 44px 14px rgba(${glowRgb},0.36)`,
            `0 0 24px 4px rgba(${glowRgb},0.18)`,
          ],
          scale: [1, 1.04, 1],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pulsing glow ring — inner tight */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 116, height: 116 }}
        animate={{
          boxShadow: [
            `0 0 0px 0px rgba(${glowRgb},0)`,
            `0 0 16px 6px rgba(${glowRgb},0.28)`,
            `0 0 0px 0px rgba(${glowRgb},0)`,
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />

      <svg width="140" height="140" viewBox="0 0 140 140" className="relative z-10 mx-auto">
        {/* Track */}
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(222,30%,18%)" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round" />
        {/* Animated arc */}
        <motion.circle cx="70" cy="70" r={r} fill="none" stroke={hex} strokeWidth="10"
          strokeDasharray={`${dash} ${gap + circ * 0.25}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${gap + circ * 0.25}` }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
        {/* Count-up number */}
        <text x="70" y="66" textAnchor="middle" fill={glowColor} fontSize="22" fontWeight="bold"
          fontFamily="JetBrains Mono, monospace">
          {display}
        </text>
        <text x="70" y="84" textAnchor="middle" fill="hsl(215,20%,55%)" fontSize="10">
          out of 900
        </text>
      </svg>
    </div>
  );
}

function ProbabilityRing({ prob }: { prob: number }) {
  const pct = prob * 100;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "hsl(150,70%,50%)" : pct >= 45 ? "hsl(30,90%,55%)" : "hsl(0,72%,55%)";

  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className="mx-auto">
      <circle cx="45" cy="45" r={r} fill="none" stroke="hsl(222,30%,18%)" strokeWidth="7" />
      <motion.circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ - dash}` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} />
      <text x="45" y="49" textAnchor="middle" fill={color} fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
        {pct.toFixed(0)}%
      </text>
    </svg>
  );
}

const gradeConfig = {
  Poor:      { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-400",    icon: "⚠️" },
  Fair:      { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", icon: "📊" },
  Good:      { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-400",  icon: "✅" },
  Excellent: { bg: "bg-primary/10",    border: "border-primary/30",    text: "text-primary",    icon: "🏆" },
};

export default function ScoreDisplay({ result, explanation }: Props) {
  const gc = gradeConfig[result.grade];

  // Parse tips and explanation from the combined string
  const parts = explanation.split("\n\n💡 Tips:\n• ");
  const mainExplanation = parts[0];
  const tips = parts[1] ? parts[1].split("\n• ") : [];

  const radarData = [
    { factor: "Orders",  value: result.breakdown.orders  },
    { factor: "Rating",  value: result.breakdown.rating  },
    { factor: "Tenure",  value: result.breakdown.tenure  },
    { factor: "Income",  value: result.breakdown.income  },
    { factor: "UPI",     value: result.breakdown.upi     },
  ];

  const barData = radarData.map((d) => ({ ...d, fill: d.value > 25 ? "hsl(173,80%,50%)" : "hsl(260,70%,60%)" }));

  // Derive probability from score
  const prob = (result.score - 300) / 600;

  const loanEligibility = result.score >= 750
    ? "Up to ₹75,000"
    : result.score >= 650
    ? "Up to ₹40,000"
    : result.score >= 550
    ? "Up to ₹20,000"
    : "Not eligible";

  const riskLevel = result.score >= 750 ? "Low" : result.score >= 650 ? "Medium" : "High";
  const riskColor = result.score >= 750 ? "text-green-400" : result.score >= 650 ? "text-orange-400" : "text-red-400";

  // Eligibility config
  const eligibility =
    result.score >= 700
      ? {
          status: "Eligible",
          statusColor: "text-green-400",
          borderColor: "border-green-500/40",
          bgColor: "bg-green-500/8",
          glowColor: "shadow-green-500/10",
          badgeBg: "bg-green-500/15",
          barColor: "bg-green-400",
          icon: "✅",
          headline: "You qualify for a loan",
          sub: "Your GigScore meets lender requirements. You can apply with confidence.",
          tiers: [
            { label: "Personal Loan", amount: "₹75,000", rate: "12.5% p.a.", active: result.score >= 750 },
            { label: "Micro Credit",  amount: "₹40,000", rate: "14% p.a.",   active: result.score >= 700 },
            { label: "Emergency Fund",amount: "₹20,000", rate: "16% p.a.",   active: true },
          ],
        }
      : result.score >= 580
      ? {
          status: "Conditional",
          statusColor: "text-orange-400",
          borderColor: "border-orange-500/40",
          bgColor: "bg-orange-500/8",
          glowColor: "shadow-orange-500/10",
          badgeBg: "bg-orange-500/15",
          barColor: "bg-orange-400",
          icon: "⚠️",
          headline: "Conditionally eligible",
          sub: "You may qualify for limited products. Improving your score unlocks better rates.",
          tiers: [
            { label: "Personal Loan", amount: "₹75,000", rate: "12.5% p.a.", active: false },
            { label: "Micro Credit",  amount: "₹40,000", rate: "14% p.a.",   active: false },
            { label: "Emergency Fund",amount: "₹20,000", rate: "16% p.a.",   active: true },
          ],
        }
      : {
          status: "Not Eligible",
          statusColor: "text-red-400",
          borderColor: "border-red-500/40",
          bgColor: "bg-red-500/8",
          glowColor: "shadow-red-500/10",
          badgeBg: "bg-red-500/15",
          barColor: "bg-red-400",
          icon: "❌",
          headline: "Not eligible at this time",
          sub: "Your score is below the minimum threshold. Follow the tips below to improve it.",
          tiers: [
            { label: "Personal Loan", amount: "₹75,000", rate: "12.5% p.a.", active: false },
            { label: "Micro Credit",  amount: "₹40,000", rate: "14% p.a.",   active: false },
            { label: "Emergency Fund",amount: "₹20,000", rate: "16% p.a.",   active: false },
          ],
        };

  const scoreBarPct = Math.min(100, Math.max(0, ((result.score - 300) / 600) * 100));

  const eligibleAmount =
    result.score >= 750 ? 75000 :
    result.score >= 650 ? 40000 :
    result.score >= 550 ? 20000 : 0;

  const [showOffers, setShowOffers] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [loadingOffer, setLoadingOffer] = useState<number | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<number | null>(null);

  function handleApply(e: React.MouseEvent, i: number) {
    e.stopPropagation();
    if (loadingOffer !== null || appliedOffer !== null) return;
    setLoadingOffer(i);
    setTimeout(() => {
      setLoadingOffer(null);
      setAppliedOffer(i);
    }, 1200);
  }

  const LOAN_OFFERS = [
    {
      amount: "₹10,000",
      amountNum: 10000,
      tenure: "7 days",
      tenureDays: 7,
      rate: "1.5% flat",
      fee: "₹150",
      label: "Quick Cash",
      icon: "⚡",
      gradient: "from-violet-600/20 to-purple-600/20",
      borderIdle: "border-violet-500/20",
      borderActive: "border-violet-400/70",
      glow: "rgba(139,92,246,0.5)",
      glowClass: "shadow-violet-500/30",
      badgeBg: "bg-violet-500/15 text-violet-300",
      accentText: "text-violet-400",
      tag: "Most Popular",
      tagColor: "bg-violet-500/20 text-violet-300",
    },
    {
      amount: "₹25,000",
      amountNum: 25000,
      tenure: "30 days",
      tenureDays: 30,
      rate: "14% p.a.",
      fee: "₹292",
      label: "Micro Credit",
      icon: "💳",
      gradient: "from-blue-600/20 to-cyan-600/20",
      borderIdle: "border-blue-500/20",
      borderActive: "border-blue-400/70",
      glow: "rgba(59,130,246,0.5)",
      glowClass: "shadow-blue-500/30",
      badgeBg: "bg-blue-500/15 text-blue-300",
      accentText: "text-blue-400",
      tag: "Best Value",
      tagColor: "bg-blue-500/20 text-blue-300",
    },
    {
      amount: "₹50,000",
      amountNum: 50000,
      tenure: "90 days",
      tenureDays: 90,
      rate: "12.5% p.a.",
      fee: "₹1,541",
      label: "Personal Loan",
      icon: "🏦",
      gradient: "from-emerald-600/20 to-teal-600/20",
      borderIdle: "border-emerald-500/20",
      borderActive: "border-emerald-400/70",
      glow: "rgba(16,185,129,0.5)",
      glowClass: "shadow-emerald-500/30",
      badgeBg: "bg-emerald-500/15 text-emerald-300",
      accentText: "text-emerald-400",
      tag: "Low Rate",
      tagColor: "bg-emerald-500/20 text-emerald-300",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* ── Row 1: Score gauge + grade + stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Score gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`glass-card p-5 flex flex-col items-center justify-center col-span-2 lg:col-span-1 border ${gc.border} ${gc.bg}`}
        >
          <ScoreGauge score={result.score} color={result.color} />
          <span className={`text-lg font-bold mt-1 ${gc.text}`}>{gc.icon} {result.grade}</span>
          <span className="text-xs text-muted-foreground mt-0.5">GigScore Rating</span>
        </motion.div>

        {/* Probability ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 flex flex-col items-center justify-center"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Repayment Prob.</p>
          <ProbabilityRing prob={prob} />
        </motion.div>

        {/* Loan eligibility */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 flex flex-col justify-between"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Loan Eligibility</p>
          <p className="text-xl font-bold font-mono gradient-text mt-2">{loanEligibility}</p>
          <p className="text-xs text-muted-foreground mt-1">Based on current score</p>
        </motion.div>

        {/* Risk level */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5 flex flex-col justify-between"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Level</p>
          <p className={`text-2xl font-bold mt-2 ${riskColor}`}>{riskLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">Lender risk assessment</p>
        </motion.div>
      </div>

      {/* ── Row 2: Radar + Bar charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <p className="text-sm font-semibold text-foreground mb-3">Factor Profile</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222,30%,18%)" />
              <PolarAngleAxis dataKey="factor" tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} />
              <Radar dataKey="value" stroke="hsl(173,80%,50%)" fill="hsl(173,80%,50%)" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <p className="text-sm font-semibold text-foreground mb-3">Score Contribution (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,18%)" />
              <XAxis dataKey="factor" tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215,20%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Row 3: Eligibility ↔ Loan Offers (AnimatePresence) ── */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── Eligibility panel ── */}
          {!showOffers && (
            <motion.div
              key="eligibility"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`glass-card border ${eligibility.borderColor} ${eligibility.bgColor} shadow-lg ${eligibility.glowColor} p-6 space-y-5 overflow-hidden relative`}
            >
              {/* Subtle radial glow behind content */}
              <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 ${eligibility.barColor}`} />

              {/* Header row */}
              <div className="flex items-start justify-between gap-4 relative">
                <div className="space-y-1">
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.12 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xl">{eligibility.icon}</span>
                    <motion.span
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.17, ease: "backOut" }}
                      className={`text-2xl font-bold tracking-tight ${eligibility.statusColor}`}
                    >
                      {eligibility.status}
                    </motion.span>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.22 }}
                    className="text-sm text-muted-foreground max-w-md"
                  >
                    {eligibility.sub}
                  </motion.p>
                </div>

                {/* Score badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: "backOut" }}
                  className={`shrink-0 px-4 py-2 rounded-xl ${eligibility.badgeBg} border ${eligibility.borderColor} text-center`}
                >
                  <p className={`text-2xl font-bold font-mono ${eligibility.statusColor}`}>{result.score}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">GigScore</p>
                </motion.div>
              </div>

              {/* Score progress bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="space-y-1.5"
              >
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>300 — Poor</span>
                  <span>580 — Fair</span>
                  <span>700 — Good</span>
                  <span>900 — Excellent</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${eligibility.barColor}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${scoreBarPct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.32 }}
                  />
                </div>
                <div className="relative h-1">
                  {[{ pct: ((580 - 300) / 600) * 100 }, { pct: ((700 - 300) / 600) * 100 }].map((m, idx) => (
                    <div key={idx} className="absolute top-0 flex flex-col items-center" style={{ left: `${m.pct}%`, transform: "translateX(-50%)" }}>
                      <div className="w-px h-2 bg-border/60" />
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Loan tier cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {eligibility.tiers.map((tier, i) => (
                  <motion.div
                    key={tier.label}
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: tier.active ? 1 : 0.38, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.36 + i * 0.08, ease: "easeOut" }}
                    className={`rounded-xl p-4 border transition-all ${
                      tier.active
                        ? `${eligibility.borderColor} ${eligibility.bgColor}`
                        : "border-border/20 bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{tier.label}</span>
                      {tier.active
                        ? <span className={`text-xs font-semibold ${eligibility.statusColor}`}>✓ Unlocked</span>
                        : <span className="text-xs text-muted-foreground/50">🔒 Locked</span>
                      }
                    </div>
                    <motion.p
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.44 + i * 0.08, ease: "backOut" }}
                      className={`text-lg font-bold font-mono ${tier.active ? eligibility.statusColor : "text-muted-foreground/40"}`}
                    >
                      {tier.amount}
                    </motion.p>
                    <p className={`text-xs mt-0.5 ${tier.active ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                      {tier.rate}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* View Loan Offers button */}
              {eligibleAmount > 0 && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.6, ease: "backOut" }}
                  onClick={() => setShowOffers(true)}
                  className="relative w-full sm:w-auto sm:self-start px-8 py-3 rounded-xl font-semibold text-sm text-white
                    bg-gradient-to-r from-purple-600 to-blue-500
                    shadow-[0_0_0_0_rgba(139,92,246,0)] hover:shadow-[0_0_24px_4px_rgba(139,92,246,0.45)]
                    transition-shadow duration-300 overflow-hidden group"
                >
                  <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700
                    bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                  <span className="relative flex items-center justify-center gap-2">
                    💰 View Loan Offers
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── Loan Offers panel ── */}
          {showOffers && (
            <motion.div
              key="loan-offers"
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card border border-purple-500/30 bg-purple-500/5 p-6 space-y-6 relative overflow-hidden"
            >
              {/* Ambient glows */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-10 bg-purple-500 pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl opacity-8 bg-blue-500 pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between relative">
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg font-bold text-foreground"
                  >
                    💰 Loan Offers
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.16 }}
                    className="text-xs text-muted-foreground mt-0.5"
                  >
                    Personalised for GigScore{" "}
                    <span className="text-purple-400 font-mono font-semibold">{result.score}</span>
                    {selectedOffer !== null && (
                      <span className="ml-2 text-purple-300">· {LOAN_OFFERS[selectedOffer].amount} selected</span>
                    )}
                  </motion.p>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18, ease: "backOut" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowOffers(false); setSelectedOffer(null); setAppliedOffer(null); setLoadingOffer(null); }}
                  className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground bg-secondary hover:bg-secondary/80 transition"
                >
                  ← Back
                </motion.button>
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LOAN_OFFERS.map((offer, i) => {
                  const isSelected = selectedOffer === i;
                  return (
                    <motion.div
                      key={offer.label}
                      initial={{ opacity: 0, y: 28, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{
                        scale: 1.04,
                        boxShadow: `0 0 28px 4px ${offer.glow}`,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedOffer(isSelected ? null : i)}
                      className={`
                        relative cursor-pointer rounded-2xl border p-5 space-y-4 overflow-hidden
                        backdrop-blur-md transition-colors duration-300
                        bg-gradient-to-br ${offer.gradient}
                        ${isSelected ? `${offer.borderActive} bg-white/5` : `${offer.borderIdle} bg-white/[0.03]`}
                      `}
                      style={{
                        boxShadow: isSelected ? `0 0 32px 6px ${offer.glow}` : undefined,
                      }}
                    >
                      {/* Shimmer sweep */}
                      <span className="absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700
                        bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />

                      {/* Selected ring pulse */}
                      {isSelected && (
                        <motion.span
                          className={`absolute inset-0 rounded-2xl border-2 ${offer.borderActive}`}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      )}

                      {/* Top row: icon + tag */}
                      <div className="flex items-start justify-between relative">
                        <motion.span
                          className="text-3xl"
                          animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          {offer.icon}
                        </motion.span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${offer.tagColor}`}>
                          {offer.tag}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="relative">
                        <motion.p
                          className={`text-3xl font-bold font-mono ${offer.accentText}`}
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.1, ease: "backOut" }}
                        >
                          {offer.amount}
                        </motion.p>
                        <p className="text-xs text-muted-foreground mt-0.5">{offer.label}</p>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2 relative">
                        {[
                          { label: "Tenure",   value: offer.tenure },
                          { label: "Rate",     value: offer.rate   },
                          { label: "Total Fee",value: offer.fee    },
                          { label: "Approval", value: "Instant"    },
                        ].map((s) => (
                          <div key={s.label} className="rounded-lg bg-black/20 backdrop-blur-sm px-2.5 py-2">
                            <p className="text-[9px] text-muted-foreground/70 uppercase tracking-wider">{s.label}</p>
                            <p className="text-xs font-semibold font-mono text-foreground/90 mt-0.5">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Confetti particles — shown on approval */}
                      <AnimatePresence>
                        {appliedOffer === i && (
                          <>
                            {Array.from({ length: 14 }).map((_, p) => {
                              const angle = (p / 14) * 360;
                              const dist = 48 + Math.random() * 36;
                              const x = Math.cos((angle * Math.PI) / 180) * dist;
                              const y = Math.sin((angle * Math.PI) / 180) * dist;
                              const colors = [
                                "bg-violet-400", "bg-blue-400", "bg-emerald-400",
                                "bg-yellow-300", "bg-pink-400", "bg-cyan-400",
                              ];
                              const size = p % 3 === 0 ? "w-2 h-2" : "w-1.5 h-1.5";
                              return (
                                <motion.span
                                  key={p}
                                  className={`absolute rounded-full ${colors[p % colors.length]} ${size} pointer-events-none`}
                                  style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }}
                                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                  animate={{ x, y, opacity: 0, scale: 0.3 }}
                                  transition={{ duration: 0.7 + (p % 3) * 0.15, ease: "easeOut", delay: p * 0.02 }}
                                />
                              );
                            })}
                          </>
                        )}
                      </AnimatePresence>

                      {/* Apply button */}
                      <AnimatePresence mode="wait">
                        {appliedOffer === i ? (
                          /* ── Success state ── */
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: [0.7, 1.12, 0.96, 1.04, 1] }}
                            transition={{ duration: 0.55, ease: "easeOut", times: [0, 0.4, 0.65, 0.82, 1] }}
                            className={`
                              w-full py-2.5 rounded-xl text-sm font-bold text-white text-center
                              bg-gradient-to-r from-emerald-500 to-teal-500
                              shadow-[0_0_24px_4px_rgba(16,185,129,0.5)]
                            `}
                          >
                            🎉 Loan Approved!
                          </motion.div>
                        ) : loadingOffer === i ? (
                          /* ── Loading state ── */
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center gap-2"
                          >
                            <motion.span
                              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                            />
                            <span className="text-sm font-semibold text-white">Processing…</span>
                          </motion.div>
                        ) : (
                          /* ── Default / selected state ── */
                          <motion.button
                            key="apply"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.93 }}
                            onClick={(e) => handleApply(e, i)}
                            className={`
                              relative w-full py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden
                              bg-gradient-to-r from-purple-600 to-blue-500
                              transition-shadow duration-300
                              ${isSelected
                                ? "shadow-[0_0_20px_3px_rgba(139,92,246,0.5)]"
                                : "hover:shadow-[0_0_16px_2px_rgba(139,92,246,0.35)]"
                              }
                            `}
                          >
                            <span className="absolute inset-0 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-600
                              bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="relative">
                              {isSelected ? "✓ Selected — Apply Now" : "Apply →"}
                            </span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Comparison hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[10px] text-muted-foreground/40 text-center"
              >
                Tap a card to select · Rates are indicative · Final approval subject to lender verification
              </motion.p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Row 4: Tips + AI Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Tips */}
        {tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5 space-y-3"
          >
            <p className="text-sm font-semibold text-foreground">💡 Improvement Tips</p>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.08 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary mt-0.5 shrink-0">→</span>
                  {tip}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card-accent p-5"
        >
          <p className="text-sm font-semibold gradient-text mb-3">🤖 AI Insights</p>
          <p className="text-sm text-secondary-foreground leading-relaxed">{mainExplanation}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
