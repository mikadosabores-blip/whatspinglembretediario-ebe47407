import { useState } from "react";
import { MessageCircle, ArrowRight, User, Phone } from "lucide-react";

const Index = () => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) return;
    console.log("Login:", { name, whatsapp });
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-2 leading-tight">
            Acesse sua conta
          </h1>
          <p className="text-primary-foreground/70 text-sm mb-8">
            Entre com seu nome e WhatsApp para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-foreground text-background font-bold py-3.5 text-sm hover:opacity-90 transition-opacity mt-2"
            >
              Entrar
              <ArrowRight className="w-4 h-4" />
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
