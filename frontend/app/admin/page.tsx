"use client";

import { useEffect, useState, useCallback } from "react";
import { adminLogin, adminChangePassword, adminGetStats, adminGetLeads } from "@/lib/api";
import { AdminStats, AdminLead } from "@/lib/types";

// ── Design-system tokens ──────────────────────────────────────────────────
const DS = {
  charcoal: "#191a23",
  offwhite: "#f3f3f3",
  white: "#ffffff",
  green: "#a3e635",
  greenVivid: "#c0ff2b",
  gray: "#888888",
  error: "#f02070",
  shadowSm: "3px 3px 0 #191a23",
  shadowMd: "5px 5px 0 #191a23",
  shadowAccent: "5px 5px 0 #a3e635",
  border: "2.5px solid #191a23",
} as const;

const VOLTAGE_LABEL: Record<string, string> = {
  low: "Baixa tensão",
  medium: "Média tensão",
  high: "Alta tensão",
};

const inputCls =
  "w-full rounded-[10px] px-4 py-2.5 text-sm font-semibold focus:outline-none";
const inputStyle = {
  border: DS.border,
  background: DS.white,
  color: DS.charcoal,
  boxShadow: DS.shadowSm,
};

type Screen = "login" | "change-password" | "dashboard";

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-[18px] p-5 flex flex-col gap-1"
      style={{
        border: DS.border,
        boxShadow: accent ? DS.shadowAccent : DS.shadowSm,
        background: accent ? DS.charcoal : DS.white,
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: accent ? DS.green : DS.gray }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-black"
        style={{ color: accent ? DS.greenVivid : DS.charcoal }}
      >
        {value}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Change-password form
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpNew2, setCpNew2] = useState("");

  // Dashboard data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Restore token from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
      setScreen("dashboard");
    }
  }, []);

  const loadDashboard = useCallback(async (t: string) => {
    setDataLoading(true);
    try {
      const [s, l] = await Promise.all([adminGetStats(t), adminGetLeads(t)]);
      setStats(s);
      setLeads(l);
    } catch {
      setError("Sessão expirada. Faça login novamente.");
      sessionStorage.removeItem("admin_token");
      setToken(null);
      setScreen("login");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen === "dashboard" && token) {
      loadDashboard(token);
    }
  }, [screen, token, loadDashboard]);

  // ── Login ──────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await adminLogin(username, password);
      setToken(res.access_token);
      sessionStorage.setItem("admin_token", res.access_token);
      if (res.must_change_password) {
        setScreen("change-password");
      } else {
        setScreen("dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpNew !== cpNew2) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await adminChangePassword(token, cpCurrent, cpNew);
      setScreen("dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
    setScreen("login");
    setUsername("");
    setPassword("");
    setStats(null);
    setLeads([]);
    setError(null);
  };

  // ── Render: Login ──────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: DS.offwhite }}
      >
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-[24px] p-8 flex flex-col gap-5"
          style={{ border: DS.border, boxShadow: DS.shadowMd, background: DS.white }}
        >
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: DS.gray }}
            >
              contaLeve
            </p>
            <h1 className="text-2xl font-black" style={{ color: DS.charcoal }}>
              Área administrativa
            </h1>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: DS.gray }}>
              Usuário
            </label>
            <input
              className={inputCls}
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: DS.gray }}>
              Senha
            </label>
            <input
              type="password"
              className={inputCls}
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm font-semibold" style={{ color: DS.error }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[12px] py-3 text-sm font-black uppercase tracking-widest transition-opacity disabled:opacity-60"
            style={{
              border: DS.border,
              background: DS.greenVivid,
              color: DS.charcoal,
              boxShadow: DS.shadowSm,
            }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  // ── Render: Change password ────────────────────────────────────────────
  if (screen === "change-password") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: DS.offwhite }}
      >
        <form
          onSubmit={handleChangePassword}
          className="w-full max-w-sm rounded-[24px] p-8 flex flex-col gap-5"
          style={{ border: DS.border, boxShadow: DS.shadowMd, background: DS.white }}
        >
          <div>
            <div
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{ background: DS.greenVivid, border: DS.border }}
            >
              Primeiro acesso
            </div>
            <h1 className="text-2xl font-black" style={{ color: DS.charcoal }}>
              Defina sua senha
            </h1>
            <p className="text-sm mt-1" style={{ color: DS.gray }}>
              Por segurança, troque a senha padrão antes de continuar.
            </p>
          </div>

          {[
            { label: "Senha atual", val: cpCurrent, set: setCpCurrent },
            { label: "Nova senha", val: cpNew, set: setCpNew },
            { label: "Confirmar nova senha", val: cpNew2, set: setCpNew2 },
          ].map(({ label, val, set }) => (
            <div key={label} className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: DS.gray }}>
                {label}
              </label>
              <input
                type="password"
                className={inputCls}
                style={inputStyle}
                value={val}
                onChange={(e) => set(e.target.value)}
                required
                minLength={label === "Senha atual" ? 1 : 6}
              />
            </div>
          ))}

          {error && (
            <p className="text-sm font-semibold" style={{ color: DS.error }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[12px] py-3 text-sm font-black uppercase tracking-widest disabled:opacity-60"
            style={{
              border: DS.border,
              background: DS.greenVivid,
              color: DS.charcoal,
              boxShadow: DS.shadowSm,
            }}
          >
            {loading ? "Salvando…" : "Salvar e continuar"}
          </button>
        </form>
      </div>
    );
  }

  // ── Render: Dashboard ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: DS.offwhite }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: DS.border, background: DS.charcoal }}
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: DS.green }}>
            contaLeve
          </span>
          <h1 className="text-lg font-black" style={{ color: DS.white }}>
            Painel Administrativo
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(token!)}
            className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-[8px]"
            style={{ border: "2px solid #a3e635", color: DS.green, background: "transparent" }}
          >
            Atualizar
          </button>
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-[8px]"
            style={{ border: DS.border, color: DS.charcoal, background: DS.greenVivid }}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto flex flex-col gap-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: DS.green, borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <>
            {/* ── Stats ── */}
            {stats && (
              <>
                <section>
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: DS.gray }}>
                    Visão geral
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Total de leads" value={stats.total} accent />
                    <StatCard label="Baixa tensão" value={stats.by_voltage.low} />
                    <StatCard label="Média tensão" value={stats.by_voltage.medium} />
                    <StatCard label="Alta tensão" value={stats.by_voltage.high} />
                  </div>
                </section>

                {/* By state */}
                {stats.by_state.length > 0 && (
                  <section>
                    <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: DS.gray }}>
                      Leads por estado
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {stats.by_state.map(({ state, count }) => (
                        <span
                          key={state}
                          className="px-3 py-1.5 rounded-[10px] text-xs font-bold"
                          style={{ border: DS.border, background: DS.white, boxShadow: DS.shadowSm }}
                        >
                          {state}{" "}
                          <span
                            className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black"
                            style={{ background: DS.greenVivid }}
                          >
                            {count}
                          </span>
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── Leads table ── */}
            <section>
              <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: DS.gray }}>
                Todos os leads ({leads.length})
              </h2>
              <div
                className="rounded-[18px] overflow-hidden"
                style={{ border: DS.border, boxShadow: DS.shadowSm }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: DS.charcoal }}>
                        {[
                          "#",
                          "Nome",
                          "E-mail",
                          "Telefone",
                          "Estado",
                          "Grupo",
                          "Economia est.",
                          "Status",
                          "Data",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                            style={{ color: DS.green }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-sm" style={{ color: DS.gray }}>
                            Nenhum lead ainda.
                          </td>
                        </tr>
                      )}
                      {leads.map((lead, i) => (
                        <tr
                          key={lead.id}
                          style={{
                            background: i % 2 === 0 ? DS.white : DS.offwhite,
                            borderBottom: `1px solid #e5e5e5`,
                          }}
                        >
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: DS.gray }}>
                            {lead.id}
                          </td>
                          <td className="px-4 py-3 font-semibold" style={{ color: DS.charcoal }}>
                            {lead.name}
                          </td>
                          <td className="px-4 py-3" style={{ color: DS.charcoal }}>
                            <a href={`mailto:${lead.email}`} style={{ color: DS.charcoal }}>
                              {lead.email}
                            </a>
                          </td>
                          <td className="px-4 py-3" style={{ color: DS.gray }}>
                            {lead.phone ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-bold" style={{ color: DS.charcoal }}>
                            {lead.state ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded-[6px] text-[10px] font-black uppercase"
                              style={{
                                background:
                                  lead.voltage_level === "high"
                                    ? DS.charcoal
                                    : lead.voltage_level === "medium"
                                    ? "#ffd60a"
                                    : DS.greenVivid,
                                color:
                                  lead.voltage_level === "high" ? DS.green : DS.charcoal,
                                border: DS.border,
                              }}
                            >
                              {VOLTAGE_LABEL[lead.voltage_level] ?? lead.voltage_level}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold" style={{ color: "#16a34a" }}>
                            {lead.estimated_savings != null
                              ? `R$ ${lead.estimated_savings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded-[6px] text-[10px] font-black uppercase"
                              style={{
                                background: DS.offwhite,
                                border: DS.border,
                                color: DS.charcoal,
                              }}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: DS.gray }}>
                            {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
