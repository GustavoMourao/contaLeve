"use client";

import Link from "next/link";
import { CheckCircle, X } from "lucide-react";
import { usePlan } from "@/lib/usePlan";

const freeFeatures = [
  "Upload da conta (PDF ou foto)",
  "Análise automática do consumo",
  "Melhor oferta do mercado revelada",
  "Economia mensal e anual estimada",
  "Estimativa de CO₂ reduzido",
];

const proOnlyFeatures = [
  "Comparativo completo de todos os fornecedores",
  "Histórico e gráficos de consumo (12 meses)",
  "Calculadora de energia solar (ROI)",
  "Alertas automáticos de preço por e-mail",
  "Relatórios em PDF profissionais",
  "Gerenciamento de múltiplos imóveis (até 50)",
  "Assistente de troca de contrato",
  "Previsão de consumo com IA",
  "Monitoramento contínuo mensal",
  "Suporte prioritário",
];

const comparison = [
  { feature: "Upload de conta", free: true, pro: true },
  { feature: "Melhor oferta revelada", free: true, pro: true },
  { feature: "Estimativa de economia", free: true, pro: true },
  { feature: "Comparativo CO₂", free: true, pro: true },
  { feature: "Todos os fornecedores", free: false, pro: true },
  { feature: "Histórico 12 meses", free: false, pro: true },
  { feature: "Calculadora solar", free: false, pro: true },
  { feature: "Alertas de preço", free: false, pro: true },
  { feature: "Relatórios PDF", free: false, pro: true },
  { feature: "Multi-imóveis (até 50)", free: false, pro: true },
  { feature: "Assistente de troca", free: false, pro: true },
  { feature: "Previsão IA", free: false, pro: true },
  { feature: "Suporte prioritário", free: false, pro: true },
];

const faqs = [
  {
    q: "O plano Básico é realmente gratuito?",
    a: "Sim, 100% gratuito e sem cadastro. Basta enviar sua conta e ver o resultado na hora.",
  },
  {
    q: "Preciso de cartão de crédito para testar o Pro?",
    a: "Não. Os 7 dias de teste gratuito não exigem cartão. Você só paga se decidir continuar.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Cancele a qualquer momento pelo painel sem burocracia. Sem multas.",
  },
  {
    q: "O plano Pro funciona para empresas?",
    a: "Sim! O plano Pro é ideal para síndicos, gestores de facilities, pequenas e médias empresas com múltiplos medidores.",
  },
  {
    q: "Como funciona o gerenciamento de múltiplos imóveis?",
    a: "Você cadastra até 50 unidades consumidoras e vê o comparativo e economias de cada uma em um painel unificado.",
  },
];

export default function PricingPage() {
  const { isPro, upgradeToPro, downgradeFree } = usePlan();

  return (
    <div className="flex flex-col gap-16">
      {/* Header */}
      <section className="text-center pt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Planos simples e transparentes
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          Comece grátis. Sem cartão. Sem surpresas.
        </p>

        {isPro && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
            ✅ Você está no plano Pro
            <button
              onClick={downgradeFree}
              className="text-xs text-slate-400 hover:text-red-500 ml-1 transition-colors"
            >
              (reverter para grátis)
            </button>
          </div>
        )}
      </section>

      {/* Plan cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
        {/* Free */}
        <div className="rounded-2xl p-8 border border-slate-200 bg-white flex flex-col">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Básico
          </p>
          <div className="text-5xl font-extrabold text-slate-900">Grátis</div>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            Para quem quer uma análise rápida do mercado
          </p>
          <ul className="space-y-3 flex-1">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-8 block text-center border-2 border-slate-200 hover:border-green-400 hover:text-green-700 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {isPro ? "Voltar ao básico" : "Começar grátis →"}
          </Link>
        </div>

        {/* Pro */}
        <div className="rounded-2xl p-8 bg-green-600 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-5 right-5 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
            MAIS POPULAR
          </div>
          <p className="text-xs font-bold text-green-200 uppercase tracking-widest mb-2">
            Pro
          </p>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-extrabold text-white">R$ 19,90</span>
            <span className="text-green-300 text-base mb-1.5">/mês</span>
          </div>
          <p className="text-green-200 text-sm mt-2 mb-6">
            Para gestores, síndicos e quem quer economizar de verdade
          </p>
          <ul className="space-y-3 flex-1">
            <li className="flex items-start gap-2 text-sm text-white font-medium">
              <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 shrink-0" />
              Tudo do plano Básico
            </li>
            {proOnlyFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-white">
                <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="mt-8 block text-center bg-white text-green-700 font-semibold py-3 rounded-xl text-sm">
              ✅ Plano ativo
            </div>
          ) : (
            <button
              onClick={upgradeToPro}
              className="mt-8 block w-full text-center bg-white hover:bg-green-50 text-green-700 font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer"
            >
              Experimentar 7 dias grátis →
            </button>
          )}
          <p className="text-green-200 text-xs text-center mt-2">
            Sem cartão · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-3xl mx-auto w-full">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-6">
          Comparativo completo
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-4 text-slate-500 font-medium">
                  Recurso
                </th>
                <th className="text-center px-5 py-4 text-slate-700 font-bold">
                  Básico
                </th>
                <th className="text-center px-5 py-4 text-green-700 font-bold">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(({ feature, free, pro }, i) => (
                <tr
                  key={feature}
                  className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                >
                  <td className="px-5 py-3.5 text-slate-700">{feature}</td>
                  <td className="text-center px-5 py-3.5">
                    {free ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="text-center px-5 py-3.5">
                    {pro ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-6">
          Perguntas frequentes
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 text-center text-white">
        <h2 className="text-3xl font-extrabold mb-2">Comece grátis agora</h2>
        <p className="text-green-100 mb-6">
          Sem cadastro. Resultado em 30 segundos.
        </p>
        <Link
          href="/"
          className="inline-block bg-white hover:bg-green-50 text-green-700 font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-md text-sm"
        >
          Analisar minha conta →
        </Link>
      </section>
    </div>
  );
}
