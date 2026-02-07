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
      

      {/* Stats - inline compact */}
      <div className="flex items-center gap-6 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold text-foreground">{pending.length}</span>
          <span className="text-xs text-muted-foreground">Pendentes</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold text-foreground">{today.length}</span>
          <span className="text-xs text-muted-foreground">Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold text-foreground">{done.length}</span>
          <span className="text-xs text-muted-foreground">Concluídos</span>
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
