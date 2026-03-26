import { supabase } from "./supabase";

export async function logActivity(params: {
  userId: string | null;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await supabase.from("activity_logs").insert({
      user_id: params.userId,
      action: params.action,
      details: params.details || {},
      ip_address: params.ipAddress || null,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
