export type Frequency = "weekly" | "monthly" | "quarterly" | "annually";

export function computeNextDate(startDate: string, frequency: Frequency): string {
  const d = new Date(startDate);
  switch (frequency) {
    case "weekly":    d.setDate(d.getDate() + 7); break;
    case "monthly":   d.setMonth(d.getMonth() + 1); break;
    case "quarterly": d.setMonth(d.getMonth() + 3); break;
    case "annually":  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.toISOString().split("T")[0];
}

export function addFrequencyInterval(date: string, frequency: Frequency): string {
  return computeNextDate(date, frequency);
}
