// Lightweight global store — no Zustand needed, just a module-level reactive ref
// Components subscribe via a custom hook using useState + event listener

export interface ScoredApplicant {
  name: string;
  platform: string;
  score: number;
  probability: number;
  tips: string[];
  explanation: string;
  status: "approved" | "rejected" | "pending";
  amount: string;
  timestamp: number;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let applicants: ScoredApplicant[] = [];

export function pushApplicant(a: Omit<ScoredApplicant, "status" | "amount" | "timestamp">) {
  const status: ScoredApplicant["status"] =
    a.score >= 700 ? "approved" : a.score >= 580 ? "pending" : "rejected";
  const maxLoan = a.score >= 750 ? 75000 : a.score >= 650 ? 40000 : a.score >= 550 ? 20000 : 0;
  const entry: ScoredApplicant = {
    ...a,
    status,
    amount: maxLoan > 0 ? `₹${maxLoan.toLocaleString("en-IN")}` : "Not eligible",
    timestamp: Date.now(),
  };
  applicants = [entry, ...applicants].slice(0, 20); // keep last 20
  listeners.forEach((l) => l());
}

export function getApplicants() {
  return applicants;
}

export function subscribeStore(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
