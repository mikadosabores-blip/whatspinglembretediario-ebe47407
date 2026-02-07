import { CalendarClock, LayoutDashboard, Users, Settings, Bell, Building2, GraduationCap, LogOut, MessageCircle, Heart, Baby, History } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { title: "Lembretes", url: "/reminders", icon: Bell, color: "text-amber-500" },
  { title: "Agenda", url: "/agenda", icon: CalendarClock, color: "text-emerald-500" },
  { title: "Histórico", url: "/history", icon: History, color: "text-purple-500" },
];

const categoryItems = [
  { title: "Prestadores", url: "/category/providers", icon: Building2, color: "text-slate-500" },
  { title: "Contatos", url: "/category/contacts", icon: Users, color: "text-cyan-500" },
  { title: "Cursos", url: "/category/courses", icon: GraduationCap, color: "text-orange-500" },
  { title: "Namorado", url: "/category/partners", icon: Heart, color: "text-rose-500" },
  { title: "Pais & Família", url: "/category/family", icon: Baby, color: "text-pink-400" },
];

export function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
    navigate("/");
  };

  const allItems = [...mainItems, ...categoryItems];

  return (
    <Sidebar className="border-r border-border">
      <div className="flex items-center justify-center gap-2 py-4 border-b border-border">
        <MessageCircle className="w-5 h-5 text-primary" strokeWidth={2.5} />
        <span className="text-sm font-bold text-foreground tracking-tight">WhatsPing</span>
      </div>

      <SidebarContent>
        <SidebarMenu className="px-1 py-2 space-y-0.5">
          {allItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                  activeClassName="bg-primary/10 text-primary font-semibold"
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                activeClassName="bg-primary/10 text-primary font-semibold"
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">Configurações</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
