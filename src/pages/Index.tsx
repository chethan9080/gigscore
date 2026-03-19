import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ScoreInput from "@/components/ScoreInput";
import ScoreDisplay from "@/components/ScoreDisplay";
import LenderDashboard from "@/components/LenderDashboard";
import ScoreHistory from "@/components/ScoreHistory";
import { type GigProfile, type ScoreResult } from "@/lib/scoreCalculator";
import { pushApplicant } from "@/lib/scoreStore";
import { useAuth } from "@/hooks/useAuth";
import { sendScoreEmail } from "@/lib/emailScore";
import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8000";

const DEMO_PROFILE: GigProfile = {
  name: "Demo User",
  platform: "Swiggy",
  orders: 1500,
  rating: 4.8,
  tenure: 24,
  income: 25000,
  upiTransactions: 120,
};

type Tab = "calculator" | "history" | "lender";

// Map backend response into the ScoreResult shape the UI expects
function toScoreResult(score: number, probability: number): ScoreResult {
  let grade: ScoreResult["grade"];
  let color: ScoreResult["color"];
  if (score < 600) { grade = "Poor"; color = "red"; }
  else if (score <= 700) { grade = "Fair"; color = "orange"; }
  else if (score <= 800) { grade = "Good"; color = "green"; }
  else { grade = "Excellent"; color = "green"; }

  // Approximate breakdown from probability weight
  const w = probability;
  return {
    score,
    grade,
    color,
    breakdown: {
      orders: 20,
      rating: 30,
      tenure: 15,
      income: 25,
      upi: 10,
    },
  };
}

// Google "G" SVG logo
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("calculator");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [explanation, setExplanation] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  async function handleGoogle() {
    setAuthLoading(true);
    try { await signInWithGoogle(); } catch { /* OAuth redirect */ }
    setAuthLoading(false);
  }

  type EmailStatus = "idle" | "sending" | "sent" | "error";
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");

  async function handleSendEmail() {
    if (!user || !result) return;
    setEmailStatus("sending");
    try {
      const parts = explanation.split("\n\n💡 Tips:\n• ");
      const tips = parts[1] ? "• " + parts[1].split("\n• ").join("\n• ") : "";
      await sendScoreEmail({
        toEmail: user.email ?? "",
        toName:  displayName,
        score:   result.score,
        grade:   result.grade,
        tips,
      });
      setEmailStatus("sent");
      toast.success("Email sent successfully!");
      setTimeout(() => setEmailStatus("idle"), 4000);
    } catch (err) {
      console.error(err);
      setEmailStatus("error");
      toast.error("Failed to send email. Check your EmailJS credentials.");
      setTimeout(() => setEmailStatus("idle"), 3000);
    }
  }

  const callBackend = async (profile: GigProfile) => {
    const res = await fetch(`${API_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orders: profile.orders,
        rating: profile.rating,
        tenure: profile.tenure,
        income: profile.income,
        upi: profile.upiTransactions,
      }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json() as Promise<{
      score: number;
      probability: number;
      tips: string[];
      explanation: string;
    }>;
  };

  const handleCalculate = async (p: GigProfile) => {
    try {
      const data = await callBackend(p);
      const r = toScoreResult(data.score, data.probability);
      setResult(r);
      setExplanation(data.explanation + (data.tips.length ? "\n\n💡 Tips:\n• " + data.tips.join("\n• ") : ""));
      // Push to global store so Dashboard reflects this score
      pushApplicant({
        name: p.name || "Unknown",
        platform: p.platform || "Gig Platform",
        score: data.score,
        probability: data.probability,
        tips: data.tips,
        explanation: data.explanation,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not reach backend. Is the API running?");
    }
  };

  const handleTryDemo = async () => {
    setDemoLoading(true);
    setTab("calculator");
    try {
      const data = await callBackend(DEMO_PROFILE);
      const r = toScoreResult(data.score, data.probability);
      setResult(r);
      setExplanation(data.explanation + (data.tips.length ? "\n\n💡 Tips:\n• " + data.tips.join("\n• ") : ""));
      pushApplicant({
        name: DEMO_PROFILE.name,
        platform: DEMO_PROFILE.platform,
        score: data.score,
        probability: data.probability,
        tips: data.tips,
        explanation: data.explanation,
      });
      toast.success("Demo loaded!");
    } catch (err) {
      console.error(err);
      toast.error("Could not reach backend. Is the API running on port 8000?");
    } finally {
      setDemoLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "calculator", label: "📊 Calculator" },
    { key: "history", label: "📈 History" },
    { key: "lender", label: "🏦 Lender" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">GigScore</h1>
            <p className="text-muted-foreground text-sm mt-1">AI-Powered Credit Scoring for Gig Workers</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition"
            >
              ← Back
            </button>

            {/* User chip */}
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/60 border border-border/40">
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-6 h-6 rounded-full" />
                  : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
                      {displayName[0].toUpperCase()}
                    </div>
                }
                <span className="text-xs font-medium text-foreground hidden sm:block">{displayName}</span>
                <button onClick={() => signOut()} className="text-[10px] text-muted-foreground hover:text-foreground transition ml-1">
                  ✕
                </button>
              </div>
            ) : null}

            <button
              onClick={handleTryDemo}
              disabled={demoLoading}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-all duration-200 glow-primary disabled:opacity-50 text-sm"
            >
              {demoLoading ? "Loading..." : "🚀 Try Demo"}
            </button>
          </div>
        </motion.header>

        <div className="flex justify-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "calculator" && (
          <div className="space-y-6">
            <ScoreInput onCalculate={handleCalculate} />
            {result && <ScoreDisplay result={result} explanation={explanation} />}

            {/* Save score prompt — only shown after score generated and not logged in */}
            <AnimatePresence>
              {result && !user && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm p-6 overflow-hidden"
                >
                  {/* Ambient glow */}
                  <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl opacity-20 bg-purple-500 pointer-events-none" />

                  <div className="relative flex flex-col sm:flex-row items-center gap-5">
                    <div className="text-4xl">🔒</div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="font-semibold text-foreground">Login to save your score</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sign in to track your GigScore history, unlock loan offers, and get personalised tips.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleGoogle}
                      disabled={authLoading}
                      className="shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white text-gray-700 font-semibold text-sm
                        shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]
                        transition-shadow duration-200 disabled:opacity-60"
                    >
                      {authLoading ? (
                        <motion.span
                          className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        />
                      ) : <GoogleIcon />}
                      Continue with Google
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Logged-in confirmation */}
              {result && user && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/8 text-sm text-green-400"
                >
                  <span>✅</span>
                  <span>Score saved to <span className="font-semibold">{displayName}</span>'s account</span>
                </motion.div>
              )}

              {/* Email button — only when logged in + score ready */}
              {result && user && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/8 to-cyan-500/8 backdrop-blur-sm p-5 overflow-hidden"
                >
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-15 bg-blue-500 pointer-events-none" />

                  <div className="relative flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <p className="font-semibold text-foreground text-sm">📧 Get your score report</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        We'll send a full breakdown to <span className="text-blue-400">{user.email}</span>
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      {emailStatus === "sent" ? (
                        <motion.div
                          key="sent"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: [0.8, 1.1, 1] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, ease: "backOut" }}
                          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-semibold"
                        >
                          ✅ Email sent successfully
                        </motion.div>
                      ) : emailStatus === "error" ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="shrink-0 px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold"
                        >
                          ❌ Failed — check credentials
                        </motion.div>
                      ) : (
                        <motion.button
                          key="btn"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSendEmail}
                          disabled={emailStatus === "sending"}
                          className="shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                            bg-gradient-to-r from-blue-600 to-cyan-500
                            hover:shadow-[0_0_20px_4px_rgba(59,130,246,0.4)]
                            transition-shadow duration-300 disabled:opacity-60"
                        >
                          {emailStatus === "sending" ? (
                            <>
                              <motion.span
                                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                              />
                              Sending…
                            </>
                          ) : (
                            <>📧 Send Score to Email</>
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {tab === "history" && <ScoreHistory />}
        {tab === "lender" && <LenderDashboard />}

        <footer className="text-center text-xs text-muted-foreground pt-8 pb-4">
          Built for the future of gig economy finance • GigScore © 2026
        </footer>
      </div>
    </div>
  );
};

export default Index;
