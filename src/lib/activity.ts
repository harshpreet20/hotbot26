import { addActivityLog } from "./db";

export async function logActivity(params: {
  userId: string | null;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await addActivityLog(params);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
