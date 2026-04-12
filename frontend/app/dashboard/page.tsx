"use client";

import { useEffect, useState } from "react";
import { Bill, SimulationResponse } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [bill, setBill] = useState<Bill | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);

  useEffect(() => {
    const b = sessionStorage.getItem("bill");
    const s = sessionStorage.getItem("simulation");
    if (b) setBill(JSON.parse(b));
    if (s) setSimulation(JSON.parse(s));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Seu histórico</h1>
        <p className="text-gray-500 mt-1">
          Contas enviadas e simulações realizadas nesta sessão.
        </p>
      </div>

      {!bill ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-600 font-medium">Nenhuma conta enviada ainda.</p>
          <Link
            href="/"
            className="mt-4 inline-block bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Enviar minha conta
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bill card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              📄 Última conta
            </h2>
            <dl className="space-y-2 text-sm">
              {[
                ["Unidade consumidora", bill.consumer_unit ?? "—"],
                ["Consumo mensal", `${bill.monthly_kwh} kWh`],
                ["Custo total", `R$ ${bill.total_cost.toFixed(2)}`],
                ["Distribuidora", bill.utility ?? "—"],
                [
                  "Enviada em",
                  new Date(bill.created_at).toLocaleDateString("pt-BR"),
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Savings card */}
          {simulation && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                💚 Melhor economia
              </h2>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Com {simulation.best_option.supplier.name}</p>
                <p className="text-4xl font-extrabold text-green-600 mt-1">
                  R$ {simulation.best_option.monthly_savings.toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">por mês</p>
                <p className="mt-2 text-xl font-bold text-gray-800">
                  R$ {simulation.best_option.yearly_savings.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-gray-500">por ano</span>
                </p>
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/results"
                  className="flex-1 text-center bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  Ver resultados
                </Link>
                <Link
                  href="/compare"
                  className="flex-1 text-center border border-green-600 text-green-600 py-2 rounded-xl font-semibold hover:bg-green-50 transition-colors text-sm"
                >
                  Comparar planos
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
