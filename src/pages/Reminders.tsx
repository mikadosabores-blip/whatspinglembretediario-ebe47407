import { AppLayout } from "@/components/AppLayout";
import { CommitmentForm } from "@/components/reminders/CommitmentForm";
import { CommitmentTimeline } from "@/components/reminders/CommitmentTimeline";
import { useCommitments } from "@/hooks/useCommitments";

const Reminders = () => {
  const { commitments, loading, addCommitment, updateCommitment, deleteCommitment } = useCommitments();

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Lembretes Inteligentes</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre compromissos e receba lembretes automáticos no WhatsApp.
          </p>
        </div>
        <CommitmentForm onSubmit={addCommitment} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <CommitmentTimeline
          commitments={commitments}
          onDelete={deleteCommitment}
          onUpdate={updateCommitment}
        />
      )}
    </AppLayout>
  );
};

export default Reminders;
