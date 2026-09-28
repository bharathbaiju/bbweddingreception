import { CalendarPlus, MapPin, Clock } from "lucide-react";
import { Reveal } from "./Reveal";
import { ScratchReveal } from "./ScratchReveal";
import { EVENTS, googleCalendarUrl, mapsUrl, type WeddingEvent } from "@/lib/wedding-data";
import { getWeddingIcs, getReceptionIcs } from "@/lib/guest-submissions.functions";
import weddingImg from "@/assets/wedding.jpg";
import receptionImg from "@/assets/reception.jpg";

const images: Record<string, string> = {
  wedding: weddingImg,
  reception: receptionImg,
};

// Real HTTP links (not blob: URLs) so tapping them works as a native "add to
// calendar" action on Android calendar apps (Samsung, Huawei, Google, ...),
// Apple Calendar and Outlook alike.
const icsUrls: Record<string, string> = {
  wedding: getWeddingIcs.url,
  reception: getReceptionIcs.url,
};

function EventCard({ event, index }: { event: WeddingEvent; index: number }) {
  return (
    <Reveal delay={index * 140} className="h-full">
      <ScratchReveal label={event.name} className="h-full rounded-[inherit]">
        <article className="surface-card group flex h-full flex-col overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={images[event.id]}
              alt={`${event.name} at ${event.venue}`}
              loading="lazy"
              width={1024}
              height={1280}
              className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 35%, oklch(0.98 0.03 88 / 0.9) 100%)",
              }}
            />
            <span className="absolute left-4 top-4 rounded-full bg-card/80 px-3 py-1 text-[0.6rem] tracking-[0.28em] text-gold-deep uppercase backdrop-blur">
              {event.dayLabel}
            </span>
          </div>

          <div className="flex flex-1 flex-col px-6 pb-7 pt-5 text-center">
            <h3 className="font-display text-3xl">
              <span className="text-gold">{event.name}</span>
            </h3>
            <p className="mt-2 text-sm italic text-muted-foreground">{event.tagline}</p>

            <div className="gold-rule my-5" />

            <p className="font-[family-name:var(--font-serif-alt)] text-lg tracking-[0.08em]">
              {event.dateLabel}
            </p>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {event.timeLabel}
            </p>
            <p className="mt-3 font-[family-name:var(--font-serif-alt)] text-base">{event.venue}</p>
            <p className="text-sm text-muted-foreground">{event.address}</p>

            <div className="mt-6 flex flex-1 flex-col justify-end gap-2.5">
              <div className="flex flex-wrap justify-center gap-2.5">
                <a
                  href={googleCalendarUrl(event)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-gold !px-5 !py-2.5 !text-[0.65rem]"
                >
                  <CalendarPlus className="h-3.5 w-3.5" /> Google
                </a>
                <a
                  href={icsUrls[event.id]}
                  className="btn-outline-gold !px-5 !py-2.5 !text-[0.65rem]"
                >
                  <CalendarPlus className="h-3.5 w-3.5" /> Other calendar
                </a>
              </div>
              <a
                href={mapsUrl(event)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-[0.68rem] tracking-[0.22em] text-gold-deep uppercase underline-offset-4 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" /> View location
              </a>
            </div>
          </div>
        </article>
      </ScratchReveal>
    </Reveal>
  );
}

export function EventsSection() {
  return (
    <section id="events" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="eyebrow">Two days of celebration</p>
          <h2 className="mt-4 font-display text-5xl sm:text-6xl">
            <span className="text-gold">The Celebrations</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Add each occasion straight to your phone's calendar — Google, Samsung, Huawei, Apple or
            Outlook — and let the map guide you to our doorstep.
          </p>
          <div className="gold-rule mx-auto mt-8 w-40" />
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-2 md:mx-auto md:max-w-3xl">
          {EVENTS.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
