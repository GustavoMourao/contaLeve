"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bill, SimulationResponse, SupplierSimulationResult } from "@/lib/types";
import Link from "next/link";
import FeatureGate from "@/components/FeatureGate";
import { CheckCircle, Leaf, TrendingDown, Zap, ArrowRight } from "lucide-react";

/* -- Small helpers -- */

function Badge({ savings }: { savings: number }) {
  const pos = savings > 0;
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
        pos ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {pos
        ? `Economize R$ ${savings.toFixed(2)}/mês`
        : `R$ ${Math.abs(savings).toFixed(2)} mais caro`}
    </span>
  );
}

function SupplierCard({
  result,
  isBest,
}: {
  result: SupplierSimulationResult;
  isBest: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-shadow hover:shadow-md ${
        isBest ? "border-green-500" : "border-slate-100"
      }`}
    >
      {isBest && (
        <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">
          ⭐ Melhor opção
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-lg">
            {result.supplier.name}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {result.supplier.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {result.supplier.renewable && (
              <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100">
                🌱 100% renovável
              </span>
            )}
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full capitalize">
              {result.supplier.type === "fixed" ? "Tarifa fixa" : "Tarifa variável"}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-extrabold text-slate-900">
            R$ {result.monthly_cost.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400">por mês</p>
          <div className="mt-1.5">
            <Badge savings={result.monthly_savings} />
          </div>
        </div>
      </div>

      {result.monthly_savings > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600">
          Economia anual estimada:{" "}
          <span className="font-semibold text-green-700">
            R$ {result.yearly_savings.toFixed(2)}
          </span>
        </div>
      )}

      {isBest && result.monthly_savings > 0 && (
        <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          Quero trocar agora
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* -- CO2 section (pro-gated) -- */
function Co2Section({
  monthly_kwh,
  renewable,
}: {
  monthly_kwh: number;
  renewable: boolean;
}) {
  // Brazil grid average: ~0.09 kg CO2/kWh. Renewable = ~0.01 kg CO2/kWh
  const currentCo2 = (monthly_kwh * 0.09 * 12).toFixed(0);
  const renewableCo2 = (monthly_kwh * 0.01 * 12).toFixed(0);
  const saved = (monthly_kwh * 0.08 * 12).toFixed(0);

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-green-700" />
        <h3 className="font-bold text-slate-900">Impacto ambiental</h3>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-extrabold text-slate-800">{currentCo2} kg</p>
          <p className="text-xs text-slate-500 mt-0.5">CO₂ atual/ano</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-green-700">{renewableCo2} kg</p>
          <p className="text-xs text-slate-500 mt-0.5">CO₂ renovável/ano</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-emerald-600">-{saved} kg</p>
          <p className="text-xs text-slate-500 mt-0.5">redução potencial</p>
        </div>
      </div>
      {!renewable && (
        <p className="text-xs text-slate-500 mt-4 text-center">
          Trocando para uma fonte 100% renovável você reduziria{" "}
          <strong className="text-green-700">{saved} kg de CO₂</strong> por ano
          — equivalente a plantar ~{Math.round(Number(saved) / 22)} árvores.
        </p>
      )}
    </div>
  );
}

/* -- 12-month savings chart (pro-gated, CSS-only) -- */
function SavingsChart({ monthlySavings }: { monthlySavings: number }) {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const values = months.map((_, i) =>
    parseFloat((monthlySavings * (1 + (i % 3) * 0.05)).toFixed(2))
  );
  const max = Math.max(...values);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-5 h-5 text-green-700" />
        <h3 className="font-bold text-slate-900">Projeção de economia — 12 meses</h3>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-green-500 rounded-t-md transition-all"
              style={{ height: `${(v / max) * 100}%` }}
            />
            <span className="text-[10px] text-slate-400 leading-none">{months[i]}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-slate-600 mt-3">
        Economia acumulada estimada:{" "}
        <span className="font-bold text-green-700">
          R$ {(monthlySavings * 12).toFixed(2)}
        </span>{" "}
        no primeiro ano
      </p>
    </div>
  );
}

/* -- Main page -- */
export default function ResultsPage() {
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);

  useEffect(() => {
    const b = sessionStorage.getItem("bill");
    const s = sessionStorage.getItem("simulation");
    if (!b || !s) {
      router.replace("/");
      return;
    }
    setBill(JSON.parse(b));
    setSimulation(JSON.parse(s));
  }, [router]);

  if (!bill || !simulation) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const best = simulation.best_option;

  return (
    <div className="flex flex-col gap-8">
      {/* -- Summary banner -- */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 text-center border border-green-200">
        {best.monthly_savings > 0 ? (
          <>
            <p className="text-slate-600 text-lg">Você está pagando</p>
            <p className="text-5xl font-extrabold text-red-500 my-2">
              R$ {best.monthly_savings.toFixed(2)} a mais por mês
            </p>
            <p className="text-slate-600">
              Trocando para{" "}
              <strong className="text-green-700">{best.supplier.name}</strong>{" "}
              você economiza{" "}
              <strong className="text-green-700">
                R$ {best.yearly_savings.toFixed(2)} por ano
              </strong>
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-green-700">
              Você já tem uma ótima tarifa! 🎉
            </p>
            <p className="text-slate-600 mt-1">
              Os fornecedores disponíveis não oferecem preço menor agora.
            </p>
          </>
        )}
      </section>

      {/* -- Bill stats -- */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Consumo mensal", value: `${bill.monthly_kwh} kWh` },
          { label: "Custo atual", value: `R$ ${bill.total_cost.toFixed(2)}` },
          { label: "Distribuidora", value: bill.utility ?? "—" },
          { label: "Unidade", value: bill.consumer_unit ?? "—" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"
          >
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              {item.label}
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">{item.value}</p>
          </div>
        ))}
      </section>

      {/* -- Best option (FREE) -- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-slate-700">Melhor opção para você</h2>
        </div>
        <SupplierCard result={best} isBest />
      </section>

      {/* -- CO2 impact (PRO-gated) -- */}
      <section>
        <FeatureGate
          title="Impacto Ambiental"
          description="Veja quanto CO₂ você pode deixar de emitir trocando para uma fonte renovável."
        >
          <Co2Section
            monthly_kwh={bill.monthly_kwh}
            renewable={best.supplier.renewable}
          />
        </FeatureGate>
      </section>

      {/* -- Savings chart (PRO-gated) -- */}
      <section>
        <FeatureGate
          title="Projeção de Economia"
          description="Veja sua economia mês a mês ao longo de 12 meses com o plano Pro."
        >
          <SavingsChart monthlySavings={best.monthly_savings} />
        </FeatureGate>
      </section>

      {/* -- All options (PRO-gated) -- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-700">
            Todos os fornecedores
          </h2>
          <Link
            href="/compare"
            className="text-sm text-green-600 hover:underline"
          >
            Ver tabela completa →
          </Link>
        </div>
        <FeatureGate
          title="Comparativo Completo"
          description="Acesse a lista completa com todos os fornecedores, preços e detalhes no plano Pro."
        >
          <div className="grid gap-4">
            {simulation.all_options.map((r) => (
              <SupplierCard
                key={r.supplier.id}
                result={r}
                isBest={r.supplier.id === best.supplier.id}
              />
            ))}
          </div>
        </FeatureGate>
      </section>

      {/* -- PDF report (PRO-gated) -- */}
      <section>
        <FeatureGate
          title="Relatório em PDF"
          description="Exporte um relatório profissional com todas as análises para apresentar a síndicos ou gestores."
        >
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                📋
              </div>
              <div>
                <p className="font-semibold text-slate-900">Relatório PDF pronto</p>
                <p className="text-sm text-slate-500">
                  Análise completa de {bill.utility ?? "distribuidora"} · {bill.monthly_kwh} kWh/mês
                </p>
              </div>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Baixar PDF
            </button>
          </div>
        </FeatureGate>
      </section>

      <div className="text-center pb-4">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          ← Enviar outra conta
        </Link>
      </div>
    </div>
  );
}
