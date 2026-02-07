import { useState } from "react";
import { UserContact, CONTACT_LABELS, useContacts } from "@/hooks/useContacts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, Trash2, Users, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WhatsAppCheckResult {
  exists: boolean;
  profileName?: string | null;
  profilePicUrl?: string | null;
}

export function ContactsManager() {
  const { contacts, loading, addContact, deleteContact, canAddMore } = useContacts();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newLabel, setNewLabel] = useState("familia");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<WhatsAppCheckResult | null>(null);

  const handleCheckWhatsApp = async () => {
    if (!newWhatsapp.trim() || newWhatsapp.replace(/\D/g, "").length < 10) {
      toast.error("Digite um número válido");
      return;
    }

    setChecking(true);
    setCheckResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("check-whatsapp", {
        body: { phone: newWhatsapp },
      });

      if (error) {
        toast.error("Erro ao verificar número");
        return;
      }

      setCheckResult(data as WhatsAppCheckResult);

      if (data.exists) {
        toast.success("✅ Número encontrado no WhatsApp!");
        if (data.profileName && !newName.trim()) {
          setNewName(data.profileName);
        }
      } else {
        toast.error("❌ Número não encontrado no WhatsApp");
      }
    } catch {
      toast.error("Erro ao verificar número");
    } finally {
      setChecking(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newWhatsapp.trim()) return;

    const success = await addContact({
      name: newName.trim(),
      whatsapp_number: newWhatsapp,
      label: newLabel,
    });
    if (success) {
      setNewName("");
      setNewWhatsapp("");
      setNewLabel("familia");
      setCheckResult(null);
      setShowForm(false);
    }
  };

  const formatPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 13) {
      return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
    }
    if (clean.length === 12) {
      return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
    }
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    return phone;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-card-foreground">Contatos para lembretes</h2>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {contacts.length}/3
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Adicione até 3 pessoas que podem receber lembretes dos seus compromissos via WhatsApp.
      </p>

      {/* Existing contacts - card style */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          {contacts.map((contact) => {
            const labelInfo = CONTACT_LABELS.find((l) => l.value === contact.label);
            return (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-xl border bg-background p-3 shadow-sm"
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{getInitials(contact.name)}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground truncate">{contact.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                      {labelInfo?.emoji} {labelInfo?.label || contact.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />
                    {formatPhone(contact.whatsapp_number)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="space-y-3 rounded-xl border border-dashed border-primary/30 p-4">
          {/* Phone + verify */}
          <div>
            <Label className="text-xs font-semibold mb-1 block">Número do WhatsApp</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={newWhatsapp}
                  onChange={(e) => {
                    setNewWhatsapp(e.target.value);
                    setCheckResult(null);
                  }}
                  placeholder="5562999999999"
                  className="h-9 text-sm pl-9"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCheckWhatsApp}
                disabled={checking || !newWhatsapp.trim()}
                className="h-9 text-xs gap-1 shrink-0"
              >
                {checking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>Verificar</>
                )}
              </Button>
            </div>
            {/* Check result feedback */}
            {checkResult && (
              <div className={`flex items-center gap-2 mt-2 text-xs font-medium ${checkResult.exists ? "text-emerald-600" : "text-destructive"}`}>
                {checkResult.exists ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>WhatsApp encontrado{checkResult.profileName ? ` — ${checkResult.profileName}` : ""}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Número não encontrado no WhatsApp</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Name + Label */}
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <div>
              <Label className="text-xs font-semibold mb-1 block">Nome</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do contato"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1 block">Tipo</Label>
              <Select value={newLabel} onValueChange={setNewLabel}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_LABELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.emoji} {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || !newWhatsapp.trim()} className="h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setCheckResult(null); }} className="h-8 text-xs">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        canAddMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full h-9 text-xs gap-1.5 border-dashed"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar contato
          </Button>
        )
      )}
    </div>
  );
}
