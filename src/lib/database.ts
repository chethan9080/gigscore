import { supabase } from "@/integrations/supabase/client";
import type { GigProfile, ScoreResult } from "./scoreCalculator";

export async function saveGigProfile(userId: string, profile: GigProfile) {
  const { data, error } = await supabase.from("gig_profiles").insert({
    user_id: userId,
    name: profile.name,
    platform: profile.platform,
    orders: profile.orders,
    rating: profile.rating,
    tenure: profile.tenure,
    income: profile.income,
    upi_transactions: profile.upiTransactions,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function saveScoreHistory(
  userId: string,
  gigProfileId: string | null,
  result: ScoreResult,
  explanation: string
) {
  const { data, error } = await supabase.from("score_history").insert({
    user_id: userId,
    gig_profile_id: gigProfileId,
    score: result.score,
    grade: result.grade,
    breakdown: result.breakdown as any,
    explanation,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getScoreHistory(userId: string) {
  const { data, error } = await supabase
    .from("score_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getGigProfiles(userId: string) {
  const { data, error } = await supabase
    .from("gig_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllScoreHistory() {
  const { data, error } = await supabase
    .from("score_history")
    .select("*, gig_profiles(name, platform)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveLenderDecision(
  lenderId: string,
  scoreHistoryId: string,
  applicantName: string,
  score: number,
  amountRequested: number,
  status: "approved" | "rejected"
) {
  const { error } = await supabase.from("lender_decisions").insert({
    lender_id: lenderId,
    score_history_id: scoreHistoryId,
    applicant_name: applicantName,
    score,
    amount_requested: amountRequested,
    status,
  });
  if (error) throw error;
}

export async function getLenderDecisions(lenderId: string) {
  const { data, error } = await supabase
    .from("lender_decisions")
    .select("*")
    .eq("lender_id", lenderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
