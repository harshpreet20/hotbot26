"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  config: Record<string, unknown>;
  active: boolean;
  last_run?: string | null;
  created_at: string;
}

const TRIGGER_OPTIONS = [
  { value: "invoice_overdue",        label: "Invoice Overdue" },
  { value: "ticket_created",         label: "Ticket Created" },
  { value: "ticket_status_changed",  label: "Ticket Status Changed" },
  { value: "lead_won",               label: "Lead Won" },
  { value: "lead_lost",              label: "Lead Lost" },
  { value: "payment_received",       label: "Payment Received" },
  { value: "project_milestone",      label: "Project Milestone" },
  { value: "client_created",         label: "Client Onboarded" },
  { value: "schedule",               label: "Schedule (cron)" },
];

const ACTION_OPTIONS = [
  { value: "send_email",     label: "Send Email" },
  { value: "send_whatsapp",  label: "Send WhatsApp" },
  { value: "create_task",    label: "Create Task" },
  { value: "update_status",  label: "Update Status" },
  { value: "webhook",        label: "Webhook" },
];

const TRIGGER_LABEL: Record<string, string> = Object.fromEntries(TRIGGER_OPTIONS.map((t) => [t.value, t.label]));
const ACTION_LABEL: Record<string, string>  = Object.fromEntries(ACTION_OPTIONS.map((a) => [a.value, a.label]));

const TRIGGER_CHIP_COLOR: Record<string, string> = {
  invoice_overdue:       "#f59e0b",
  ticket_created:        "#3b82f6",
  ticket_status_changed: "#8b5cf6",
  lead_won:              "#22c55e",
  lead_lost:             "#ef4444",
  payment_received:      "#10b981",
  project_milestone:     "#06b6d4",
  client_created:        "#a78bfa",
  schedule:              "#64748b",
};

const PRESET_AUTOMATIONS = [
  {
    id: "preset-1",
    name: "Invoice Overdue Reminder",
    trigger: "invoice_overdue",
    action: "send_email",
    description: "Send email reminder when invoice is 3+ days overdue",
  },
  {
    id: "preset-2",
    name: "Welcome New Client",
    trigger: "client_created",
    action: "send_email",
    description: "Send a welcome email when a new client is added",
  },
  {
    id: "preset-3",
    name: "Ticket SLA Breach",
    trigger: "ticket_created",
    action: "send_email",
    description: "Send escalation email when ticket is open for 48+ hours",
  },
  {
    id: "preset-4",
    name: "Payment Thank You",
    trigger: "payment_received",
    action: "send_email",
    description: "Send a thank you email when an invoice is paid",
  },
  {
    id: "preset-5",
    name: "Project Milestone Alert",
    trigger: "project_milestone",
    action: "send_email",
    description: "Notify client via email when a project milestone is reached",
  },
];

export default function AutomationsPage() {
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState<string | null>(null);
  const [showModal, setShowModal]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [enablingPreset, setEnablingPreset] = useState<string | null>(null);

  // Modal form
  const [form, setForm] = useState({
    name:    "",
    trigger: "invoice_overdue",
    action:  "send_email",
    active:  true,
    // Action config fields
    email_template: "",
    phone_number:   "",
    webhook_url:    "",
    task_title:     "",
    cron_schedule:  "",
    // Trigger condition fields
    overdue_days:   "3",
    ticket_open_hours: "48",
  });

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { router.replace("/enter/backdrop"); return; }
    fetch("/api/dashboard/automations", { headers: { Authorization: `Bearer ${secret}` } })
      .then((r) => {
        if (r.status === 401) {
          ["backdrop_secret","backdrop_role","backdrop_username"].forEach((k)=>sessionStorage.removeItem(k));
          router.replace("/enter/backdrop");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setAutomations((d as { automations: Automation[] }).automations ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function toggleActive(id: string, active: boolean) {
    const secret = getSecret();
    setToggling(id);
    try {
      const res = await fetch("/api/dashboard/automations", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      if (res.ok) {
        const data = await res.json() as { automation: Automation };
        setAutomations((prev) => prev.map((a) => a.id === id ? data.automation : a));
      }
    } finally {
      setToggling(null);
    }
  }

  async function deleteAutomation(id: string) {
    if (!confirm("Delete this automation?")) return;
    const secret = getSecret();
    const res = await fetch(`/api/dashboard/automations?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (res.ok) setAutomations((prev) => prev.filter((a) => a.id !== id));
  }

  async function enablePreset(preset: typeof PRESET_AUTOMATIONS[number]) {
    setEnablingPreset(preset.id);
    const secret = getSecret();
    try {
      const res = await fetch("/api/dashboard/automations", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    preset.name,
          trigger: preset.trigger,
          action:  preset.action,
          config:  {},
          active:  true,
        }),
      });
      const data = await res.json() as { automation?: Automation; error?: string };
      if (!res.ok) { alert(data.error ?? "Failed"); return; }
      if (data.automation) setAutomations((prev) => [data.automation!, ...prev]);
    } catch {
      alert("Failed to enable preset");
    } finally {
      setEnablingPreset(null);
    }
  }

  function buildConfig(): Record<string, unknown> {
    const config: Record<string, unknown> = {};
    if (form.action === "send_email" && form.email_template) config.email_template = form.email_template;
    if (form.action === "send_whatsapp" && form.phone_number)  config.phone_number  = form.phone_number;
    if (form.action === "webhook" && form.webhook_url)          config.webhook_url   = form.webhook_url;
    if (form.action === "create_task" && form.task_title)       config.task_title    = form.task_title;
    if (form.trigger === "invoice_overdue")  config.overdue_days      = Number(form.overdue_days);
    if (form.trigger === "ticket_created")   config.ticket_open_hours = Number(form.ticket_open_hours);
    if (form.trigger === "schedule")         config.cron_schedule     = form.cron_schedule;
    return config;
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const secret = getSecret();
    try {
      const res = await fetch("/api/dashboard/automations", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    form.name,
          trigger: form.trigger,
          action:  form.action,
          config:  buildConfig(),
          active:  form.active,
        }),
      });
      const data = await res.json() as { automation?: Automation; error?: string };
      if (!res.ok) { alert(data.error ?? "Failed"); return; }
      if (data.automation) setAutomations((prev) => [data.automation!, ...prev]);
      setShowModal(false);
      setForm({ name: "", trigger: "invoice_overdue", action: "send_email", active: true, email_template: "", phone_number: "", webhook_url: "", task_title: "", cron_schedule: "", overdue_days: "3", ticket_open_hours: "48" });
    } catch {
      alert("Failed to create automation");
    } finally {
      setSubmitting(false);
    }
  }

  const showPresets = !loading && automations.length === 0;
  const enabledPresetNames = new Set(automations.map((a) => a.name));

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-semibold">Automations</h1>
            <p className="text-slate-500 text-xs mt-0.5">Configure automated workflows and triggers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: "rgba(99,102,241,0.8)" }}
          >
            + New Automation
          </button>
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : (
            <>
              {/* Presets — shown when empty OR as a suggestion section */}
              {(showPresets || automations.length > 0) && (
                <div className="mb-8">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    {showPresets ? "Suggested Automations — Enable to get started" : "Quick Templates"}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {PRESET_AUTOMATIONS.filter((p) => !enabledPresetNames.has(p.name)).map((preset) => (
                      <div
                        key={preset.id}
                        className="rounded-2xl p-4 flex flex-col gap-3"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white text-sm font-medium leading-snug">{preset.name}</p>
                          <TriggerChip trigger={preset.trigger} />
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">{preset.description}</p>
                        <div className="flex items-center gap-2">
                          <ActionChip action={preset.action} />
                          <div className="flex-1" />
                          <button
                            onClick={() => enablePreset(preset)}
                            disabled={enablingPreset === preset.id}
                            className="px-3 py-1 rounded-lg text-xs font-medium text-white disabled:opacity-60 transition-opacity"
                            style={{ background: "rgba(99,102,241,0.6)", border: "1px solid rgba(99,102,241,0.4)" }}
                          >
                            {enablingPreset === preset.id ? "Enabling…" : "Enable"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active automations grid */}
              {automations.length > 0 && (
                <>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Your Automations</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {automations.map((auto) => (
                      <AutomationCard
                        key={auto.id}
                        automation={auto}
                        toggling={toggling === auto.id}
                        onToggle={(active) => toggleActive(auto.id, active)}
                        onDelete={() => deleteAutomation(auto.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Automation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh" }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h2 className="text-white font-semibold">New Automation</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">×</button>
            </div>

            <form onSubmit={submitCreate} className="overflow-y-auto flex-1 p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Automation Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Invoice Overdue Reminder"
                  className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Trigger</label>
                <select
                  value={form.trigger}
                  onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {TRIGGER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Trigger-specific conditions */}
              {form.trigger === "invoice_overdue" && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Days overdue before triggering</label>
                  <input
                    type="number"
                    min="1"
                    value={form.overdue_days}
                    onChange={(e) => setForm((f) => ({ ...f, overdue_days: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}
              {form.trigger === "ticket_created" && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Hours open before triggering (SLA threshold)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.ticket_open_hours}
                    onChange={(e) => setForm((f) => ({ ...f, ticket_open_hours: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}
              {form.trigger === "schedule" && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Cron schedule <span className="text-slate-600">(e.g. 0 9 * * 1 for every Monday 9am)</span></label>
                  <input
                    type="text"
                    value={form.cron_schedule}
                    onChange={(e) => setForm((f) => ({ ...f, cron_schedule: e.target.value }))}
                    placeholder="0 9 * * 1"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none font-mono"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Action</label>
                <select
                  value={form.action}
                  onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {ACTION_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>

              {/* Action-specific config */}
              {form.action === "send_email" && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Email template / message</label>
                  <textarea
                    value={form.email_template}
                    onChange={(e) => setForm((f) => ({ ...f, email_template: e.target.value }))}
                    rows={3}
                    placeholder="Hi {{client_name}}, your invoice is overdue…"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}
              {form.action === "send_whatsapp" && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Phone number (with country code)</label>
                  <input
                    type="text"
                    value={form.phone_number}
                    onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}
              {form.action === "webhook" && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Webhook URL</label>
                  <input
                    type="url"
                    value={form.webhook_url}
                    onChange={(e) => setForm((f) => ({ ...f, webhook_url: e.target.value }))}
                    placeholder="https://hooks.example.com/..."
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}
              {form.action === "create_task" && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Task title template</label>
                  <input
                    type="text"
                    value={form.task_title}
                    onChange={(e) => setForm((f) => ({ ...f, task_title: e.target.value }))}
                    placeholder="Follow up with {{client_name}}"
                    className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-500">Active on creation</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className="relative w-10 h-5 rounded-full transition-colors"
                  style={{ background: form.active ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.1)" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ transform: form.active ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
                <span className="text-xs" style={{ color: form.active ? "#818cf8" : "#64748b" }}>
                  {form.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: "rgba(99,102,241,0.8)" }}
                >
                  {submitting ? "Creating…" : "Create Automation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function TriggerChip({ trigger }: { trigger: string }) {
  const color = TRIGGER_CHIP_COLOR[trigger] ?? "#64748b";
  return (
    <span
      className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {TRIGGER_LABEL[trigger] ?? trigger}
    </span>
  );
}

function ActionChip({ action }: { action: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {ACTION_LABEL[action] ?? action}
    </span>
  );
}

function ToggleSwitch({ active, disabled, onChange }: { active: boolean; disabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!active)}
      className="relative w-10 h-5 rounded-full transition-colors disabled:opacity-50"
      style={{ background: active ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.1)" }}
      title={active ? "Click to deactivate" : "Click to activate"}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: active ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

function AutomationCard({
  automation,
  toggling,
  onToggle,
  onDelete,
}: {
  automation: Automation;
  toggling: boolean;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: automation.active ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.01)",
        border: `1px solid ${automation.active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-white font-semibold text-sm leading-snug">{automation.name}</p>
        <ToggleSwitch active={automation.active} disabled={toggling} onChange={onToggle} />
      </div>

      {/* Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <TriggerChip trigger={automation.trigger} />
        <span className="text-slate-600 text-xs">→</span>
        <ActionChip action={automation.action} />
      </div>

      {/* Status + last run */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: automation.active ? "#22c55e" : "#64748b" }}>
          {automation.active ? "Active" : "Inactive"}
        </span>
        {automation.last_run && (
          <span className="text-xs text-slate-600">
            Last run: {new Date(automation.last_run).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
