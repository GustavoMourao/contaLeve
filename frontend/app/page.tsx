import BillUploader from "@/components/BillUploader";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12">
      {/* Hero */}
      <section className="text-center pt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Pague menos na{" "}
          <span className="text-green-600">energia elétrica</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          Envie sua conta de energia, veja planos mais baratos em segundos e
          simule sua economia — sem cadastro.
        </p>
      </section>

      {/* Upload card */}
      <section className="w-full max-w-2xl">
        <BillUploader />
      </section>

      {/* How it works */}
      <section className="w-full max-w-3xl">
        <h2 className="text-center text-xl font-semibold text-gray-700 mb-8">
          Como funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: "📤",
              step: "1",
              title: "Envie sua conta",
              desc: "Faça upload do PDF ou foto da sua conta de energia.",
            },
            {
              emoji: "🔍",
              step: "2",
              title: "Analisamos tudo",
              desc: "Extraímos seu consumo e comparamos com dezenas de fornecedores.",
            },
            {
              emoji: "💚",
              step: "3",
              title: "Economize",
              desc: "Veja quanto você pode economizar por mês e por ano.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 shadow-sm text-center"
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
