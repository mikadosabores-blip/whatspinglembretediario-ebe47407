import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CATEGORIES } from "@/hooks/useCommitments";

interface VoiceReminderResult {
  title: string;
  category: string;
  commitment_date: string;
  commitment_time: string;
  description?: string;
  location?: string;
  provider_name?: string;
  remind_days_before?: number;
  remind_hours_before?: number;
  remind_minutes_before?: number;
  notify_contact_ids?: string[];
}

interface Contact {
  id: string;
  name: string;
}

interface Props {
  onResult: (data: VoiceReminderResult) => void;
  contacts?: Contact[];
}

export function VoiceReminderRecorder({ onResult, contacts = [] }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<VoiceReminderResult | null>(null);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef("");
  const isRecordingRef = useRef(false);

  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRecording = useCallback(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.interimResults = true;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      recognition.continuous = !isMobile;

      recognition.onresult = (event: any) => {
        try {
          let interim = "";
          let final = "";
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (final) {
            fullTranscriptRef.current += (fullTranscriptRef.current ? " " : "") + final;
          }
          setTranscript(fullTranscriptRef.current + (interim ? " " + interim : ""));

          if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
          autoStopTimeoutRef.current = setTimeout(() => {
            try {
              if (recognitionRef.current && isRecordingRef.current) {
                recognitionRef.current.stop();
              }
            } catch (e) {
              console.error("Auto-stop error:", e);
            }
          }, 3000);
        } catch (e) {
          console.error("onresult error:", e);
        }
      };

      recognition.onerror = (event: any) => {
        try {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            toast.error("Permissão do microfone negada. Habilite nas configurações do navegador.");
          } else if (event.error === "no-speech") {
            if (isMobile && isRecordingRef.current) {
              try { recognition.start(); } catch {}
              return;
            }
          } else if (event.error === "aborted") {
            // Silently handle aborted errors on mobile
            if (isMobile && isRecordingRef.current) {
              try { recognition.start(); } catch {}
              return;
            }
          }
        } catch (e) {
          console.error("onerror handler error:", e);
        }
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognition.onend = () => {
        try {
          if (isMobile && isRecordingRef.current) {
            try {
              recognition.start();
            } catch {
              setIsRecording(false);
              isRecordingRef.current = false;
            }
            return;
          }
        } catch (e) {
          console.error("onend handler error:", e);
        }
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognitionRef.current = recognition;
      fullTranscriptRef.current = "";
      setTranscript("");
      setResult(null);
      recognition.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("Erro ao iniciar gravação. Verifique as permissões do microfone.");
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    isRecordingRef.current = false;
    if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    const text = fullTranscriptRef.current || transcript;
    if (!text.trim()) {
      toast.error("Nenhuma fala detectada. Tente novamente.");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-voice-reminder", {
        body: { transcript: text, contacts: contacts.map(c => ({ id: c.id, name: c.name })) },
      });

      if (error || !data?.success) {
        toast.error("Erro ao processar comando de voz");
        return;
      }

      setResult(data.commitment);
    } catch {
      toast.error("Erro ao processar comando de voz");
    } finally {
      setIsProcessing(false);
    }
  }, [transcript, contacts]);

  const confirmResult = () => {
    if (result) {
      onResult(result);
      setResult(null);
      setTranscript("");
      toast.success("Compromisso criado por voz! 🎙️");
    }
  };

  const cancelResult = () => {
    setResult(null);
    setTranscript("");
  };

  const getCategoryLabel = (value: string) => {
    const cat = CATEGORIES.find((c) => c.value === value);
    return cat ? `${cat.emoji} ${cat.label}` : value;
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <p className="text-sm font-bold text-card-foreground flex items-center gap-2">
        🎙️ Lembrete por voz
      </p>

      {!result && !isProcessing && (
        <>
          <p className="text-xs text-muted-foreground">
            Fale o compromisso que deseja agendar. Ex: "Consulta no dentista amanhã às 14 horas, me lembra 30 minutos antes"
          </p>

          <div className="flex items-center gap-3">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              className="gap-2 h-10"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Parar gravação
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Gravar
                </>
              )}
            </Button>

            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs text-muted-foreground">Gravando...</span>
              </div>
            )}
          </div>

          {transcript && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">Transcrição:</p>
              <p className="text-sm text-card-foreground">{transcript}</p>
            </div>
          )}
        </>
      )}

      {isProcessing && (
        <div className="flex items-center gap-3 py-4 justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Processando com IA...</span>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-background p-3 space-y-2">
            <p className="text-xs text-muted-foreground">A IA identificou:</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-card-foreground w-20">Título:</span>
                <span className="text-sm text-card-foreground">{result.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-card-foreground w-20">Categoria:</span>
                <span className="text-sm">{getCategoryLabel(result.category)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-card-foreground w-20">Data:</span>
                <span className="text-sm text-card-foreground">
                  {new Date(result.commitment_date + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-card-foreground w-20">Horário:</span>
                <span className="text-sm text-card-foreground">{result.commitment_time}</span>
              </div>
              {result.location && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-card-foreground w-20">Local:</span>
                  <span className="text-sm text-card-foreground">{result.location}</span>
                </div>
              )}
              {result.provider_name && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-card-foreground w-20">Profissional:</span>
                  <span className="text-sm text-card-foreground">{result.provider_name}</span>
                </div>
              )}
              {(result.remind_days_before || result.remind_hours_before || result.remind_minutes_before) ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-card-foreground w-20">Lembrete:</span>
                  <span className="text-sm text-card-foreground">
                    {[
                      result.remind_days_before ? `${result.remind_days_before} dia(s)` : "",
                      result.remind_hours_before ? `${result.remind_hours_before}h` : "",
                      result.remind_minutes_before ? `${result.remind_minutes_before}min` : "",
                    ].filter(Boolean).join(" + ")} antes
                  </span>
                </div>
              ) : null}
              {result.notify_contact_ids && result.notify_contact_ids.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-card-foreground w-20">Enviar p/:</span>
                  <span className="text-sm text-card-foreground">
                    {result.notify_contact_ids.map(id => contacts.find(c => c.id === id)?.name || id).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={confirmResult} className="gap-1.5 h-9 text-xs flex-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirmar e salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelResult} className="gap-1 h-9 text-xs">
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
