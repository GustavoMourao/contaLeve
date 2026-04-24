"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { usePlan } from "@/lib/usePlan";

interface FeatureGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function FeatureGate({
  children,
  title = "Recurso Pro",
  description = "Faça upgrade para o plano Pro para desbloquear este recurso.",
}: FeatureGateProps) {
  const { isPro } = usePlan();

  if (isPro) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-50 saturate-50">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[3px] rounded-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center max-w-xs mx-4">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-500 mb-4">{description}</p>
          <Link
            href="/pricing"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors block text-center"
          >
            Ver planos Pro →
          </Link>
          <p className="text-xs text-slate-400 mt-2">7 dias grátis, sem cartão</p>
        </div>
      </div>
    </div>
  );
}
