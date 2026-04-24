"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/api";
import { LeadCreate, VoltageLevel, Partner, SupplierSimulationResult } from "@/lib/types";

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

type Step = "form" | "success";

export default function LeadModal({ offer, partner, bill, onClose }: LeadModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    state: string;
    city: string;
    voltage_level: VoltageLevel;
  }>({
    name: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    voltage_level: "low",
  });

  const set = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: LeadCreate = {
        name: form.name,
        email: form.email,
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
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "success" ? (
          /* Success screen */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Solicitação enviada!
            </h2>
            <p className="text-slate-500 mb-2">
              {partner
                ? `A equipe da ${partner.name} entrará em contato em até 24h.`
                : "Um especialista entrará em contato em até 24h."}
            </p>
            <p className="text-sm text-slate-400 mb-6">
              Economia estimada:{" "}
              <strong className="text-green-700">
                R$ {offer.monthly_savings.toFixed(2)}/mês
              </strong>{" "}
              ·{" "}
              <strong className="text-green-700">
                R$ {offer.yearly_savings.toFixed(2)}/ano
              </strong>
            </p>
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          /* Form screen */
          <div className="p-6">
            {/* Offer summary bar */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">
                Oferta selecionada
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900">{offer.supplier.name}</span>
                {offer.monthly_savings > 0 && (
                  <span className="text-sm font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                    Economize R$ {offer.monthly_savings.toFixed(2)}/mês
                  </span>
                )}
              </div>
              {partner && (
                <p className="text-xs text-slate-500 mt-1">
                  Parceiro:{" "}
                  <a
                    href={partner.website ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-700 hover:underline"
                  >
                    {partner.name}
                  </a>
                </p>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              Quero esta oferta
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Preencha seus dados. Um especialista entra em contato gratuitamente.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="João da Silva"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="joao@email.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="(11) 9 0000-0000"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* State + City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="">Selecione</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="São Paulo"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Voltage level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nível de tensão <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {(Object.entries(VOLTAGE_LABELS) as [VoltageLevel, string][]).map(
                    ([value, label]) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 cursor-pointer transition-colors text-sm ${
                          form.voltage_level === value
                            ? "border-green-500 bg-green-50 text-green-900"
                            : "border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="voltage"
                          value={value}
                          checked={form.voltage_level === value}
                          onChange={() => set("voltage_level", value)}
                          className="accent-green-600"
                        />
                        {label}
                      </label>
                    )
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {loading ? "Enviando..." : "Quero esta oferta →"}
              </button>

              <p className="text-xs text-slate-400 text-center">
                Gratuito · Sem compromisso · Dados protegidos (LGPD)
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
