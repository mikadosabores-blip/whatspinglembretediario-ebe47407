import { AppLayout } from "@/components/AppLayout";
import { QuickCommitmentForm } from "@/components/reminders/QuickCommitmentForm";
import { CommitmentTimeline } from "@/components/reminders/CommitmentTimeline";
import { useCommitments, CATEGORIES } from "@/hooks/useCommitments";
import { CalendarClock, Bell, CheckCircle2 } from "lucide-react";
import { isToday, isTomorrow, parseISO } from "date-fns";

const Dashboard = () => {
  const { commitments, loading, addCommitment, updateCommitment, deleteCommitment } = useCommitments();

  const pending = commitments.filter((c) => c.status === "pending");
  const today = pending.filter((c) => isToday(parseISO(c.commitment_date)));
  const done = commitments.filter((c) => c.status === "done");

  return (
    <AppLayout>
      <h1 className="text-2xl font-extrabold text-foreground mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-card-foreground">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-card-foreground">{today.length}</p>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-card-foreground">{done.length}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </div>
        </div>
      </div>

      {/* Quick add form inline */}
      <div className="mb-6">
        <QuickCommitmentForm onSubmit={addCommitment} />
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <CommitmentTimeline
          commitments={pending}
          onDelete={deleteCommitment}
          onUpdate={updateCommitment}
        />
      )}
    </AppLayout>
  );
};

export default Dashboard;
