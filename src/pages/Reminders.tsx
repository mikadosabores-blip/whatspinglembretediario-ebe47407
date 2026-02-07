import { AppLayout } from "@/components/AppLayout";
import { QuickCommitmentForm } from "@/components/reminders/QuickCommitmentForm";
import { CommitmentTimeline } from "@/components/reminders/CommitmentTimeline";
import { VoiceReminderRecorder } from "@/components/reminders/VoiceReminderRecorder";
import { useCommitments } from "@/hooks/useCommitments";
import { useContacts } from "@/hooks/useContacts";

const Reminders = () => {
  const { commitments, loading, addCommitment, updateCommitment, deleteCommitment } = useCommitments();
  const { contacts } = useContacts();

  const handleVoiceResult = (data: any) => {
    addCommitment({
      category: data.category || "outro",
      title: data.title,
      description: data.description || "",
      commitment_date: data.commitment_date,
      commitment_time: data.commitment_time,
      location: data.location || "",
      provider_name: data.provider_name || "",
      custom_message: "",
      remind_days_before: data.remind_days_before || 0,
      remind_hours_before: data.remind_hours_before || 0,
      remind_minutes_before: data.remind_minutes_before || 0,
      recurrence: "none",
      recurrence_end_date: null,
      status: "pending",
      notify_contact_ids: data.notify_contact_ids || [],
    });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Lembretes Inteligentes</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre compromissos e receba lembretes automáticos no WhatsApp.
        </p>
      </div>

      <div className="mb-4">
        <VoiceReminderRecorder onResult={handleVoiceResult} contacts={contacts} />
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
