export interface GigProfile {
  name: string;
  platform: string;
  orders: number;
  rating: number;
  tenure: number; // months
  income: number; // monthly in INR
  upiTransactions: number;
}

export interface ScoreResult {
  score: number;
  breakdown: {
    orders: number;
    rating: number;
    tenure: number;
    income: number;
    upi: number;
  };
  grade: "Poor" | "Fair" | "Good" | "Excellent";
  color: "red" | "orange" | "green";
}

export function calculateScore(profile: GigProfile): ScoreResult {
  const rawOrders = profile.orders * 0.1;
  const rawRating = profile.rating * 100;
  const rawTenure = profile.tenure * 2;
  const rawIncome = profile.income * 0.01;
  const rawUpi = profile.upiTransactions * 1;

  const raw = rawOrders + rawRating + rawTenure + rawIncome + rawUpi;
  const score = Math.min(900, Math.max(300, Math.round(300 + raw)));

  const total = raw || 1;
  const breakdown = {
    orders: (rawOrders / total) * 100,
    rating: (rawRating / total) * 100,
    tenure: (rawTenure / total) * 100,
    income: (rawIncome / total) * 100,
    upi: (rawUpi / total) * 100,
  };

  let grade: ScoreResult["grade"];
  let color: ScoreResult["color"];

  if (score < 600) { grade = "Poor"; color = "red"; }
  else if (score <= 700) { grade = "Fair"; color = "orange"; }
  else if (score <= 800) { grade = "Good"; color = "green"; }
  else { grade = "Excellent"; color = "green"; }

  return { score, breakdown, grade, color };
}

export function getExplanation(result: ScoreResult, profile: GigProfile): string {
  const tips: string[] = [];
  
  if (profile.rating < 4.5) tips.push("Improve your platform rating above 4.5 to boost your score significantly.");
  if (profile.orders < 500) tips.push("Complete more orders to demonstrate consistent gig activity.");
  if (profile.tenure < 12) tips.push("A longer tenure on the platform shows stability to lenders.");
  if (profile.income < 30000) tips.push("Higher monthly income improves creditworthiness.");
  if (profile.upiTransactions < 50) tips.push("More UPI transactions demonstrate active digital financial behavior.");

  return `Your GigScore is ${result.score} (${result.grade}). ${
    result.score >= 700
      ? "You have a strong credit profile for gig workers. Most lenders will view you favorably."
      : result.score >= 600
      ? "Your score is fair. There's room for improvement to unlock better lending terms."
      : "Your score needs improvement. Focus on building consistent gig activity and digital transactions."
  }\n\n${tips.length ? "💡 Tips to improve:\n• " + tips.join("\n• ") : "🎉 Great job! Keep maintaining your activity levels."}`;
}

export const sampleProfiles: GigProfile[] = [
  {
    name: "Rahul - Swiggy Rider",
    platform: "Swiggy",
    orders: 2200,
    rating: 4.7,
    tenure: 18,
    income: 28000,
    upiTransactions: 120,
  },
  {
    name: "Priya - Uber Driver",
    platform: "Uber",
    orders: 3500,
    rating: 4.9,
    tenure: 30,
    income: 42000,
    upiTransactions: 200,
  },
  {
    name: "Amit - Freelancer",
    platform: "Freelance",
    orders: 150,
    rating: 4.3,
    tenure: 8,
    income: 55000,
    upiTransactions: 80,
  },
];
