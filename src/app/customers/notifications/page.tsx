"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { portalClient } from "@/lib/supabase-portal";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  read_at: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  invoice:        "🧾",
  payment:        "💰",
  project_update: "📋",
  milestone:      "✅",
  deployment:     "🚀",
  approval:       "🎨",
  blocker:        "⚠️",
  ticket:         "🎫",
  message:        "💬",
  announcement:   "📣",
};

function getIcon(type: string) {
  return TYPE_ICONS[type] ?? "🔔";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5)  return `${w}w ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

function groupNotifications(notifications: Notification[]): {
  today: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
} {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek  = new Date(startOfToday.getTime() - (now.getDay() * 86400000));

  const today: Notification[]    = [];
  const thisWeek: Notification[] = [];
  const earlier: Notification[]  = [];

  for (const n of notifications) {
    const d = new Date(n.created_at);
    if (d >= startOfToday) {
      today.push(n);
    } else if (d >= startOfWeek) {
      thisWeek.push(n);
    } else {
      earlier.push(n);
    }
  }

  return { today, thisWeek, earlier };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(() => {
    fetch("/api/customers/notifications")
      .then((r) => {
        if (r.status === 401) { router.replace("/customers"); return null; }
        return r.json() as Promise<{ notifications: Notification[] }>;
      })
      .then((d) => {
        if (d) setNotifications(d.notifications ?? []);
        setLoading(false);
      })
      .catch(() => router.replace("/customers"));
  }, [router]);

  useEffect(() => {
    fetchNotifications();
    // Get user email for realtime subscription
    fetch("/api/customers/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.user?.email) setUserEmail(d.user.email);
      })
      .catch(() => {});
  }, [fetchNotifications]);

  // Realtime subscription via portalClient
  useEffect(() => {
    if (!userEmail) return;

    const channel = portalClient
      .channel("crm_notifications_portal")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "crm_notifications",
          filter: `recipient_email=eq.${userEmail}`,
        },
        () => {
          // Refetch on any change
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      void portalClient.removeChannel(channel);
    };
  }, [userEmail, fetchNotifications]);

  const markAsRead = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    await fetch("/api/customers/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)
    );
  }, []);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (!unreadIds.length) return;
    setMarkingAll(true);
    await markAsRead(unreadIds);
    setMarkingAll(false);
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read_at) {
      await markAsRead([n.id]);
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const groups = groupNotifications(notifications);

  return (
    <div style={{ padding: "32px 40px", overflow: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff" }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  background: "#ef4444",
                  color: "#fff",
                  padding: "2px 10px",
                  borderRadius: 100,
                  verticalAlign: "middle",
                }}>
                  {unreadCount}
                </span>
              )}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              style={{
                padding: "8px 16px",
                borderRadius: 9,
                border: "1px solid rgba(99,102,241,0.3)",
                background: "rgba(99,102,241,0.1)",
                color: "#a5b4fc",
                fontSize: 13,
                fontWeight: 600,
                cursor: markingAll ? "not-allowed" : "pointer",
                opacity: markingAll ? 0.6 : 1,
              }}
            >
              {markingAll ? "Marking…" : "Mark all read"}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", paddingTop: 60 }}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div style={{
            padding: "64px 32px",
            textAlign: "center",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            color: "#64748b",
          }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🔔</p>
            <p style={{ margin: 0, fontSize: 14 }}>No notifications yet. We&apos;ll let you know when something happens.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {groups.today.length > 0 && (
              <NotifGroup label="Today" notifications={groups.today} onNotificationClick={handleNotificationClick} />
            )}
            {groups.thisWeek.length > 0 && (
              <NotifGroup label="This Week" notifications={groups.thisWeek} onNotificationClick={handleNotificationClick} />
            )}
            {groups.earlier.length > 0 && (
              <NotifGroup label="Earlier" notifications={groups.earlier} onNotificationClick={handleNotificationClick} />
            )}
          </div>
        )}
    </div>
  );
}

function NotifGroup({
  label,
  notifications,
  onNotificationClick,
}: {
  label: string;
  notifications: Notification[];
  onNotificationClick: (n: Notification) => void;
}) {
  return (
    <div>
      <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px" }}>
        {label}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.map((n) => (
          <NotifRow key={n.id} notification={n} onClick={() => onNotificationClick(n)} />
        ))}
      </div>
    </div>
  );
}

function NotifRow({ notification: n, onClick }: { notification: Notification; onClick: () => void }) {
  const isUnread = !n.read_at;

  const inner = (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "16px 20px",
        background: isUnread ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
        border: "1px solid",
        borderColor: isUnread ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${isUnread ? "#6366f1" : "transparent"}`,
        borderRadius: 12,
        cursor: "pointer",
        transition: "background 0.1s, border-color 0.1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = isUnread
          ? "rgba(99,102,241,0.1)"
          : "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = isUnread
          ? "rgba(99,102,241,0.06)"
          : "rgba(255,255,255,0.02)";
      }}
    >
      {/* Icon */}
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0,
      }}>
        {getIcon(n.type)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{
            margin: 0,
            fontSize: 14,
            fontWeight: isUnread ? 700 : 500,
            color: isUnread ? "#fff" : "#e2e8f0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {n.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 12 }}>
            {isUnread && (
              <span style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#6366f1",
                display: "inline-block",
              }} />
            )}
            <span style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap" }}>
              {timeAgo(n.created_at)}
            </span>
          </div>
        </div>
        {n.body && (
          <p style={{
            margin: 0,
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {n.body}
          </p>
        )}
      </div>
    </div>
  );

  // If it has a link, wrap in Link; otherwise just the div
  if (n.link) {
    return <Link href={n.link} style={{ textDecoration: "none" }} onClick={(e) => { e.preventDefault(); onClick(); }}>{inner}</Link>;
  }

  return inner;
}

