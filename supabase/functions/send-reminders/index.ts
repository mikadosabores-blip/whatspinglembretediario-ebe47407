import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsApp(url: string, apiKey: string, instanceName: string, phone: string, message: string) {
  const sendUrl = `${url}/message/sendText/${instanceName}`;
  const res = await fetch(sendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: apiKey },
    body: JSON.stringify({ number: `${phone}@s.whatsapp.net`, text: message }),
  });
  return res;
}

async function logNotification(
  supabase: any,
  userId: string,
  commitmentId: string,
  reminderType: string,
  phone: string,
  message: string,
  status: "sent" | "failed",
  errorMessage?: string
) {
  await supabase.from("notification_logs").insert({
    user_id: userId,
    commitment_id: commitmentId,
    reminder_type: reminderType,
    phone_number: phone,
    message_preview: message.substring(0, 200),
    status,
    error_message: errorMessage || null,
  });
}

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

    const { data: commitmentsOnly, error } = await supabase
      .from("commitments")
      .select("*")
      .eq("status", "pending");

    if (error) throw error;

    const results: string[] = [];
    // Use Brazil timezone (UTC-3) since commitments are stored in local time
    const now = new Date();
    const brasilOffset = -3 * 60; // UTC-3 in minutes
    const brasilNow = new Date(now.getTime() + (brasilOffset + now.getTimezoneOffset()) * 60000);

    for (const c of commitmentsOnly || []) {
      // Parse commitment date/time as local Brasil time
      const commitmentDateTime = new Date(`${c.commitment_date}T${c.commitment_time}`);
      const diffMs = commitmentDateTime.getTime() - brasilNow.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes < -5) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_number, name")
        .eq("id", c.user_id)
        .single();

      if (!profile?.whatsapp_number) continue;

      const phone = profile.whatsapp_number.replace(/\D/g, "");

      // Get additional contacts to notify
      const contactIds: string[] = c.notify_contact_ids || [];
      interface Recipient { phone: string; name: string; }
      const recipients: Recipient[] = [{ phone, name: profile.name }];
      if (contactIds.length > 0) {
        const { data: contacts } = await supabase
          .from("user_contacts")
          .select("whatsapp_number, name")
          .in("id", contactIds);
        if (contacts) {
          for (const ct of contacts) {
            recipients.push({ phone: ct.whatsapp_number.replace(/\D/g, ""), name: ct.name });
          }
        }
      }
      const categoryLabels: Record<string, string> = {
        dentista: "🦷 Dentista", medico: "🏥 Médico", escola: "🏫 Escola",
        trabalho: "💼 Trabalho", veterinario: "🐾 Veterinário", reuniao: "🤝 Reunião",
        curso: "📚 Curso", clinica: "🏨 Clínica", idoso: "👴 Pessoa Idosa",
        bebe: "👶 Mãe/Bebê", namorado: "❤️ Namorado(a)", pais: "👨‍👩‍👧 Pais",
        familiares: "👨‍👩‍👧‍👦 Familiares", outro: "📌 Outro",
      };

      const catLabel = categoryLabels[c.category] || c.category;
      const dateFormatted = new Date(c.commitment_date).toLocaleDateString("pt-BR");
      const timeFormatted = c.commitment_time.slice(0, 5);

      // Helper to build message
      const buildMessage = (recipientName: string, unitText: string, isOnTime: boolean) => {
        if (c.custom_message && c.custom_message.trim() && !isOnTime) {
          return c.custom_message
            .replace(/{nome}/gi, recipientName)
            .replace(/{titulo}/gi, c.title)
            .replace(/{data}/gi, dateFormatted)
            .replace(/{horario}/gi, timeFormatted)
            .replace(/{local}/gi, c.location || "")
            .replace(/{profissional}/gi, c.provider_name || "")
            .replace(/{categoria}/gi, catLabel)
            .replace(/{tempo}/gi, unitText);
        }

        const header = isOnTime
          ? `⏰ *Hora do compromisso!*\n\nOlá ${recipientName}! Seu compromisso é *agora*:\n\n`
          : `⏰ *Lembrete WhatsPing*\n\nOlá ${recipientName}! Você tem um compromisso em *${unitText}*:\n\n`;

        return header +
          `${catLabel}\n` +
          `📋 *${c.title}*\n` +
          `📅 ${dateFormatted} às ${timeFormatted}\n` +
          (c.provider_name ? `👤 ${c.provider_name}\n` : "") +
          (c.location ? `📍 ${c.location}\n` : "") +
          (c.description && !isOnTime ? `📝 ${c.description}\n` : "") +
          `\n_Enviado automaticamente pelo WhatsPing_`;
      };

      // Helper to send message to all recipients
      const sendToAll = async (unitText: string, isOnTime: boolean, reminderType: string) => {
        let allOk = true;
        for (const recipient of recipients) {
          const msg = buildMessage(recipient.name, unitText, isOnTime);
          console.log(`Sending ${reminderType} for "${c.title}" to ${recipient.phone} (${recipient.name})`);
          const res = await sendWhatsApp(EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME, recipient.phone, msg);
          if (res.ok) {
            await logNotification(supabase, c.user_id, c.id, reminderType, recipient.phone, msg, "sent");
            results.push(`✅ ${reminderType} "${c.title}" → ${recipient.name} (${recipient.phone})`);
          } else {
            const errText = await res.text();
            await logNotification(supabase, c.user_id, c.id, reminderType, recipient.phone, msg, "failed", errText);
            results.push(`❌ ${reminderType} "${c.title}" → ${recipient.name} (${recipient.phone}): ${errText}`);
            allOk = false;
          }
        }
        return allOk;
      };

      // Determine which SINGLE reminder should fire based on time windows
      // Each reminder only fires in its proper window, preventing cascade
      const reminders = [
        { type: "days", field: "notified_days", threshold: (c.remind_days_before || 0) * 24 * 60, unit: `${c.remind_days_before} dia(s)` },
        { type: "hours", field: "notified_hours", threshold: (c.remind_hours_before || 0) * 60, unit: `${c.remind_hours_before} hora(s)` },
        { type: "minutes", field: "notified_minutes", threshold: c.remind_minutes_before || 0, unit: `${c.remind_minutes_before} minuto(s)` },
      ].filter(r => r.threshold > 0).sort((a, b) => b.threshold - a.threshold);

      // Find which window diffMinutes falls into
      // Window for reminder[i] = [reminder[i].threshold, reminder[i+1].threshold or 0)
      let firedOne = false;

      for (let i = 0; i < reminders.length && !firedOne; i++) {
        const reminder = reminders[i];
        if (c[reminder.field]) continue; // already sent

        const nextThreshold = i + 1 < reminders.length ? reminders[i + 1].threshold : 0;
        
        // Only fire if diffMinutes is within THIS reminder's window
        // Window: diffMinutes <= threshold AND diffMinutes > nextThreshold
        if (diffMinutes <= reminder.threshold && diffMinutes > nextThreshold) {
          const ok = await sendToAll(reminder.unit, false, reminder.type);
          if (ok) {
            const updateField: Record<string, boolean> = {};
            updateField[`notified_${reminder.type}`] = true;
            await supabase.from("commitments").update(updateField).eq("id", c.id);
          }
          firedOne = true;
        }
      }

      // On-time reminder: only when diffMinutes <= 0 (already past)
      if (!firedOne && !c.notified_ontime && diffMinutes <= 0 && diffMinutes > -5) {
        const ok = await sendToAll("", true, "ontime");
        if (ok) {
          await supabase.from("commitments").update({ notified_ontime: true }).eq("id", c.id);
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
