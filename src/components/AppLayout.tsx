import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, Phone } from "lucide-react";

export function AppLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<{ name: string; whatsapp_number: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("name, whatsapp_number")
        .eq("id", session.user.id)
        .single();

      if (mounted) {
        if (data) setProfile(data);
        setReady(true);
      }
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (!ready) return null;

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 13) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    if (digits.length === 12) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
    }
    return phone;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center h-14 px-3 sm:px-4 border-b border-border gap-2 sm:gap-3 overflow-hidden">
            <SidebarTrigger />
            {profile && (
              <div className="flex items-center gap-2 min-w-0">
                <ArrowUp className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">{profile.name}</span>
                <span className="text-xs text-muted-foreground items-center gap-1 hidden sm:flex">
                  <Phone className="h-3 w-3 shrink-0" />
                  {formatPhone(profile.whatsapp_number)}
                </span>
              </div>
            )}
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
