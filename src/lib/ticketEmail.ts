/**
 * Ticket email notifications — now powered by Resend.
 * Re-exports from the central resend lib so existing import paths keep working.
 */
export { sendTicketConfirmation, sendStaffReplyNotification, sendStatusUpdateNotification } from "@/lib/resend";
