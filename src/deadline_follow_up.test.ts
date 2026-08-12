import test from "node:test";
import assert from "node:assert/strict";
import { decideDeadlineFollowUp } from "./legal_workflow.ts";

test("an unsigned matter seven days from court gets a reminder", () => {
  const decision = decideDeadlineFollowUp(
    { matterId: "matter-1042", clientName: "Northwind Market", courtDate: "2026-08-16", signed: false },
    "2026-08-10",
  );

  assert.deepEqual(decision, {
    state: "send-reminder",
    reason: "matter-1042 has no signed document and the deadline is 6 days away",
  });
});
