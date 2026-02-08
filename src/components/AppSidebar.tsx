import { CalendarClock, LayoutDashboard, Users, Settings, Bell, Building2, GraduationCap, LogOut, MessageCircle, Heart, Baby, History } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCallback } from "react";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { title: "Lembretes", url: "/reminders", icon: Bell, color: "text-amber-500" },
  { title: "Agenda", url: "/agenda", icon: CalendarClock, color: "text-emerald-500" },
  { title: "Histórico", url: "/history", icon: History, color: "text-purple-500" },
] as const;

const categoryItems = [
  { title: "Prestadores", url: "/category/providers", icon: Building2, color: "text-slate-500" },
  { title: "Contatos", url: "/category/contacts", icon: Users, color: "text-cyan-500" },
  { title: "Cursos", url: "/category/courses", icon: GraduationCap, color: "text-orange-500" },
  { title: "Namorado", url: "/category/partners", icon: Heart, color: "text-rose-500" },
  { title: "Pais & Família", url: "/category/family", icon: Baby, color: "text-pink-400" },
] as const;

const allItems = [...mainItems, ...categoryItems];

export function AppSidebar() {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
    navigate("/");
  };

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar className="border-r border-border">
      <div className="flex items-center justify-center gap-3 py-5 border-b border-border">
        <MessageCircle className="w-6 h-6 text-primary shrink-0" strokeWidth={2.5} />
        <span className="text-base font-bold text-foreground tracking-tight">WhatsPing</span>
      </div>

      <SidebarContent className="overflow-x-hidden">
        <nav className="px-2 py-3 space-y-1">
          {allItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              onClick={closeMobileSidebar}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              activeClassName="bg-primary/10 text-primary font-semibold"
            >
              <item.icon className={`h-5 w-5 shrink-0 ${item.color}`} />
              <span>{item.title}</span>
            </NavLink>
          ))}

          <NavLink
            to="/settings"
            onClick={closeMobileSidebar}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
            activeClassName="bg-primary/10 text-primary font-semibold"
          >
            <Settings className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span>Configurações</span>
          </NavLink>
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-4 w-full text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
