import { Draggable } from "@hello-pangea/dnd";
import { X, User } from "lucide-react";
import type { PipelineCard as CardType } from "@/hooks/usePipeline";

interface Props {
  card: CardType;
  index: number;
  onDelete: (id: string) => void;
}

export function PipelineCardItem({ card, index, onDelete }: Props) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group rounded-xl border bg-card p-3 shadow-sm transition-shadow ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/30" : "hover:shadow-md"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{card.name}</p>
                {card.description && (
                  <p className="text-xs text-muted-foreground truncate">{card.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {new Date(card.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
          </p>
        </div>
      )}
    </Draggable>
  );
}
