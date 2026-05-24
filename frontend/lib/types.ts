export interface Bill {
  id: number;
  consumer_unit: string | null;
  monthly_kwh: number;
  tariff: number | null;
  total_cost: number;
  utility: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Hybrid extraction types
// ---------------------------------------------------------------------------

export type FieldStatus = "extracted" | "uncertain" | "missing";

export interface ExtractedField {
  value: string | null;
  status: FieldStatus;
  confidence: number;   // 0.0 – 1.0
  hint: string | null;
}

export interface BillParseResponse {
  bill_id: number;
  extraction_status: "complete" | "partial" | "manual_required";
  fields: {
    utility: ExtractedField;
    consumer_unit: ExtractedField;
    monthly_kwh: ExtractedField;
    total_cost: ExtractedField;
    tariff: ExtractedField;
  };
  message: string;
  next_action: "simulate" | "confirm_fields";
}

export interface BillConfirmRequest {
  monthly_kwh: number;
  total_cost: number;
  tariff?: number;
  utility?: string;
  consumer_unit?: string;
}

export interface BillConfirmResponse {
  bill: Bill;
  simulation: SimulationResponse | null;
}

export interface Supplier {
  id: number;
  name: string;
  price_per_kwh: number;
  type: "fixed" | "variable";
  renewable: boolean;
  description: string | null;
  created_at: string;
}

export interface Partner {
  id: number;
  name: string;
  slug: string;
  website: string | null;
  logo_url: string | null;
  description: string | null;
}

export interface SupplierSimulationResult {
  supplier: Supplier;
  monthly_cost: number;
  monthly_savings: number;
  yearly_savings: number;
  savings_percentage: number;
}

export interface SimulationResponse {
  current_cost: number;
  monthly_kwh: number;
  best_option: SupplierSimulationResult;
  all_options: SupplierSimulationResult[];
  estimated_savings_min: number;
  estimated_savings_max: number;
  recommended_contract_type: string;
}

export interface UploadBillResponse {
  bill: Bill;
  message: string;
  status: "success" | "partial";
  extraction_notes?: string;
  kwh_extraction_method?: string;
  cost_extraction_method?: string;
  kwh_confidence?: string;
  cost_confidence?: string;
}

export type VoltageLevel = "low" | "medium" | "high";
export type LeadStatus = "new" | "sent" | "in_negotiation" | "converted" | "lost";

export interface LeadCreate {
  name: string;
  email: string;
  phone?: string;
  state?: string;
  city?: string;
  monthly_kwh: number;
  current_cost: number;
  utility?: string;
  voltage_level: VoltageLevel;
  estimated_savings?: number;
  partner_id?: number;
}

export interface LeadResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  city: string | null;
  monthly_kwh: number;
  current_cost: number;
  utility: string | null;
  voltage_level: VoltageLevel;
  estimated_savings: number | null;
  status: LeadStatus;
  notes: string | null;
  partner: Partner | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Admin types
// ---------------------------------------------------------------------------

export interface AdminTokenResponse {
  access_token: string;
  token_type: string;
  must_change_password: boolean;
}

export interface AdminStats {
  total: number;
  by_voltage: { low: number; medium: number; high: number };
  by_state: { state: string; count: number }[];
}

export interface AdminLead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  city: string | null;
  voltage_level: string;
  monthly_kwh: number;
  current_cost: number;
  estimated_savings: number | null;
  status: string;
  created_at: string;
}
