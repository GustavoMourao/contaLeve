import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "contaLeve – Pague menos na energia elétrica",
  description:
    "Envie sua conta de energia e descubra quanto você pode economizar trocando de fornecedor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <a href="/" className="text-xl font-bold text-green-600">
              contaLeve
            </a>
            <nav className="ml-auto flex gap-4 text-sm text-gray-600">
              <a href="/" className="hover:text-green-600">Início</a>
              <a href="/compare" className="hover:text-green-600">Comparar</a>
              <a href="/dashboard" className="hover:text-green-600">Histórico</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-6">
          © {new Date().getFullYear()} contaLeve · Economia de energia simples e transparente
        </footer>
      </body>
    </html>
  );
}
