import { CalendarClock, LayoutDashboard, Users, Settings, Bell, Building2, GraduationCap, LogOut, MessageCircle, Heart, Baby, History } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Lembretes", url: "/reminders", icon: Bell },
  { title: "Agenda", url: "/agenda", icon: CalendarClock },
  { title: "Histórico", url: "/history", icon: History },
];

const categoryItems = [
  { title: "Prestadores", url: "/category/providers", icon: Building2 },
  { title: "Contatos", url: "/category/contacts", icon: Users },
  { title: "Cursos", url: "/category/courses", icon: GraduationCap },
  { title: "Namorado", url: "/category/partners", icon: Heart },
  { title: "Pais & Família", url: "/category/family", icon: Baby },
];

export function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
    navigate("/");
  };

  return (
    <Sidebar className="border-r border-border">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <MessageCircle className="w-6 h-6 text-primary" strokeWidth={2.5} />
        <span className="text-lg font-extrabold text-foreground tracking-tight">WhatsPing</span>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categorias</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categoryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                    activeClassName="bg-primary/10 text-primary font-semibold"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
