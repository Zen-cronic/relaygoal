import { runVerifiedGoal } from "@/src/core/runGoal";
import { FakeCalle } from "@/src/core/fakecalle";
import { maskPhone } from "@/src/core/phone";
import { findPreset } from "@/src/goals";
import { scenarios } from "@/src/scenarios";

// Runs a MOCKED CALL-E call through the real verified-phone-outcome core.
// Swap `new FakeCalle(scenario)` for `new CalleClient({ apiKey })` to go live —
// the CalleLike interface is identical, so nothing else changes.
export async function POST(req: Request) {
  let body: { verticalId?: string; presetId?: string; goal?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { verticalId, presetId, goal } = body;
  if (!verticalId || !presetId) {
    return Response.json({ error: "verticalId and presetId are required" }, { status: 400 });
  }

  const found = findPreset(verticalId, presetId);
  if (!found) {
    return Response.json({ error: "unknown goal" }, { status: 404 });
  }
  const { vertical, preset } = found;
  const scenario = scenarios[preset.scenarioId];
  if (!scenario) {
    return Response.json({ error: "no mock scenario for this goal" }, { status: 500 });
  }

  const client = new FakeCalle(scenario);
  const goalText = (goal && goal.trim()) || preset.goalText;

  const outcome = await runVerifiedGoal(client, {
    task: vertical.taskTemplate(goalText),
    phone: preset.phone,
    resultSchema: preset.resultSchema,
    requestedKeys: preset.requestedKeys,
    idempotencyKey: `demo-${verticalId}-${presetId}`,
  });

  return Response.json({
    outcome,
    goalText,
    presetLabel: preset.label,
    phoneMasked: maskPhone(preset.phone),
    mocked: true,
  });
}
