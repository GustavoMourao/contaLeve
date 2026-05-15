"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadBill, simulate } from "@/lib/api";
import { Bill, SimulationResponse, UploadBillResponse } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function BillUploader() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      if (accepted.length === 0) return;
      setStatus("uploading");
      setError(null);

      try {
        const uploadRes: UploadBillResponse = await uploadBill(accepted[0]);
        const bill: Bill = uploadRes.bill;

        // Check if extraction was partial
        if (uploadRes.status === "partial") {
          // Store full response for review page
          sessionStorage.setItem("billData", JSON.stringify(uploadRes));
          router.push("/review");
          return;
        }

        // Full extraction succeeded - proceed to simulation
        const simRes: SimulationResponse = await simulate(
          bill.monthly_kwh,
          bill.total_cost
        );

        // Persist in sessionStorage so the results page can read it
        sessionStorage.setItem("bill", JSON.stringify(bill));
        sessionStorage.setItem("simulation", JSON.stringify(simRes));

        router.push("/results");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao processar conta.");
        setStatus("error");
      }
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".tiff", ".bmp"],
    },
    maxFiles: 1,
    disabled: status === "uploading",
  });

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
