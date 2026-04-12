"use client";

import { useEffect, useState } from "react";
import { getSuppliers } from "@/lib/api";
import { Supplier, SimulationResponse } from "@/lib/types";
import { simulate } from "@/lib/api";

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Comparar fornecedores</h1>
        <p className="text-gray-500 mt-1">
          Todos os planos disponíveis ordenados do mais barato ao mais caro.
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
                : "bg-white text-gray-600 border border-gray-200 hover:border-green-400"
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
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-semibold text-gray-600">#</th>
                <th className="text-left p-4 font-semibold text-gray-600">Fornecedor</th>
                <th className="text-left p-4 font-semibold text-gray-600">R$/kWh</th>
                <th className="text-left p-4 font-semibold text-gray-600">Tipo</th>
                <th className="text-left p-4 font-semibold text-gray-600">Renovável</th>
                {simulation && (
                  <>
                    <th className="text-left p-4 font-semibold text-gray-600">
                      Custo mensal*
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-600">
                      Economia mensal*
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((supplier, i) => {
                const opt = simulation?.all_options.find(
                  (o) => o.supplier.id === supplier.id
                );
                return (
                  <tr
                    key={supplier.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-400">{i + 1}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{supplier.name}</p>
                      {supplier.description && (
                        <p className="text-gray-400 text-xs">{supplier.description}</p>
                      )}
                    </td>
                    <td className="p-4 font-mono">
                      R$ {supplier.price_per_kwh.toFixed(2)}
                    </td>
                    <td className="p-4 capitalize text-gray-600">
                      {supplier.type === "fixed" ? "Fixa" : "Variável"}
                    </td>
                    <td className="p-4">
                      {supplier.renewable ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    {simulation && opt && (
                      <>
                        <td className="p-4 font-semibold">
                          R$ {opt.monthly_cost.toFixed(2)}
                        </td>
                        <td className="p-4">
                          {opt.monthly_savings > 0 ? (
                            <span className="text-green-600 font-semibold">
                              + R$ {opt.monthly_savings.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-red-400">
                              − R$ {Math.abs(opt.monthly_savings).toFixed(2)}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Nenhum fornecedor encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {simulation && (
            <p className="text-xs text-gray-400 p-4">
              * Baseado no consumo de {simulation.monthly_kwh} kWh da conta enviada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
