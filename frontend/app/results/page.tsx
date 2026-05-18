"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bill, SimulationResponse } from "@/lib/types";
import LeadModal from "@/components/LeadModal";

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

// ── Primitive: stat tile ──
function StatTile({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        border: DS.border,
        boxShadow: accent ? DS.shadowAccent : DS.shadowSm,
        background: accent ? DS.charcoal : DS.white,
      }}
      className="rounded-[18px] p-5 flex flex-col gap-1"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent ? DS.green : DS.gray }}>
        {label}
      </p>
      <p className="text-3xl font-black leading-tight" style={{ color: accent ? DS.greenVivid : DS.charcoal }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs font-semibold" style={{ color: accent ? DS.green : DS.gray }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Primitive: step header ──
function StepHeader({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-black shrink-0"
        style={{ border: DS.border, boxShadow: DS.shadowSm, background: DS.greenVivid, color: DS.charcoal }}
      >
        {n}
      </div>
      <h2 className="text-xl font-black" style={{ color: DS.charcoal }}>
        {title}
      </h2>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLead, setShowLead] = useState(false);

  useEffect(() => {
    const billData = sessionStorage.getItem("bill");
    const simData = sessionStorage.getItem("simulation");
    if (billData && simData) {
      setBill(JSON.parse(billData));
      setSimulation(JSON.parse(simData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: DS.offwhite }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: DS.charcoal, borderTopColor: "transparent" }}
          />
          <p className="font-semibold" style={{ color: DS.gray }}>Calculando resultados…</p>
        </div>
      </div>
    );
  }

  if (!bill || !simulation) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: DS.offwhite }}>
        <div className="text-center p-8">
          <p className="text-lg font-semibold mb-4" style={{ color: DS.error }}>
            Nenhum resultado encontrado.
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

  const impliedTariff = bill.monthly_kwh > 0 ? bill.total_cost / bill.monthly_kwh : null;

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: DS.offwhite }}>
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: DS.gray }}>
            Análise concluída
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight" style={{ color: DS.charcoal }}>
            Sua economia<br />está calculada
          </h1>
        </div>

        {/* ── Step 1: Dados da conta ── */}
        <div
          className="rounded-[18px] p-7 mb-5"
          style={{ border: DS.border, boxShadow: DS.shadowMd, background: DS.white }}
        >
          <StepHeader n="01" title="Dados da sua conta" />
          <div className="grid grid-cols-2 gap-4">
            <StatTile label="Consumo mensal" value={`${bill.monthly_kwh.toFixed(0)}`} sub="kWh / mês" />
            <StatTile label="Custo atual" value={`R$ ${bill.total_cost.toFixed(2)}`} sub="por mês" />
            {bill.utility && (
              <div
                className="col-span-2 rounded-[10px] px-5 py-3 flex items-center justify-between"
                style={{ background: DS.offwhite, border: `2.5px solid ${DS.charcoal}` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DS.gray }}>Distribuidora</span>
                <span className="font-bold" style={{ color: DS.charcoal }}>{bill.utility}</span>
              </div>
            )}
            {bill.consumer_unit && (
              <div
                className="col-span-2 rounded-[10px] px-5 py-3 flex items-center justify-between"
                style={{ background: DS.offwhite, border: `2.5px solid ${DS.charcoal}` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DS.gray }}>UC / Instalação</span>
                <span className="font-bold" style={{ color: DS.charcoal }}>{bill.consumer_unit}</span>
              </div>
            )}
            {impliedTariff && (
              <div
                className="col-span-2 rounded-[10px] px-5 py-3 flex items-center justify-between"
                style={{ background: DS.offwhite, border: `2.5px solid ${DS.charcoal}` }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DS.gray }}>Tarifa implícita</span>
                <span className="font-bold font-mono" style={{ color: DS.charcoal }}>
                  R$ {impliedTariff.toFixed(4)}<span className="font-normal text-sm" style={{ color: DS.gray }}>/kWh</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Step 2: Análise ── */}
        <div
          className="rounded-[18px] p-7 mb-5"
          style={{ border: DS.border, boxShadow: DS.shadowMd, background: DS.white }}
        >
          <StepHeader n="02" title="Nossa análise" />
          <div className="flex flex-col gap-3">
            <div
              className="rounded-[10px] p-4 flex items-start gap-3"
              style={{ border: `2.5px solid ${DS.green}`, boxShadow: `4px 4px 0 ${DS.green}`, background: DS.white }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d7a00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: DS.charcoal }}>
                Valores confirmados. Dados prontos para simulação.
              </p>
            </div>
            <div
              className="rounded-[10px] p-4 flex items-start gap-3"
              style={{ border: `2.5px solid ${DS.info}`, boxShadow: `4px 4px 0 ${DS.info}`, background: DS.white }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DS.info} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: DS.charcoal }}>
                Comparamos com <strong>{simulation.all_options.length} fornecedores</strong> disponíveis para seu perfil.
              </p>
            </div>
          </div>
        </div>

        {/* ── Step 3: Economias ── */}
        <div
          className="rounded-[18px] p-7 mb-5"
          style={{ border: DS.border, boxShadow: DS.shadowAccent, background: DS.charcoal }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-black shrink-0"
              style={{ border: `2.5px solid ${DS.greenVivid}`, background: DS.greenVivid, color: DS.charcoal }}
            >
              03
            </div>
            <h2 className="text-xl font-black" style={{ color: DS.green }}>
              Economias estimadas
            </h2>
          </div>

          {/* Savings range */}
          <div
            className="rounded-[18px] p-6 mb-4 text-center"
            style={{ border: `2.5px solid ${DS.greenVivid}`, background: "rgba(192,255,43,0.10)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: DS.green }}>
              Economia estimada
            </p>
            <p className="text-6xl font-black" style={{ color: DS.greenVivid }}>
              {simulation.estimated_savings_min.toFixed(0)}–{simulation.estimated_savings_max.toFixed(0)}%
            </p>
            <p className="text-xs font-semibold mt-2" style={{ color: DS.green }}>por mês</p>
          </div>

          {/* Best option breakdown */}
          {simulation.best_option && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                className="rounded-[18px] p-5"
                style={{ border: `2.5px solid ${DS.green}`, background: "rgba(163,230,53,0.08)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: DS.green }}>
                  Economia / mês
                </p>
                <p className="text-2xl font-black" style={{ color: DS.greenVivid }}>
                  R$ {simulation.best_option.monthly_savings.toFixed(2)}
                </p>
                <p className="text-xs mt-1" style={{ color: DS.green }}>
                  vs. custo atual de R$ {bill.total_cost.toFixed(2)}
                </p>
              </div>
              <div
                className="rounded-[18px] p-5"
                style={{ border: `2.5px solid ${DS.green}`, background: "rgba(163,230,53,0.08)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: DS.green }}>
                  Economia / ano
                </p>
                <p className="text-2xl font-black" style={{ color: DS.greenVivid }}>
                  R$ {simulation.best_option.yearly_savings.toFixed(0)}
                </p>
                <p className="text-xs mt-1" style={{ color: DS.green }}>
                  {simulation.best_option.savings_percentage.toFixed(1)}% de desconto
                </p>
              </div>
              <div
                className="col-span-2 rounded-[10px] px-5 py-3 flex items-center justify-between"
                style={{ border: `2px solid ${DS.green}`, background: "rgba(163,230,53,0.08)" }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DS.green }}>
                  Melhor fornecedor
                </span>
                <span className="font-bold" style={{ color: DS.greenVivid }}>
                  {simulation.best_option.supplier.name}
                </span>
              </div>
              <div
                className="col-span-2 rounded-[10px] px-5 py-3 flex items-center justify-between"
                style={{ border: `2px solid ${DS.green}`, background: "rgba(163,230,53,0.08)" }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DS.green }}>
                  Tipo de contrato
                </span>
                <span className="font-bold" style={{ color: DS.greenVivid }}>
                  {simulation.recommended_contract_type}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Warning ── */}
        <div
          className="rounded-[10px] p-4 mb-5 flex items-start gap-3"
          style={{ border: `2.5px solid ${DS.warning}`, boxShadow: `4px 4px 0 ${DS.warning}`, background: DS.white }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a5f00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm" style={{ color: DS.charcoal }}>
            <strong>Importante:</strong> Economias são estimativas baseadas nas tarifas disponíveis.
            Valores finais dependem do contrato formalizado.
          </p>
        </div>

        {/* ── Legal ── */}
        <p className="text-xs text-center mb-8" style={{ color: DS.gray }}>
          <strong>ContaLeve</strong> é uma plataforma de análise e intermediação de energia elétrica.
          Contratos são formalizados por participantes autorizados do mercado livre.
        </p>

        {/* ── CTA buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              sessionStorage.removeItem("bill");
              sessionStorage.removeItem("simulation");
              router.push("/");
            }}
            style={{ border: `2.5px dashed ${DS.charcoal}`, color: DS.charcoal, background: "transparent" }}
            className="flex-1 py-3 rounded-[10px] font-bold hover:bg-[#e8e8e8] transition-colors"
          >
            ← Voltar ao Início
          </button>
          <button
            onClick={() => setShowLead(true)}
            style={{ border: DS.border, boxShadow: DS.shadowSm, background: DS.greenVivid, color: DS.charcoal }}
            className="flex-1 py-3 rounded-[10px] font-bold hover:opacity-90 transition-opacity"
          >
            Continuar →
          </button>
        </div>
      </div>

      {/* ── Lead modal ── */}
      {showLead && simulation.best_option && (
        <LeadModal
          offer={simulation.best_option}
          partner={null}
          bill={{
            monthly_kwh: bill.monthly_kwh,
            total_cost: bill.total_cost,
            utility: bill.utility,
          }}
          onClose={() => setShowLead(false)}
        />
      )}
    </div>
  );
}
