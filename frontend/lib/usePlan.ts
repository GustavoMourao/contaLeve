"use client";

import { useState, useEffect } from "react";

export type Plan = "free" | "pro";

const STORAGE_KEY = "contaLeve_plan";

export function usePlan() {
  const [plan, setPlan] = useState<Plan>("free");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Plan | null;
      if (stored === "pro") setPlan("pro");
    } catch {
      /* SSR / private browsing — stay free */
    }
  }, []);

  const upgradeToPro = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "pro");
    } catch {}
    setPlan("pro");
  };

  const downgradeFree = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPlan("free");
  };

  return { plan, isPro: plan === "pro", upgradeToPro, downgradeFree };
}
