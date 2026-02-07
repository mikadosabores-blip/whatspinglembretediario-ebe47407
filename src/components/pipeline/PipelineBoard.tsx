import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { PipelineColumn } from "./PipelineColumn";
import { usePipeline } from "@/hooks/usePipeline";
import { Loader2 } from "lucide-react";

export function PipelineBoard() {
  const { stages, loading, addCard, deleteCard, moveCard } = usePipeline();

  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    moveCard(draggableId, destination.droppableId, destination.index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {stages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
