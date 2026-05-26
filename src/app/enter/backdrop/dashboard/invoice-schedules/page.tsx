"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getSecret() {
  return typeof window !== "undefined" ? sessionStorage.getItem("backdrop_secret") || "" : "";
}

function authHeaders(extra: Record<string, string> = {}) {
  return { Authorization: `Bearer ${getSecret()}`, "Content-Type": "application/json", ...extra };
}

type Frequency = "weekly" | "monthly" | "quarterly" | "annually";

type Schedule = {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  frequency: Frequency;
  start_date: string;
  end_date: string | null;
  next_invoice_date: string;
  invoices_generated: number;
  active: boolean;
  currency: string;
  created_at: string;
};

type ScheduleFormData = {
  name: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  frequency: Frequency;
  start_date: string;
  end_date: string;
  payment_terms_days: string;
  currency: string;
  notes: string;
  terms: string;
};

const EMPTY_FORM: ScheduleFormData = {
  name: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  client_company: "",
  frequency: "monthly",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  payment_terms_days: "30",
  currency: "INR",
  notes: "",
  terms: "",
};

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const FREQ_COLORS: Record<Frequency, string> = {
  weekly:    "#3b82f6",
  monthly:   "#8b5cf6",
  quarterly: "#f59e0b",
  annually:  "#22c55e",
};

export default function InvoiceSchedulesPage() {
  const router  = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState<ScheduleFormData>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState<string | null>(null);

  useEffect(() => {
    const secret = getSecret();
    if (!secret) { setTimeout(() => { if (!getSecret()) router.replace("/enter/backdrop"); }, 200); return; }
    fetch("/api/dashboard/invoice-schedules", { headers: authHeaders() })
      .then((r) => {
        if (r.status === 401) { router.replace("/enter/backdrop"); return null; }
        return r.json();
      })
      .then((d) => { if (d) setSchedules((d as { schedules: Schedule[] }).schedules); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  function setField(key: keyof ScheduleFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/invoice-schedules", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name:               form.name,
          client_name:        form.client_name,
          client_email:       form.client_email,
          client_phone:       form.client_phone || null,
          client_company:     form.client_company || null,
          frequency:          form.frequency,
          start_date:         form.start_date,
          end_date:           form.end_date || null,
          payment_terms_days: parseInt(form.payment_terms_days) || 30,
          currency:           form.currency,
          notes:              form.notes || null,
          terms:              form.terms || null,
          line_items:         [],
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error: string };
        alert(d.error ?? "Failed to create schedule");
        return;
      }
      const d = await res.json() as { schedule: Schedule };
      setSchedules((prev) => [d.schedule, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
      alert("Failed to create schedule");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(sch: Schedule) {
    setToggling(sch.id);
    try {
      if (sch.active) {
        // Deactivate via DELETE
        await fetch(`/api/dashboard/invoice-schedules?id=${sch.id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        setSchedules((prev) => prev.map((s) => s.id === sch.id ? { ...s, active: false } : s));
      } else {
        // Reactivate via PATCH
        const res = await fetch("/api/dashboard/invoice-schedules", {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ id: sch.id, active: true }),
        });
        if (res.ok) {
          const d = await res.json() as { schedule: Schedule };
          setSchedules((prev) => prev.map((s) => s.id === sch.id ? d.schedule : s));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-full">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-4">
            <Link href="/enter/backdrop/dashboard/invoices" className="text-slate-500 hover:text-white text-sm transition-colors">
              ← Invoices
            </Link>
            <div>
              <h1 className="text-white font-semibold">Recurring Schedules</h1>
              <p className="text-slate-500 text-xs mt-0.5">{schedules.length} schedule(s)</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: "rgba(99,102,241,0.8)" }}
          >
            + New Schedule
          </button>
        </header>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="text-slate-500 text-sm py-20 text-center">Loading…</div>
          ) : schedules.length === 0 ? (
            <div className="text-slate-500 text-sm py-20 text-center">No schedules yet. Create your first recurring invoice.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {["Name", "Client", "Frequency", "Next Invoice", "Generated", "Active"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs text-slate-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sch) => (
                    <tr key={sch.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="text-white font-medium">{sch.name}</p>
                        <p className="text-slate-500 text-xs">{sch.currency}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <p className="text-white text-sm">{sch.client_name}</p>
                        <p className="text-slate-500 text-xs">{sch.client_email}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
                          style={{ background: `${FREQ_COLORS[sch.frequency]}18`, color: FREQ_COLORS[sch.frequency], border: `1px solid ${FREQ_COLORS[sch.frequency]}40` }}>
                          {sch.frequency}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs whitespace-nowrap">
                        {fmtDate(sch.next_invoice_date)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-white font-bold">{sch.invoices_generated ?? 0}</span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleActive(sch)}
                          disabled={toggling === sch.id}
                          className="relative w-10 h-5 rounded-full transition-colors disabled:opacity-50"
                          style={{ background: sch.active ? "#22c55e" : "rgba(255,255,255,0.1)" }}
                        >
                          <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                            style={{ left: sch.active ? "calc(100% - 18px)" : "2px" }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h2 className="text-white font-semibold">New Recurring Schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <FormField label="Schedule Name *" value={form.name} onChange={(v) => setField("name", v)} placeholder="Monthly Retainer" required />
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Client Name *" value={form.client_name} onChange={(v) => setField("client_name", v)} required />
                <FormField label="Client Email *" type="email" value={form.client_email} onChange={(v) => setField("client_email", v)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Client Phone" value={form.client_phone} onChange={(v) => setField("client_phone", v)} />
                <FormField label="Client Company" value={form.client_company} onChange={(v) => setField("client_company", v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Frequency *</label>
                  <select value={form.frequency} onChange={(e) => setField("frequency", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => setField("currency", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Start Date *" type="date" value={form.start_date} onChange={(v) => setField("start_date", v)} required />
                <FormField label="End Date" type="date" value={form.end_date} onChange={(v) => setField("end_date", v)} />
              </div>
              <FormField label="Payment Terms (days)" type="number" value={form.payment_terms_days} onChange={(v) => setField("payment_terms_days", v)} />
              <FormField label="Notes" value={form.notes} onChange={(v) => setField("notes", v)} />
              <FormField label="Payment Terms Text" value={form.terms} onChange={(v) => setField("terms", v)} />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "rgba(99,102,241,0.8)" }}>
                  {saving ? "Creating…" : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function FormField({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      />
    </div>
  );
}
