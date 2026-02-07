import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PipelineCard {
  id: string;
  user_id: string;
  stage_id: string;
  name: string;
  description: string;
  position: number;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  position: number;
  cards: PipelineCard[];
}

export function usePipeline() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: stagesData, error: stagesError } = await supabase
      .from("pipeline_stages")
      .select("*")
      .order("position");

    if (stagesError) {
      toast.error("Erro ao carregar pipeline");
      return;
    }

    const { data: cardsData, error: cardsError } = await supabase
      .from("pipeline_cards")
      .select("*")
      .order("position");

    if (cardsError) {
      toast.error("Erro ao carregar cards");
      return;
    }

    const merged: PipelineStage[] = (stagesData || []).map((s) => ({
      ...s,
      cards: (cardsData || []).filter((c) => c.stage_id === s.id),
    }));

    setStages(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCard = async (stageId: string, name: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const stage = stages.find((s) => s.id === stageId);
    const position = stage ? stage.cards.length : 0;

    const { error } = await supabase.from("pipeline_cards").insert({
      user_id: session.user.id,
      stage_id: stageId,
      name,
      position,
    });

    if (error) {
      toast.error("Erro ao adicionar card");
      return;
    }

    await fetchData();
  };

  const deleteCard = async (cardId: string) => {
    const { error } = await supabase.from("pipeline_cards").delete().eq("id", cardId);
    if (error) {
      toast.error("Erro ao remover card");
      return;
    }
    await fetchData();
  };

  const moveCard = async (cardId: string, newStageId: string, newPosition: number) => {
    // Optimistic update
    setStages((prev) => {
      const allCards = prev.flatMap((s) => s.cards);
      const card = allCards.find((c) => c.id === cardId);
      if (!card) return prev;

      return prev.map((stage) => {
        let cards = stage.cards.filter((c) => c.id !== cardId);
        if (stage.id === newStageId) {
          const movedCard = { ...card, stage_id: newStageId, position: newPosition };
          cards.splice(newPosition, 0, movedCard);
        }
        return { ...stage, cards: cards.map((c, i) => ({ ...c, position: i })) };
      });
    });

    const { error } = await supabase
      .from("pipeline_cards")
      .update({ stage_id: newStageId, position: newPosition })
      .eq("id", cardId);

    if (error) {
      toast.error("Erro ao mover card");
      await fetchData();
    }
  };

  return { stages, loading, addCard, deleteCard, moveCard, fetchData };
}
