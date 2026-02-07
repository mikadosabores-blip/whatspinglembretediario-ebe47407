const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("Missing LOVABLE_API_KEY");
    }

    const { transcript } = await req.json();
    if (!transcript || !transcript.trim()) {
      return new Response(JSON.stringify({ error: "No transcript provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current date/time in Brazil timezone for context
    const now = new Date();
    const brasilOffset = -3 * 60;
    const brasilNow = new Date(now.getTime() + (brasilOffset + now.getTimezoneOffset()) * 60000);
    const todayStr = brasilNow.toISOString().slice(0, 10);
    const currentTime = brasilNow.toTimeString().slice(0, 5);
    const weekday = brasilNow.toLocaleDateString("pt-BR", { weekday: "long" });

    const systemPrompt = `Você é um assistente que extrai dados de compromissos a partir de mensagens de voz em português brasileiro.

Data atual: ${todayStr} (${weekday}), Horário atual: ${currentTime} (Brasília).

Analise o texto transcrito e extraia as seguintes informações em JSON:
- title: título curto do compromisso (obrigatório)
- category: uma das categorias: dentista, medico, escola, trabalho, veterinario, reuniao, curso, clinica, namorado, pais, familiares, idoso, bebe, outro (obrigatório)
- commitment_date: data no formato YYYY-MM-DD (obrigatório - se o usuário disser "amanhã", "segunda", etc., calcule a data correta)
- commitment_time: horário no formato HH:MM (obrigatório - se não mencionado, use "09:00")
- description: detalhes adicionais mencionados (opcional)
- location: local mencionado (opcional)
- provider_name: nome de profissional ou clínica mencionado (opcional)
- remind_days_before: quantos dias antes lembrar (0 se não mencionado)
- remind_hours_before: quantas horas antes lembrar (0 se não mencionado)
- remind_minutes_before: quantos minutos antes lembrar (0 se não mencionado)

Regras:
- Se disser "hoje", use ${todayStr}
- Se disser "amanhã", calcule o dia seguinte
- Se mencionar dia da semana (ex: "segunda"), calcule a próxima ocorrência
- Se disser "me lembra X minutos/horas antes", defina o campo correto
- Identifique a categoria pelo contexto (ex: "dentista" → dentista, "reunião de trabalho" → reuniao)
- Retorne APENAS o JSON, sem texto adicional`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcrição da mensagem de voz: "${transcript}"` },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", errText);
      throw new Error("AI processing failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ success: true, commitment: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("parse-voice-reminder error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
