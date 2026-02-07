import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
    const EVOLUTION_INSTANCE_NAME = Deno.env.get("EVOLUTION_INSTANCE_NAME");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase credentials");
    }
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
      throw new Error("Missing Evolution API credentials");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all pending commitments
    const { data: commitmentsOnly, error } = await supabase
      .from("commitments")
      .select("*")
      .eq("status", "pending");

    if (error) throw error;

    const results: string[] = [];
    const now = new Date();

    for (const c of commitmentsOnly || []) {
      const commitmentDateTime = new Date(`${c.commitment_date}T${c.commitment_time}`);
      const diffMs = commitmentDateTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      // Skip if commitment already passed
      if (diffMinutes < -5) continue;

      // Get user's WhatsApp number
      const { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_number, name")
        .eq("id", c.user_id)
        .single();

      if (!profile?.whatsapp_number) {
        results.push(`Skipped "${c.title}": no WhatsApp number for user ${c.user_id}`);
        continue;
      }

      const phone = profile.whatsapp_number.replace(/\D/g, "");
      const categoryLabels: Record<string, string> = {
        dentista: "🦷 Dentista",
        medico: "🏥 Médico",
        escola: "🏫 Escola",
        trabalho: "💼 Trabalho",
        veterinario: "🐾 Veterinário",
        reuniao: "🤝 Reunião",
        curso: "📚 Curso",
        clinica: "🏨 Clínica",
        idoso: "👴 Pessoa Idosa",
        bebe: "👶 Mãe/Bebê",
        namorado: "❤️ Namorado(a)",
        pais: "👨‍👩‍👧 Pais",
        familiares: "👨‍👩‍👧‍👦 Familiares",
        outro: "📌 Outro",
      };

      const catLabel = categoryLabels[c.category] || c.category;
      const dateFormatted = new Date(c.commitment_date).toLocaleDateString("pt-BR");
      const timeFormatted = c.commitment_time.slice(0, 5);

      // Check each reminder threshold
      const reminders = [
        { type: "days", field: "notified_days", threshold: (c.remind_days_before || 0) * 24 * 60, unit: `${c.remind_days_before} dia(s)` },
        { type: "hours", field: "notified_hours", threshold: (c.remind_hours_before || 0) * 60, unit: `${c.remind_hours_before} hora(s)` },
        { type: "minutes", field: "notified_minutes", threshold: c.remind_minutes_before || 0, unit: `${c.remind_minutes_before} minuto(s)` },
      ];

      for (const reminder of reminders) {
        const alreadyNotified = c[reminder.field];
        if (alreadyNotified) continue;
        if (reminder.threshold <= 0) continue;

        // Send if we're within the threshold window (and commitment hasn't passed yet)
        if (diffMinutes <= reminder.threshold && diffMinutes > -5) {
          let message: string;

          if (c.custom_message && c.custom_message.trim()) {
            message = c.custom_message
              .replace(/{nome}/gi, profile.name)
              .replace(/{titulo}/gi, c.title)
              .replace(/{data}/gi, dateFormatted)
              .replace(/{horario}/gi, timeFormatted)
              .replace(/{local}/gi, c.location || "")
              .replace(/{profissional}/gi, c.provider_name || "")
              .replace(/{categoria}/gi, catLabel)
              .replace(/{tempo}/gi, reminder.unit);
          } else {
            message = `⏰ *Lembrete WhatsPing*\n\n` +
              `Olá ${profile.name}! Você tem um compromisso em *${reminder.unit}*:\n\n` +
              `${catLabel}\n` +
              `📋 *${c.title}*\n` +
              `📅 ${dateFormatted} às ${timeFormatted}\n` +
              (c.provider_name ? `👤 ${c.provider_name}\n` : "") +
              (c.location ? `📍 ${c.location}\n` : "") +
              (c.description ? `📝 ${c.description}\n` : "") +
              `\n_Enviado automaticamente pelo WhatsPing_`;
          }

          // Send via Evolution API
          const sendUrl = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`;
          console.log(`Sending ${reminder.type} reminder for "${c.title}" to ${phone}...`);

          const sendRes = await fetch(sendUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
              number: `${phone}@s.whatsapp.net`,
              text: message,
            }),
          });

          if (sendRes.ok) {
            const updateField: Record<string, boolean> = {};
            updateField[`notified_${reminder.type}`] = true;
            await supabase
              .from("commitments")
              .update(updateField)
              .eq("id", c.id);

            results.push(`✅ Sent ${reminder.type} reminder for "${c.title}" to ${phone}`);
          } else {
            const errText = await sendRes.text();
            console.error(`Failed ${reminder.type} for "${c.title}": ${errText}`);
            results.push(`❌ Failed ${reminder.type} for "${c.title}": ${errText}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, details: results, timestamp: now.toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-reminders error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
