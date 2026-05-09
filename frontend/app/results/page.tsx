"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bill, SimulationResponse } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!bill || !simulation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <p className="text-lg text-red-600 mb-4">Nenhum resultado encontrado.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✅ Sua análise está pronta</h1>
          <p className="text-gray-600">Confira os detalhes e economias estimadas</p>
        </div>

        {/* STEP 1: Your Bill */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">📄</div>
            <h2 className="text-2xl font-bold text-gray-800">PASSO 1 — Sua Conta</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Consumo Mensal</p>
              <p className="text-3xl font-bold text-green-600">{bill.monthly_kwh.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">kWh</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Custo Atual</p>
              <p className="text-3xl font-bold text-green-600">R$ {bill.total_cost.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">por mês</p>
            </div>

            {bill.utility && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Distribuidora</p>
                <p className="text-xl font-semibold text-gray-800">{bill.utility}</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              ℹ️ <strong>Como extraímos:</strong> O consumo foi extraído da linha "Total apurado" da sua conta,
              garantindo a precisão dos cálculos.
            </p>
          </div>
        </div>

        {/* STEP 2: Our Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800">PASSO 2 — Nossa Análise</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm font-semibold text-gray-700 mb-1">✅ Valores confirmados com sucesso</p>
              <p className="text-xs text-gray-600">
                Sua conta foi processada com precisão. Os dados estão prontos para a simulação.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm font-semibold text-gray-700 mb-1">📊 Comparamos com {simulation.all_options.length} fornecedores</p>
              <p className="text-xs text-gray-600">
                Analisamos as principais opções de energia disponíveis para seu perfil de consumo.
              </p>
            </div>
          </div>
        </div>

        {/* STEP 3: Estimated Savings */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">💰</div>
            <h2 className="text-2xl font-bold">PASSO 3 — Economias Estimadas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Savings Range */}
            <div className="bg-white bg-opacity-20 backdrop-blur p-6 rounded-xl text-center">
              <p className="text-sm font-semibold opacity-90 mb-2">ECONOMIA ESTIMADA</p>
              <p className="text-5xl font-bold">
                {simulation.estimated_savings_min.toFixed(0)}%–{simulation.estimated_savings_max.toFixed(0)}%
              </p>
              <p className="text-xs opacity-80 mt-2">por mês</p>
            </div>

            {/* Best Option */}
            {simulation.best_option && (
              <div className="bg-white bg-opacity-20 backdrop-blur p-6 rounded-xl">
                <p className="text-sm font-semibold opacity-90 mb-3">MELHOR OPÇÃO</p>
                <div className="bg-white bg-opacity-30 p-3 rounded-lg">
                  <p className="font-bold text-lg">{simulation.best_option.supplier.name}</p>
                  <p className="text-sm opacity-90 mt-1">
                    💵 R$ {simulation.best_option.monthly_savings.toFixed(2)}/mês de economia
                  </p>
                  <p className="text-sm opacity-90">
                    📅 R$ {simulation.best_option.yearly_savings.toFixed(2)}/ano
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Contract */}
          <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-xl border-2 border-white border-opacity-30">
            <p className="text-sm font-semibold opacity-90 mb-2">🎯 RECOMENDAÇÃO</p>
            <p className="text-2xl font-bold">{simulation.recommended_contract_type}</p>
            <p className="text-xs opacity-75 mt-2">
              Contrato de preço fixo com melhor relação custo-benefício para seu consumo.
            </p>
          </div>
        </div>

        {/* Warning Box */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-8">
          <p className="text-sm text-amber-900">
            <strong>⚠️ Importante:</strong> As economias apresentadas são estimativas baseadas nas tarifas
            disponíveis. Os valores finais podem variar conforme contrato formalizado.
          </p>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-gray-100 p-6 rounded-lg text-center border border-gray-300 mb-8">
          <p className="text-xs text-gray-700 leading-relaxed">
            <strong>ContaLeve</strong> é uma plataforma de análise e intermediação de energia elétrica.
            <br />
            Os contratos de energia são formalizados por participantes autorizados do mercado.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {
              sessionStorage.removeItem("bill");
              sessionStorage.removeItem("simulation");
              router.push("/");
            }}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            ← Voltar ao Início
          </button>
          <button
            onClick={() => {
              alert("Próximas etapas em desenvolvimento...");
            }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}
