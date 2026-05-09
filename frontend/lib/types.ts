export interface Bill {
  id: number;
  consumer_unit: string | null;
  monthly_kwh: number;
  tariff: number | null;
  total_cost: number;
  utility: string | null;
  created_at: string;
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
