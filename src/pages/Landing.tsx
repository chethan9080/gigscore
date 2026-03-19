import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GlowingShadow } from "@/components/ui/glowing-shadow";

// ── Reusable scroll-reveal wrapper ───────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Feature section data ──────────────────────────────────────────────────────
const FEATURES = [
  {
    tag: "Score & Benchmarking",
    title: "Score and Benchmarking",
    sub: "Your GigsScore: 780 | Excellent",
    flip: false,
    accent: "from-yellow-500/20 to-amber-500/20",
    border: "border-yellow-500/20",
    tagColor: "bg-yellow-500/15 text-yellow-300",
    illustration: {
      bg: "bg-gradient-to-br from-yellow-500/10 to-amber-600/10",
      icon: "🏆",
      items: [
        { icon: "📊", label: "Current GigsScore", value: "780", highlight: true },
        { icon: "📈", label: "vs Industry Average", value: "+12%" },
        { icon: "🥇", label: "Percentile Rank",    value: "Top 15%" },
      ],
      bar: { pct: 82, color: "bg-gradient-to-r from-red-400 via-yellow-400 to-green-400" },
    },
    points: [
      "See exactly where you stand vs. industry peers",
      "Live score benchmarking across platforms",
      "Track your score trend over time",
    ],
  },
  {
    tag: "Gig Analytics",
    title: "Analyze Gigs and Earnings",
    sub: "Gig Analytics | Overview",
    flip: true,
    accent: "from-violet-500/20 to-purple-500/20",
    border: "border-violet-500/20",
    tagColor: "bg-violet-500/15 text-violet-300",
    illustration: {
      bg: "bg-gradient-to-br from-violet-500/10 to-purple-600/10",
      icon: "💻",
      items: [
        { icon: "📦", label: "Deliveries",   value: "1,240" },
        { icon: "🚴", label: "Rides",        value: "380"   },
        { icon: "✏️", label: "Freelance",    value: "56"    },
        { icon: "💰", label: "Avg Monthly",  value: "₹28k"  },
        { icon: "</>" , label: "Dev Projects", value: "12"  },
        { icon: "📄", label: "Reports",      value: "8"     },
      ],
      bar: null,
    },
    points: [
      "Unified view across Swiggy, Uber, Upwork & more",
      "Earnings breakdown by platform and category",
      "Identify your highest-value gig channels",
    ],
  },
  {
    tag: "Score Improvement",
    title: "Improve and Grow Score",
    sub: "Improve Your Score | Recommendations",
    flip: false,
    accent: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/20",
    tagColor: "bg-purple-500/15 text-purple-300",
    illustration: {
      bg: "bg-gradient-to-br from-purple-500/10 to-indigo-600/10",
      icon: "🧑‍💻",
      items: [
        { icon: "☑️", label: "Add New Platform",       value: "" },
        { icon: "⭐", label: "Improve Rating",          value: "" },
        { icon: "✅", label: "Reduce Cancellation Rate",value: "" },
        { icon: "👍", label: "Improve Score",           value: "" },
      ],
      bar: { pct: 58, color: "bg-gradient-to-r from-purple-400 to-indigo-400" },
    },
    points: [
      "AI-generated personalised improvement tips",
      "Step-by-step actions to boost your score",
      "Track progress after each completed action",
    ],
  },
  {
    tag: "Opportunities",
    title: "Access Better Opportunities",
    sub: "Unlock Opportunities | Milestone Achieved",
    flip: true,
    accent: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/20",
    tagColor: "bg-amber-500/15 text-amber-300",
    illustration: {
      bg: "bg-gradient-to-br from-amber-500/10 to-orange-600/10",
      icon: "🔑",
      items: [
        { icon: "🏦", label: "Premium Loan Offers",  value: "Unlocked" },
        { icon: "📋", label: "Priority Applications",value: "Active"   },
        { icon: "🎖️", label: "Milestone Badge",      value: "Earned"   },
      ],
      bar: null,
    },
    points: [
      "Unlock premium loan offers as your score grows",
      "Get priority access to top lenders",
      "Earn milestone badges and rewards",
    ],
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 gap-10 pb-48">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-10"
        >
          <GlowingShadow>
            <div className="flex flex-col items-center gap-2 px-8 py-4">
              <span className="text-5xl md:text-6xl font-bold tracking-tight text-white">GigScore</span>
              <span className="text-sm md:text-base text-white/60 text-center">
                AI-Powered Credit Scoring for Gig Workers
              </span>
            </div>
          </GlowingShadow>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-center max-w-md text-sm leading-relaxed"
          >
            Know your creditworthiness in seconds. Built for delivery riders,
            freelancers, and every gig worker who deserves fair access to finance.
          </motion.p>

          {/* Auth row — removed from homepage, shown after score is generated */}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button onClick={() => navigate("/app")}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-base hover:opacity-90 transition-all duration-200 glow-primary">
              🚀 Try Demo
            </button>
            <button onClick={() => navigate("/app")}
              className="px-8 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold text-base hover:bg-secondary/80 transition-all duration-200">
              Get Started →
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="px-8 py-3 rounded-lg border border-border text-muted-foreground font-semibold text-base hover:bg-secondary/50 transition-all duration-200">
              📊 Analytics
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground"
          >
            {["📦 Orders", "⭐ Rating", "📅 Tenure", "💰 Income", "📱 UPI"].map((f) => (
              <span key={f} className="px-3 py-1 rounded-full bg-secondary">{f}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col items-center gap-2 mt-4"
        >
          <span className="text-xs text-muted-foreground/50">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
            className="w-px h-5 bg-gradient-to-b from-muted-foreground/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Marquee strip — full bleed, outside hero section ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="relative z-10 w-full overflow-hidden py-2 -mt-32 mb-16"
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* card = 280px, gap = 32px → one set = 4 × (280+32) = 1248px */}
        <motion.div
          className="flex gap-8 w-max"
          animate={{ x: [0, -1248] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        >
          {[...FEATURES, ...FEATURES].map((f, i) => (
            <motion.div
              key={`${f.title}-${i}`}
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                document.getElementById(`feature-${i % FEATURES.length}`)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className={`
                shrink-0 w-[280px] rounded-2xl border ${f.border} cursor-pointer
                bg-gradient-to-br ${f.accent} backdrop-blur-md
                p-6 space-y-3
                hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]
                transition-shadow duration-300
              `}
            >
              <span className="text-4xl">{f.illustration.icon}</span>
              <p className="text-sm font-bold text-foreground leading-snug">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-snug">{f.sub}</p>
              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${f.tagColor}`}>
                {f.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Feature sections ── */}
      <section className="relative z-10 w-full max-w-5xl px-4 pb-24 space-y-32">
        {FEATURES.map((f, idx) => (
          <div
            id={`feature-${idx}`}
            key={f.title}
            className={`flex flex-col ${f.flip ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12`}
          >
            {/* Illustration card */}
            <Reveal delay={0.05} className="w-full md:w-1/2">
              <div className={`
                relative rounded-3xl border ${f.border} ${f.illustration.bg}
                backdrop-blur-sm p-8 overflow-hidden
                shadow-[0_8px_40px_-8px_rgba(0,0,0,0.4)]
              `}>
                {/* Ambient blob */}
                <div className={`absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${f.accent}`} />

                {/* Big icon */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + idx * 0.05, ease: "backOut", duration: 0.5 }}
                  className="text-5xl mb-6"
                >
                  {f.illustration.icon}
                </motion.div>

                {/* Score bar (if present) */}
                {f.illustration.bar && (
                  <div className="mb-5 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Score Progress</span>
                      <span className="font-mono text-foreground">{f.illustration.bar.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${f.illustration.bar.color}`}
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${f.illustration.bar.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Item grid */}
                <div className={`grid ${f.illustration.items.length > 3 ? "grid-cols-3" : "grid-cols-1"} gap-2`}>
                  {f.illustration.items.map((item, ii) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + ii * 0.07, duration: 0.4 }}
                      className={`
                        flex items-center gap-2 rounded-xl px-3 py-2.5
                        bg-black/20 backdrop-blur-sm border border-white/5
                        ${item.highlight ? "border-yellow-400/30 bg-yellow-500/10" : ""}
                      `}
                    >
                      <span className="text-base shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
                        {item.value && (
                          <p className="text-xs font-bold font-mono text-foreground">{item.value}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Text content */}
            <Reveal delay={0.15} className="w-full md:w-1/2 space-y-5">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${f.tagColor}`}>
                {f.tag}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {f.title}
              </h2>
              <p className="text-sm text-muted-foreground">{f.sub}</p>
              <ul className="space-y-3">
                {f.points.map((pt, pi) => (
                  <motion.li
                    key={pi}
                    initial={{ opacity: 0, x: f.flip ? 16 : -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + pi * 0.1, duration: 0.45 }}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs shrink-0">
                      ✓
                    </span>
                    {pt}
                  </motion.li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/app")}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-primary to-accent
                  hover:shadow-[0_0_20px_4px_rgba(139,92,246,0.3)]
                  transition-shadow duration-300"
              >
                Explore →
              </motion.button>
            </Reveal>
          </div>
        ))}
      </section>

      <p className="relative z-10 pb-8 text-xs text-muted-foreground">
        GigScore © 2026 • Built for the future of gig economy finance
      </p>
    </div>
  );
}
