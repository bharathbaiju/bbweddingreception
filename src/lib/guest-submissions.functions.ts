import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { isMeaningfulText } from "@/lib/utils";
import { EVENTS, icsContent } from "@/lib/wedding-data";

type RsvpInput = {
  name: string;
  contact: string | null;
  attending: boolean;
  guests: number;
  events: string[];
  message: string | null;
};

type WishInput = { name: string; message: string };

type GuestPhotoInput = { name: string; storagePath: string };

function serverSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Sends a Telegram message. Never throws — delivery problems are logged only. */
async function notifyTelegram(text: string) {
  try {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["TELEGRAM_API_KEY"];
    const botToken = process.env["TELEGRAM_BOT_TOKEN"];
    const chatId = process.env["TELEGRAM_CHAT_ID"];

    if (!chatId) {
      console.error("Telegram notification skipped: TELEGRAM_CHAT_ID is not set");
      return;
    }

    const body = JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" });
    let response: Response;

    if (lovableKey && connectionKey) {
      response = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connectionKey,
          "Content-Type": "application/json",
        },
        body,
      });
    } else if (botToken) {
      response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } else {
      console.error("Telegram notification skipped: no bot credentials configured");
      return;
    }

    const payload = await response.text();
    if (!response.ok) {
      console.error(`Telegram send failed [${response.status}]: ${payload}`);
      return;
    }
    try {
      const parsed = JSON.parse(payload) as { ok?: boolean; description?: string };
      if (parsed.ok === false) {
        console.error(`Telegram send rejected: ${parsed.description ?? payload}`);
      }
    } catch {
      /* non-JSON success body is fine */
    }
  } catch (err) {
    console.error("Telegram send threw:", err);
  }
}

export const submitRsvp = createServerFn({ method: "POST" })
  .validator((input: RsvpInput) => {
    const name = String(input?.name ?? "")
      .trim()
      .slice(0, 100);
    if (!isMeaningfulText(name, 2)) throw new Error("A real name is required");
    const message = String(input?.message ?? "")
      .trim()
      .slice(0, 500);
    return {
      name,
      contact: input.contact ? String(input.contact).trim().slice(0, 120) : null,
      attending: Boolean(input.attending),
      guests: Math.min(Math.max(Number(input.guests) || 0, 0), 20),
      events: Array.isArray(input.events)
        ? input.events.slice(0, 10).map((e) => String(e).slice(0, 40))
        : [],
      message: isMeaningfulText(message, 1) ? message : null,
    } satisfies RsvpInput;
  })
  .handler(async ({ data }) => {
    // rsvps intentionally has no SELECT policy (guest phone/email stay private),
    // so this insert must not request the row back (no .select()/RETURNING) or RLS rejects it.
    const { error } = await serverSupabase().from("rsvps").insert(data);
    if (error) throw new Error(error.message);

    await notifyTelegram(
      [
        "🎉 New RSVP Received",
        `👤 Name: ${data.name}`,
        `📧 Contact: ${data.contact ?? "—"}`,
        `✅ Attending: ${data.attending ? "Yes" : "No"}`,
        `🕒 Submitted: ${new Date().toISOString()}`,
      ].join("\n"),
    );

    return { ok: true as const };
  });

export const submitWish = createServerFn({ method: "POST" })
  .validator((input: WishInput) => {
    const name = String(input?.name ?? "")
      .trim()
      .slice(0, 80);
    const message = String(input?.message ?? "")
      .trim()
      .slice(0, 600);
    if (!isMeaningfulText(name, 2)) throw new Error("A real name is required");
    if (!isMeaningfulText(message, 3)) throw new Error("A real message is required");
    return { name, message };
  })
  .handler(async ({ data }) => {
    const { data: row, error } = await serverSupabase()
      .from("wishes")
      .insert(data)
      .select("id, name, message, created_at")
      .single();
    if (error) throw new Error(error.message);

    await notifyTelegram(
      [
        "💌 New Wish Received",
        `👤 Name: ${row.name}`,
        `📝 Message: ${row.message}`,
        `🆔 Wish ID: ${row.id}`,
        `🕒 Submitted: ${row.created_at}`,
      ].join("\n"),
    );

    return { ok: true as const };
  });

export const submitGuestPhoto = createServerFn({ method: "POST" })
  .validator((input: GuestPhotoInput) => {
    const name = String(input?.name ?? "")
      .trim()
      .slice(0, 80);
    const storagePath = String(input?.storagePath ?? "").trim();
    if (!isMeaningfulText(name, 2)) throw new Error("A real name is required");
    if (!storagePath) throw new Error("Missing uploaded photo");
    return { name, storage_path: storagePath };
  })
  .handler(async ({ data }) => {
    // Like rsvps, no need to read the row back — the gallery re-fetches the
    // list separately (under the SELECT policy), so skip .select() here.
    const { error } = await serverSupabase().from("guest_photos").insert(data);
    if (error) throw new Error(error.message);

    await notifyTelegram(
      [
        "📸 New Guest Photo",
        `👤 From: ${data.name}`,
        `🕒 Submitted: ${new Date().toISOString()}`,
      ].join("\n"),
    );

    return { ok: true as const };
  });

/**
 * Serves each event's .ics as a real HTTP resource (not a blob: URL), so
 * tapping the link works as a native "add to calendar" action across
 * Android calendar apps (Samsung, Huawei, Google Calendar, ...) as well as
 * Apple Calendar and Outlook — blob: URLs can't be handed off to another
 * app, only same-origin HTTP responses can.
 */
function icsFileResponse(eventId: (typeof EVENTS)[number]["id"]) {
  const event = EVENTS.find((e) => e.id === eventId)!;
  return new Response(icsContent(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}-bharath-bhavya.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const getWeddingIcs = createServerFn({ method: "GET" }).handler(() =>
  icsFileResponse("wedding"),
);
export const getReceptionIcs = createServerFn({ method: "GET" }).handler(() =>
  icsFileResponse("reception"),
);
