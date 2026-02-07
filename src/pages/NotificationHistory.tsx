import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, XCircle, Clock, MessageCircle, Phone, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationLog {
  id: string;
  user_id: string;
  commitment_id: string | null;
  reminder_type: string;
  phone_number: string;
  message_preview: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

const typeLabels: Record<string, { label: string; emoji: string }> = {
  days: { label: "Dias antes", emoji: "📅" },
  hours: { label: "Horas antes", emoji: "⏰" },
  minutes: { label: "Minutos antes", emoji: "⏱️" },
  ontime: { label: "No horário", emoji: "🔔" },
};

const NotificationHistory = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notification_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data as NotificationLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const sentCount = logs.filter((l) => l.status === "sent").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Histórico de Envios</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe todas as mensagens enviadas pelo WhatsPing.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{logs.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-primary">{sentCount}</p>
          <p className="text-xs text-muted-foreground">Enviados</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className={cn("text-2xl font-extrabold", failedCount > 0 ? "text-destructive" : "text-foreground")}>{failedCount}</p>
          <p className="text-xs text-muted-foreground">Falhas</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">Nenhuma mensagem enviada ainda</p>
          <p className="text-sm text-muted-foreground/60">As mensagens aparecerão aqui quando forem enviadas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const typeInfo = typeLabels[log.reminder_type] || { label: log.reminder_type, emoji: "📨" };
            const isSent = log.status === "sent";

            return (
              <div
                key={log.id}
                className={cn(
                  "rounded-xl border bg-card p-4 transition-all",
                  !isSent && "border-destructive/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{typeInfo.emoji}</span>
                      <Badge variant={isSent ? "default" : "destructive"} className="text-[10px] h-5">
                        {isSent ? (
                          <><Send className="h-2.5 w-2.5 mr-1" />Enviado</>
                        ) : (
                          <><XCircle className="h-2.5 w-2.5 mr-1" />Falhou</>
                        )}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
                        {typeInfo.label}
                      </span>
                    </div>

                    {log.message_preview && (
                      <p className="text-xs text-card-foreground mb-1.5 line-clamp-2">
                        {log.message_preview}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {format(parseISO(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-2.5 w-2.5" />
                        {log.phone_number}
                      </span>
                    </div>

                    {log.error_message && (
                      <p className="text-[10px] text-destructive mt-1.5 bg-destructive/5 rounded px-2 py-1">
                        {log.error_message.substring(0, 150)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default NotificationHistory;
