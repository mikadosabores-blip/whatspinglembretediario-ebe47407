import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { PipelineCardItem } from "./PipelineCard";
import type { PipelineStage } from "@/hooks/usePipeline";

interface Props {
  stage: PipelineStage;
  onAddCard: (stageId: string, name: string) => void;
  onDeleteCard: (id: string) => void;
}

const STAGE_COLORS: Record<string, string> = {
  Novo: "bg-blue-500",
  Contato: "bg-amber-500",
  Qualificado: "bg-purple-500",
  Proposta: "bg-emerald-500",
  Fechado: "bg-green-600",
};

export function PipelineColumn({ stage, onAddCard, onDeleteCard }: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const dotColor = STAGE_COLORS[stage.name] || "bg-muted-foreground";

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddCard(stage.id, newName.trim());
    setNewName("");
    setAdding(false);
  };

  return (
    <div className="flex w-[260px] shrink-0 flex-col">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <h3 className="text-sm font-bold text-foreground">{stage.name}</h3>
        <span className="text-xs text-muted-foreground font-medium">{stage.cards.length}</span>
      </div>

      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5" : "bg-muted/40"
            }`}
          >
            {stage.cards.map((card, i) => (
              <PipelineCardItem key={card.id} card={card} index={i} onDelete={onDeleteCard} />
            ))}
            {provided.placeholder}

            {adding ? (
              <div className="rounded-xl border bg-card p-3 space-y-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="Nome do contato"
                  className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => { setAdding(false); setNewName(""); }}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-1 py-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
