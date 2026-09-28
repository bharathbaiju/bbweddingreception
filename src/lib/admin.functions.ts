import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BUCKET = "guest-photos";

function requireAdmin(password: string) {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) throw new Error("Admin access is not configured on the server");
  if (!password || password !== expected) throw new Error("Incorrect password");
}

/**
 * Uses the Supabase secret key (never sent to the browser) so it can bypass
 * the RLS policies guests are restricted by — e.g. rsvps has no public
 * SELECT policy at all, on purpose, to keep guest contact info private.
 */
function adminSupabase() {
  const key = process.env["SUPABASE_SECRET_KEY"]!;
  if (!key) throw new Error("Admin Supabase key is not configured on the server");
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

type Auth = { password: string };

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: Auth) => input)
  .handler(({ data }) => {
    requireAdmin(data.password);
    return { ok: true as const };
  });

export const adminListRsvps = createServerFn({ method: "POST" })
  .validator((input: Auth) => input)
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: rows, error } = await adminSupabase()
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

export const adminListWishes = createServerFn({ method: "POST" })
  .validator((input: Auth) => input)
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: rows, error } = await adminSupabase()
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

export const adminListGuestPhotos = createServerFn({ method: "POST" })
  .validator((input: Auth) => input)
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const client = adminSupabase();
    const { data: rows, error } = await client
      .from("guest_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows.map((r) => ({
      ...r,
      url: client.storage.from(BUCKET).getPublicUrl(r.storage_path).data.publicUrl,
    }));
  });

export const adminDeleteRsvp = createServerFn({ method: "POST" })
  .validator((input: Auth & { id: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { error } = await adminSupabase().from("rsvps").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteWish = createServerFn({ method: "POST" })
  .validator((input: Auth & { id: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { error } = await adminSupabase().from("wishes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminDeleteGuestPhoto = createServerFn({ method: "POST" })
  .validator((input: Auth & { id: string; storagePath: string }) => input)
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const client = adminSupabase();
    const { error: dbError } = await client.from("guest_photos").delete().eq("id", data.id);
    if (dbError) throw new Error(dbError.message);
    await client.storage.from(BUCKET).remove([data.storagePath]);
    return { ok: true as const };
  });
