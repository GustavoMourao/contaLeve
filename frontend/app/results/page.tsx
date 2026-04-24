"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bill, SimulationResponse, SupplierSimulationResult, Partner } from "@/lib/types";
import Link from "next/link";
import LeadModal from "@/components/LeadModal";
import { getPartners } from "@/lib/api";
import { ArrowRight, Leaf, Zap, TrendingDown } from "lucide-react";

function SavingsBadge({ savings }: { savings: number }) {
  const pos = savings > 0;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${pos ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
      {pos ? `Economize R$ ${savings.toFixed(2)}/mês` : "Sem economia estimada"}
    </span>
  );
}

function OfferCard({ result, isBest, partner, bill, onSelect }: {
  result: SupplierSimulationResult;
  isBest: boolean;
  partner: Partner | null;
  bill: Bill;
  onSelect: (r: SupplierSimulationResult, p: Partner | null) => void;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 border-2 transition-shadow hover:shadow-md ${isBest ? "border-green-500 shadow-sm" : "border-slate-100"}`}>
      {isBest && <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">⭐ Melhor oferta</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-0.5">{result.supplier.name}</h3>
          {partner && (
            <p className="text-xs text-slate-400 mb-1">
              Parceiro:{" "}
              <a href={partner.website ?? "#"} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{partner.name}</a>
            </p>
          )}
          <p className="text-sm text-slate-500">{result.supplier.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {result.supplier.renewable && (
              <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                <Leaf className="w-3 h-3" />100% renovável
              </span>
            )}
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
              {result.supplier.type === "fixed" ? "Tarifa fixa" : "Tarifa variável"}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-extrabold text-slate-900">R$ {result.monthly_cost.toFixed(2)}</p>
          <p className="text-xs text-slate-400">por mês</p>
          <div className="mt-1.5"><SavingsBadge savings={result.monthly_savings} /></div>
        </div>
      </div>
      {result.monthly_savings > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
          Economia anual: <strong className="text-green-700">R$ {result.yearly_savings.toFixed(2)}</strong>
        </div>
      )}
      <button
        onClick={() => onSelect(result, partner)}
        className={`mt-4 w-full font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm ${
          isBest ? "bg-green-600 hover:bg-green-700 text-white" : "border border-green-600 text-green-700 hover:bg-green-50"
        }`}
      >
        Quero esta oferta <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selected, setSelected] = useState<{ offer: SupplierSimulationResult; partner: Partner | null } | null>(null);

  useEffect(() => {
    const b = sessionStorage.getItem("bill");
    const s = sessionStorage.getItem("simulation");
    if (!b || !s) { router.replace("/"); return; }
    setBill(JSON.parse(b));
    setSimulation(JSON.parse(s));
    getPartners().then(setPartners).catch(() => {});
  }, [router]);

  if (!bill || !simulation) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const best = simulation.best_option;
  const findPartner = (name: string): Partner | null =>
    partners.find((p) => name.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])) ?? null;

  return (
    <div className="flex flex-col gap-8">
      {/* Banner */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-center text-white">
        {best.monthly_savings > 0 ? (
          <>
            <p className="text-green-100 text-lg">Identificamos uma economia de</p>
            <p className="text-5xl font-extrabold my-2">R$ {best.monthly_savings.toFixed(2)}/mês</p>
            <p className="text-green-100">
              Com <strong className="text-white">{best.supplier.name}</strong> — economia de{" "}
              <strong className="text-white">R$ {best.yearly_savings.toFixed(2)} no primeiro ano</strong>
            </p>
            <button
              onClick={() => setSelected({ offer: best, partner: findPartner(best.supplier.name) })}
              className="mt-5 bg-white hover:bg-green-50 text-green-700 font-bold px-8 py-3 rounded-2xl transition-colors shadow-md inline-flex items-center gap-2"
            >
              Quero esta oferta <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <p className="text-2xl font-bold">Você já tem uma ótima tarifa! 🎉</p>
        )}
      </section>

      {/* Bill stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Consumo mensal", value: `${bill.monthly_kwh} kWh` },
          { label: "Custo atual", value: `R$ ${bill.total_cost.toFixed(2)}` },
          { label: "Distribuidora", value: bill.utility ?? "—" },
          { label: "Unidade", value: bill.consumer_unit ?? "—" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{item.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{item.value}</p>
          </div>
        ))}
      </section>

      {/* All offers */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Todas as ofertas disponíveis</h2>
          <Link href="/compare" className="text-sm text-green-600 hover:underline">Ver tabela →</Link>
        </div>
        <div className="grid gap-4">
          {simulation.all_options.map((r) => (
            <OfferCard
              key={r.supplier.id}
              result={r}
              isBest={r.supplier.id === best.supplier.id}
              partner={findPartner(r.supplier.name)}
              bill={bill}
              onSelect={(offer, partner) => setSelected({ offer, partner })}
            />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Como funciona a troca?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            { n: "1", t: "Você solicita a oferta", d: "Preenche seus dados gratuitamente." },
            { n: "2", t: "Parceiro entra em contato", d: "Especialista liga em até 24h para detalhar o contrato." },
            { n: "3", t: "Contrato assinado", d: "A troca é feita sem interromper o fornecimento." },
          ].map((s) => (
            <div key={s.n} className="flex gap-3">
              <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{s.n}</div>
              <div>
                <p className="font-semibold text-slate-900">{s.t}</p>
                <p className="text-xs mt-0.5 text-slate-500">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center pb-4">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">← Enviar outra conta</Link>
      </div>

      {selected && (
        <LeadModal offer={selected.offer} partner={selected.partner} bill={bill} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
