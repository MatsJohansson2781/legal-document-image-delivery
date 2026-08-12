export type MatterIntake = {
  matterId: string;
  clientName: string;
  courtDate: string;
  signed: boolean;
};

export type FollowUp = {
  state: "send-reminder" | "wait";
  reason: string;
};

export function decideDeadlineFollowUp(
  intake: MatterIntake,
  today: string,
): FollowUp {
  const due = Date.parse(`${intake.courtDate}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  const daysUntilCourt = Math.ceil((due - now) / 86_400_000);

  if (!intake.signed && daysUntilCourt <= 7) {
    return {
      state: "send-reminder",
      reason: `${intake.matterId} has no signed document and the deadline is ${daysUntilCourt} days away`,
    };
  }

  return { state: "wait", reason: `${intake.matterId} needs no reminder today` };
}
