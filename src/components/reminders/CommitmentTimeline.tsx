import { useEffect, useState } from "react";
import { format, differenceInMilliseconds, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, Trash2, CheckCircle2, Bell, BellOff, Send, Pencil, CalendarIcon, X, Check } from "lucide-react";
import { CATEGORIES, type Commitment } from "@/hooks/useCommitments";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface Props {
  commitments: Commitment[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Commitment>) => void;
}

function CountdownDisplay({ targetDate, targetTime }: { targetDate: string; targetTime: string }) {
  const [remaining, setRemaining] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const update = () => {
      const target = new Date(`${targetDate}T${targetTime}`);
      const diff = differenceInMilliseconds(target, new Date());

      if (diff <= 0) {
        setIsExpired(true);
        setRemaining("⏰ Agora!");
        setProgress(0);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      if (days === 0) parts.push(`${secs}s`);

      setRemaining(parts.join(" "));
      setIsExpired(false);

      // Progress: 100% at 24h+, 0% at now
      const totalWindow = 24 * 60 * 60 * 1000;
      setProgress(Math.min(100, (diff / totalWindow) * 100));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", isExpired ? "bg-destructive" : "bg-primary")}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={cn("text-xs font-bold tabular-nums", isExpired ? "text-destructive animate-pulse" : "text-primary")}>
        {remaining}
      </span>
    </div>
  );
}

function NotificationBadge({ label, sent }: { label: string; sent: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
      sent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
    )}>
      {sent ? <Send className="h-2.5 w-2.5" /> : <Bell className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

function EditableCard({ commitment, onSave, onCancel }: {
  commitment: Commitment;
  onSave: (id: string, updates: Partial<Commitment>) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState(commitment.category);
  const [title, setTitle] = useState(commitment.title);
  const [description, setDescription] = useState(commitment.description);
  const [date, setDate] = useState<Date>(parseISO(commitment.commitment_date));
  const [time, setTime] = useState(commitment.commitment_time.slice(0, 5));
  const [location, setLocation] = useState(commitment.location);
  const [providerName, setProviderName] = useState(commitment.provider_name);
  const [remindDays, setRemindDays] = useState(commitment.remind_days_before);
  const [remindHours, setRemindHours] = useState(commitment.remind_hours_before);
  const [remindMinutes, setRemindMinutes] = useState(commitment.remind_minutes_before);

  const handleSave = () => {
    onSave(commitment.id, {
      category,
      title,
      description,
      commitment_date: format(date, "yyyy-MM-dd"),
      commitment_time: time,
      location,
      provider_name: providerName,
      remind_days_before: remindDays,
      remind_hours_before: remindHours,
      remind_minutes_before: remindMinutes,
    });
  };

  return (
    <div className="rounded-xl border-2 border-primary bg-card p-4 space-y-3">
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.emoji} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-sm" />
      </div>

      <div className="grid grid-cols-[1fr_90px_1fr] gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-8 justify-start text-left text-xs font-normal">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {format(date, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-8 text-xs" />
        <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Profissional" className="h-8 text-sm" />
      </div>

      <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Endereço" className="h-8 text-sm" />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Observações" rows={2} className="text-sm" />

      <div className="grid grid-cols-3 gap-2">
        <Select value={String(remindDays)} onValueChange={(v) => setRemindDays(Number(v))}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 5, 7].map((d) => (
              <SelectItem key={d} value={String(d)}>{d}d antes</SelectItem>
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

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 text-xs gap-1">
          <X className="h-3.5 w-3.5" /> Cancelar
        </Button>
        <Button size="sm" onClick={handleSave} className="h-8 text-xs gap-1">
          <Check className="h-3.5 w-3.5" /> Salvar
        </Button>
      </div>
    </div>
  );
}

export function CommitmentTimeline({ commitments, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (commitments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BellOff className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium">Nenhum compromisso cadastrado</p>
        <p className="text-sm text-muted-foreground/60">Use o formulário acima para começar.</p>
      </div>
    );
  }

  const grouped: Record<string, Commitment[]> = {};
  commitments.forEach((c) => {
    if (!grouped[c.commitment_date]) grouped[c.commitment_date] = [];
    grouped[c.commitment_date].push(c);
  });

  const handleEditSave = (id: string, updates: Partial<Commitment>) => {
    onUpdate(id, updates);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-sm font-bold text-foreground mb-3 sticky top-0 bg-background py-1">
            📅 {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <div className="space-y-2 ml-2 border-l-2 border-primary/20 pl-4">
            {items.map((c) => {
              if (editingId === c.id) {
                return (
                  <div key={c.id} className="relative">
                    <div className="absolute -left-[22px] top-5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <EditableCard commitment={c} onSave={handleEditSave} onCancel={() => setEditingId(null)} />
                  </div>
                );
              }

              const cat = CATEGORIES.find((cat) => cat.value === c.category);
              return (
                <div
                  key={c.id}
                  className={cn(
                    "relative rounded-xl border bg-card p-4 transition-all hover:shadow-md",
                    c.status === "done" && "opacity-60"
                  )}
                >
                  <div className="absolute -left-[22px] top-5 h-3 w-3 rounded-full bg-primary border-2 border-background" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{cat?.emoji || "📌"}</span>
                        <span className="font-bold text-card-foreground text-sm">{c.title}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {cat?.label || c.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {c.commitment_time.slice(0, 5)}
                        </span>
                        {c.provider_name && <span>{c.provider_name}</span>}
                        {c.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {c.location}
                          </span>
                        )}
                      </div>

                      {c.description && (
                        <p className="text-xs text-muted-foreground mb-2">{c.description}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <CountdownDisplay targetDate={c.commitment_date} targetTime={c.commitment_time} />
                        <NotificationBadge label={`${c.remind_days_before}d`} sent={c.notified_days} />
                        <NotificationBadge label={`${c.remind_hours_before}h`} sent={c.notified_hours} />
                        <NotificationBadge label={`${c.remind_minutes_before}min`} sent={c.notified_minutes} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingId(c.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {c.status !== "done" && (
                        <button
                          onClick={() => onUpdate(c.id, { status: "done" })}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Marcar como concluído"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(c.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
