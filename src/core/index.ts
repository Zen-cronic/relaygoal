// Public surface of the reusable verified-phone-outcome core.
export * from "./types";
export { isValidE164, assertE164, maskPhone, InvalidPhoneNumberError } from "./phone";
export { verifyOutcome, type VerifyOptions } from "./verify";
export { runVerifiedGoal, type VerifiedGoalRequest } from "./runGoal";
export { FakeCalle, type FakeResolver } from "./fakecalle";
