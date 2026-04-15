import BillUploader from "@/components/BillUploader";
import Link from "next/link";
import {
  Upload,
  Search,
  TrendingDown,
  Leaf,
  CheckCircle,
  BarChart2,
  Bell,
  FileText,
  Sun,
  Home as HomeIcon,
  RefreshCw,
  Cpu,
  Shield,
} from "lucide-react";

const steps = [
  {
    Icon: Upload,
    step: "01",
    title: "Envie sua conta",
    desc: "Upload do PDF ou foto da conta de energia. Funciona com qualquer distribuidora do Brasil.",
  },
  {
    Icon: Search,
    step: "02",
    title: "Analisamos tudo",
    desc: "Nossa IA extrai consumo, tarifa e distribuidora e compara com dezenas de fornecedores em segundos.",
  },
  {
    Icon: TrendingDown,
    step: "03",
    title: "Economize agora",
    desc: "Veja exatamente quanto pode economizar por mês e por ano, e como trocar de fornecedor.",
  },
];

const freeFeatures = [
  "Upload de conta (PDF ou foto)",
  "Análise automática do consumo",
  "Melhor oferta do mercado revelada",
  "Economia mensal e anual estimada",
  "Comparação de CO₂ emitido",
];

const proFeatures = [
  "Tudo do plano Básico",
  "Comparativo completo de todos os fornecedores",
  "Histórico e gráficos de 12 meses",
  "Calculadora de energia solar ☀️",
  "Alertas automáticos de preço 🔔",
  "Relatórios em PDF profissionais 📋",
  "Gerenciamento de múltiplos imóveis 🏠",
  "Assistente de troca de contrato 🔄",
  "Previsão de consumo com IA 🤖",
];

const proTools = [
  {
    Icon: BarChart2,
    title: "Painel de Mercado",
    desc: "Comparativo em tempo real de todos os fornecedores disponíveis na sua região.",
  },
  {
    Icon: Sun,
    title: "Calculadora Solar",
    desc: "Estime o retorno do investimento em painéis solares com base no seu consumo real.",
  },
  {
    Icon: Bell,
    title: "Alertas de Preço",
    desc: "Receba notificações automáticas quando surgir uma oferta melhor para você.",
  },
  {
    Icon: FileText,
    title: "Relatórios em PDF",
    desc: "Gere relatórios profissionais de economia — ideal para síndicos e gestores.",
  },
  {
    Icon: HomeIcon,
    title: "Multi-imóveis",
    desc: "Gerencie até 50 unidades consumidoras em um único painel centralizado.",
  },
  {
    Icon: RefreshCw,
    title: "Assistente de Troca",
    desc: "Guia passo a passo para trocar de fornecedor com segurança e sem burocracia.",
  },
  {
    Icon: Cpu,
    title: "Previsão de Consumo IA",
    desc: "Previsão inteligente do consumo dos próximos 3 meses baseada no seu histórico.",
  },
  {
    Icon: Shield,
    title: "Monitoramento Contínuo",
    desc: "Auditoria automática mensal: verificamos se você ainda tem o melhor contrato.",
  },
];

const testimonials = [
  {
    quote:
      "Em menos de um minuto descobri que podia economizar R$ 87 por mês. Já fiz a troca e está valendo demais!",
    name: "Carla Mendonça",
    role: "Moradora de apartamento · São Paulo",
  },
  {
    quote:
      "Uso o Pro para gerenciar os 8 imóveis do condomínio. Os relatórios em PDF facilitam muito a prestação de contas.",
    name: "Roberto Farias",
    role: "Síndico profissional · Rio de Janeiro",
  },
  {
    quote:
      "Achei que ia ser complicado. Enviei a foto da conta, em 30 segundos já tinha o resultado. Impressionante.",
    name: "Ana Luiza Costa",
    role: "Pequena empresária · Minas Gerais",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      {/* -- Hero -- */}
      <section id="upload" className="text-center pt-4 md:pt-8">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Leaf className="w-3.5 h-3.5" />
          Gratuito · Sem cadastro · Resultado em 30 segundos
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight max-w-3xl mx-auto tracking-tight">
          Descubra se você está{" "}
          <span className="text-green-600">pagando caro demais</span> na
          energia
        </h1>

        <p className="mt-5 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Envie sua conta de energia e veja em segundos quanto pode economizar
          trocando de fornecedor — sem cadastro, sem complicação.
        </p>

        {/* Trust stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-10 mb-8">
          {[
            { value: "12.400+", label: "contas analisadas" },
            { value: "R$ 2,1M", label: "economizados" },
            { value: "4.9 ★", label: "avaliação média" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold text-slate-900">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Uploader */}
        <div className="max-w-2xl mx-auto">
          <BillUploader />
        </div>
      </section>

      {/* -- How it works -- */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Como funciona?
          </h2>
          <p className="text-slate-500 mt-2">
            Três passos simples para começar a economizar
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <s.Icon className="w-5 h-5 text-green-700" />
                </div>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                  Passo {s.step}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">
                {s.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -- Free vs Pro -- */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Planos simples e transparentes
          </h2>
          <p className="text-slate-500 mt-2">
            Comece grátis. Evolua quando precisar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl p-6 border border-slate-200">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Básico
            </p>
            <div className="text-4xl font-extrabold text-slate-900">Grátis</div>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Para quem quer uma análise rápida
            </p>
            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/#upload"
              className="mt-6 block text-center border border-slate-200 hover:border-green-400 hover:text-green-700 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Começar grátis →
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-6 bg-green-600 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              POPULAR
            </div>
            <p className="text-sm font-semibold text-green-200 uppercase tracking-wide mb-1">
              Pro
            </p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-white">
                R$ 19,90
              </span>
              <span className="text-green-300 text-sm mb-1">/mês</span>
            </div>
            <p className="text-green-200 text-sm mt-1 mb-6">
              Para gestores e quem quer economizar de verdade
            </p>
            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-white"
                >
                  <CheckCircle className="w-4 h-4 text-green-300 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-6 block text-center bg-white hover:bg-green-50 text-green-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Experimentar 7 dias grátis →
            </Link>
          </div>
        </div>
      </section>

      {/* -- Pro tools grid -- */}
      <section>
        <div className="text-center mb-10">
          <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
            Exclusivo Pro
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Ferramentas para economizar de verdade
          </h2>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">
            Vá além da análise básica. O plano Pro traz um conjunto completo de
            ferramentas para gestores, síndicos e famílias com múltiplos imóveis.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {proTools.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-green-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/pricing"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Ver todos os recursos Pro →
          </Link>
        </div>
      </section>

      {/* -- Testimonials -- */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900">
            O que dizem nossos usuários
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg leading-none">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -- Final CTA -- */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 md:p-14 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
          Pronto para economizar?
        </h2>
        <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
          Junte-se a mais de 12.000 pessoas que já descobriram quanto pagam a
          mais na energia.
        </p>
        <Link
          href="/#upload"
          className="inline-block bg-white hover:bg-green-50 text-green-700 font-bold text-lg px-8 py-4 rounded-2xl transition-colors shadow-md"
        >
          Analisar minha conta agora →
        </Link>
        <p className="text-green-200 text-sm mt-4">
          Gratuito · Sem cadastro · Resultado em 30 segundos
        </p>
      </section>
    </div>
  );
}
