import { AppLayout } from "@/components/AppLayout";
import { QuickCommitmentForm } from "@/components/reminders/QuickCommitmentForm";
import { CommitmentTimeline } from "@/components/reminders/CommitmentTimeline";
import { useCommitments } from "@/hooks/useCommitments";

const Reminders = () => {
  const { commitments, loading, addCommitment, updateCommitment, deleteCommitment } = useCommitments();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Lembretes Inteligentes</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre compromissos e receba lembretes automáticos no WhatsApp.
        </p>
      </div>

      <div className="mb-6">
        <QuickCommitmentForm onSubmit={addCommitment} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
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
