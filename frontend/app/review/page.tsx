"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadBillResponse } from "@/lib/types";
import { simulate } from "@/lib/api";

export default function ReviewBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billData, setBillData] = useState<UploadBillResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [monthly_kwh, setMonthly_kwh] = useState<number>(0);
  const [total_cost, setTotal_cost] = useState<number>(0);

  useEffect(() => {
    const billJson = sessionStorage.getItem("billData");
    if (billJson) {
      const data = JSON.parse(billJson);
      setBillData(data);
      setMonthly_kwh(data.bill.monthly_kwh || 0);
      setTotal_cost(data.bill.total_cost || 0);
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (monthly_kwh <= 0) {
      setError("Consumo deve ser maior que 0");
      return;
    }

    if (total_cost <= 0) {
      setError("Custo deve ser maior que 0");
      return;
    }

    setSubmitting(true);
    try {
      // Run simulation with corrected values
      const simulation = await simulate(monthly_kwh, total_cost);

      // Store results and redirect to results page
      sessionStorage.setItem(
        "bill",
        JSON.stringify({
          ...billData?.bill,
          monthly_kwh,
          total_cost,
        })
      );
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <p className="text-lg text-red-600 mb-4">Nenhum dado de conta encontrado.</p>
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 Verifique os Dados Extraídos
          </h1>
          <p className="text-gray-600">
            Alguns dados não foram extraídos automaticamente. Por favor, insira os valores corretos.
          </p>
        </div>

        {/* Extraction Notes */}
        {billData.extraction_notes && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-amber-900 mb-3">📊 Extração Automática:</h3>
            <div className="text-sm text-amber-800 whitespace-pre-line font-mono">
              {billData.extraction_notes}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8">
            <p className="text-red-800 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* Bill Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Informações da Conta</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Read-only fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distribuidora
              </label>
              <div className="bg-gray-50 p-3 rounded-lg text-gray-800">
                {billData.bill.utility || "Não detectada"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                UC / Número de Instalação
              </label>
              <div className="bg-gray-50 p-3 rounded-lg text-gray-800">
                {billData.bill.consumer_unit || "Não detectada"}
              </div>
            </div>

            {/* Editable fields */}
            <div>
              <label htmlFor="kwh" className="block text-sm font-semibold text-gray-700 mb-2">
                Consumo Mensal (kWh) *
              </label>
              <input
                id="kwh"
                type="number"
                min="0.1"
                step="0.1"
                value={monthly_kwh}
                onChange={(e) => setMonthly_kwh(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                placeholder="ex: 250.5"
              />
              {billData.kwh_extraction_method === "not_found" && (
                <p className="text-sm text-red-600 mt-1">❌ Não foi extraído automaticamente</p>
              )}
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-semibold text-gray-700 mb-2">
                Custo Total (R$) *
              </label>
              <input
                id="cost"
                type="number"
                min="0.01"
                step="0.01"
                value={total_cost}
                onChange={(e) => setTotal_cost(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                placeholder="ex: 250.50"
              />
              {billData.cost_extraction_method === "not_found" && (
                <p className="text-sm text-red-600 mt-1">❌ Não foi extraído automaticamente</p>
              )}
            </div>
          </div>

          {/* Tariff info if available */}
          {billData.bill.tariff && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-900">
                <strong>📌 Tarifa detectada:</strong> R$ {billData.bill.tariff.toFixed(4)}/kWh
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 mb-6">* Campos obrigatórios</p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              ← Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              {submitting ? "Processando..." : "Continuar →"}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>💡 Dica:</strong> Verifique os valores na sua conta de energia. O consumo
            geralmente está em "Total Apurado" e o custo em "Total a Pagar".
          </p>
        </div>
      </div>
    </div>
  );
}
