import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, MapPin, Phone, Mail } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Gate } from "@/components/wedding/Gate";
import { Petals } from "@/components/wedding/Petals";
import { Monogram } from "@/components/wedding/Monogram";
import { Countdown } from "@/components/wedding/Countdown";
import { Reveal } from "@/components/wedding/Reveal";
import { EventsSection } from "@/components/wedding/EventsSection";
import { Gallery } from "@/components/wedding/Gallery";
import { GuestPhotos } from "@/components/wedding/GuestPhotos";
import { WishesWall } from "@/components/wedding/WishesWall";
import { RsvpSection } from "@/components/wedding/RsvpSection";
import { MusicToggle, useAmbientMusic } from "@/components/wedding/MusicToggle";
import { COUPLE, EVENTS } from "@/lib/wedding-data";

const eventsJsonLd = EVENTS.map((event) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${event.name} — ${COUPLE.groom} & ${COUPLE.bride}`,
  description: event.tagline,
  startDate: event.start,
  endDate: event.end,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: event.venue,
    address: `${event.address}, Kerala, India`,
  },
  organizer: {
    "@type": "Person",
    name: `${COUPLE.groom} & ${COUPLE.bride}`,
  },
}));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bharath & Bhavya — Wedding Invitation | 24 October 2026" },
      {
        name: "description",
        content:
          "Join Bharath & Bhavya for their Wedding and Reception in Kerala, October 2026. RSVP, add the dates to your calendar and leave a blessing.",
      },
      { property: "og:title", content: "Bharath & Bhavya — Wedding Invitation" },
      {
        property: "og:description",
        content:
          "Wedding and Reception — October 2026, Kerala. RSVP and leave your blessing on our wishing wall.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(eventsJsonLd),
      },
    ],
  }),
  component: Home,
});

const NAV = [
  { href: "#story", label: "Our Story" },
  { href: "#events", label: "Celebrations" },
  { href: "#gallery", label: "Moments" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#photos", label: "Photos" },
  { href: "#wishes", label: "Wishes" },
];

function Home() {
  const [opened, setOpened] = useState(false);
  const music = useAmbientMusic();

  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const enter = () => {
    setOpened(true);
    music.start();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {!opened && <Gate onOpen={enter} />}
      <Petals />
      {opened && <MusicToggle playing={music.playing} onToggle={music.toggle} />}

      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-start gap-5 overflow-x-auto px-4 py-3 sm:justify-center sm:gap-10 sm:overflow-visible">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="whitespace-nowrap text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase transition-colors hover:text-gold-deep sm:text-[0.68rem]"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-5 py-20">
        <img
          src={heroImg}
          alt="Golden silk and floral wedding backdrop"
          width={1536}
          height={1024}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ animation: "float-slow 14s ease-in-out infinite" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 52%, oklch(0.995 0.02 92 / 0.86) 0%, oklch(0.98 0.03 88 / 0.6) 55%, oklch(0.9 0.07 82 / 0.25) 100%)",
          }}
        />

        <div className="relative z-10 text-center">
          <Reveal>
            <p className="eyebrow">Together with our families</p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mt-6 font-display text-[3.2rem] leading-[0.95] tracking-[0.04em] sm:text-[7rem]">
              <span className="text-gold">{COUPLE.groom}</span>
              <span className="mx-3 font-[family-name:var(--font-script)] text-3xl sm:mx-6 sm:text-6xl">
                <span className="text-gold">&amp;</span>
              </span>
              <span className="text-gold">{COUPLE.bride}</span>
              <span className="sr-only"> — Wedding Invitation</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <div className="gold-rule mx-auto mt-8 w-56" />
            <p className="mt-6 font-[family-name:var(--font-serif-alt)] text-lg tracking-[0.3em] uppercase sm:text-2xl">
              24 October 2026
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Kalarikkal Convention Centre · Palakkad, Kerala
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="mt-12">
              <Countdown />
            </div>
          </Reveal>
          <Reveal delay={420}>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <a href="#rsvp" className="btn-gold">
                <Heart className="h-4 w-4" /> RSVP now
              </a>
              <a href="#events" className="btn-outline-gold">
                See the celebrations
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Story / families ---------- */}
      <section id="story" className="relative px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <Monogram className="mx-auto h-28 w-28" />
            <p className="eyebrow mt-6">Our story</p>
            <h2 className="mt-4 font-display text-5xl sm:text-6xl">
              <span className="text-gold">Two Hearts, One Promise</span>
            </h2>
            <div className="gold-rule mx-auto mt-8 w-40" />
          </Reveal>

          <Reveal delay={140}>
            <p className="mx-auto mt-8 max-w-2xl font-[family-name:var(--font-display)] text-xl leading-relaxed sm:text-2xl">
              What began as two families and a quiet blessing has grown into a promise we now make
              in front of everyone we love. Between the lamps, the silk and the sound of the
              nadaswaram, we begin a lifetime together — and we would love for you to be standing
              right there with us.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <Reveal delay={100}>
              <div className="surface-card ornament-frame h-full px-7 py-9">
                <p className="eyebrow">The Groom's Family</p>
                <h3 className="mt-3 font-display text-3xl">
                  <span className="text-gold">{COUPLE.groomParents}</span>
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{COUPLE.groomHome}</p>
                <div className="gold-rule my-5" />
                <p className="text-sm italic text-muted-foreground">
                  Cordially invite you and your family to celebrate the wedding of their son,{" "}
                  {COUPLE.groom}.
                </p>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <div className="surface-card ornament-frame h-full px-7 py-9">
                <p className="eyebrow">The Bride's Family</p>
                <h3 className="mt-3 font-display text-3xl">
                  <span className="text-gold">{COUPLE.brideParents}</span>
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{COUPLE.brideHome}</p>
                <div className="gold-rule my-5" />
                <p className="text-sm italic text-muted-foreground">
                  Warmly welcome you to share in the joy of their daughter, {COUPLE.bride}.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <EventsSection />
      <Gallery />
      <RsvpSection />
      <GuestPhotos />
      <WishesWall />

      {/* ---------- Footer ---------- */}
      <footer className="relative px-5 pb-16 pt-10 text-center">
        <div className="gold-rule mx-auto w-64" />
        <Reveal>
          <Monogram className="mx-auto mt-10 h-24 w-24" />
          <p className="mt-6 font-[family-name:var(--font-script)] text-3xl">
            <span className="text-gold">{COUPLE.quote}</span>
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <a
              href={`tel:${COUPLE.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 hover:text-gold-deep"
            >
              <Phone className="h-3.5 w-3.5" /> {COUPLE.phone}
            </a>
            <a
              href={`mailto:${COUPLE.email}`}
              className="inline-flex items-center gap-2 hover:text-gold-deep"
            >
              <Mail className="h-3.5 w-3.5" /> {COUPLE.email}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Thrissur · Palakkad, Kerala
            </span>
          </div>
          <p className="mt-10 text-[0.6rem] tracking-[0.3em] text-muted-foreground uppercase">
            {COUPLE.groom} &amp; {COUPLE.bride} · MMXXVI
          </p>
        </Reveal>
      </footer>
    </div>
  );
}
