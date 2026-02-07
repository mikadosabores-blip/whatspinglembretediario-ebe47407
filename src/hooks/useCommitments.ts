import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, format, parseISO } from "date-fns";

export interface Commitment {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  commitment_date: string;
  commitment_time: string;
  location: string;
  provider_name: string;
  remind_days_before: number;
  remind_hours_before: number;
  remind_minutes_before: number;
  status: string;
  notified_days: boolean;
  notified_hours: boolean;
  notified_minutes: boolean;
  custom_message: string;
  recurrence: string;
  recurrence_end_date: string | null;
  parent_commitment_id: string | null;
  notify_contact_ids: string[];
  created_at: string;
  updated_at: string;
}

export const CATEGORIES = [
  { value: "dentista", label: "Dentista", emoji: "🦷" },
  { value: "medico", label: "Médico", emoji: "🏥" },
  { value: "escola", label: "Escola", emoji: "🏫" },
  { value: "trabalho", label: "Trabalho", emoji: "💼" },
  { value: "veterinario", label: "Veterinário", emoji: "🐾" },
  { value: "reuniao", label: "Reunião", emoji: "🤝" },
  { value: "curso", label: "Curso", emoji: "📚" },
  { value: "clinica", label: "Clínica", emoji: "🏨" },
  { value: "namorado", label: "Namorado(a)", emoji: "❤️" },
  { value: "pais", label: "Pais", emoji: "👨‍👩‍👧" },
  { value: "familiares", label: "Familiares", emoji: "👨‍👩‍👧‍👦" },
  { value: "idoso", label: "Pessoa Idosa", emoji: "👴" },
  { value: "bebe", label: "Mãe/Bebê", emoji: "👶" },
  { value: "outro", label: "Outro", emoji: "📌" },
];

export const RECURRENCE_OPTIONS = [
  { value: "none", label: "Sem repetição" },
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
];

function generateRecurringDates(startDate: string, recurrence: string, endDate: string | null): string[] {
  const dates: string[] = [];
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : addMonths(start, 3); // Default 3 months ahead
  let current = start;

  const advanceFn = {
    daily: (d: Date) => addDays(d, 1),
    weekly: (d: Date) => addWeeks(d, 1),
    biweekly: (d: Date) => addWeeks(d, 2),
    monthly: (d: Date) => addMonths(d, 1),
  }[recurrence];

  if (!advanceFn) return dates;

  // Skip the first date (it's the original)
  current = advanceFn(current);
  while (current <= end) {
    dates.push(format(current, "yyyy-MM-dd"));
    current = advanceFn(current);
  }

  return dates;
}

export function useCommitments() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommitments = useCallback(async () => {
    const { data, error } = await supabase
      .from("commitments")
      .select("*")
      .order("commitment_date", { ascending: true })
      .order("commitment_time", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar compromissos");
      return;
    }
    setCommitments(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCommitments();
  }, [fetchCommitments]);

  const addCommitment = async (commitment: Omit<Commitment, "id" | "user_id" | "created_at" | "updated_at" | "notified_days" | "notified_hours" | "notified_minutes" | "parent_commitment_id"> & { notify_contact_ids?: string[] }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Insert the main commitment
    const { data: inserted, error } = await supabase.from("commitments").insert({
      ...commitment,
      user_id: session.user.id,
    }).select().single();

    if (error || !inserted) {
      toast.error("Erro ao criar compromisso");
      return;
    }

    // Generate recurring entries
    if (commitment.recurrence && commitment.recurrence !== "none") {
      const recurringDates = generateRecurringDates(
        commitment.commitment_date,
        commitment.recurrence,
        commitment.recurrence_end_date || null
      );

      if (recurringDates.length > 0) {
        const recurringEntries = recurringDates.map((date) => ({
          user_id: session.user.id,
          category: commitment.category,
          title: commitment.title,
          description: commitment.description,
          commitment_date: date,
          commitment_time: commitment.commitment_time,
          location: commitment.location,
          provider_name: commitment.provider_name,
          custom_message: commitment.custom_message,
          remind_days_before: commitment.remind_days_before,
          remind_hours_before: commitment.remind_hours_before,
          remind_minutes_before: commitment.remind_minutes_before,
          status: "pending" as const,
          recurrence: commitment.recurrence,
          recurrence_end_date: commitment.recurrence_end_date,
          parent_commitment_id: inserted.id,
        }));

        const { error: recurError } = await supabase.from("commitments").insert(recurringEntries);
        if (recurError) {
          console.error("Error creating recurring entries:", recurError);
        }
      }
    }

    toast.success(commitment.recurrence !== "none"
      ? "Compromisso recorrente criado!"
      : "Compromisso criado!");
    await fetchCommitments();
  };

  const updateCommitment = async (id: string, updates: Partial<Commitment>) => {
    const { error } = await supabase.from("commitments").update(updates).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar compromisso");
      return;
    }
    await fetchCommitments();
  };

  const deleteCommitment = async (id: string) => {
    // Also delete child recurring entries
    await supabase.from("commitments").delete().eq("parent_commitment_id", id);
    const { error } = await supabase.from("commitments").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover compromisso");
      return;
    }
    toast.success("Compromisso removido");
    await fetchCommitments();
  };

  return { commitments, loading, addCommitment, updateCommitment, deleteCommitment, fetchCommitments };
}
