import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES } from "@/hooks/useCommitments";

interface Props {
  onSubmit: (data: {
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
  }) => void;
}

export function CommitmentForm({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [providerName, setProviderName] = useState("");
  const [remindDays, setRemindDays] = useState(0);
  const [remindHours, setRemindHours] = useState(0);
  const [remindMinutes, setRemindMinutes] = useState(0);
  const [enableDays, setEnableDays] = useState(false);
  const [enableHours, setEnableHours] = useState(false);
  const [enableMinutes, setEnableMinutes] = useState(false);

  const handleSubmit = () => {
    if (!category || !title || !date) return;

    onSubmit({
      category,
      title,
      description,
      commitment_date: format(date, "yyyy-MM-dd"),
      commitment_time: time,
      location,
      provider_name: providerName,
      remind_days_before: enableDays ? remindDays : 0,
      remind_hours_before: enableHours ? remindHours : 0,
      remind_minutes_before: enableMinutes ? remindMinutes : 0,
      status: "pending",
    });

    setCategory("");
    setTitle("");
    setDescription("");
    setDate(undefined);
    setTime("09:00");
    setLocation("");
    setProviderName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Compromisso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Compromisso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Consulta Dr. Silva" />
          </div>

          <div>
            <Label>Prestador / Local</Label>
            <Input value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Nome da clínica ou profissional" />
          </div>

          <div>
            <Label>Endereço</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Endereço (opcional)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Horário</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Observação</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes adicionais..." rows={2} />
          </div>

          <div>
            <Label className="text-sm font-semibold">Lembretes automáticos</Label>
            <p className="text-xs text-muted-foreground mb-2">Selecione quando deseja ser lembrado.</p>
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-2">
                <Checkbox id="cf-enable-days" checked={enableDays} onCheckedChange={(v) => { setEnableDays(!!v); if (v && remindDays === 0) setRemindDays(1); if (!v) setRemindDays(0); }} />
                <Label htmlFor="cf-enable-days" className="text-xs cursor-pointer">Dias antes</Label>
                {enableDays && (
                  <Select value={String(remindDays)} onValueChange={(v) => setRemindDays(Number(v))}>
                    <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 7].map((d) => (
                        <SelectItem key={d} value={String(d)}>{d} dia{d !== 1 ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="cf-enable-hours" checked={enableHours} onCheckedChange={(v) => { setEnableHours(!!v); if (v && remindHours === 0) setRemindHours(2); if (!v) setRemindHours(0); }} />
                <Label htmlFor="cf-enable-hours" className="text-xs cursor-pointer">Horas antes</Label>
                {enableHours && (
                  <Select value={String(remindHours)} onValueChange={(v) => setRemindHours(Number(v))}>
                    <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 4, 6, 12].map((h) => (
                        <SelectItem key={h} value={String(h)}>{h} hora{h !== 1 ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="cf-enable-minutes" checked={enableMinutes} onCheckedChange={(v) => { setEnableMinutes(!!v); if (v && remindMinutes === 0) setRemindMinutes(30); if (!v) setRemindMinutes(0); }} />
                <Label htmlFor="cf-enable-minutes" className="text-xs cursor-pointer">Minutos antes</Label>
                {enableMinutes && (
                  <Select value={String(remindMinutes)} onValueChange={(v) => setRemindMinutes(Number(v))}>
                    <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 30, 45].map((m) => (
                        <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!category || !title || !date}>
            Salvar Compromisso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
