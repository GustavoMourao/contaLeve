"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadBillResponse } from "@/lib/types";
import { simulate } from "@/lib/api";

// ── Design-system tokens (mirrors marketing/src/styles/design-tokens.css) ──
const DS = {
  charcoal: "#191a23",
  offwhite: "#f3f3f3",
  white: "#ffffff",
  green: "#a3e635",
  greenVivid: "#c0ff2b",
  gray: "#888888",
  error: "#f02070",
  warning: "#ffd60a",
  info: "#0bc4ad",
  shadowSm: "3px 3px 0 #191a23",
  shadowMd: "5px 5px 0 #191a23",
  shadowAccent: "5px 5px 0 #a3e635",
  border: "2.5px solid #191a23",
} as const;

// ── Primitive: read-only info tile (extracted fields) ──
function InfoTile({
  label,
  value,
  extracted,
}: {
  label: string;
  value: string | null | undefined;
  extracted: boolean;
}) {
  const present = !!value;
  return (
    <div
      style={{
        border: DS.border,
        boxShadow: DS.shadowSm,
        background: present ? DS.white : DS.offwhite,
      }}
      className="rounded-[18px] p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DS.gray }}>
          {label}
        </span>
        {extracted && present ? (
          <span
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{ border: `2px solid ${DS.green}`, color: DS.charcoal, background: DS.green }}
          >
            Extraído
          </span>
        ) : (
          <span
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{ border: `2px solid ${DS.gray}`, color: DS.gray }}
          >
            Não detectado
          </span>
        )}
      </div>
      <p className="font-bold text-lg truncate" style={{ color: present ? DS.charcoal : DS.gray }}>
        {value || "—"}
      </p>
    </div>
  );
}

// ── Primitive: calculator stepper button ──
function StepBtn({
  label,
  onClick,
  accent = false,
}: {
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: DS.border,
        boxShadow: accent ? DS.shadowAccent : DS.shadowSm,
        background: accent ? DS.greenVivid : DS.white,
        color: DS.charcoal,
      }}
      className="w-12 h-12 rounded-[10px] text-xl font-bold transition-opacity hover:opacity-80 active:translate-y-px active:shadow-none select-none"
    >
      {label}
    </button>
  );
}

// ── Primitive: calculator display cell ──
function CalcField({
  id,
  label,
  unit,
  value,
  step,
  stepLarge,
  notFound,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: number;
  step: number;
  stepLarge: number;
  notFound: boolean;
  onChange: (v: number) => void;
}) {
  const dec = (by: number) => onChange(Math.max(0, parseFloat((value - by).toFixed(2))));
  const inc = (by: number) => onChange(parseFloat((value + by).toFixed(2)));

  return (
    <div
      style={{
        border: DS.border,
        boxShadow: DS.shadowMd,
        background: DS.white,
      }}
      className="rounded-[18px] p-6 flex flex-col gap-4"
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: DS.gray }}
        >
          {label}
        </span>
        {notFound && (
          <span
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{
              border: `2px solid ${DS.error}`,
              color: DS.error,
            }}
          >
            Não extraído
          </span>
        )}
      </div>

      {/* Display */}
      <div
        className="rounded-[10px] px-4 py-3 flex items-baseline gap-2"
        style={{ background: DS.offwhite, border: DS.border }}
      >
        <span className="text-sm font-semibold" style={{ color: DS.gray }}>
          {unit}
        </span>
        <input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-transparent text-3xl font-black text-right focus:outline-none min-w-0"
          style={{ color: DS.charcoal, fontFamily: "ui-monospace, monospace" }}
        />
      </div>

      {/* Stepper row */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex gap-2">
          <StepBtn label="−−" onClick={() => dec(stepLarge)} />
          <StepBtn label="−" onClick={() => dec(step)} />
        </div>
        <span className="text-xs font-semibold" style={{ color: DS.gray }}>
          ±{step} / ±{stepLarge}
        </span>
        <div className="flex gap-2">
          <StepBtn label="+" onClick={() => inc(step)} accent />
          <StepBtn label="++" onClick={() => inc(stepLarge)} accent />
        </div>
      </div>
    </div>
  );
}

// ── Page ──
export default function ReviewBillPage() {
  const router = useRouter();
  const [billData, setBillData] = useState<UploadBillResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [monthly_kwh, setMonthly_kwh] = useState<number>(0);
  const [total_cost, setTotal_cost] = useState<number>(0);

  useEffect(() => {
    const billJson = sessionStorage.getItem("billData");
    if (billJson) {
      const data = JSON.parse(billJson);
      setBillData(data);
      setMonthly_kwh(data.bill.monthly_kwh || 0);
      setTotal_cost(data.bill.total_cost || 0);
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (monthly_kwh <= 0) { setError("Consumo deve ser maior que 0"); return; }
    if (total_cost <= 0)   { setError("Custo deve ser maior que 0");   return; }
    setSubmitting(true);
    try {
      const simulation = await simulate(monthly_kwh, total_cost);
      sessionStorage.setItem("bill", JSON.stringify({ ...billData?.bill, monthly_kwh, total_cost }));
      sessionStorage.setItem("simulation", JSON.stringify(simulation));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: DS.offwhite }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: DS.charcoal, borderTopColor: "transparent" }}
          />
          <p className="font-semibold" style={{ color: DS.gray }}>Carregando…</p>
        </div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: DS.offwhite }}>
        <div className="text-center p-8">
          <p className="text-lg font-semibold mb-4" style={{ color: DS.error }}>
            Nenhum dado de conta encontrado.
          </p>
          <button
            onClick={() => router.push("/")}
            style={{ border: DS.border, boxShadow: DS.shadowSm, background: DS.greenVivid, color: DS.charcoal }}
            className="px-6 py-2.5 rounded-[10px] font-bold hover:opacity-90 transition-opacity"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: DS.offwhite }}>
      <div className="max-w-xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: DS.gray }}
          >
            Verificação de dados
          </p>
          <h1
            className="text-4xl font-black leading-tight tracking-tight"
            style={{ color: DS.charcoal }}
          >
            Confirme os<br />valores da conta
          </h1>
        </div>

        {/* ── Error alert ── */}
        {error && (
          <div
            className="rounded-[10px] p-4 mb-6 flex items-start gap-3"
            style={{ border: `2.5px solid ${DS.error}`, boxShadow: `4px 4px 0 ${DS.error}`, background: DS.white }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.error} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="font-semibold text-sm" style={{ color: DS.error }}>{error}</p>
          </div>
        )}

        {/* ── Calculator fields ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Extracted read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <InfoTile
              label="Distribuidora"
              value={billData.bill.utility}
              extracted={!!billData.bill.utility}
            />
            <InfoTile
              label="UC / Instalação"
              value={billData.bill.consumer_unit}
              extracted={!!billData.bill.consumer_unit}
            />
          </div>

          {billData.bill.tariff && (
            <div
              className="rounded-[10px] px-5 py-3 flex items-center justify-between"
              style={{ border: `2.5px solid ${DS.green}`, background: DS.white }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DS.gray }}>Tarifa detectada</span>
              <span className="font-black" style={{ color: DS.charcoal }}>
                R$ {billData.bill.tariff.toFixed(4)}<span className="font-normal text-sm" style={{ color: DS.gray }}> /kWh</span>
              </span>
            </div>
          )}

          <CalcField
            id="kwh"
            label="Consumo mensal"
            unit="kWh"
            value={monthly_kwh}
            step={10}
            stepLarge={50}
            notFound={billData.kwh_extraction_method === "not_found"}
            onChange={setMonthly_kwh}
          />

          <CalcField
            id="cost"
            label="Custo total"
            unit="R$"
            value={total_cost}
            step={10}
            stepLarge={50}
            notFound={billData.cost_extraction_method === "not_found"}
            onChange={setTotal_cost}
          />

          {/* ── Tariff result preview ── */}
          {monthly_kwh > 0 && total_cost > 0 && (
            <div
              className="rounded-[18px] px-6 py-4 flex items-center justify-between"
              style={{ border: DS.border, boxShadow: DS.shadowAccent, background: DS.charcoal }}
            >
              <p className="text-sm font-bold" style={{ color: DS.green }}>
                Tarifa implícita
              </p>
              <p className="text-xl font-black" style={{ color: DS.greenVivid }}>
                R$ {(total_cost / monthly_kwh).toFixed(4)}<span className="text-sm font-semibold" style={{ color: DS.green }}>/kWh</span>
              </p>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              style={{ border: `2.5px dashed ${DS.charcoal}`, color: DS.charcoal, background: "transparent" }}
              className="flex-1 py-3 rounded-[10px] font-bold hover:bg-[#e8e8e8] transition-colors"
            >
              ← Voltar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                border: DS.border,
                boxShadow: submitting ? "none" : DS.shadowSm,
                background: DS.greenVivid,
                color: DS.charcoal,
              }}
              className="flex-1 py-3 rounded-[10px] font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Processando…" : "Simular economia →"}
            </button>
          </div>
        </form>

        {/* ── Tip ── */}
        <div
          className="mt-8 rounded-[10px] p-4 flex gap-3 items-start"
          style={{ border: `2.5px solid ${DS.info}`, boxShadow: `4px 4px 0 ${DS.info}`, background: DS.white }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.info} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm" style={{ color: DS.charcoal }}>
            <strong>Dica:</strong> O consumo aparece como <em>"Total Apurado"</em> e o custo como <em>"Total a Pagar"</em> na sua conta.
            Use os botões <strong>+</strong> / <strong>−</strong> para ajuste fino.
          </p>
        </div>

      </div>
    </div>
  );
}
