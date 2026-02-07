import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      setUserName(session.user.user_metadata?.name || "Usuário");
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <span className="text-lg font-extrabold text-foreground tracking-tight">WhatsPing</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </header>

      <main className="flex items-center justify-center p-6" style={{ minHeight: "calc(100vh - 65px)" }}>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Olá, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao WhatsPing. Em breve novas funcionalidades aqui.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
