import { UploadBillResponse, SimulationResponse, Supplier, Partner, LeadCreate, LeadResponse } from "./types";

const API_BASE = "/api";

export async function uploadBill(file: File): Promise<UploadBillResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload-bill`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Upload failed");
  }
  return res.json();
}

export async function getSuppliers(): Promise<Supplier[]> {
  const res = await fetch(`${API_BASE}/suppliers`);
  if (!res.ok) throw new Error("Failed to fetch suppliers");
  return res.json();
}

export async function getPartners(): Promise<Partner[]> {
  const res = await fetch(`${API_BASE}/partners`);
  if (!res.ok) throw new Error("Failed to fetch partners");
  return res.json();
}

export async function simulate(
  monthly_kwh: number,
  current_cost: number
): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monthly_kwh, current_cost }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Simulation failed");
  }
  return res.json();
}

export async function submitLead(payload: LeadCreate): Promise<LeadResponse> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Failed to submit lead");
  }
  return res.json();
}

export async function getLeads(status?: string): Promise<LeadResponse[]> {
  const url = status ? `${API_BASE}/leads?status=${status}` : `${API_BASE}/leads`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function updateLeadStatus(
  leadId: number,
  status: string,
  notes?: string
): Promise<LeadResponse> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}
