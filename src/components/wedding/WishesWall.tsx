import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitWish } from "@/lib/guest-submissions.functions";
import { Reveal } from "./Reveal";
import { ConfettiBurst } from "./ConfettiBurst";
import { isMeaningfulText } from "@/lib/utils";

type Wish = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

const wishesQuery = {
  queryKey: ["wishes"],
  queryFn: async (): Promise<Wish[]> => {
    const { data, error } = await supabase
      .from("wishes")
      .select("id,name,message,created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return data ?? [];
  },
};

export function WishesWall() {
  const qc = useQueryClient();
  const { data: wishes = [], isLoading } = useQuery(wishesQuery);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [burst, setBurst] = useState(0);

  const sendWish = useServerFn(submitWish);

  const mutation = useMutation({
    mutationFn: async () => {
      await sendWish({ data: { name: name.trim(), message: message.trim() } });
    },
    onSuccess: () => {
      toast.success("Your blessing is on the wall — thank you.");
      setName("");
      setMessage("");
      setBurst((n) => n + 1);
      void qc.invalidateQueries({ queryKey: ["wishes"] });
    },
    onError: () => toast.error("That didn't send. Please try once more."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMeaningfulText(name, 2)) {
      toast.error("Please tell us your actual name.");
      return;
    }
    if (!isMeaningfulText(message, 3)) {
      toast.error("Please write an actual wish or blessing.");
      return;
    }
    mutation.mutate();
  };

  return (
    <section id="wishes" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="eyebrow">Blessings &amp; prayers</p>
          <h2 className="mt-4 font-display text-5xl sm:text-6xl">
            <span className="text-gold">The Wishing Wall</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Leave a prayer, a memory or a heartfelt wish. Every note here will be read aloud and
            kept forever.
          </p>
          <div className="gold-rule mx-auto mt-8 w-40" />
        </Reveal>

        <Reveal delay={120} className="relative">
          <ConfettiBurst trigger={burst} icon="heart" count={22} />
          <form onSubmit={submit} className="surface-card mx-auto mt-12 max-w-2xl p-6 sm:p-9">
            <div className="grid gap-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={80}
                className="w-full rounded-md border border-input bg-card/70 px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your wish, prayer or blessing…"
                rows={4}
                maxLength={600}
                className="w-full resize-none rounded-md border border-input bg-card/70 px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <button type="submit" disabled={mutation.isPending} className="btn-gold w-full">
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                Leave your blessing
              </button>
            </div>
          </form>
        </Reveal>

        <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground">Gathering wishes…</p>
          )}
          {!isLoading && wishes.length === 0 && (
            <p className="text-center text-sm italic text-muted-foreground">
              Be the first to bless Bharath &amp; Bhavya.
            </p>
          )}
          {wishes.map((w, i) => (
            <Reveal key={w.id} delay={(i % 6) * 80} className="mb-6 break-inside-avoid">
              <figure className="surface-card ornament-frame p-6">
                <Heart className="h-4 w-4 text-gold" />
                <blockquote className="mt-3 font-[family-name:var(--font-display)] text-lg leading-relaxed">
                  {w.message}
                </blockquote>
                <figcaption className="mt-4 text-[0.62rem] tracking-[0.3em] text-gold-deep uppercase">
                  — {w.name}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
