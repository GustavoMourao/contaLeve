import BillUploader from "@/components/BillUploader";
import Link from "next/link";
import {
  Upload, Search, Handshake, Leaf,
  Building2, Zap, ShieldCheck,
} from "lucide-react";

const steps = [
  { Icon: Upload, n: "01", title: "Envie sua conta", desc: "Upload do PDF ou foto. Funciona com qualquer distribuidora do Brasil." },
  { Icon: Search, n: "02", title: "Simulamos sua economia", desc: "Nossa IA extrai consumo e tarifa e compara com ofertas reais do mercado livre." },
  { Icon: Handshake, n: "03", title: "Conectamos você ao parceiro certo", desc: "Com um clique, encaminhamos seu interesse ao fornecedor mais adequado. Sem custo." },
];

const partners = [
  { name: "Comerc Energia", tag: "Maior trader independente do Brasil", href: "https://www.comerc.com.br" },
  { name: "Enerlivre", tag: "Especialistas em migração para o ML", href: "https://www.enerlivre.com.br" },
  { name: "Mercado da Energia", tag: "Plataforma de comparação e contratação", href: "https://www.mercadodeenergia.com.br" },
];

const why = [
  { Icon: ShieldCheck, title: "Totalmente gratuito", desc: "Você nunca paga nada. Nossa receita vem de comissão dos parceiros quando você fecha contrato." },
  { Icon: Leaf, title: "Apenas parceiros verificados", desc: "Trabalhamos somente com traders e comercializadoras regulamentadas pela ANEEL." },
  { Icon: Zap, title: "Resultado em 30 segundos", desc: "Sem cadastro, sem senha. Envie a conta e veja a economia imediatamente." },
  { Icon: Building2, title: "Para qualquer porte", desc: "Residências, pequenos comércios, médias e grandes empresas — temos parceiros para cada perfil." },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section id="upload" className="text-center pt-4 md:pt-8">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Leaf className="w-3.5 h-3.5" />
          Gratuito · Sem cadastro · Resultado em 30 segundos
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight max-w-3xl mx-auto tracking-tight">
          Descubra se você está{" "}
          <span className="text-green-600">pagando caro demais</span>{" "}
          na energia
        </h1>
        <p className="mt-5 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Fazemos a ponte entre você e as melhores comercializadoras do mercado livre.
          Você economiza. Nós facilitamos. Sem custo algum para você.
        </p>
        <div className="max-w-2xl mx-auto mt-10">
          <BillUploader />
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900">Como funciona?</h2>
          <p className="text-slate-500 mt-2">Três passos para começar a economizar — sem burocracia</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <s.Icon className="w-5 h-5 text-green-700" />
                </div>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Passo {s.n}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Nossos parceiros</h2>
          <p className="text-slate-500 mt-2">Comercializadoras e traders verificados pela ANEEL</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200 hover:border-green-400 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <Building2 className="w-6 h-6 text-green-700" />
              </div>
              <p className="font-bold text-slate-900">{p.name}</p>
              <p className="text-sm text-slate-500 mt-1">{p.tag}</p>
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          Interessado em se tornar parceiro?{" "}
          <a href="mailto:parcerias@contaleve.com.br" className="text-green-600 hover:underline">
            Entre em contato →
          </a>
        </p>
      </section>

      {/* Why us */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900">Por que usar o contaLeve?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {why.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-green-700" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-10 md:p-14 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Pronto para economizar?</h2>
        <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
          Envie sua conta de energia e descubra em 30 segundos quanto você pode economizar no mercado livre.
        </p>
        <Link
          href="/#upload"
          className="inline-block bg-white hover:bg-green-50 text-green-700 font-bold text-lg px-8 py-4 rounded-2xl transition-colors shadow-md"
        >
          Analisar minha conta agora →
        </Link>
        <p className="text-green-200 text-sm mt-4">Gratuito · Sem cadastro · 30 segundos</p>
      </section>
    </div>
  );
}
