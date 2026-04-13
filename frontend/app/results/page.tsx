"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bill, SimulationResponse, SupplierSimulationResult } from "@/lib/types";
import Link from "next/link";

function SavingsBadge({ savings }: { savings: number }) {
  const positive = savings > 0;
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
        positive
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {positive ? `Economize R$ ${savings.toFixed(2)}/mês` : `R$ ${Math.abs(savings).toFixed(2)} mais caro`}
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
      className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
        isBest ? "border-green-500" : "border-transparent"
      }`}
    >
      {isBest && (
        <div className="text-xs font-bold text-green-600 uppercase mb-2">
          ⭐ Melhor opção
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">
            {result.supplier.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {result.supplier.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {result.supplier.renewable && (
              <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                🌱 100% renovável
              </span>
            )}
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full capitalize">
              {result.supplier.type === "fixed" ? "Tarifa fixa" : "Tarifa variável"}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-extrabold text-gray-900">
            R$ {result.monthly_cost.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">por mês</p>
          <div className="mt-1">
            <SavingsBadge savings={result.monthly_savings} />
          </div>
        </div>
      </div>
      {result.monthly_savings > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          Economia anual estimada:{" "}
          <span className="font-semibold text-green-700">
            R$ {result.yearly_savings.toFixed(2)}
          </span>
        </div>
      )}
      {isBest && result.monthly_savings > 0 && (
        <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
          Quero trocar agora →
        </button>
      )}
    </div>
  );
}

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
      {/* Summary banner */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 text-center shadow-sm">
        {best.monthly_savings > 0 ? (
          <>
            <p className="text-gray-600 text-lg">Você está pagando</p>
            <p className="text-5xl font-extrabold text-red-500 my-2">
              R$ {best.monthly_savings.toFixed(2)} a mais por mês
            </p>
            <p className="text-gray-600">
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
            <p className="text-gray-600 mt-1">
              Os fornecedores disponíveis não oferecem preço menor agora.
            </p>
          </>
        )}
      </section>

      {/* Bill summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Consumo mensal", value: `${bill.monthly_kwh} kWh` },
          { label: "Custo atual", value: `R$ ${bill.total_cost.toFixed(2)}` },
          { label: "Fornecedora atual", value: bill.utility ?? "—" },
          { label: "Unidade", value: bill.consumer_unit ?? "—" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Best option */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Melhor opção</h2>
        <SupplierCard result={best} isBest />
      </section>

      {/* All options */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Todas as opções</h2>
          <Link
            href="/compare"
            className="text-sm text-green-600 hover:underline"
          >
            Ver tabela completa →
          </Link>
        </div>
        <div className="grid gap-4">
          {simulation.all_options.slice(1).map((r) => (
            <SupplierCard key={r.supplier.id} result={r} isBest={false} />
          ))}
        </div>
      </section>

      <div className="text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Enviar outra conta
        </Link>
      </div>
    </div>
  );
}
