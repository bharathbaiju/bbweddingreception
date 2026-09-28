import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitRsvp } from "@/lib/guest-submissions.functions";
import { Reveal } from "./Reveal";
import { ConfettiBurst } from "./ConfettiBurst";
import { EVENTS } from "@/lib/wedding-data";
import { cn, isMeaningfulText } from "@/lib/utils";

export function RsvpSection() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [attending, setAttending] = useState(true);
  const [events, setEvents] = useState<string[]>(EVENTS.map((e) => e.id));
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);

  const toggleEvent = (id: string) =>
    setEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const sendRsvp = useServerFn(submitRsvp);

  const mutation = useMutation({
    mutationFn: async () => {
      await sendRsvp({
        data: {
          name: name.trim(),
          contact: contact.trim() || null,
          attending,
          guests: attending ? 1 : 0,
          events: attending ? events : [],
          message: isMeaningfulText(message, 1) ? message.trim() : null,
        },
      });
    },
    onSuccess: () => {
      setDone(true);
      setBurst((n) => n + 1);
      toast.success("Thank you — your reply is safely with us.");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMeaningfulText(name, 2)) {
      toast.error("Please tell us your actual name.");
      return;
    }
    mutation.mutate();
  };

  return (
    <section id="rsvp" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="eyebrow">Kindly reply</p>
          <h2 className="mt-4 font-display text-5xl sm:text-6xl">
            <span className="text-gold">Will You Join Us?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your presence is the blessing we wish for most. Please reply before the 15th of October
            2026.
          </p>
          <div className="gold-rule mx-auto mt-8 w-40" />
        </Reveal>

        <Reveal delay={140}>
          {done ? (
            <div className="surface-card ornament-frame relative mt-12 px-8 py-16 text-center">
              <ConfettiBurst trigger={burst} icon={attending ? "heart" : "sparkle"} count={26} />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border">
                <Check className="h-7 w-7 text-gold" />
              </div>
              <h3 className="mt-6 font-display text-4xl">
                <span className="text-gold">Thank you, {name.split(" ")[0]}</span>
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {attending
                  ? "We can't wait to celebrate with you. Don't forget to add the dates to your calendar."
                  : "You will be dearly missed — thank you for your blessings."}
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="btn-outline-gold mt-8"
              >
                Send another reply
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="surface-card mt-12 p-6 sm:p-10">
              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Full name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={100}
                      className="mt-2 w-full rounded-md border border-input bg-card/70 px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Phone or email</span>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="So we can reach you"
                      maxLength={120}
                      className="mt-2 w-full rounded-md border border-input bg-card/70 px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                  </label>
                </div>

                <div>
                  <span className="eyebrow">Will you attend?</span>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {[
                      { v: true, label: "Joyfully accepts" },
                      { v: false, label: "Regretfully declines" },
                    ].map((o) => (
                      <button
                        key={String(o.v)}
                        type="button"
                        onClick={() => setAttending(o.v)}
                        className={cn(
                          "rounded-md border px-4 py-3 text-xs tracking-[0.14em] uppercase transition-all",
                          attending === o.v
                            ? "border-transparent bg-[image:var(--gradient-gold)] text-[oklch(0.28_0.04_58)] shadow-[var(--shadow-gold)]"
                            : "border-input bg-card/60 text-muted-foreground hover:border-ring",
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {attending && (
                  <>
                    <div>
                      <span className="eyebrow">Which celebrations?</span>
                      <div className="mt-2 flex flex-wrap gap-2.5">
                        {EVENTS.map((ev) => (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => toggleEvent(ev.id)}
                            className={cn(
                              "rounded-full border px-5 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase transition-all",
                              events.includes(ev.id)
                                ? "border-transparent bg-[image:var(--gradient-gold)] text-[oklch(0.28_0.04_58)] shadow-[var(--shadow-soft)]"
                                : "border-input bg-card/60 text-muted-foreground hover:border-ring",
                            )}
                          >
                            {ev.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <label className="block">
                  <span className="eyebrow">A note for the couple</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Dietary needs, travel plans, or a few loving words"
                    className="mt-2 w-full resize-none rounded-md border border-input bg-card/70 px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                </label>

                <button type="submit" disabled={mutation.isPending} className="btn-gold w-full">
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send my reply
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
