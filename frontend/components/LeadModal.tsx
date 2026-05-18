"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { submitLead } from "@/lib/api";
import { LeadCreate, VoltageLevel, Partner, SupplierSimulationResult } from "@/lib/types";

// ── Design-system tokens ──
const DS = {
  charcoal: "#191a23",
  offwhite: "#f3f3f3",
  white: "#ffffff",
  green: "#a3e635",
  greenVivid: "#c0ff2b",
  gray: "#888888",
  error: "#f02070",
  shadowSm: "3px 3px 0 #191a23",
  shadowMd: "5px 5px 0 #191a23",
  shadowAccent: "5px 5px 0 #a3e635",
  border: "2.5px solid #191a23",
} as const;

interface LeadModalProps {
  offer: SupplierSimulationResult;
  partner: Partner | null;
  bill: { monthly_kwh: number; total_cost: number; utility: string | null };
  onClose: () => void;
}

const STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

const VOLTAGE_LABELS: Record<VoltageLevel, string> = {
  low: "Baixa tensão — residencial / pequeno comércio",
  medium: "Média tensão — ABRADEE grupo A (empresas)",
  high: "Alta tensão — grande indústria",
};

// ── Field primitive ──
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: DS.gray }}>
        {label}{required && <span style={{ color: DS.error }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-[10px] px-4 py-2.5 text-sm font-semibold focus:outline-none transition-shadow";
const inputStyle = { border: DS.border, background: DS.white, color: DS.charcoal };

type Step = "form" | "success";

export default function LeadModal({ offer, partner, bill, onClose }: LeadModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string; email: string; phone: string;
    state: string; city: string; voltage_level: VoltageLevel;
  }>({ name: "", email: "", phone: "", state: "", city: "", voltage_level: "low" });

  const set = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: LeadCreate = {
        name: form.name, email: form.email,
        phone: form.phone || undefined,
        state: form.state || undefined,
        city: form.city || undefined,
        monthly_kwh: bill.monthly_kwh,
        current_cost: bill.total_cost,
        utility: bill.utility ?? undefined,
        voltage_level: form.voltage_level,
        estimated_savings: offer.monthly_savings > 0 ? offer.monthly_savings : undefined,
        partner_id: partner?.id ?? undefined,
      };
      await submitLead(payload);
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(25,26,35,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto relative"
        style={{ border: DS.border, boxShadow: DS.shadowAccent, background: DS.white, borderRadius: 18 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[8px] font-bold text-lg hover:opacity-70 transition-opacity"
          style={{ border: DS.border, color: DS.charcoal }}
          aria-label="Fechar"
        >
          ×
        </button>

        {step === "success" ? (
          /* ── Success screen ── */
          <div className="p-8 text-center">
            <div
              className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-6"
              style={{ border: DS.border, boxShadow: DS.shadowAccent, background: DS.greenVivid }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={DS.charcoal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: DS.charcoal }}>
              Solicitação enviada!
            </h2>
            <p className="text-sm mb-2" style={{ color: DS.gray }}>
              {partner
                ? `A equipe da ${partner.name} entrará em contato em até 24h.`
                : "Um especialista entrará em contato em até 24h."}
            </p>
            <div
              className="rounded-[10px] px-5 py-3 my-5 flex items-center justify-between"
              style={{ border: DS.border, background: DS.offwhite }}
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DS.gray }}>
                Economia estimada
              </span>
              <span className="font-black" style={{ color: DS.charcoal }}>
                R$ {offer.monthly_savings.toFixed(2)}<span className="font-normal text-sm" style={{ color: DS.gray }}>/mês</span>
              </span>
            </div>
            <button
              onClick={onClose}
              style={{ border: DS.border, boxShadow: DS.shadowSm, background: DS.greenVivid, color: DS.charcoal }}
              className="w-full py-3 rounded-[10px] font-bold hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        ) : (
          /* ── Form screen ── */
          <div className="p-6">
            {/* Offer strip */}
            <div
              className="rounded-[10px] px-5 py-3 mb-6 flex items-center justify-between"
              style={{ border: `2.5px solid ${DS.green}`, background: DS.offwhite }}
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DS.gray }}>
                Oferta selecionada
              </span>
              <div className="text-right">
                <p className="font-bold text-sm" style={{ color: DS.charcoal }}>{offer.supplier.name}</p>
                {offer.monthly_savings > 0 && (
                  <p className="text-xs font-semibold" style={{ color: DS.green }}>
                    Economize R$ {offer.monthly_savings.toFixed(2)}/mês
                  </p>
                )}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: DS.gray }}>
                Quero esta oferta
              </p>
              <h2 className="text-2xl font-black" style={{ color: DS.charcoal }}>
                Seus dados de contato
              </h2>
              <p className="text-sm mt-1" style={{ color: DS.gray }}>
                Gratuito · sem compromisso · um especialista entra em contato.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Nome completo" required>
                <input required type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="João da Silva" className={inputCls} style={inputStyle} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="E-mail" required>
                  <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    placeholder="joao@email.com" className={inputCls} style={inputStyle} />
                </Field>
                <Field label="WhatsApp">
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                    placeholder="(11) 9 0000-0000" className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Estado">
                  <select value={form.state} onChange={(e) => set("state", e.target.value)}
                    className={inputCls} style={{ ...inputStyle, appearance: "auto" }}>
                    <option value="">Selecione</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Cidade">
                  <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)}
                    placeholder="São Paulo" className={inputCls} style={inputStyle} />
                </Field>
              </div>

              <Field label="Nível de tensão" required>
                <div className="flex flex-col gap-2 mt-1">
                  {(Object.entries(VOLTAGE_LABELS) as [VoltageLevel, string][]).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex items-center gap-3 rounded-[10px] px-4 py-2.5 cursor-pointer text-sm font-semibold transition-colors"
                      style={{
                        border: form.voltage_level === value ? `2.5px solid ${DS.charcoal}` : `2.5px solid #ddd`,
                        background: form.voltage_level === value ? DS.greenVivid : DS.white,
                        color: DS.charcoal,
                      }}
                    >
                      <input type="radio" name="voltage" value={value} checked={form.voltage_level === value}
                        onChange={() => set("voltage_level", value)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </Field>

              {error && (
                <div
                  className="rounded-[10px] p-3 flex items-start gap-2"
                  style={{ border: `2.5px solid ${DS.error}`, background: DS.white }}
                >
                  <p className="text-sm font-semibold" style={{ color: DS.error }}>⚠️ {error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ border: DS.border, boxShadow: loading ? "none" : DS.shadowSm, background: DS.greenVivid, color: DS.charcoal }}
                className="py-3 rounded-[10px] font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity mt-1"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Enviando…" : "Quero esta oferta →"}
              </button>

              <p className="text-xs text-center" style={{ color: DS.gray }}>
                Gratuito · Sem compromisso · Dados protegidos (LGPD)
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}