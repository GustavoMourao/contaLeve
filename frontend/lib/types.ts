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

export interface SupplierSimulationResult {
  supplier: Supplier;
  monthly_cost: number;
  monthly_savings: number;
  yearly_savings: number;
}

export interface SimulationResponse {
  current_cost: number;
  monthly_kwh: number;
  best_option: SupplierSimulationResult;
  all_options: SupplierSimulationResult[];
}

export interface UploadBillResponse {
  bill: Bill;
  message: string;
}
