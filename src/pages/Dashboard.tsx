import { AppLayout } from "@/components/AppLayout";
import { useCommitments, CATEGORIES } from "@/hooks/useCommitments";
import { CalendarClock, Bell, CheckCircle2 } from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { commitments, loading } = useCommitments();

  const pending = commitments.filter((c) => c.status === "pending");
  const today = pending.filter((c) => isToday(parseISO(c.commitment_date)));
  const tomorrow = pending.filter((c) => isTomorrow(parseISO(c.commitment_date)));
  const done = commitments.filter((c) => c.status === "done");

  return (
    <AppLayout>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{today.length}</p>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{done.length}</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
          </div>
        </div>
      </div>

      {today.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground mb-3">📅 Compromissos de Hoje</h2>
          <div className="space-y-2">
            {today.map((c) => {
              const cat = CATEGORIES.find((cat) => cat.value === c.category);
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <span className="text-lg">{cat?.emoji || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.commitment_time.slice(0, 5)} {c.provider_name && `• ${c.provider_name}`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tomorrow.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-foreground mb-3">🔜 Amanhã</h2>
          <div className="space-y-2">
            {tomorrow.map((c) => {
              const cat = CATEGORIES.find((cat) => cat.value === c.category);
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  <span className="text-lg">{cat?.emoji || "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.commitment_time.slice(0, 5)} {c.provider_name && `• ${c.provider_name}`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
