import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import {
  adminLogin,
  adminListRsvps,
  adminListWishes,
  adminListGuestPhotos,
  adminDeleteRsvp,
  adminDeleteWish,
  adminDeleteGuestPhoto,
} from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "wedding-admin-password";

type Tab = "rsvps" | "wishes" | "photos";

function LoginGate({ onAuthed }: { onAuthed: (password: string) => void }) {
  const [password, setPassword] = useState("");
  const login = useServerFn(adminLogin);
  const mutation = useMutation({
    mutationFn: async () => {
      await login({ data: { password } });
    },
    onSuccess: () => {
      sessionStorage.setItem(STORAGE_KEY, password);
      onAuthed(password);
    },
    onError: () => toast.error("Incorrect password"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password) mutation.mutate();
        }}
        className="surface-card w-full max-w-sm p-8 text-center"
      >
        <p className="eyebrow">Private</p>
        <h1 className="mt-3 font-display text-3xl">
          <span className="text-gold">Wedding Admin</span>
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="mt-6 w-full rounded-md border border-input bg-card/70 px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button type="submit" disabled={mutation.isPending} className="btn-gold mt-4 w-full">
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enter"}
        </button>
      </form>
    </div>
  );
}

function DeleteButton({ onConfirm, pending }: { onConfirm: () => void; pending: boolean }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="rounded-md bg-destructive px-2.5 py-1.5 text-[0.65rem] text-destructive-foreground uppercase"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border border-input px-2.5 py-1.5 text-[0.65rem] uppercase text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label="Delete"
      className="shrink-0 rounded-md border border-input p-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function RsvpsPanel({ password }: { password: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListRsvps);
  const deleteFn = useServerFn(adminDeleteRsvp);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "rsvps"],
    queryFn: async () => (await listFn({ data: { password } })) as AdminRsvpRow[],
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      await deleteFn({ data: { password, id } });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "rsvps"] }),
    onError: () => toast.error("Couldn't delete that RSVP"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const attendingCount = rows.filter((r) => r.attending).length;

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">
        {rows.length} replies · {attendingCount} attending · {rows.length - attendingCount} declined
      </p>
      <div className="grid gap-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="surface-card flex items-start justify-between gap-4 p-4 text-left text-sm"
          >
            <div>
              <p className="font-[family-name:var(--font-serif-alt)] text-base">{r.name}</p>
              <p className="mt-0.5 text-muted-foreground">
                {r.attending ? "Attending" : "Declined"}
                {r.contact ? ` · ${r.contact}` : ""}
                {r.attending && r.events.length ? ` · ${r.events.join(", ")}` : ""}
              </p>
              {r.message && <p className="mt-1 italic text-muted-foreground">"{r.message}"</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <DeleteButton
              pending={del.isPending && del.variables === r.id}
              onConfirm={() => del.mutate(r.id)}
            />
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No RSVPs yet.</p>}
      </div>
    </div>
  );
}

function WishesPanel({ password }: { password: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListWishes);
  const deleteFn = useServerFn(adminDeleteWish);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "wishes"],
    queryFn: async () => (await listFn({ data: { password } })) as AdminWishRow[],
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      await deleteFn({ data: { password, id } });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "wishes"] }),
    onError: () => toast.error("Couldn't delete that wish"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">{rows.length} wishes</p>
      <div className="grid gap-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="surface-card flex items-start justify-between gap-4 p-4 text-left text-sm"
          >
            <div>
              <p className="font-[family-name:var(--font-serif-alt)] text-base">{r.name}</p>
              <p className="mt-1">{r.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <DeleteButton
              pending={del.isPending && del.variables === r.id}
              onConfirm={() => del.mutate(r.id)}
            />
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No wishes yet.</p>}
      </div>
    </div>
  );
}

function PhotosPanel({ password }: { password: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListGuestPhotos);
  const deleteFn = useServerFn(adminDeleteGuestPhoto);
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "photos"],
    queryFn: async () => (await listFn({ data: { password } })) as AdminPhotoRow[],
  });
  const del = useMutation({
    mutationFn: async (row: AdminPhotoRow) => {
      await deleteFn({ data: { password, id: row.id, storagePath: row.storage_path } });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin", "photos"] }),
    onError: () => toast.error("Couldn't delete that photo"),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">{rows.length} photos</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((r) => (
          <div key={r.id} className="surface-card overflow-hidden p-1.5 text-left text-xs">
            <img
              src={r.url}
              alt={r.name}
              className="aspect-square w-full rounded-md object-cover"
            />
            <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-2">
              <div className="min-w-0">
                <p className="truncate">{r.name}</p>
                <p className="text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <DeleteButton
                pending={del.isPending && del.variables?.id === r.id}
                onConfirm={() => del.mutate(r)}
              />
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">No photos yet.</p>
        )}
      </div>
    </div>
  );
}

type AdminRsvpRow = {
  id: string;
  name: string;
  contact: string | null;
  attending: boolean;
  guests: number;
  events: string[];
  message: string | null;
  created_at: string;
};
type AdminWishRow = { id: string; name: string; message: string; created_at: string };
type AdminPhotoRow = {
  id: string;
  name: string;
  storage_path: string;
  created_at: string;
  url: string;
};

export function AdminDashboard() {
  const [password, setPassword] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("rsvps");

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setPassword(stored);
  }, []);

  if (!password) return <LoginGate onAuthed={setPassword} />;

  const TABS: { id: Tab; label: string }[] = [
    { id: "rsvps", label: "RSVPs" },
    { id: "wishes", label: "Wishes" },
    { id: "photos", label: "Photos" },
  ];

  return (
    <div className="min-h-screen px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl">
            <span className="text-gold">Wedding Admin</span>
          </h1>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(STORAGE_KEY);
              setPassword(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs uppercase text-muted-foreground hover:text-gold-deep"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <div className="mt-8 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition-colors",
                tab === t.id
                  ? "border-transparent bg-[image:var(--gradient-gold)] text-[oklch(0.28_0.04_58)]"
                  : "border-input text-muted-foreground hover:border-ring",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "rsvps" && <RsvpsPanel password={password} />}
          {tab === "wishes" && <WishesPanel password={password} />}
          {tab === "photos" && <PhotosPanel password={password} />}
        </div>
      </div>
    </div>
  );
}
