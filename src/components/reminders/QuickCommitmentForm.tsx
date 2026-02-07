import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown, ChevronUp, Repeat, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORIES, RECURRENCE_OPTIONS } from "@/hooks/useCommitments";
import { useContacts, CONTACT_LABELS } from "@/hooks/useContacts";

interface Props {
  onSubmit: (data: {
    category: string;
    title: string;
    description: string;
    commitment_date: string;
    commitment_time: string;
    location: string;
    provider_name: string;
    custom_message: string;
    remind_days_before: number;
    remind_hours_before: number;
    remind_minutes_before: number;
    recurrence: string;
    recurrence_end_date: string | null;
    status: string;
    notify_contact_ids: string[];
  }) => void;
}

export function QuickCommitmentForm({ onSubmit }: Props) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [providerName, setProviderName] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>();
  const [remindDays, setRemindDays] = useState(1);
  const [remindHours, setRemindHours] = useState(2);
  const [remindMinutes, setRemindMinutes] = useState(30);
  const [showMore, setShowMore] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  const { contacts } = useContacts();

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = () => {
    if (!category || !title || !date) return;

    onSubmit({
      category,
      title,
      description,
      commitment_date: format(date, "yyyy-MM-dd"),
      commitment_time: time,
      location,
      provider_name: providerName,
      custom_message: customMessage,
      recurrence,
      recurrence_end_date: recurrenceEndDate ? format(recurrenceEndDate, "yyyy-MM-dd") : null,
      remind_days_before: remindDays,
      remind_hours_before: remindHours,
      remind_minutes_before: remindMinutes,
      status: "pending",
      notify_contact_ids: selectedContactIds,
    });

    setCategory("");
    setTitle("");
    setDescription("");
    setDate(undefined);
    setTime("09:00");
    setLocation("");
    setProviderName("");
    setCustomMessage("");
    setRecurrence("none");
    setRecurrenceEndDate(undefined);
    setShowMore(false);
    setSelectedContactIds([]);
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-sm font-bold text-card-foreground">⚡ Novo compromisso</p>

      <div className="grid grid-cols-[140px_1fr] gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Consulta Dr. Silva" className="h-9 text-sm" />
      </div>

      <div className="grid grid-cols-[1fr_100px] gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("h-9 justify-start text-left text-xs font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {date ? format(date, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecionar data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 text-xs" />
      </div>

      <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Profissional / Clínica (opcional)" className="h-9 text-sm" />

      {/* Contact selector */}
      {contacts.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="text-xs font-semibold text-card-foreground">Enviar lembrete para</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {contacts.map((contact) => {
              const labelInfo = CONTACT_LABELS.find((l) => l.value === contact.label);
              const isSelected = selectedContactIds.includes(contact.id);
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => toggleContact(contact.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <span>{labelInfo?.emoji || "📌"}</span>
                  <span>{contact.name}</span>
                  {isSelected && <span className="text-primary">✓</span>}
                </button>
              );
            })}
          </div>
          {selectedContactIds.length === 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Nenhum selecionado — lembrete será enviado apenas para você
            </p>
          )}
        </div>
      )}

      {/* Recurrence row */}
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <div className="flex items-center gap-2">
          <Repeat className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={recurrence} onValueChange={setRecurrence}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RECURRENCE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {recurrence !== "none" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-9 justify-start text-left text-xs font-normal", !recurrenceEndDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                {recurrenceEndDate ? `Até ${format(recurrenceEndDate, "dd/MM/yyyy")}` : "Até quando? (opcional)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={recurrenceEndDate} onSelect={setRecurrenceEndDate} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <button type="button" onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-card-foreground transition-colors">
        {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {showMore ? "Menos opções" : "Mais opções (endereço, obs., lembretes)"}
      </button>

      {showMore && (
        <div className="space-y-3 pt-1">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Endereço (opcional)" className="h-9 text-sm" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Observações..." rows={2} className="text-sm" />
          <div>
            <Label className="text-xs font-semibold text-card-foreground">💬 Texto do lembrete no WhatsApp</Label>
            <Textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Ex: Não esqueça de levar os documentos! (deixe vazio para usar mensagem padrão)" rows={2} className="text-sm mt-1" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-card-foreground">Lembretes automáticos</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Select value={String(remindDays)} onValueChange={(v) => setRemindDays(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 5, 7].map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} dia{d !== 1 ? "s" : ""} antes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(remindHours)} onValueChange={(v) => setRemindHours(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 4, 6, 12].map((h) => (
                    <SelectItem key={h} value={String(h)}>{h}h antes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(remindMinutes)} onValueChange={(v) => setRemindMinutes(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 10, 15, 30, 45].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m}min antes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleSubmit} className="w-full h-9 text-sm" disabled={!category || !title || !date}>
        {recurrence !== "none" ? "🔄 Salvar com repetição" : "Salvar"}
      </Button>
    </div>
  );
}
