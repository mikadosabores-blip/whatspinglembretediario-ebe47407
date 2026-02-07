import { useState } from "react";
import { UserContact, CONTACT_LABELS, useContacts } from "@/hooks/useContacts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Plus, Trash2, Users } from "lucide-react";

export function ContactsManager() {
  const { contacts, loading, addContact, deleteContact, canAddMore } = useContacts();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newLabel, setNewLabel] = useState("familia");

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
      setShowForm(false);
    }
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

      {/* Existing contacts */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          {contacts.map((contact) => {
            const labelInfo = CONTACT_LABELS.find((l) => l.value === contact.label);
            return (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{labelInfo?.emoji || "📌"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{contact.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5" />
                      {contact.whatsapp_number}
                    </p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                    {labelInfo?.label || contact.label}
                  </span>
                </div>
                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="space-y-3 rounded-lg border border-dashed border-primary/30 p-3">
          <div className="grid grid-cols-[1fr_120px] gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do contato"
              className="h-9 text-sm"
            />
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
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={newWhatsapp}
              onChange={(e) => setNewWhatsapp(e.target.value)}
              placeholder="5562999999999"
              className="h-9 text-sm flex-1"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || !newWhatsapp.trim()} className="h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="h-8 text-xs">
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
