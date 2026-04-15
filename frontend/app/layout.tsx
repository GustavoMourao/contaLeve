import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "contaLeve – Economize na energia elétrica",
  description:
    "Envie sua conta de energia e descubra em 30 segundos quanto pode economizar trocando de fornecedor. Gratuito, sem cadastro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2 md:col-span-1">
                <div className="font-bold text-slate-900 text-lg mb-2">
                  conta<span className="text-green-600">Leve</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Comparação de energia simples, transparente e gratuita para
                  brasileiros.
                </p>
              </div>
              <div>
                <div className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                  Produto
                </div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li>
                    <a href="/" className="hover:text-green-600 transition-colors">
                      Analisar conta
                    </a>
                  </li>
                  <li>
                    <a href="/compare" className="hover:text-green-600 transition-colors">
                      Comparar planos
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="hover:text-green-600 transition-colors">
                      Preços
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                  Ferramentas Pro
                </div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li>
                    <a href="/pricing" className="hover:text-green-600 transition-colors">
                      Calculadora solar
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="hover:text-green-600 transition-colors">
                      Alertas de preço
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="hover:text-green-600 transition-colors">
                      Relatórios PDF
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="hover:text-green-600 transition-colors">
                      Multi-imóveis
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                  Empresa
                </div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li>
                    <a href="#" className="hover:text-green-600 transition-colors">
                      Sobre
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-green-600 transition-colors">
                      Privacidade
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-green-600 transition-colors">
                      Termos de uso
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <p>© {new Date().getFullYear()} contaLeve · Todos os direitos reservados</p>
              <p>Feito com 💚 para o mercado de energia brasileiro</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
