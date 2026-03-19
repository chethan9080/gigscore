/**
 * emailScore.ts
 * Sends a GigScore report email via EmailJS.
 *
 * Setup (one-time):
 *  1. Create a free account at https://www.emailjs.com
 *  2. Add an Email Service (Gmail, Outlook, etc.) → copy SERVICE_ID
 *  3. Create an Email Template with these variables:
 *       {{to_email}}  {{to_name}}  {{score}}  {{grade}}
 *       {{eligibility}}  {{loan_amount}}  {{tips}}  {{message}}
 *  4. Copy TEMPLATE_ID and PUBLIC_KEY
 *  5. Replace the three constants below.
 */

import emailjs from "@emailjs/browser";

// ── Replace these with your EmailJS credentials ──────────────────────────────
const SERVICE_ID  = "YOUR_SERVICE_ID";
const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const PUBLIC_KEY  = "YOUR_PUBLIC_KEY";
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreEmailParams {
  toEmail: string;
  toName:  string;
  score:   number;
  grade:   string;
  tips:    string;
}

function eligibilityLabel(score: number) {
  if (score >= 700) return "Eligible ✅";
  if (score >= 580) return "Conditionally Eligible ⚠️";
  return "Not Eligible ❌";
}

function loanAmount(score: number) {
  if (score >= 750) return "₹75,000";
  if (score >= 650) return "₹40,000";
  if (score >= 550) return "₹20,000";
  return "Not eligible for a loan at this time";
}

export async function sendScoreEmail(params: ScoreEmailParams): Promise<void> {
  const templateParams = {
    to_email:    params.toEmail,
    to_name:     params.toName,
    score:       params.score.toString(),
    grade:       params.grade,
    eligibility: eligibilityLabel(params.score),
    loan_amount: loanAmount(params.score),
    tips:        params.tips || "Keep improving your gig activity to boost your score.",
    message:
      `Hello ${params.toName},\n\n` +
      `Your GigScore is ${params.score} (${params.grade}).\n` +
      `Eligibility: ${eligibilityLabel(params.score)}\n` +
      `Maximum Loan Amount: ${loanAmount(params.score)}\n\n` +
      `Tips to improve:\n${params.tips || "• Increase your order count\n• Maintain a high rating"}\n\n` +
      `Keep up the great work!\n— GigScore Team`,
  };

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
}
