import { useEffect, useState } from "react";
import { format, differenceInMilliseconds, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, MapPin, Trash2, CheckCircle2, Bell, BellOff, Send } from "lucide-react";
import { CATEGORIES, type Commitment } from "@/hooks/useCommitments";
import { cn } from "@/lib/utils";

interface Props {
  commitments: Commitment[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Commitment>) => void;
}

function CountdownDisplay({ targetDate, targetTime }: { targetDate: string; targetTime: string }) {
  const [remaining, setRemaining] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const target = new Date(`${targetDate}T${targetTime}`);
      const diff = differenceInMilliseconds(target, new Date());

      if (diff <= 0) {
        setIsExpired(true);
        setRemaining("Agora!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${mins}min`);

      setRemaining(parts.join(" "));
      setIsExpired(false);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return (
    <span className={cn("text-xs font-bold tabular-nums", isExpired ? "text-destructive" : "text-primary")}>
      {remaining}
    </span>
  );
}

function NotificationBadge({ label, sent }: { label: string; sent: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
      sent ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
    )}>
      {sent ? <Send className="h-2.5 w-2.5" /> : <Bell className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

export function CommitmentTimeline({ commitments, onDelete, onUpdate }: Props) {
  if (commitments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BellOff className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium">Nenhum compromisso cadastrado</p>
        <p className="text-sm text-muted-foreground/60">Clique em "Novo Compromisso" para começar.</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Commitment[]> = {};
  commitments.forEach((c) => {
    if (!grouped[c.commitment_date]) grouped[c.commitment_date] = [];
    grouped[c.commitment_date].push(c);
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-sm font-bold text-foreground mb-3 sticky top-0 bg-background py-1">
            📅 {format(parseISO(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <div className="space-y-2 ml-2 border-l-2 border-primary/20 pl-4">
            {items.map((c) => {
              const cat = CATEGORIES.find((cat) => cat.value === c.category);
              return (
                <div
                  key={c.id}
                  className={cn(
                    "relative rounded-xl border bg-card p-4 transition-all hover:shadow-md",
                    c.status === "done" && "opacity-60"
                  )}
                >
                  {/* Timeline dot */}
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
                      {c.status !== "done" && (
                        <button
                          onClick={() => onUpdate(c.id, { status: "done" })}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
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
