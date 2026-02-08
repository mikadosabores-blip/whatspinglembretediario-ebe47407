import { useCommitments, CATEGORIES, type Commitment } from "@/hooks/useCommitments";
import { useParams } from "react-router-dom";
import { Clock, MapPin, CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { title: string; description: string; categories: string[] }> = {
  providers: {
    title: "Prestadores de Serviço",
    description: "Compromissos com clínicas, profissionais e serviços.",
    categories: ["dentista", "medico", "veterinario", "clinica"],
  },
  contacts: {
    title: "Contatos",
    description: "Todos os seus compromissos gerais.",
    categories: ["reuniao", "trabalho", "outro"],
  },
  courses: {
    title: "Cursos",
    description: "Compromissos com cursos e educação.",
    categories: ["curso", "escola"],
  },
  partners: {
    title: "Namorado(a)",
    description: "Compromissos e datas especiais com seu parceiro(a).",
    categories: ["namorado"],
  },
  family: {
    title: "Pais & Família",
    description: "Compromissos com pais, familiares e filhos.",
    categories: ["pais", "familiares", "idoso", "bebe"],
  },
};

function CommitmentCard({ commitment }: { commitment: Commitment }) {
  const cat = CATEGORIES.find((c) => c.value === commitment.category);
  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 hover:shadow-md transition-shadow",
      commitment.status === "done" && "opacity-60"
    )}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-lg">{cat?.emoji || "📌"}</span>
        <span className="font-bold text-card-foreground text-sm">{commitment.title}</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {cat?.label || commitment.category}
        </span>
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          commitment.status === "done" ? "bg-primary/15 text-primary" : "bg-accent/20 text-accent-foreground"
        )}>
          {commitment.status === "done" ? "✓ Concluído" : "Pendente"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" />
          {format(parseISO(commitment.commitment_date), "dd/MM/yyyy")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {commitment.commitment_time.slice(0, 5)}
        </span>
        {commitment.provider_name && <span>👤 {commitment.provider_name}</span>}
        {commitment.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {commitment.location}
          </span>
        )}
      </div>
      {commitment.description && (
        <p className="text-xs text-muted-foreground mt-2">{commitment.description}</p>
      )}
    </div>
  );
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { commitments, loading } = useCommitments();

  const meta = slug ? CATEGORY_META[slug] : null;

  if (!meta) {
    return <p className="text-muted-foreground">Categoria não encontrada.</p>;
  }

  const filtered = commitments.filter((c) => meta.categories.includes(c.category));
  const pending = filtered.filter((c) => c.status === "pending");
  const done = filtered.filter((c) => c.status === "done");

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">{meta.title}</h1>
        <p className="text-sm text-muted-foreground">{meta.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
            {CATEGORIES.find((c) => meta.categories.includes(c.value))?.emoji || "📌"}
          </div>
          <div>
            <p className="text-2xl font-extrabold text-card-foreground">{filtered.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center text-lg">⏳</div>
          <div>
            <p className="text-2xl font-extrabold text-card-foreground">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">✅</div>
          <div>
            <p className="text-2xl font-extrabold text-card-foreground">{done.length}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground font-medium">Nenhum compromisso nesta categoria</p>
          <p className="text-sm text-muted-foreground/60">Crie um compromisso no Dashboard ou em Lembretes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3">⏳ Pendentes</h2>
              <div className="space-y-2">
                {pending.map((c) => <CommitmentCard key={c.id} commitment={c} />)}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-bold text-foreground mb-3">✅ Concluídos</h2>
              <div className="space-y-2">
                {done.map((c) => <CommitmentCard key={c.id} commitment={c} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CategoryPage;
