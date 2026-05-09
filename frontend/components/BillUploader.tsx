"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadBill, simulate } from "@/lib/api";
import { Bill, SimulationResponse, UploadBillResponse } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function BillUploader() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "review">("idle");
  const [error, setError] = useState<string | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadBillResponse | null>(null);
  const [reviewKwh, setReviewKwh] = useState<string>("");
  const [reviewCost, setReviewCost] = useState<string>("");

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (accepted.length === 0) return;
      setStatus("uploading");
      setError(null);

      try {
        const uploadRes: UploadBillResponse = await uploadBill(accepted[0]);
        setUploadResponse(uploadRes);

        // If extraction was partial or values are 0, show review screen
        if (uploadRes.status === "partial" || uploadRes.bill.monthly_kwh === 0 || uploadRes.bill.total_cost === 0) {
          setReviewKwh(uploadRes.bill.monthly_kwh > 0 ? uploadRes.bill.monthly_kwh.toString() : "");
          setReviewCost(uploadRes.bill.total_cost > 0 ? uploadRes.bill.total_cost.toString() : "");
          setStatus("review");
          return;
        }

        // Full extraction - proceed to simulation
        const simRes: SimulationResponse = await simulate(
          uploadRes.bill.monthly_kwh,
          uploadRes.bill.total_cost
        );

        sessionStorage.setItem("bill", JSON.stringify(uploadRes.bill));
        sessionStorage.setItem("simulation", JSON.stringify(simRes));
        router.push("/results");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao processar conta.");
        setStatus("error");
      }
    },
    [router]
  );

  const handleReviewSubmit = async () => {
    const kwhValue = parseFloat(reviewKwh);
    const costValue = parseFloat(reviewCost);

    if (!kwhValue || !costValue) {
      setError("Por favor, preencha os valores de consumo e custo.");
      return;
    }

    if (kwhValue <= 0 || costValue <= 0) {
      setError("Os valores devem ser maiores que zero.");
      return;
    }

    try {
      setStatus("uploading");
      setError(null);

      if (!uploadResponse) return;

      // Update bill with user-confirmed values
      const updatedBill = {
        ...uploadResponse.bill,
        monthly_kwh: kwhValue,
        total_cost: costValue,
      };

      const simRes: SimulationResponse = await simulate(kwhValue, costValue);

      sessionStorage.setItem("bill", JSON.stringify(updatedBill));
      sessionStorage.setItem("simulation", JSON.stringify(simRes));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao simular.");
      setStatus("review");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".tiff", ".bmp"],
    },
    maxFiles: 1,
    disabled: status === "uploading",
  });

  // Review screen for extracted/manual values
  if (status === "review" && uploadResponse) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            ✓ Conta processada
          </h2>
          <p className="text-sm text-amber-700 mb-6">
            {uploadResponse.extraction_notes}
          </p>

          {/* Extracted info display */}
          {uploadResponse.bill.utility && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-amber-100">
              <p className="text-sm text-gray-600">
                <strong>Fornecedor:</strong> {uploadResponse.bill.utility}
              </p>
              {uploadResponse.bill.consumer_unit && (
                <p className="text-sm text-gray-600">
                  <strong>UC:</strong> {uploadResponse.bill.consumer_unit}
                </p>
              )}
            </div>
          )}

          {/* Manual value entry */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Consumo (kWh) *
              </label>
              <input
                type="number"
                value={reviewKwh}
                onChange={(e) => setReviewKwh(e.target.value)}
                placeholder="Ex: 138"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor da coluna "Total Apurado" ou "Consumo"
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custo Total (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={reviewCost}
                onChange={(e) => setReviewCost(e.target.value)}
                placeholder="Ex: 132.70"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor total a pagar da sua conta
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStatus("idle");
                setUploadResponse(null);
                setError(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              ↻ Enviar outro arquivo
            </button>
            <button
              onClick={handleReviewSubmit}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              → Continuar para resultados
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal upload screen
  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 bg-white hover:border-green-400 hover:bg-green-50"}
          ${status === "uploading" ? "opacity-70 cursor-wait" : ""}`}
      >
        <input {...getInputProps()} />
        {status === "uploading" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Processando sua conta…</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">📄</div>
            <p className="text-lg font-semibold text-gray-700">
              {isDragActive
                ? "Solte o arquivo aqui"
                : "Arraste sua conta de energia ou clique para selecionar"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              PDF ou imagem (PNG, JPG) · Máx. 10 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
