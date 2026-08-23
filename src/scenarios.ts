// Mocked CALL-E call outcomes for the FakeCalle dry-run path (demo + tests).
// Every number is in the reserved-fictional range (555-0100..0199) so no real
// number ever touches this repo. Each transcript is written so the verify engine
// grounds (or correctly fails to ground) the structured answers.

import type { CalleCallResult } from "./core/types";
import { pharmacyReadyScenario, noAnswerScenario, DEMO_PHARMACY } from "./core/fixtures";

export { pharmacyReadyScenario, noAnswerScenario, DEMO_PHARMACY };

// Accessibility — restaurant reservation (all verified)
export const restaurantReservationScenario: CalleCallResult = {
  status: "completed",
  taskCompleted: true,
  completionConfidence: { score: 0.86, label: "high" },
  summary: "Bella Trattoria: earliest table for four tonight is 7:15 PM; step-free and wheelchair accessible.",
  evidence: [
    "Host said the earliest table for four tonight is 7:15 PM",
    "Host confirmed step-free entrance and wheelchair accessible seating",
  ],
  structuredResult: {
    earliest_table: "7:15 PM",
    party_size_ok: "yes",
    wheelchair_accessible: "yes",
  },
  transcriptTurns: [
    { offsetSeconds: 0, speaker: "bot", text: "Hi, I'm calling for a customer to book a table for four tonight. What's the earliest time?" },
    { offsetSeconds: 7, speaker: "user", text: "For four people, the earliest table tonight is 7:15 PM." },
    { offsetSeconds: 13, speaker: "bot", text: "Thank you. Is the restaurant wheelchair accessible?" },
    { offsetSeconds: 18, speaker: "user", text: "Yes, we have a step-free entrance and wheelchair accessible seating." },
  ],
};

// Accessibility — clinic hours + walk-in (all verified)
export const clinicHoursScenario: CalleCallResult = {
  status: "completed",
  taskCompleted: true,
  completionConfidence: { score: 0.83, label: "high" },
  summary: "Riverside Clinic open until 6:00 PM today; walk-in flu shots available.",
  evidence: [
    "Front desk said they are open until 6:00 PM today",
    "Walk-in flu shots are available today",
  ],
  structuredResult: {
    open_until: "6:00 PM",
    walk_in_flu_shot: "yes",
  },
  transcriptTurns: [
    { offsetSeconds: 0, speaker: "bot", text: "Hello, what time do you close today, and are walk-in flu shots available?" },
    { offsetSeconds: 6, speaker: "user", text: "We're open until 6:00 PM today." },
    { offsetSeconds: 11, speaker: "user", text: "Yes, walk-in flu shots are available, no appointment needed." },
  ],
};

// Civic — DMV REAL ID documents + wait (all verified; non-authenticated logistics)
export const dmvRealIdScenario: CalleCallResult = {
  status: "completed",
  taskCompleted: true,
  completionConfidence: { score: 0.81, label: "high" },
  summary: "DMV: bring a passport or birth certificate, two proofs of address, and your Social Security card; wait is about 40 minutes.",
  evidence: [
    "Agent listed: passport or birth certificate, two proofs of address, and Social Security card",
    "Current wait time is about 40 minutes",
  ],
  structuredResult: {
    documents_needed: "passport or birth certificate, two proofs of address, Social Security card",
    wait_time: "about 40 minutes",
  },
  transcriptTurns: [
    { offsetSeconds: 0, speaker: "bot", text: "Hi, what documents are required to apply for a REAL ID, and what's the current wait?" },
    { offsetSeconds: 8, speaker: "user", text: "For a REAL ID, bring a passport or birth certificate, two proofs of address, and your Social Security card." },
    { offsetSeconds: 19, speaker: "user", text: "Right now the wait is about 40 minutes." },
  ],
};

// Civic — benefits office: hours VERIFIED, case status hits the IDENTITY WALL (partial).
// This is the honest identity-wall-as-a-feature demo beat.
export const benefitsIdentityWallScenario: CalleCallResult = {
  status: "completed",
  taskCompleted: true,
  completionConfidence: { score: 0.8, label: "high" },
  summary: "County benefits office open 8:00 AM to 4:30 PM. Case status could not be shared without the account holder verifying their identity.",
  evidence: [
    "Office hours are 8:00 AM to 4:30 PM, Monday to Friday",
    "Case status cannot be shared without the account holder present to verify identity",
  ],
  structuredResult: {
    office_hours: "8:00 AM to 4:30 PM",
    // Deliberately absent/undetermined -> must come back UNVERIFIED, never fabricated.
    case_status: "unknown",
  },
  transcriptTurns: [
    { offsetSeconds: 0, speaker: "bot", text: "Hello, what are your hours, and can you tell me the status of a case?" },
    { offsetSeconds: 7, speaker: "user", text: "We're open 8:00 AM to 4:30 PM, Monday through Friday." },
    { offsetSeconds: 14, speaker: "user", text: "I'm sorry, I can't share case status unless the account holder is on the line to verify their identity." },
  ],
};

// Civic — city water department, closed (unreachable; fail-closed).
export const waterDeptUnreachableScenario: CalleCallResult = {
  status: "failed",
  taskCompleted: false,
  completionConfidence: { score: 0, label: "none" },
  summary: "No answer — line rang out and went to a full voicemail box.",
  transcriptTurns: [],
};

export const scenarios: Record<string, CalleCallResult> = {
  "pharmacy-ready": pharmacyReadyScenario,
  "restaurant-reservation": restaurantReservationScenario,
  "clinic-hours": clinicHoursScenario,
  "dmv-realid": dmvRealIdScenario,
  "benefits-identity-wall": benefitsIdentityWallScenario,
  "water-unreachable": waterDeptUnreachableScenario,
};
