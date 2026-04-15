"use client";

import { useEffect, useState } from "react";
import { getSuppliers } from "@/lib/api";
import { Supplier, SimulationResponse } from "@/lib/types";
import { simulate } from "@/lib/api";
import FeatureGate from "@/components/FeatureGate";

type Filter = "all" | "renewable" | "fixed" | "variable";

export default function ComparePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sups, simStr] = await Promise.all([
          getSuppliers(),
          Promise.resolve(sessionStorage.getItem("simulation")),
        ]);
        setSuppliers(sups);
        if (simStr) setSimulation(JSON.parse(simStr));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = suppliers.filter((s) => {
    if (filter === "renewable") return s.renewable;
    if (filter === "fixed") return s.type === "fixed";
    if (filter === "variable") return s.type === "variable";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => a.price_per_kwh - b.price_per_kwh);

  // First 3 rows are free; the rest are pro-gated
  const freeRows = sorted.slice(0, 3);
  const proRows = sorted.slice(3);

  const TableRows = ({ rows }: { rows: Supplier[] }) => (
    <>
      {rows.map((supplier, i) => {
        const opt = simulation?.all_options.find(
          (o) => o.supplier.id === supplier.id
        );
        return (
          <tr
            key={supplier.id}
            className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
          >
            <td className="p-4 text-slate-400 font-mono text-sm">
              {sorted.indexOf(supplier) + 1}
            </td>
            <td className="p-4">
              <p className="font-semibold text-slate-900">{supplier.name}</p>
              {supplier.description && (
                <p className="text-slate-400 text-xs mt-0.5">
                  {supplier.description}
                </p>
              )}
            </td>
            <td className="p-4 font-mono text-sm font-semibold text-slate-800">
              R$ {supplier.price_per_kwh.toFixed(4)}
            </td>
            <td className="p-4">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  supplier.type === "fixed"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-violet-50 text-violet-700"
                }`}
              >
                {supplier.type === "fixed" ? "Fixa" : "Variável"}
              </span>
            </td>
            <td className="p-4">
              {supplier.renewable ? (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  🌱 Sim
                </span>
              ) : (
                <span className="text-slate-300 text-sm">—</span>
              )}
            </td>
            {simulation && opt && (
              <>
                <td className="p-4 font-semibold text-slate-800">
                  R$ {opt.monthly_cost.toFixed(2)}
                </td>
                <td className="p-4">
                  {opt.monthly_savings > 0 ? (
                    <span className="text-green-600 font-semibold text-sm">
                      + R$ {opt.monthly_savings.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-red-400 text-sm">
                      − R$ {Math.abs(opt.monthly_savings).toFixed(2)}
                    </span>
                  )}
                </td>
              </>
            )}
          </tr>
        );
      })}
    </>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Comparar fornecedores
        </h1>
        <p className="text-slate-500 mt-1">
          Planos disponíveis ordenados do mais barato ao mais caro.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: "Todos" },
            { key: "renewable", label: "🌱 Renovável" },
            { key: "fixed", label: "Tarifa fixa" },
            { key: "variable", label: "Tarifa variável" },
          ] as { key: Filter; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? "bg-green-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-green-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {/* Free rows — always visible */}
          <div className="bg-white rounded-t-2xl shadow-sm overflow-x-auto border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-4 font-semibold text-slate-500">#</th>
                  <th className="text-left p-4 font-semibold text-slate-500">
                    Fornecedor
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-500">
                    R$/kWh
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-500">
                    Tipo
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-500">
                    Renovável
                  </th>
                  {simulation && (
                    <>
                      <th className="text-left p-4 font-semibold text-slate-500">
                        Custo/mês*
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-500">
                        Economia*
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {freeRows.length > 0 ? (
                  <TableRows rows={freeRows} />
                ) : (
                  <tr>
                    <td
                      colSpan={simulation ? 7 : 5}
                      className="p-8 text-center text-slate-400"
                    >
                      Nenhum fornecedor encontrado para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pro rows — gated */}
          {proRows.length > 0 && (
            <FeatureGate
              title="Todos os Fornecedores"
              description={`Veja os ${proRows.length} fornecedores restantes com preços, tipos e economia estimada no plano Pro.`}
            >
              <div className="bg-white rounded-b-2xl overflow-x-auto border-x border-b border-slate-100">
                <table className="w-full text-sm">
                  <tbody>
                    <TableRows rows={proRows} />
                  </tbody>
                </table>
              </div>
            </FeatureGate>
          )}

          {simulation && (
            <p className="text-xs text-slate-400 mt-2 px-1">
              * Baseado no consumo de {simulation.monthly_kwh} kWh da conta
              enviada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
