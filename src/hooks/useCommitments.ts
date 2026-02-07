import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  { value: "idoso", label: "Pessoa Idosa", emoji: "👴" },
  { value: "bebe", label: "Mãe/Bebê", emoji: "👶" },
  { value: "outro", label: "Outro", emoji: "📌" },
];

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

  const addCommitment = async (commitment: Omit<Commitment, "id" | "user_id" | "created_at" | "updated_at" | "notified_days" | "notified_hours" | "notified_minutes">) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("commitments").insert({
      ...commitment,
      user_id: session.user.id,
    });

    if (error) {
      toast.error("Erro ao criar compromisso");
      return;
    }

    toast.success("Compromisso criado!");
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
