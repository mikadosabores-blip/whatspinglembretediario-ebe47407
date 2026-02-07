import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Phone, Bell, Save } from "lucide-react";

const Settings = () => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [defaultRemindDays, setDefaultRemindDays] = useState("1");
  const [defaultRemindHours, setDefaultRemindHours] = useState("2");
  const [defaultRemindMinutes, setDefaultRemindMinutes] = useState("30");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setWhatsapp(profile.whatsapp_number || "");
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({ name, whatsapp_number: whatsapp })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Configurações</h1>

      <div className="max-w-lg space-y-6">
        {/* Profile Section */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-card-foreground">Perfil</h2>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="mt-1" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Número do WhatsApp</Label>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5511999999999"
                className="flex-1"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Formato: código do país + DDD + número (ex: 5511999999999)
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-card-foreground">Notificações</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">Lembretes no WhatsApp</p>
              <p className="text-xs text-muted-foreground">Receber lembretes automáticos via WhatsApp</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>

          <div>
            <Label className="text-xs font-semibold text-card-foreground">Lembretes padrão para novos compromissos</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Dias antes</Label>
                <Select value={defaultRemindDays} onValueChange={setDefaultRemindDays}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 5, 7].map((d) => (
                      <SelectItem key={d} value={String(d)}>{d} dia{d !== 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Horas antes</Label>
                <Select value={defaultRemindHours} onValueChange={setDefaultRemindHours}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 4, 6, 12].map((h) => (
                      <SelectItem key={h} value={String(h)}>{h} hora{h !== 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Minutos antes</Label>
                <Select value={defaultRemindMinutes} onValueChange={setDefaultRemindMinutes}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 10, 15, 30, 45].map((m) => (
                      <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </AppLayout>
  );
};

export default Settings;
