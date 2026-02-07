import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCadastro = async () => {
    const email = `${whatsapp.replace(/\D/g, "")}@whatsping.app`;
    const { error } = await supabase.auth.signUp({
      email,
      password: whatsapp.replace(/\D/g, ""),
      options: {
        data: { name, whatsapp_number: whatsapp },
      },
    });
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este WhatsApp já está cadastrado. Faça login.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Cadastro realizado! Você já está logado.");
    navigate("/dashboard");
  };

  const handleLogin = async () => {
    const email = `${whatsapp.replace(/\D/g, "")}@whatsping.app`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: whatsapp.replace(/\D/g, ""),
    });
    if (error) {
      toast.error("WhatsApp não encontrado ou dados incorretos.");
      return;
    }
    toast.success("Login realizado com sucesso!");
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp.trim()) return;
    if (tab === "cadastro" && !name.trim()) return;
    setLoading(true);
    try {
      if (tab === "cadastro") {
        await handleCadastro();
      } else {
        await handleLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <MessageCircle className="w-8 h-8 text-primary" strokeWidth={2.5} />
          <span className="text-2xl font-extrabold text-foreground tracking-tight">WhatsPing</span>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius)] bg-primary p-8 md:p-10 shadow-2xl">
          {/* Tabs */}
          <div className="flex rounded-lg bg-primary-foreground/10 p-1 mb-8">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                tab === "login"
                  ? "bg-primary-foreground text-foreground shadow-sm"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setTab("cadastro")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${
                tab === "cadastro"
                  ? "bg-primary-foreground text-foreground shadow-sm"
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-2 leading-tight">
            {tab === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </h1>
          <p className="text-primary-foreground/70 text-sm mb-8">
            {tab === "login"
              ? "Entre com seu WhatsApp para continuar"
              : "Preencha seus dados para começar a usar"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "cadastro" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-primary-foreground text-foreground placeholder:text-muted-foreground pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                placeholder="WhatsApp (ex: 11999999999)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-lg bg-primary-foreground text-foreground placeholder:text-muted-foreground pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background font-bold py-3.5 text-sm hover:opacity-90 transition-opacity mt-2 disabled:opacity-50"
            >
              {loading ? "Aguarde..." : tab === "login" ? "Entrar" : "Cadastrar"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          © 2026 WhatsPing. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default Index;
