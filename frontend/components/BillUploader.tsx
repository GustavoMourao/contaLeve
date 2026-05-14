"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { parseBill, confirmBill, simulate } from "@/lib/api";
import {
  BillParseResponse,
  ExtractedField,
  FieldStatus,
  SimulationResponse,
} from "@/lib/types";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Field-level status chip
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  FieldStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  extracted: {
    label: "Extraído",
    bg: "bg-[#BEFF00]",
    text: "text-black",
    border: "border-black",
  },
  uncertain: {
    label: "Incerto",
    bg: "bg-amber-300",
    text: "text-black",
    border: "border-black",
  },
  missing: {
    label: "Ausente",
    bg: "bg-white",
    text: "text-black",
    border: "border-black",
  },
};

function StatusChip({ status }: { status: FieldStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border-2 ${cfg.bg} ${cfg.text} ${cfg.border}`}
      style={{ boxShadow: "2px 2px 0 #000" }}
    >
      {status === "extracted" ? "✓ " : status === "uncertain" ? "⚠ " : "✗ "}
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Individual editable field row
// ---------------------------------------------------------------------------

interface FieldRowProps {
  label: string;
  field: ExtractedField;
  value: string;
  onChange: (v: string) => void;
  inputType?: "text" | "number";
  step?: string;
  placeholder?: string;
  required?: boolean;
}

function FieldRow({
  label,
  field,
  value,
  onChange,
  inputType = "text",
  step,
  placeholder,
  required,
}: FieldRowProps) {
  const isEditable = field.status !== "extracted";
  return (
    <div className="border-2 border-black rounded-xl p-4" style={{ boxShadow: "3px 3px 0 #000" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-black uppercase tracking-wide">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </span>
        <StatusChip status={field.status} />
      </div>

      {field.status === "extracted" ? (
        /* Confirmed value — show read-only but still allow override */
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-black">{value}</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-gray-500 underline hover:text-black"
          >
            corrigir
          </button>
        </div>
      ) : (
        <input
          type={inputType}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border-2 border-black rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#BEFF00]"
        />
      )}

      {field.hint && (
        <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type UploaderStatus = "idle" | "uploading" | "review" | "submitting" | "error";

export default function BillUploader() {
  const router = useRouter();
  const [status, setStatus] = useState<UploaderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [parseResponse, setParseResponse] = useState<BillParseResponse | null>(null);

  // Form state (all as strings; parsed to numbers on submit)
  const [fKwh, setFKwh] = useState("");
  const [fCost, setFCost] = useState("");
  const [fUtility, setFUtility] = useState("");
  const [fUnit, setFUnit] = useState("");

  // -------------------------------------------------------------------------
  // Drop handler
  // -------------------------------------------------------------------------
  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0) return;
    setStatus("uploading");
    setError(null);

    try {
      const res: BillParseResponse = await parseBill(accepted[0]);
      setParseResponse(res);

      // Pre-fill form from extracted fields
      setFKwh(res.fields.monthly_kwh.value ?? "");
      setFCost(res.fields.total_cost.value ?? "");
      setFUtility(res.fields.utility.value ?? "");
      setFUnit(res.fields.consumer_unit.value ?? "");

      if (res.next_action === "simulate" && res.extraction_status === "complete") {
        // Fast path — all data confident, go straight to results
        const simRes: SimulationResponse = await simulate(
          parseFloat(res.fields.monthly_kwh.value!),
          parseFloat(res.fields.total_cost.value!)
        );
        sessionStorage.setItem("bill_id", String(res.bill_id));
        sessionStorage.setItem("simulation", JSON.stringify(simRes));
        router.push("/results");
        return;
      }

      setStatus("review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao processar conta.");
      setStatus("error");
    }
  }, [router]);

  // -------------------------------------------------------------------------
  // Confirm handler
  // -------------------------------------------------------------------------
  const handleConfirm = async () => {
    const kwhNum = parseFloat(fKwh);
    const costNum = parseFloat(fCost);

    if (!fKwh || !fCost || kwhNum <= 0 || costNum <= 0) {
      setError("Preencha o consumo (kWh) e o custo total para continuar.");
      return;
    }

    if (!parseResponse) return;
    setStatus("submitting");
    setError(null);

    try {
      const confirmed = await confirmBill(parseResponse.bill_id, {
        monthly_kwh: kwhNum,
        total_cost: costNum,
        utility: fUtility || undefined,
        consumer_unit: fUnit || undefined,
      });

      const simData = confirmed.simulation ?? await simulate(kwhNum, costNum);

      sessionStorage.setItem("bill_id", String(parseResponse.bill_id));
      sessionStorage.setItem("simulation", JSON.stringify(simData));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao confirmar dados.");
      setStatus("review");
    }
  };

  // =========================================================================
  // REVIEW SCREEN
  // =========================================================================
  if ((status === "review" || status === "submitting") && parseResponse) {
    const f = parseResponse.fields;
    const isLoading = status === "submitting";

    const missingCount = Object.values(f).filter((v) => v.status === "missing").length;
    const uncertainCount = Object.values(f).filter((v) => v.status === "uncertain").length;

    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* Header card */}
        <div
          className="bg-black text-white rounded-2xl p-6 mb-4 border-2 border-black"
          style={{ boxShadow: "5px 5px 0 #BEFF00" }}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">📄</div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                {parseResponse.extraction_status === "complete"
                  ? "Conta identificada"
                  : "Confirme os dados da sua conta"}
              </h2>
              <p className="text-sm text-gray-300 mt-1">{parseResponse.message}</p>
            </div>
          </div>

          {/* Summary chips */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="px-3 py-1 rounded-full border-2 border-[#BEFF00] text-[#BEFF00] text-xs font-bold">
              ✓ {Object.values(f).filter((v) => v.status === "extracted").length} extraídos
            </span>
            {uncertainCount > 0 && (
              <span className="px-3 py-1 rounded-full border-2 border-amber-300 text-amber-300 text-xs font-bold">
                ⚠ {uncertainCount} incertos
              </span>
            )}
            {missingCount > 0 && (
              <span className="px-3 py-1 rounded-full border-2 border-white text-white text-xs font-bold">
                ✗ {missingCount} ausentes
              </span>
            )}
          </div>
        </div>

        {/* Field rows */}
        <div className="space-y-3 mb-4">
          <FieldRow
            label="Consumo mensal"
            field={f.monthly_kwh}
            value={fKwh}
            onChange={setFKwh}
            inputType="number"
            placeholder="Ex: 138"
            required
          />
          <FieldRow
            label="Total a pagar (R$)"
            field={f.total_cost}
            value={fCost}
            onChange={setFCost}
            inputType="number"
            step="0.01"
            placeholder="Ex: 482,00"
            required
          />
          <FieldRow
            label="Distribuidora"
            field={f.utility}
            value={fUtility}
            onChange={setFUtility}
            placeholder="Ex: Celesc, Enel, CPFL…"
          />
          <FieldRow
            label="Unidade Consumidora (UC)"
            field={f.consumer_unit}
            value={fUnit}
            onChange={setFUnit}
            placeholder="Número da UC (opcional)"
          />
        </div>

        {error && (
          <div
            className="mb-4 p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 text-sm font-semibold"
            style={{ boxShadow: "3px 3px 0 #dc2626" }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setParseResponse(null);
              setError(null);
            }}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-black text-black font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            style={{ boxShadow: "3px 3px 0 #000" }}
          >
            ↻ Enviar outro arquivo
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#BEFF00] text-black font-black rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
            style={{ boxShadow: "3px 3px 0 #000" }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Calculando…
              </span>
            ) : (
              "Calcular Economia →"
            )}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DROP ZONE SCREEN
  // =========================================================================
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
        className={`border-2 border-black rounded-2xl p-12 text-center cursor-pointer transition-all
          ${isDragActive ? "bg-[#BEFF00]" : "bg-white hover:bg-gray-50"}
          ${status === "uploading" ? "opacity-70 cursor-wait" : ""}`}
        style={{ boxShadow: isDragActive ? "5px 5px 0 #000" : "3px 3px 0 #000" }}
      >
        <input {...getInputProps()} />
        {status === "uploading" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-black border-t-[#BEFF00] rounded-full animate-spin" />
            <p className="text-black font-bold">Lendo sua conta…</p>
            <p className="text-sm text-gray-500">Tentando extrair os dados automaticamente</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">📄</div>
            <p className="text-lg font-black text-black">
              {isDragActive
                ? "Solte o arquivo aqui"
                : "Arraste sua conta de energia ou clique para selecionar"}
            </p>
            <p className="text-sm text-gray-500 mt-2">PDF ou imagem · Máx. 10 MB</p>
            <p className="text-xs text-gray-400 mt-1">
              Funciona com Celesc, Enel, CPFL, Equatorial e outras distribuidoras
            </p>
          </>
        )}
      </div>

      {(status === "error" || error) && (
        <div
          className="mt-4 p-4 bg-white border-2 border-red-500 rounded-xl text-red-700 text-sm font-semibold"
          style={{ boxShadow: "3px 3px 0 #dc2626" }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
