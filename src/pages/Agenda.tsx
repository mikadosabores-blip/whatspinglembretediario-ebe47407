import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useCommitments, CATEGORIES, type Commitment } from "@/hooks/useCommitments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Agenda = () => {
  const { commitments, loading } = useCommitments();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getCommitmentsForDay = (day: Date): Commitment[] =>
    commitments.filter((c) => isSameDay(parseISO(c.commitment_date), day));

  const selectedCommitments = selectedDate ? getCommitmentsForDay(selectedDate) : [];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Agenda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-bold text-card-foreground capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayCommitments = getCommitmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative flex flex-col items-center rounded-lg py-2 px-1 min-h-[52px] text-xs transition-colors",
                    !isCurrentMonth && "opacity-30",
                    isToday && "ring-1 ring-primary",
                    isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent/50",
                  )}
                >
                  <span className={cn("font-semibold", !isSelected && "text-card-foreground")}>
                    {format(day, "d")}
                  </span>
                  {dayCommitments.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayCommitments.slice(0, 3).map((c) => {
                        const cat = CATEGORIES.find((cat) => cat.value === c.category);
                        return (
                          <span key={c.id} className="text-[8px]" title={c.title}>
                            {cat?.emoji || "📌"}
                          </span>
                        );
                      })}
                      {dayCommitments.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayCommitments.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day detail */}
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-bold text-card-foreground mb-3">
            {selectedDate
              ? format(selectedDate, "dd 'de' MMMM, EEEE", { locale: ptBR })
              : "Selecione um dia"}
          </h3>

          {!selectedDate && (
            <p className="text-xs text-muted-foreground">Clique em um dia no calendário para ver os compromissos.</p>
          )}

          {selectedDate && selectedCommitments.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhum compromisso neste dia.</p>
          )}

          <div className="space-y-2 mt-2">
            {selectedCommitments.map((c) => {
              const cat = CATEGORIES.find((cat) => cat.value === c.category);
              return (
                <div key={c.id} className="rounded-lg border bg-background p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{cat?.emoji || "📌"}</span>
                    <span className="font-bold text-sm text-foreground">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{c.commitment_time.slice(0, 5)}</span>
                    {c.provider_name && <span>• {c.provider_name}</span>}
                  </div>
                  {c.description && (
                    <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  )}
                  <span className={cn(
                    "inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2",
                    c.status === "done" ? "bg-primary/15 text-primary" : "bg-accent/20 text-accent-foreground"
                  )}>
                    {c.status === "done" ? "Concluído" : "Pendente"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Agenda;
