import {
  UploadBillResponse,
  SimulationResponse,
  Supplier,
  Partner,
  LeadCreate,
  LeadResponse,
  BillParseResponse,
  BillConfirmRequest,
  BillConfirmResponse,
  AdminTokenResponse,
  AdminStats,
  AdminLead,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// New hybrid-extraction API
// ---------------------------------------------------------------------------

/**
 * POST /bills/parse
 * Upload a bill and get per-field extraction results.
 */
export async function parseBill(file: File): Promise<BillParseResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/bills/parse`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Falha ao processar a conta.");
  }
  return res.json();
}

/**
 * POST /bills/{id}/confirm
 * User confirms / corrects extracted values → returns bill + simulation.
 */
export async function confirmBill(
  billId: number,
  payload: BillConfirmRequest
): Promise<BillConfirmResponse> {
  const res = await fetch(`${API_BASE}/bills/${billId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Falha ao confirmar os dados.");
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Legacy / unchanged endpoints
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export async function adminLogin(username: string, password: string): Promise<AdminTokenResponse> {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Credenciais inválidas." }));
    throw new Error(err.detail ?? "Erro ao fazer login.");
  }
  return res.json();
}

export async function adminChangePassword(
  token: string,
  current_password: string,
  new_password: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ current_password, new_password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro." }));
    throw new Error(err.detail ?? "Erro ao alterar senha.");
  }
}

export async function adminGetStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Sem autorização.");
  return res.json();
}

export async function adminGetLeads(token: string): Promise<AdminLead[]> {
  const res = await fetch(`${API_BASE}/admin/leads?limit=500`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Sem autorização.");
  return res.json();
}
