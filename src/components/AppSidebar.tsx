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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <Sidebar className="border-r border-border w-16">
      <div className="flex items-center justify-center py-4 border-b border-border">
        <MessageCircle className="w-6 h-6 text-primary" strokeWidth={2.5} />
      </div>

      <SidebarContent>
        <SidebarMenu className="px-2 py-2 space-y-1">
          {allItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center justify-center p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      activeClassName="bg-primary/10"
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </NavLink>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    activeClassName="bg-primary/10"
                  >
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </NavLink>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">
                Configurações
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 w-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Sair
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
